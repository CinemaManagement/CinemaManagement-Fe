import { useAppSelector } from '../../store';
import { User, Ticket, Settings, Shield, ChevronRight, Download, QrCode, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);

  const mockBookings = [
    {
      id: 'BK-7729',
      movie: 'Star Wars: The Last Jedi',
      date: 'Oct 24, 2026',
      time: '07:30 PM',
      seats: ['F5', 'F6'],
      amount: '$36.00',
      status: 'PAID',
    },
    {
      id: 'BK-5521',
      movie: 'Dune: Part Two',
      date: 'Oct 15, 2026',
      time: '04:15 PM',
      seats: ['D10', 'D11'],
      amount: '$30.00',
      status: 'CHECKED_IN',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar */}
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
                <h2 className="text-xl font-bold text-white">{user?.fullName || 'Guest User'}</h2>
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
                  { icon: shield, label: 'Security', active: false },
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
              
              <div className="flex flex-col gap-4">
                 {mockBookings.map((booking) => (
                   <div key={booking.id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background/50 border border-border rounded-2xl transition-all hover:border-primary/30">
                         <div className="flex items-start gap-6">
                            <div className="w-16 h-20 bg-accent/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                               <Film className="w-8 h-8 opacity-40" />
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">{booking.movie}</h3>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                    booking.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                                  }`}>
                                     {booking.status}
                                  </span>
                               </div>
                               <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  {booking.date} • {booking.time} • Seats: <span className="text-primary font-bold">{booking.seats.join(', ')}</span>
                               </p>
                               <p className="text-xs text-muted-foreground mt-2">Booking ID: {booking.id}</p>
                            </div>
                         </div>
                         
                         <div className="flex md:flex-col items-end gap-3 mt-4 md:mt-0">
                            <span className="text-xl font-black text-white">{booking.amount}</span>
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
              
              <button className="w-full mt-6 py-4 border border-border rounded-2xl text-muted-foreground font-bold hover:bg-accent/20 transition-all uppercase tracking-widest text-sm">
                 View Full History
              </button>
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

// Mocking icons that might be missing in some contexts
const Film = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M3 7h4" /><path d="M3 11h4" /><path d="M3 15h4" /><path d="M17 7h4" /><path d="M17 11h4" /><path d="M17 15h4" /></svg>;
const shield = Shield;

export default Profile;
