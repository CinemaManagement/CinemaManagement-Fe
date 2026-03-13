import { CheckCircle2, Download, Printer, Home, Calendar, Clock, MapPin, Ticket, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-20 animate-in fade-in zoom-in duration-700">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-stretch glass-card rounded-[3rem] overflow-hidden shadow-2xl shadow-inner-glossy">
        
        {/* Left Side: Success Message */}
        <div className="flex-1 p-12 md:p-20 flex flex-col items-center text-center justify-center bg-linear-to-b from-primary/10 to-transparent">
          <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(var(--primary),0.5)] btn-glossy animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 italic">
            Enjoy The <span className="text-gradient-gold">Show!</span>
          </h1>
          <p className="text-white/40 font-medium uppercase tracking-widest text-xs mb-10 max-w-xs">
            Your booking has been confirmed. A digital ticket has been sent to your email.
          </p>
          
          <div className="flex flex-col w-full gap-4">
            <Link 
              to="/" 
              className="w-full py-5 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all btn-glossy uppercase tracking-widest"
            >
              <Home className="w-5 h-5" /> Back to Lobby
            </Link>
            <button className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-inner-glossy uppercase tracking-widest">
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>
        </div>

        {/* Right Side: Visual Ticket */}
        <div className="w-full md:w-[400px] bg-black/40 p-10 flex flex-col items-center justify-between relative border-l border-white/5">
          {/* Decorative notches for ticket look */}
          <div className="absolute top-1/2 -left-4 w-8 h-8 bg-background rounded-full -translate-y-1/2 hidden md:block" />
          <div className="absolute top-1/2 -right-4 w-8 h-8 bg-background rounded-full -translate-y-1/2 hidden md:block" />
          
          <div className="w-full space-y-10 relative z-10">
             <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-2xl relative group">
                   <QrCode className="w-full h-full text-black" />
                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                      <span className="text-[10px] font-black text-white bg-black/80 px-3 py-1.5 rounded-full uppercase">Scan at Entrance</span>
                   </div>
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Order #CLX-88291</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Movie</p>
                   <p className="text-xl text-white font-black uppercase tracking-tight leading-none">Avatar: Way of Water</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Date</p>
                      <p className="text-sm text-white font-black uppercase flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> OCT 24</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Time</p>
                      <p className="text-sm text-white font-black uppercase flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> 07:30 PM</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Seats</p>
                      <p className="text-sm text-white font-black uppercase flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /> F12, F13</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Hall</p>
                      <p className="text-sm text-white font-black uppercase flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> IMAX 01</p>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-dashed border-white/20 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">Thank you for choosing CineLux</p>
                <button className="text-primary hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
                   <Printer className="w-4 h-4 group-hover:scale-125 transition-transform" /> Print Receipt
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;
