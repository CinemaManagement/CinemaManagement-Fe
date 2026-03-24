import {useEffect, useState} from "react";
import {useSearchParams, Link} from "react-router-dom";
import {CheckCircle2, Download, Printer, Home, Calendar, Clock, MapPin, Ticket, Loader2} from "lucide-react";
import {getBookingById} from "@/services/api/bookingApi";
import dayjs from "dayjs";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getBookingById(bookingId);
        setBooking(res.data || res);
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-2xl font-bold text-white uppercase">Booking Not Found</h1>
        <Link to="/" className="text-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  const movie = booking.showtimeId?.movieId;
  const showtime = booking.showtimeId;
  const room = showtime?.cinemaRoomId;
  const seatsString = booking.seats?.map((s: any) => s.seatCode).join(", ");
  
  // Barcode API: https://bwip-js.metafloor.com/
  // bcid=code128 is a standard barcode format
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${booking.bookingCode}&scale=3&rotate=N&includetext`;

  return (
    <div className="animate-in fade-in zoom-in flex min-h-[80vh] items-center justify-center p-4 py-20 duration-700">
      <div className="glass-card shadow-inner-glossy flex w-full max-w-4xl flex-col items-stretch overflow-hidden rounded-[3rem] shadow-2xl md:flex-row">
        
        {/* Left Side: Success Message */}
        <div className="from-primary/10 flex flex-1 flex-col items-center justify-center bg-linear-to-b to-transparent p-12 md:p-20 text-center">
          <div className="bg-primary text-primary-foreground btn-glossy mb-8 flex h-24 w-24 animate-bounce items-center justify-center rounded-full shadow-[0_0_50px_rgba(var(--primary),0.5)]">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          
          <h1 className="italic mb-4 text-4xl font-black tracking-tighter text-white uppercase md:text-5xl">
            Enjoy The <span className="text-gradient-gold">Show!</span>
          </h1>
          <p className="mb-10 max-w-xs text-xs font-medium tracking-widest text-white/40 uppercase">
            Your booking has been confirmed. A digital ticket has been sent to your email.
          </p>
          
          <div className="flex w-full flex-col gap-4">
            <Link 
              to="/" 
              className="bg-primary text-primary-foreground btn-glossy flex w-full items-center justify-center gap-3 rounded-2xl py-5 font-black tracking-widest uppercase transition-all hover:scale-105"
            >
              <Home className="h-5 w-5" /> Back to Lobby
            </Link>
            <button className="shadow-inner-glossy flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-5 font-black tracking-widest text-white uppercase transition-all hover:bg-white/10">
              <Download className="h-5 w-5" /> Download PDF
            </button>
          </div>
        </div>

        {/* Right Side: Visual Ticket */}
        <div className="relative flex w-full flex-col items-center justify-between border-l border-white/5 bg-black/40 p-10 md:w-[400px]">
          {/* Decorative notches for ticket look */}
          <div className="bg-background absolute top-1/2 -left-4 hidden h-8 w-8 -translate-y-1/2 rounded-full md:block" />
          <div className="bg-background absolute top-1/2 -right-4 hidden h-8 w-8 -translate-y-1/2 rounded-full md:block" />
          
          <div className="relative z-10 w-full space-y-10">
             <div className="flex flex-col items-center gap-4">
                <div className="group relative rounded-3xl bg-white p-4 shadow-2xl transition-all hover:scale-105">
                   <img 
                     src={barcodeUrl} 
                     alt="Booking Barcode" 
                     className="h-24 w-64 object-contain"
                   />
                   <div className="bg-primary/20 absolute inset-0 flex items-center justify-center rounded-3xl opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="bg-black/80 rounded-full px-3 py-1.5 text-[10px] font-black text-white uppercase">Scan at Entrance</span>
                   </div>
                </div>
                <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">Order #{booking.bookingCode}</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Movie</p>
                   <p className="text-xl font-black leading-none tracking-tight text-white uppercase">{movie?.title || "Unknown Movie"}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Date</p>
                      <p className="flex items-center gap-2 text-sm font-black text-white uppercase">
                        <Calendar className="text-primary h-4 w-4" /> 
                        {showtime ? dayjs(showtime.startTime).format("MMM DD") : "N/A"}
                      </p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Time</p>
                      <p className="flex items-center gap-2 text-sm font-black text-white uppercase">
                        <Clock className="text-primary h-4 w-4" /> 
                        {showtime ? dayjs(showtime.startTime).format("hh:mm A") : "N/A"}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Seats</p>
                      <p className="flex items-center gap-2 text-sm font-black text-white uppercase">
                        <Ticket className="text-primary h-4 w-4" /> 
                        {seatsString || "N/A"}
                      </p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Hall</p>
                      <p className="flex items-center gap-2 text-sm font-black text-white uppercase">
                        <MapPin className="text-primary h-4 w-4" /> 
                        {room?.roomName || "N/A"}
                      </p>
                   </div>
                </div>
             </div>

             <div className="border-white/20 flex flex-col items-center gap-4 border-t border-dashed pt-8">
                <p className="italic text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Thank you for choosing CineLux</p>
                <button 
                  onClick={() => window.print()}
                  className="group flex items-center gap-2 text-xs font-black tracking-widest text-primary transition-colors hover:text-white uppercase"
                >
                   <Printer className="h-4 w-4 transition-transform group-hover:scale-125" /> Print Receipt
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
