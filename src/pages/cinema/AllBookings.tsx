/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { getAllBookingsHistory, checkIn } from "@/services/api/bookingApi";
import type { MovieBooking, ShowtimeSeat, FoodBooking } from "@/types/document";
import { BookingStatus } from "@/types/document";
import { Search, Calendar, Ticket, CheckCircle2, XCircle, Clock, Info, ExternalLink, Utensils } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import URL from "@/constants/url";

const AllBookings = () => {
  const [movieBookings, setMovieBookings] = useState<MovieBooking[]>([]);
  const [foodBookings, setFoodBookings] = useState<FoodBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<"MOVIE" | "FOOD">("MOVIE");
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookingsHistory();
      const data = res.data || res;
      setMovieBookings(data.movieBookingHistory || []);
      setFoodBookings(data.foodBookingHistory || []);
    } catch {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckInNow = async (id: string) => {
    try {
      await checkIn(id);
      toast.success("Check-in successful");
      fetchBookings();
    } catch {
      toast.error("Check-in failed");
    }
  };

  const filteredMovies = movieBookings.filter((b: MovieBooking) => {
    const matchesSearch = b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.userId && b.userId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFoods = foodBookings.filter((b: FoodBooking) => {
    const matchesSearch = b._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.userId && b.userId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || b.status === (statusFilter as any);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "CHECKED_IN": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "HELD": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "EXPIRED": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      case "CANCELED": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "PENDING": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase flex items-center gap-4">
              <Ticket className="w-12 h-12 text-primary" />
              Booking <span className="text-primary italic">Management</span>
            </h1>
            <p className="text-white/40 font-medium tracking-widest uppercase text-xs">
              Monitor and verify all cinema activity.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setActiveTab("MOVIE")}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "MOVIE" ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
                >
                  <Ticket className="w-4 h-4" /> Movie
                </button>
                <button 
                  onClick={() => setActiveTab("FOOD")}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "FOOD" ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
                >
                  <Utensils className="w-4 h-4" /> Food
                </button>
             </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-primary/20 transition-all">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total {activeTab === "MOVIE" ? "Movies" : "Foods"}</p>
              <p className="text-4xl font-black text-white group-hover:text-primary transition-colors">
                {activeTab === "MOVIE" ? movieBookings.length : foodBookings.length}
              </p>
           </div>
           <div className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-green-400/20 transition-all text-right md:text-left">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Paid Bookings</p>
              <p className="text-4xl font-black text-green-400">
                {activeTab === "MOVIE" 
                  ? movieBookings.filter(b => b.status === "PAID").length 
                  : foodBookings.filter(b => b.status === "PAID").length}
              </p>
           </div>
           <div className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-primary/20 transition-all text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-4xl font-black text-primary">
                {(activeTab === "MOVIE" 
                  ? movieBookings.reduce((acc, b) => b.status === "PAID" || b.status === "CHECKED_IN" ? acc + b.totalAmount : acc, 0)
                  : foodBookings.reduce((acc, b) => b.status === "PAID" ? acc + b.totalAmount : acc, 0)
                ).toLocaleString('vi-VN')}₫
              </p>
           </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={`Search by ${activeTab === "MOVIE" ? "Code" : "ID"} or User ID...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          
          <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 shrink-0">
             {["ALL", "PAID", "CHECKED_IN", "HELD", "CANCELED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as BookingStatus | "ALL")}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                    statusFilter === status 
                      ? "bg-primary text-black shadow-lg shadow-primary/20" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {status}
                </button>
             ))}
          </div>
        </div>

        {/* Table View */}
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {activeTab === "MOVIE" ? (
               <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-white/5 bg-white/2">
                   <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Movie Code</th>
                   <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Details</th>
                   <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Amount</th>
                   <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Status</th>
                   <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {filteredMovies.length > 0 ? filteredMovies.map((booking: MovieBooking) => (
                   <tr key={booking._id} className="group hover:bg-white/3 transition-colors">
                     <td className="px-8 py-8">
                        <div className="flex flex-col gap-1">
                           <span className="text-lg font-black text-white group-hover:text-primary transition-colors">#{booking.bookingCode}</span>
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ID: {booking._id.slice(-8)}</span>
                        </div>
                     </td>
                     <td className="px-8 py-8">
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 text-white/80">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold">{dayjs(booking.createdAt).format("DD MMM YYYY, HH:mm")}</span>
                         </div>
                          <div className="flex items-center gap-2">
                            {booking.seats.slice(0, 3).map((s: ShowtimeSeat, i: number) => (
                              <span key={i} className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60">
                                {s.seatCode}
                              </span>
                            ))}
                            {booking.seats.length > 3 && <span className="text-[10px] font-black text-white/20">+{booking.seats.length - 3}</span>}
                          </div>
                       </div>
                     </td>
                     <td className="px-8 py-8">
                        <span className="text-xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                          {booking.totalAmount.toLocaleString('vi-VN')}₫
                        </span>
                     </td>
                     <td className="px-8 py-8">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest uppercase ${getStatusColor(booking.status)}`}>
                           {booking.status === "PAID" && <Clock className="w-3.5 h-3.5" />}
                           {booking.status === "CHECKED_IN" && <CheckCircle2 className="w-3.5 h-3.5" />}
                           {booking.status === "CANCELED" && <XCircle className="w-3.5 h-3.5" />}
                           {booking.status}
                        </div>
                     </td>
                     <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                           {booking.status === "PAID" && (
                             <button 
                               onClick={() => handleCheckInNow(booking.bookingCode)}
                               className="bg-primary hover:bg-white text-black px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl transition-all active:scale-95"
                             >
                               Check-in
                             </button>
                           )}
                           <button 
                              onClick={() => navigate(URL.CheckIn.replace(":id", booking._id))}
                              className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                              title="Manual Check-in Screen"
                           >
                              <ExternalLink className="w-5 h-5" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-white/20">
                           <Info className="w-12 h-12" />
                           <p className="text-lg font-black uppercase tracking-widest">No movie bookings found</p>
                        </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
            ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Order ID</th>
                  <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Food Items</th>
                  <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Total</th>
                  <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFoods.length > 0 ? filteredFoods.map((food: FoodBooking) => (
                  <tr key={food._id} className="group hover:bg-white/3 transition-colors">
                    <td className="px-8 py-8">
                       <span className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase">#{food._id.slice(-12)}</span>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex flex-col gap-2">
                          {food.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                 {item.quantity}
                               </div>
                               <span className="text-xs font-bold text-white/80">{item.name}</span>
                            </div>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <span className="text-xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                         {food.totalAmount.toLocaleString('vi-VN')}₫
                       </span>
                    </td>
                    <td className="px-8 py-8">
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest uppercase ${getStatusColor(food.status)}`}>
                          {food.status === "PAID" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {food.status}
                       </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <p className="text-xs font-bold text-white/40 uppercase">{dayjs(food.createdAt).format("DD/MM/YYYY")}</p>
                       <p className="text-lg font-black text-white">{dayjs(food.createdAt).format("HH:mm")}</p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-4 text-white/20">
                          <Utensils className="w-12 h-12" />
                          <p className="text-lg font-black uppercase tracking-widest">No food bookings found</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
};

export default AllBookings;
