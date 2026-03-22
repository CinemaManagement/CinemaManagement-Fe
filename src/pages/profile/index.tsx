/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import { User, Ticket, Settings, Shield, ChevronRight, Download, QrCode, Star, Film } from 'lucide-react';
import { bookingApi } from '../../services/api/bookingApi';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await bookingApi.getHistory();
        const movieBookings = res.data?.movieBookings || [];
        setBookings(movieBookings);
      } catch (error) {
        console.error("Failed to fetch booking history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-3xl p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User className="w-32 h-32" />
            </div>
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-xl">
                 <User className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{'Guest User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || 'guest@example.com'}</p>
                <span className="mt-3 inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full uppercase">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-4">
             <nav className="flex flex-col gap-1">
                {[
                  { icon: User, label: 'Account Details', active: true },
                  { icon: Ticket, label: 'My Bookings', active: false },
                  { icon: Shield, label: 'Security', active: false },
                  { icon: Settings, label: 'Preferences', active: false },
                ].map((item, i) => (
                  <button 
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      item.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <item.icon className="w-5 h-5" />
                       <span className="font-bold">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </button>
                ))}
             </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
           <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                 <Ticket className="w-7 h-7 text-primary" /> Recent Bookings
              </h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>You have no recent bookings.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                   {bookings.map((booking) => (
                     <div key={booking._id} className="relative group">
                        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background/50 border border-border rounded-2xl transition-all hover:border-primary/30">
                           <div className="flex items-start gap-6">
                              <div className="w-16 h-20 bg-accent/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                                 <Film className="w-8 h-8 opacity-40" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{booking.showtime?.movie?.title || 'Unknown Movie'}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                      booking.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                                    }`}>
                                       {booking.status || 'PENDING'}
                                    </span>
                                 </div>
                                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    {booking.showtime?.time || 'Unknown Time'} • Seats: <span className="text-primary font-bold">{booking.seats?.join(', ') || 'None'}</span>
                                 </p>
                                 <p className="text-xs text-muted-foreground mt-2">Booking ID: {booking._id}</p>
                              </div>
                           </div>
                           
                           <div className="flex md:flex-col items-end gap-3 mt-4 md:mt-0">
                              <span className="text-xl font-black text-white">${booking.totalAmount || '0.00'}</span>
                              <div className="flex gap-2">
                                 <button className="p-2 bg-accent/20 text-muted-foreground hover:text-primary transition-colors rounded-lg border border-border" title="Download PDF">
                                    <Download className="w-5 h-5" />
                                  </button>
                                  <button className="p-2 bg-accent/20 text-muted-foreground hover:text-primary transition-colors rounded-lg border border-border" title="Show QR Code">
                                    <QrCode className="w-5 h-5" />
                                  </button>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
              
              {!isLoading && bookings.length > 0 && (
                <button className="w-full mt-6 py-4 border border-border rounded-2xl text-muted-foreground font-bold hover:bg-accent/20 transition-all uppercase tracking-widest text-sm">
                   View Full History
                </button>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-3xl p-8">
                 <h3 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" /> Security
                 </h3>
                 <p className="text-sm text-muted-foreground mb-6">Update your password or manage your session settings.</p>
                 <button className="text-sm font-bold text-primary hover:underline uppercase tracking-widest">Change Password</button>
              </div>
              <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Star className="w-24 h-24 text-primary" />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase mb-2">CineLux Gold</h3>
                 <p className="text-sm text-muted-foreground mb-6">Current Points: 1,250</p>
                 <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black rounded-xl uppercase tracking-widest">Redeem Rewards</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
