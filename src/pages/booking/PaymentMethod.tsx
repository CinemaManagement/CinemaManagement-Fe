/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  CreditCard,
  Clock,
  Shield,
  Loader2,
  Ticket,
  ShoppingBag,
} from "lucide-react";
import { movieApi } from "@/services/api/movieApi";
import { createVnpayPaymentUrl } from "@/services/api/bookingApi";
import toast from "react-hot-toast";

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const PaymentMethod = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("movieId");
  const movieBookingId = searchParams.get("movieBookingId");
  const expiredAtParam = searchParams.get("expiredAt");
  const seats = searchParams.get("seats")?.split(",") || [];
  const ticketTotal = Number(searchParams.get("ticketTotal")) || 0;
  const foodTotal = Number(searchParams.get("foodTotal")) || 0;

  const [movie, setMovie] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

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
        navigate("/");
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiredAtParam, navigate]);

  useEffect(() => {
    if (movieId) {
      movieApi
        .getMovieById(movieId)
        .then((res) => setMovie(res.data))
        .catch((err) => console.error("Failed to fetch movie", err));
    }
  }, [movieId]);

  const grandTotal = ticketTotal + foodTotal;

  const handleVnpayPayment = async () => {
    if (!movieBookingId) {
      toast.error("Missing booking record. Please restart your booking.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createVnpayPaymentUrl(movieBookingId);
      if (res.paymentUrl) {
        // Redirect browser to VNPay sandbox
        window.location.href = res.paymentUrl;
      } else {
        toast.error("Failed to create payment URL");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong creating payment URL.");
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in mx-auto min-h-screen max-w-5xl px-4 pt-12 pb-32 duration-700 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="glass-card hover:text-primary shadow-inner-glossy rounded-2xl p-4 text-white/40 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Payment
            </h1>
            <p className="text-primary mt-1 flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
              Select Payment Method <span className="bg-primary/40 h-1.5 w-1.5 rounded-full" />{" "}
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
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-black whitespace-nowrap">STEP 04/04</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        {/* Payment Methods */}
        <div className="space-y-8 lg:col-span-2">
          <div className="space-y-4">
            <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
              Available Methods
            </p>

            {/* VNPay Option */}
            <button
              onClick={handleVnpayPayment}
              disabled={submitting}
              className="glass-card group hover:border-primary/40 shadow-inner-glossy flex w-full items-center gap-6 rounded-[2rem] border-2 border-primary/20 p-8 text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="bg-primary/10 text-primary shadow-inner-gold flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl">
                <CreditCard className="h-10 w-10" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                  {submitting ? "Redirecting..." : "VNPay"}
                </h3>
                <p className="text-sm font-medium text-white/40">
                  Pay with VNPay — supports ATM, Visa, MasterCard, QR Pay, and more. You will be redirected to VNPay&apos;s secure payment gateway.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-bold text-green-400/80">Secure Payment Gateway</span>
                </div>
              </div>
              <div className="text-primary opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                {submitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ChevronLeft className="h-6 w-6 rotate-180" />
                )}
              </div>
            </button>
          </div>

          {/* Security Info */}
          <div className="glass-card shadow-inner-glossy flex items-center gap-8 rounded-[2.5rem] border-dashed border-white/10 p-8">
            <div className="bg-primary/10 text-primary shadow-inner-gold flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl">
              <Shield className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black tracking-tight text-white uppercase">
                Safe & Secure
              </h4>
              <p className="text-sm font-medium text-white/40">
                All transactions are encrypted and processed through VNPay&apos;s certified payment gateway. Your financial data is never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card shadow-inner-glossy sticky top-24 flex flex-col gap-10 rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
              Order Summary
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                  Cinema Tickets
                </p>
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Ticket className="text-primary h-4 w-4" /> {seats.length} Seat(s)
                  </span>
                  <span>{formatVND(ticketTotal)}</span>
                </div>
              </div>

              {foodTotal > 0 && (
                <div className="space-y-4">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    Food & Drinks
                  </p>
                  <div className="flex items-center justify-between text-sm font-bold text-white/80">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="text-primary h-4 w-4" /> Food Order
                    </span>
                    <span>{formatVND(foodTotal)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-white/5 pt-10">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                      Grand Total
                    </span>
                    <p className="text-4xl leading-none font-black text-white">
                      {formatVND(grandTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
