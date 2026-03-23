/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Minus,
  ShoppingBag,
  Info,
  Loader2,
  ShoppingCart,
  Clock,
} from "lucide-react";
import {movieApi} from "@/services/api/movieApi";
import {createFoodBooking, addFoodToBooking, confirmPayment, cancelBooking} from "@/services/api/bookingApi";
import toast from "react-hot-toast";
import {foodApi} from "@/services/api/foodApi";
import {cartApi} from "@/services/api/cartApi";

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(amount);

const FoodSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movieId");
  const movieBookingId = searchParams.get("movieBookingId");
  const expiredAtParam = searchParams.get("expiredAt");
  const seats = searchParams.get("seats")?.split(",") || [];

  const [movie, setMovie] = useState<any>({});
  const [foodMenu, setFoodMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [userCart, setUserCart] = useState<any>(null);
  const [cartAdded, setCartAdded] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!expiredAtParam) return;
    const expiredAt = new Date(decodeURIComponent(expiredAtParam)).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiredAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        toast.error("Session expired! Your held seats have been released.");
        navigate(-1);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiredAtParam, navigate]);
  

  useEffect(() => {
    // Fetch food menu from backend
    foodApi
      .getFoods()
      .then((res: any) => {
        const data = res.data?.data ?? res.data;
        const items = Array.isArray(data) ? data : [];
        setFoodMenu(items);
      })
      .catch((err) => {
        console.error("Failed to fetch food", err);
        toast.error("Failed to load food menu");
      })
      .finally(() => setLoading(false));

    cartApi.getCart().then((res: any) => {
      const data = res.data?.data ?? res.data;
      setUserCart(data);
    });
    if (movieId) {
      movieApi
        .getMovieById(movieId)
        .then((res) => setMovie(res.data))
        .catch((err) => console.error("Failed to fetch movie", err));
    }
  }, [movieId]);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return {...prev, [id]: next};
    });
  };

  const calculateTotal = () =>
    foodMenu.reduce((acc, item) => {
      const id = item._id || item.id;
      return acc + item.price * (cart[id] || 0);
    }, 0);

  const handleAddFromCart = () => {
    // The cart can be { items: [...] } or just an array depending on backend serialization
    const itemsArray = Array.isArray(userCart?.items)
      ? userCart.items
      : Array.isArray(userCart)
        ? userCart
        : [];

    if (itemsArray.length === 0) {
      toast.error("Your card is empty!");
      return;
    }

    setCart((prev) => {
      const newCart = {...prev};
      itemsArray.forEach((item: any) => {
        // Handle variations where foodId might be populated or an object
        const id = item.foodId?._id || item.foodId?.id || item.foodId || item._id || item.id;
        const qty = item.quantity || 1;

        if (id) {
          newCart[id] = (newCart[id] || 0) + qty;
        }
      });
      return newCart;
    });

    setCartAdded(true);
    toast.success("Added food from your card!");


  };

  const handleCheckout = async () => {
    if (!movieBookingId) {
      toast.error("Missing booking record. Please restart your booking.");
      return;
    }
    
    setSubmitting(true);
    try {
      let foodBookingId: string | undefined;

      const cartItems = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([foodId, quantity]) => ({foodId, quantity}));

      // 1. Process food order and attach to the initial Held reservation
      if (cartItems.length > 0) {
        const foodRes = await createFoodBooking(cartItems);
        foodBookingId = foodRes._id || foodRes.data?._id;
        
        if (foodBookingId) {
          await addFoodToBooking(movieBookingId, foodBookingId);
        }
        await cartApi.clearCart();
      }

      // 2. Mock transaction details to finish checkout process
      await confirmPayment(movieBookingId, { method: "ONLINE", transactionId: `TRX_${Date.now()}` });

      toast.success("Payment confirmed! See your ticket details.");
      navigate(`/payment-success?bookingId=${movieBookingId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong processing payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const ticketPrice = seats.length * 75000;
  const foodTotal = calculateTotal();
  const grandTotal = ticketPrice + foodTotal;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in mx-auto min-h-screen max-w-7xl px-4 pt-12 pb-32 duration-700 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={async () => {
              if (movieBookingId) {
                toast.loading("Releasing held seats...", { id: "release" });
                try {
                  await cancelBooking(movieBookingId);
                  toast.success("Seats released.", { id: "release" });
                } catch (e) {
                  toast.dismiss("release");
                }
              }
              navigate(-1);
            }}
            className="glass-card hover:text-primary shadow-inner-glossy rounded-2xl p-4 text-white/40 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              CineLux Snacks
            </h1>
            <p className="text-primary mt-1 flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
              Enhance Your Experience <span className="bg-primary/40 h-1.5 w-1.5 rounded-full" />{" "}
              {movie?.title}
            </p>
          </div>
        </div>
        <div className="shadow-inner-glossy flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-2">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black whitespace-nowrap transition-colors ${
              timeLeft <= 120
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "bg-primary/10 text-primary"
            }`}>
              <Clock className="h-4 w-4" />
              <span>{`${Math.floor(timeLeft / 60).toString().padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`}</span>
            </div>
          )}
          <div className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2 shadow-lg">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-sm font-black whitespace-nowrap">STEP 03/04</span>
          </div>
          <span className="hidden px-4 text-[10px] font-black tracking-widest text-white/40 uppercase md:block">
            Food &amp; Drinks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        {/* Food Menu */}
        <div className="space-y-12 lg:col-span-2">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/40">
                <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                <p>Loading chef&apos;s specials...</p>
              </div>
            ) : (
              foodMenu.map((item) => {
                const id = item._id || item.id;
                return (
                  <div
                    key={id}
                    className="glass-card group hover:border-primary/30 shadow-inner-glossy flex flex-col items-start gap-6 rounded-[2rem] p-6 transition-all sm:flex-row sm:items-center"
                  >
                    <div className="h-24 w-24 shrink-0 self-center overflow-hidden rounded-3xl border border-white/5 shadow-2xl sm:h-28 sm:w-28 sm:self-auto">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl text-white/20">
                          🍿
                        </div>
                      )}
                    </div>
                    <div className="w-full min-w-0 flex-1 space-y-4">
                      <div>
                        <h3 className="line-clamp-2 text-lg font-black tracking-tight text-white uppercase sm:text-xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-white/40">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-primary text-xl font-black">
                          {formatVND(item.price)}
                        </span>
                        <div className="bg-background/50 shadow-inner-glossy flex items-center gap-4 rounded-2xl border border-white/5 p-1">
                          <button
                            onClick={() => updateQuantity(id, -1)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/5 hover:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-black text-white">
                            {cart[id] || 0}
                          </span>
                          <button
                            onClick={() => updateQuantity(id, 1)}
                            className="text-primary bg-primary/10 hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-xl font-black transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="glass-card shadow-inner-glossy flex items-center gap-8 rounded-[2.5rem] border-dashed border-white/10 p-8">
            <div className="bg-primary/10 text-primary shadow-inner-gold flex h-16 w-16 items-center justify-center rounded-2xl">
              <Info className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black tracking-tight text-white uppercase">
                VIP Experience?
              </h4>
              <p className="text-sm font-medium text-white/40">
                Order through our mobile app while in the theater for contactless delivery directly
                to your seat.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card shadow-inner-glossy sticky top-24 flex flex-col gap-10 rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
              Order Detail
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                  Cinema Tickets
                </p>
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>{seats.length} x Regular Seats</span>
                  <span>{formatVND(ticketPrice)}</span>
                </div>
              </div>

              {foodTotal > 0 && (
                <div className="animate-in slide-in-from-top-4 space-y-4 duration-500">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    Food &amp; Drinks
                  </p>
                  <div className="space-y-3">
                    {foodMenu
                      .filter((item) => cart[item._id || item.id] > 0)
                      .map((item) => {
                        const id = item._id || item.id;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between text-sm font-bold text-white/80"
                          >
                            <span>
                              {cart[id]} x {item.name}
                            </span>
                            <span>{formatVND(item.price * cart[id])}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="space-y-8 border-t border-white/5 pt-10">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                      Total Payable
                    </span>
                    <p className="text-4xl leading-none font-black text-white">
                      {formatVND(grandTotal)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="btn-glossy bg-primary text-primary-foreground flex w-full items-center justify-center gap-3 rounded-3xl py-6 text-sm font-black tracking-[0.2em] uppercase shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_60px_-10px_rgba(var(--primary),0.6)] hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {submitting ? "Processing..." : "Make Payment"}
                </button>

                <button
                  onClick={handleAddFromCart}
                  disabled={cartAdded || submitting}
                  className="group shadow-inner-glossy flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 py-4 transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ShoppingCart className="text-primary h-5 w-5 opacity-50 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:opacity-100" />
                  <span className="text-[10px] font-black tracking-widest text-white/30 uppercase transition-all duration-300 group-hover:text-white/90">
                    {cartAdded ? "Added From Card" : "Add From Card"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodSelection;
