import {useEffect, useState, useRef} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import {CheckCircle2, XCircle, Loader2,TriangleAlert, House} from "lucide-react";
import toast from "react-hot-toast";
import {confirmPayment, getBookingById} from "@/services/api/bookingApi";


const API_BASE = import.meta.env.VITE_APP_API || "http://localhost:3800";

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-paid">("loading");
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const verifyPayment = async () => {
      try {
        // ── VietQR flow ───────────────────────────────────────────────
        // When the user clicks "I've Paid" in the VietQR modal, confirmPayment
        // was already called before the redirect. We just need to show success.
        const isVietQR =
          searchParams.get("success") === "true" &&
          searchParams.get("bookingId") &&
          !searchParams.get("vnp_TxnRef");

        if (isVietQR) {
          const bid = searchParams.get("bookingId") || "";
          setBookingId(bid);
          
          // Check for a one-time session flag set by PaymentMethod
          const sessionKey = `justPaid_${bid}`;
          const isJustPaid = sessionStorage.getItem(sessionKey) === "true";
          
          try {
            const res = await getBookingById(bid);
            const booking = res.data || res;
            if (booking.status === "PAID" || booking.status === "CHECKED_IN") {
              if (isJustPaid) {
                // Success case: FIRST time payment confirmation
                setStatus("success");
                setMessage("Bank transfer confirmed!");
                toast.success("Payment confirmed!");
                // CONSUME the flag so it shows "already-paid" on refresh/new tab
                sessionStorage.removeItem(sessionKey);
              } else {
                // Already paid case: Revisit or copy-pasted link
                setStatus("already-paid");
                setMessage("This booking has already been paid for.");
              }
            } else {
              setStatus("error");
              setMessage("Booking found, but it is not marked as paid.");
            }
          } catch (e) {
            console.error("VietQR verify error:", e);
            setStatus("error");
            setMessage("Failed to verify booking status.");
          }
          return;
        }

        // ── VNPay flow ────────────────────────────────────────────────
        // Forward all VNPay query params to backend for signature verification
        const queryString = searchParams.toString();

        // Guard: if no VNPay params, don't call backend
        if (!searchParams.get("vnp_TxnRef")) {
          setStatus("error");
          setMessage(
            "No payment information found. Please complete payment through the booking flow.",
          );
          return;
        }

        const res = await fetch(`${API_BASE}/api/bookings/vnpay-return?${queryString}`);
        const data = await res.json();
        console.log(data);
        const bookingId = searchParams.get("vnp_TxnRef") || "";
        const transactionNo = searchParams.get("vnp_TransactionNo");

        setBookingId(bookingId);

        console.log("VNPay verification response:", res.status, data);

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || `Server error (${res.status})`);
          return;
        }

        if (data.success) {
          if (data.message === "Booking already paid") {
            setStatus("already-paid");
            setMessage("This booking has already been paid for.");
          } else {
            setStatus("success");
            setMessage(data.message || "Payment successful!");
            toast.success("Payment confirmed!");
          }
          setBookingId(data.bookingId || "");
          if (data.finalAmount) {
            setFinalAmount(data.finalAmount.toString());
          }
          
          try {
            await confirmPayment(data.bookingId || bookingId, {
              method: "VNPAY",
              transactionId: transactionNo || "",
            });
          } catch (e) {
            console.error("Optional confirmPayment failed:", e);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Payment was not successful.");
        }
      } catch (err: any) {
        console.error("VNPay verify error:", err);
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
        {status === "already-paid" && (
          <>
            <div className="bg-primary text-primary-foreground btn-glossy mb-8 flex h-24 w-24 animate-bounce items-center justify-center rounded-full shadow-[0_0_50px_rgba(var(--primary),0.5)]">
              <TriangleAlert className="h-12 w-12" />
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase md:text-4xl">
              Payment <span className="text-gradient-gold">Already Paid!</span>
            </h1>
            <p className="mb-10 text-xs font-medium tracking-widest text-white/40 uppercase">
              {message}
            </p>
            <button
              onClick={() => navigate(`/`)}
              className="bg-primary text-primary-foreground btn-glossy flex w-full items-center justify-center gap-3 rounded-2xl py-5 font-black tracking-widest uppercase transition-all hover:scale-105"
            >
              <House className="h-5 w-5" /> Return Home
            </button>
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
            {finalAmount && (
              <p className="mb-10 text-xl font-bold text-gradient-gold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(finalAmount))}
              </p>
            )}
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
