/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useState} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import {CheckCircle2, XCircle, Loader2} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_APP_API || "http://localhost:3800";

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Forward all VNPay query params to backend for verification
        const queryString = searchParams.toString();
        const res = await fetch(`${API_BASE}/api/bookings/vnpay-return?${queryString}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Payment successful!");
          setBookingId(data.bookingId || "");
          toast.success("Payment confirmed!");
        } else {
          setStatus("error");
          setMessage(data.message || "Payment was not successful.");
        }
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setMessage("Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="animate-in fade-in zoom-in flex min-h-[80vh] items-center justify-center p-4 py-20 duration-700">
      <div className="glass-card shadow-inner-glossy flex w-full max-w-lg flex-col items-center overflow-hidden rounded-[3rem] p-12 text-center shadow-2xl md:p-20">
        {status === "loading" && (
          <>
            <div className="bg-primary/20 text-primary shadow-inner-glossy mb-8 flex h-24 w-24 items-center justify-center rounded-full">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase md:text-4xl">
              Verifying Payment
            </h1>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
              Please wait while we confirm your transaction with VNPay...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-primary text-primary-foreground btn-glossy mb-8 flex h-24 w-24 animate-bounce items-center justify-center rounded-full shadow-[0_0_50px_rgba(var(--primary),0.5)]">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase md:text-4xl">
              Payment <span className="text-gradient-gold">Confirmed!</span>
            </h1>
            <p className="mb-10 text-xs font-medium tracking-widest text-white/40 uppercase">
              {message}
            </p>
            <button
              onClick={() => navigate(`/payment-success?bookingId=${bookingId}`)}
              className="bg-primary text-primary-foreground btn-glossy flex w-full items-center justify-center gap-3 rounded-2xl py-5 font-black tracking-widest uppercase transition-all hover:scale-105"
            >
              <CheckCircle2 className="h-5 w-5" /> View Your Ticket
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="shadow-inner-glossy mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <XCircle className="h-12 w-12" />
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase md:text-4xl">
              Payment <span className="text-red-400">Failed</span>
            </h1>
            <p className="mb-10 text-xs font-medium tracking-widest text-white/40 uppercase">
              {message}
            </p>
            <button
              onClick={() => navigate("/")}
              className="shadow-inner-glossy flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-5 font-black tracking-widest text-white uppercase transition-all hover:bg-white/10"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VnpayReturn;
