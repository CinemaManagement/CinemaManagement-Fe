import { useAppSelector } from '../../store';
import { User, Ticket, Settings, Shield, ChevronRight, Download, QrCode, Star, Film, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBookingHistory } from '../../services/api/bookingApi';
import { authApi } from '../../services/api/authApi';
import { toast } from 'react-hot-toast';
import type { MovieBooking, Showtime } from '@/types/document';

const Profile = () => {
   const { user } = useAppSelector((state) => state.auth);
   const [activeTab, setActiveTab] = useState('Account Details');
   const [bookings, setBookings] = useState<MovieBooking[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // Security form state
   const [securityForm, setSecurityForm] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
   });
   const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

   useEffect(() => {
      fetchBookings();
   }, []);

   const fetchBookings = async () => {
      try {
         setIsLoading(true);
         const res = await getBookingHistory();
         // The backend return { rawMovieBookingHistory, foodBookingHistory }
         setBookings(res.data.rawMovieBookingHistory || []);
      } catch (error) {
         console.error('Failed to fetch bookings:', error);
         toast.error('Failed to load booking history');
      } finally {
         setIsLoading(false);
      }
   };

   const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (securityForm.newPassword !== securityForm.confirmPassword) {
         toast.error('New passwords do not match');
         return;
      }

      try {
         setIsUpdatingPassword(true);
         await authApi.changePassword({
            oldPassword: securityForm.oldPassword,
            newPassword: securityForm.newPassword
         });
         toast.success('Password changed successfully');
         setSecurityForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error: any) {
         const message = error.response?.data?.message || 'Failed to change password';
         toast.error(message);
      } finally {
         setIsUpdatingPassword(false);
      }
   };

   const renderBookingItem = (booking: MovieBooking) => {
      const showtime = booking.showtimeId as unknown as Showtime;
      const date = showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString() : 'N/A';
      const time = showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

      return (
         <div key={booking._id} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background/50 border border-border rounded-2xl transition-all hover:border-primary/30">
               <div className="flex items-start gap-6">
                  <div className="w-16 h-20 bg-accent/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                     <Film className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Movie Booking</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${booking.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                           }`}>
                           {booking.status}
                        </span>
                     </div>
                     <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {date} • {time} • Seats: <span className="text-primary font-bold">{booking.seats.map(s => s.seatCode).join(', ')}</span>
                     </p>
                     <p className="text-xs text-muted-foreground mt-2">Booking ID: {booking.bookingCode}</p>
                  </div>
               </div>

               <div className="flex md:flex-col items-end gap-3 mt-4 md:mt-0">
                  <span className="text-xl font-black text-white">${booking.totalAmount.toFixed(2)}</span>
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
      );
   };

   const renderContent = () => {
      switch (activeTab) {
         case 'Account Details':
            return (
               <div className="space-y-8">
                  <div className="bg-card border border-border rounded-3xl p-8">
                     <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <Ticket className="w-7 h-7 text-primary" /> Recent Bookings
                     </h2>

                     {isLoading ? (
                        <div className="flex justify-center py-12">
                           <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                     ) : bookings.length > 0 ? (
                        <div className="flex flex-col gap-4">
                           {bookings.slice(0, 3).map(renderBookingItem)}
                           {bookings.length > 3 && (
                              <button
                                 onClick={() => setActiveTab('My Bookings')}
                                 className="w-full mt-6 py-4 border border-border rounded-2xl text-muted-foreground font-bold hover:bg-accent/20 transition-all uppercase tracking-widest text-sm"
                              >
                                 View Full History
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                           <p className="text-muted-foreground">No bookings found</p>
                        </div>
                     )}
                  </div>
               </div>
            );
         case 'My Bookings':
            return (
               <div className="bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                     <Ticket className="w-7 h-7 text-primary" /> All Bookings
                  </h2>
                  {isLoading ? (
                     <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                     </div>
                  ) : bookings.length > 0 ? (
                     <div className="flex flex-col gap-4">
                        {bookings.map(renderBookingItem)}
                     </div>
                  ) : (
                     <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                        <p className="text-muted-foreground">No bookings found</p>
                     </div>
                  )}
               </div>
            );
         case 'Security':
            return (
               <div className="bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                     <Shield className="w-7 h-7 text-primary" /> Security Settings
                  </h2>
                  <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Password</label>
                        <input
                           type="password"
                           required
                           className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                           value={securityForm.oldPassword}
                           onChange={(e) => setSecurityForm({ ...securityForm, oldPassword: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
                        <input
                           type="password"
                           required
                           className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                           value={securityForm.newPassword}
                           onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
                        <input
                           type="password"
                           required
                           className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                           value={securityForm.confirmPassword}
                           onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        />
                     </div>
                     <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                     </button>
                  </form>
               </div>
            );
         default:
            return null;
      }
   };

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
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">{user?.email?.split('@')[0] || 'Guest User'}</h2>
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
                        { icon: User, label: 'Account Details' },
                        { icon: Ticket, label: 'My Bookings' },
                        { icon: Shield, label: 'Security' },
                        { icon: Settings, label: 'Preferences' },
                     ].map((item, i) => (
                        <button
                           key={i}
                           onClick={() => setActiveTab(item.label)}
                           className={`flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.label ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-accent/20 hover:text-white'
                              }`}
                        >
                           <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5" />
                              <span className="font-bold">{item.label}</span>
                           </div>
                           <ChevronRight className={`w-5 h-5 transition-transform ${activeTab === item.label ? 'rotate-90 opacity-100' : 'opacity-50'}`} />
                        </button>
                     ))}
                  </nav>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1">
               {renderContent()}
            </div>
         </div>
      </div>
   );
};

export default Profile;
