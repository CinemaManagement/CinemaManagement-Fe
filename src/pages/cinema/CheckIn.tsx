import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { checkIn, getBookingById } from "@/services/api/bookingApi";
import type { MovieBooking, ShowtimeSeat } from "@/types/document";
import { CheckCircle2, AlertCircle, Calendar, Ticket, ArrowLeft, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import URL from "@/constants/url";

const CheckInConfirm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<MovieBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const res = await getBookingById(id);
        const found = res.data || res;
        if (found) {
          setBooking(found);
        } else {
          toast.error("Booking not found");
        }
      } catch {
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      await checkIn(id);
      toast.success("Check-in confirmed successfully!");
      navigate(URL.AllBookings);
    } catch {
      toast.error("Check-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <AlertCircle className="w-20 h-20 text-red-500/50" />
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Booking Not Found</h2>
        <button 
          onClick={() => navigate(URL.AllBookings)}
          className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(var(--primary),0.1)]">
           {/* Header */}
           <div className="bg-primary/10 border-b border-white/5 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_#d4af37]" />
              <Ticket className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                Confirm <span className="text-primary italic">Check-in</span>
              </h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Manual Verification Required</p>
           </div>

           {/* Content */}
           <div className="p-10 space-y-8">
              <div className="space-y-6">
                 {/* Booking Info Box */}
                 <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Booking Code</span>
                       <span className="text-xl font-black text-white">#{booking.bookingCode}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-2">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Date & Time</p>
                          <div className="flex items-center gap-2 text-white/80">
                             <Calendar className="w-4 h-4 text-primary" />
                             <span className="text-sm font-bold">{dayjs(booking.createdAt).format("DD MMM, HH:mm")}</span>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Customer</p>
                          <div className="flex items-center gap-2 text-white/80">
                             <User className="w-4 h-4 text-primary" />
                             <span className="text-sm font-bold truncate">User ID: {booking.userId.slice(-6).toUpperCase()}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Seats Section */}
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Allocated Seats</p>
                    <div className="flex flex-wrap gap-2">
                       {booking.seats.map((s: ShowtimeSeat, i: number) => (
                         <div key={i} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                            <span className="text-primary font-black">{s.seatCode}</span>
                            <div className="w-1 h-1 bg-primary/40 rounded-full" />
                            <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">{s.type}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Status Alert */}
                 {booking.status === "CHECKED_IN" ? (
                   <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                      <CheckCircle2 className="w-8 h-8 text-blue-400 shrink-0" />
                      <div>
                         <p className="text-blue-400 font-bold uppercase text-xs tracking-widest">Already Verified</p>
                         <p className="text-white/40 text-xs">This booking was already checked in at {dayjs(booking.createdAt).format("HH:mm")}</p>
                      </div>
                   </div>
                 ) : booking.status !== "PAID" ? (
                   <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                      <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
                      <div>
                         <p className="text-red-400 font-bold uppercase text-xs tracking-widest">Invalid Status</p>
                         <p className="text-white/40 text-xs">This booking is currently {booking.status} and cannot be checked in.</p>
                      </div>
                   </div>
                 ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                 {booking.status === "PAID" && (
                   <button
                     disabled={submitting}
                     onClick={handleConfirm}
                     className="w-full bg-primary hover:bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(var(--primary),0.2)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                   >
                     {submitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          Confirm ENTRY
                        </>
                     )}
                   </button>
                 )}
                 <button 
                   onClick={() => navigate(URL.AllBookings)}
                   className="w-full bg-white/5 border border-white/5 py-5 rounded-[1.5rem] text-white/60 font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
                 >
                   Cancel & Return
                 </button>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
      `}</style>
    </div>
  );
};

export default CheckInConfirm;
