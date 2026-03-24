/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  CreditCard,
  Clock,
  Shield,
  Loader2,
  Ticket,
  ShoppingBag,
  QrCode,
  CheckCircle,
  X,
  Copy,
} from "lucide-react";
import { movieApi } from "@/services/api/movieApi";
import { checkoutAndPay, getVietQRInfo, confirmPayment } from "@/services/api/bookingApi";
import { cartApi } from "@/services/api/cartApi";
import toast from "react-hot-toast";

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface VietQRData {
  bankBin: string;
  accountNumber: string;
  amount: number;
  description: string;
  bookingId: string;
}

const PaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const movieId = searchParams.get("movieId");
  const movieBookingId = searchParams.get("movieBookingId");
  const expiredAtParam = searchParams.get("expiredAt");
  const seats = searchParams.get("seats")?.split(",") || [];
  const ticketTotal = Number(searchParams.get("ticketTotal")) || 0;

  // Food items passed from FoodSelection via React Router state
  const foodItems: { foodId: string; quantity: number }[] =
    (location.state as any)?.foodItems ?? [];
  const foodTotal: number = (location.state as any)?.foodTotal ?? 0;

  const [movie, setMovie] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // VietQR state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<VietQRData | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

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

  const handleVnpayPayment = async () => {
    if (!movieBookingId) {
      toast.error("Missing booking record. Please restart your booking.");
      return;
    }

    setSubmitting(true);
    try {
      // One call: creates FoodBooking (if any items) + generates VNPay URL
      const res = await checkoutAndPay(movieBookingId, foodItems);
      if (res.paymentUrl) {
        // Clear the cart before redirecting (food is now committed to the booking)
        try { await cartApi.clearCart(); } catch (_) { /* non-critical */ }

        window.location.href = res.paymentUrl;
      } else {
        toast.error("Failed to create payment URL");
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong creating payment URL.");
      setSubmitting(false);
    }
  };

  const handleVietQRPayment = async () => {
    if (!movieBookingId) {
      toast.error("Missing booking record. Please restart your booking.");
      return;
    }

    setLoadingQR(true);
    try {
      const res = await getVietQRInfo(movieBookingId, foodItems);
      if (res.success) {
        setQrData(res);
        setShowQRModal(true);
        try { await cartApi.clearCart(); } catch (_) { /* non-critical */ }
      } else {
        toast.error("Failed to generate QR code.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not generate VietQR.");
    } finally {
      setLoadingQR(false);
    }
  };

  const handleConfirmVietQR = async () => {
    if (!movieBookingId) return;
    setConfirmingPayment(true);
    try {
      await confirmPayment(movieBookingId, { method: "VIETQR" });
      setShowQRModal(false);
      
      // Set a session flag for the return page to show "Success" instead of "Already Paid"
      // This flag is ONLY available in the current tab session.
      sessionStorage.setItem(`justPaid_${movieBookingId}`, "true");
      
      toast.success("Payment confirmed! Redirecting...");
      navigate(`/vnpay-return?bookingId=${movieBookingId}&success=true`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setConfirmingPayment(false);
    }
  };

  const buildQRImageUrl = (data: VietQRData) =>
    `https://img.vietqr.io/image/${data.bankBin}-${data.accountNumber}-compact2.png` +
    `?amount=${data.amount}&addInfo=${encodeURIComponent(data.description)}&accountName=CINELUX`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="animate-in fade-in mx-auto min-h-screen max-w-5xl px-4 pt-12 pb-32 duration-700 sm:px-6 lg:px-8">
      {/* VietQR Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="glass-card shadow-inner-glossy relative mx-4 flex w-full max-w-lg flex-col gap-6 rounded-[3rem] p-10 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-6 right-6 rounded-xl p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Scan to Pay</h2>
              <p className="text-primary text-xs font-bold tracking-widest uppercase">VietQR Bank Transfer</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
                <img
                  src={buildQRImageUrl(qrData)}
                  alt="VietQR Payment QR Code"
                  className="h-56 w-56 object-contain"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="glass-card rounded-2xl border border-white/5 p-5 text-center">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase">Transfer Amount</p>
              <p className="text-primary mt-1 text-3xl font-black">{formatVND(qrData.amount)}</p>
            </div>

            {/* Bank Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs font-black tracking-widest text-white/40 uppercase">Account</p>
                  <p className="text-sm font-black text-white">{qrData.accountNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(qrData.accountNumber, "Account number")}
                  className="text-primary hover:bg-primary/10 rounded-lg p-2 transition-all"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs font-black tracking-widest text-white/40 uppercase">Transfer Note</p>
                  <p className="truncate text-sm font-black text-white">{qrData.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(qrData.description, "Transfer note")}
                  className="text-primary hover:bg-primary/10 rounded-lg p-2 transition-all"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmVietQR}
              disabled={confirmingPayment}
              className="btn-glossy bg-primary text-primary-foreground flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-sm font-black tracking-widest uppercase transition-all hover:brightness-110 disabled:opacity-50"
            >
              {confirmingPayment ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              {confirmingPayment ? "Confirming..." : "I've Completed the Transfer"}
            </button>

            <p className="text-center text-xs text-white/20">
              Only click after completing the bank transfer. Your booking will be confirmed immediately.
            </p>
          </div>
        </div>
      )}

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
              disabled={submitting || loadingQR}
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

            {/* VietQR Option */}
            <button
              onClick={handleVietQRPayment}
              disabled={submitting || loadingQR}
              className="glass-card group hover:border-blue-400/40 shadow-inner-glossy flex w-full items-center gap-6 rounded-[2rem] border-2 border-blue-400/20 p-8 text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-400 shadow-[0_4px_24px_-4px_rgba(96,165,250,0.3)]">
                <QrCode className="h-10 w-10" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                  {loadingQR ? "Generating QR..." : "VietQR"}
                </h3>
                <p className="text-sm font-medium text-white/40">
                  Pay via bank transfer using VietQR. Scan with any Vietnamese banking app — VCB, MBBank, Techcombank, and more.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400/80">Instant QR Code · No Redirect</span>
                </div>
              </div>
              <div className="text-blue-400 opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                {loadingQR ? (
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
                Safe &amp; Secure
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

              {foodItems.length > 0 && (
                <div className="space-y-4">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    Food &amp; Drinks
                  </p>
                  <div className="flex items-center justify-between text-sm font-bold text-white/80">
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="text-primary h-4 w-4" />
                      {foodItems.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                    </span>
                    <span>{formatVND(foodTotal)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-white/5 pt-10">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                      Total
                    </span>
                    <p className="text-4xl leading-none font-black text-white">
                      {formatVND(ticketTotal + foodTotal)}
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
