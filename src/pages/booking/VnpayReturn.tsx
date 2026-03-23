/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3800";

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
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-20 animate-in fade-in zoom-in duration-700">
      <div className="max-w-lg w-full glass-card rounded-[3rem] overflow-hidden shadow-2xl shadow-inner-glossy p-12 md:p-20 flex flex-col items-center text-center">
        {status === "loading" && (
          <>
            <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-8 shadow-inner-glossy">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
              Verifying Payment
            </h1>
            <p className="text-white/40 font-medium uppercase tracking-widest text-xs">
              Please wait while we confirm your transaction with VNPay...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(var(--primary),0.5)] btn-glossy animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
              Payment <span className="text-gradient-gold">Confirmed!</span>
            </h1>
            <p className="text-white/40 font-medium uppercase tracking-widest text-xs mb-10">
              {message}
            </p>
            <button
              onClick={() => navigate(`/payment-success?bookingId=${bookingId}`)}
              className="w-full py-5 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all btn-glossy uppercase tracking-widest"
            >
              <CheckCircle2 className="w-5 h-5" /> View Your Ticket
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-24 h-24 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-8 shadow-inner-glossy">
              <XCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
              Payment <span className="text-red-400">Failed</span>
            </h1>
            <p className="text-white/40 font-medium uppercase tracking-widest text-xs mb-10">
              {message}
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-inner-glossy uppercase tracking-widest"
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
