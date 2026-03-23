import {useAppDispatch, useAppSelector} from "../../store";
import {
  User,
  Ticket,
  Shield,
  ChevronRight,
  Download,
  Film,
  Loader2,
  Trash2,
} from "lucide-react";
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getBookingHistory} from "../../services/api/bookingApi";
import {authApi} from "../../services/api/authApi";
import {userApi} from "../../services/api/userApi";
import {logout} from "../../store/slices/authSlice";
import {toast} from "react-hot-toast";
import type {MovieBooking} from "@/types/document";

const Profile = () => {
  const {user} = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Account Details");
  const [bookings, setBookings] = useState<MovieBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await getBookingHistory();
      // The backend return { rawMovieBookingHistory, foodBookingHistory }
      setBookings(res.rawMovieBookingHistory || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load booking history");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await authApi.changePassword({
        oldPassword: securityForm.oldPassword,
        newPassword: securityForm.newPassword,
      });
      toast.success("Password changed successfully");
      setSecurityForm({oldPassword: "", newPassword: "", confirmPassword: ""});
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setIsDeletingAccount(true);
      await userApi.deleteAccount(user._id);
      toast.success("Account deleted successfully");
      dispatch(logout());
      navigate("/");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to delete account";
      toast.error(message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const renderBookingItem = (booking: MovieBooking) => {
    const showtime = booking.showtimeId as any;
    const movie = showtime?.movieId;
    const isExpanded = expandedBooking === booking._id;

    return (
      <div key={booking._id} className="group relative">
        <div className="from-primary/5 pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div
          onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
          className={`bg-background/50 border-border hover:border-primary/30 flex cursor-pointer flex-col justify-between rounded-2xl border p-6 transition-all ${isExpanded ? "border-primary/50 ring-primary/20 ring-1" : ""}`}
        >
          <div className="flex w-full flex-col justify-between md:flex-row md:items-center">
            <div className="flex items-start gap-6">
              <div className="bg-accent/20 text-primary border-border/50 flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                {movie?.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Film className="h-8 w-8 opacity-40" />
                )}
              </div>
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-white uppercase">
                    {movie?.title || "Movie Booking"}
                  </h3>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                      booking.status === "PAID"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span className="bg-border h-1 w-1 rounded-full" />
                  <span>
                    Seats:{" "}
                    <span className="text-primary font-bold">
                      {booking.seats.map((s) => s.seatCode).join(", ")}
                    </span>
                  </span>
                </p>
                <p className="text-muted-foreground mt-2 font-mono text-[10px] tracking-widest uppercase opacity-50">
                  Booking ID: {booking.bookingCode}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-6 md:mt-0 md:justify-end">
              <div className="text-right">
                <p className="text-muted-foreground mb-1 text-[10px] font-black uppercase opacity-50">
                  Total Paid
                </p>
                <span className="text-2xl leading-none font-black text-white">
                  ${booking.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-accent/20 text-muted-foreground hover:text-primary border-border rounded-lg border p-2.5 transition-colors"
                  title="Download PDF"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  className={`bg-accent/20 text-muted-foreground hover:text-primary border-border rounded-lg border p-2.5 transition-all ${isExpanded ? "bg-primary/10 text-primary border-primary/30 rotate-180" : ""}`}
                  title="View Details"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="border-border/50 animate-in fade-in slide-in-from-top-2 mt-6 border-t pt-6 duration-300">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <h4 className="text-primary mb-4 text-[10px] font-black tracking-[0.2em] uppercase">
                    Seat Selection Details
                  </h4>
                  <div className="space-y-3">
                    {booking.seats.map((seat, idx) => (
                      <div
                        key={idx}
                        className="bg-accent/10 border-border/30 flex items-center justify-between rounded-xl border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black">
                            {seat.seatCode}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white uppercase">
                              {seat.type} SEAT
                            </p>
                            <p className="text-muted-foreground text-[10px] uppercase">
                              Row {seat.seatCode.charAt(0)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white">
                          ${seat.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-primary mb-4 text-[10px] font-black tracking-[0.2em] uppercase">
                    Order Summary
                  </h4>
                  <div className="bg-accent/10 border-border/30 space-y-4 rounded-2xl border p-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Original Ticket Price</span>
                      <span className="font-bold text-white">
                        ${booking.seats.reduce((acc, s) => acc + s.price, 0).toFixed(2)}
                      </span>
                    </div>
                    {booking.foodBooking && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Food & Drinks Bundle</span>
                        <span className="font-bold text-white">
                          ${(booking.foodBooking as any).totalAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="bg-border/50 h-px" />
                    <div className="flex justify-between">
                      <span className="text-xs font-black tracking-wider text-white uppercase">
                        Grand Total
                      </span>
                      <span className="text-primary text-lg font-black">
                        ${booking.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2">
                      <button className="hover:bg-primary w-full transform rounded-xl bg-white py-3 text-[10px] font-black tracking-widest text-black uppercase transition-all hover:scale-[1.02] hover:text-white active:scale-95">
                        Re-order Same Tickets
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Account Details":
        return (
          <div className="space-y-8">
            <div className="bg-card border-border rounded-3xl border p-8">
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-black tracking-tighter text-white uppercase">
                <Ticket className="text-primary h-7 w-7" /> Recent Bookings
              </h2>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {bookings.slice(0, 3).map(renderBookingItem)}
                  {bookings.length > 3 && (
                    <button
                      onClick={() => setActiveTab("My Bookings")}
                      className="border-border text-muted-foreground hover:bg-accent/20 mt-6 w-full rounded-2xl border py-4 text-sm font-bold tracking-widest uppercase transition-all"
                    >
                      View Full History
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-border rounded-2xl border border-dashed py-12 text-center">
                  <p className="text-muted-foreground">No bookings found</p>
                </div>
              )}
            </div>
          </div>
        );
      case "My Bookings":
        return (
          <div className="bg-card border-border rounded-3xl border p-8">
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-black tracking-tighter text-white uppercase">
              <Ticket className="text-primary h-7 w-7" /> All Bookings
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="flex flex-col gap-4">{bookings.map(renderBookingItem)}</div>
            ) : (
              <div className="border-border rounded-2xl border border-dashed py-12 text-center">
                <p className="text-muted-foreground">No bookings found</p>
              </div>
            )}
          </div>
        );
      case "Security":
        return (
          <div className="bg-card border-border rounded-3xl border p-8">
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-black tracking-tighter text-white uppercase">
              <Shield className="text-primary h-7 w-7" /> Security Settings
            </h2>
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="bg-background border-border focus:border-primary w-full rounded-xl border px-4 py-3 text-white transition-colors focus:outline-none"
                  value={securityForm.oldPassword}
                  onChange={(e) => setSecurityForm({...securityForm, oldPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  className="bg-background border-border focus:border-primary w-full rounded-xl border px-4 py-3 text-white transition-colors focus:outline-none"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="bg-background border-border focus:border-primary w-full rounded-xl border px-4 py-3 text-white transition-colors focus:outline-none"
                  value={securityForm.confirmPassword}
                  onChange={(e) =>
                    setSecurityForm({...securityForm, confirmPassword: e.target.value})
                  }
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isUpdatingPassword ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>

            {user?.role === "CUSTOMER" && (
              <div className="border-border mt-12 border-t pt-8">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase">
                      Danger Zone
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Deleting your account will permanently remove all your
                      data.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border py-4 font-black tracking-widest uppercase transition-all disabled:opacity-50"
                  >
                    {isDeletingAccount ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5" />
                        Delete Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Sidebar */}
        <div className="flex w-full flex-col gap-6 md:w-80">
          <div className="bg-card border-border relative overflow-hidden rounded-3xl border p-8">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="bg-primary/20 border-background flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-xl">
                <User className="text-primary h-12 w-12" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                  {user?.email?.split("@")[0] || "Guest User"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {user?.email || "guest@example.com"}
                </p>
                <span className="bg-primary text-primary-foreground mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase">
                  {user?.role || "CUSTOMER"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-3xl border p-4">
            <nav className="flex flex-col gap-1">
              {[
                {icon: User, label: "Account Details"},
                {icon: Ticket, label: "My Bookings"},
                {icon: Shield, label: "Security"},
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(item.label)}
                  className={`flex items-center justify-between rounded-2xl p-4 transition-all ${
                    activeTab === item.label
                      ? "bg-primary text-primary-foreground shadow-primary/20 shadow-lg"
                      : "text-muted-foreground hover:bg-accent/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-bold">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 transition-transform ${activeTab === item.label ? "rotate-90 opacity-100" : "opacity-50"}`}
                  />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Profile;
