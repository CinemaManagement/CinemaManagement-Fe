import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, Minus, ShoppingBag, Info, Ticket } from 'lucide-react';
import { MOCK_FOOD, MOCK_MOVIES } from '../../constants/mockData';

const FoodSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');
  const seats = searchParams.get('seats')?.split(',') || [];
  
  const movie = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0];
  const [cart, setCart] = useState<Record<string, number>>({});

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    return MOCK_FOOD.reduce((acc, item) => {
      return acc + (item.price * (cart[item.id] || 0));
    }, 0);
  };

  const ticketPrice = seats.length * 15; // Simple mock price
  const foodTotal = calculateTotal();
  const grandTotal = ticketPrice + foodTotal;

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-4 glass-card rounded-2xl text-white/40 hover:text-primary transition-all shadow-inner-glossy hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">CineLux Snacks</h1>
            <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              Enhance Your Experience <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" /> {movie.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 shadow-inner-glossy">
           <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-lg">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm font-black whitespace-nowrap">STEP 03/04</span>
           </div>
           <span className="text-[10px] font-black text-white/40 uppercase px-4 tracking-widest hidden md:block">Food & Drinks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Food Menu */}
        <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MOCK_FOOD.map((item) => (
                <div key={item.id} className="glass-card rounded-[2.5rem] p-8 flex gap-8 items-center group hover:border-primary/30 transition-all shadow-inner-glossy">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shrink-0 border border-white/5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{item.name}</h3>
                      <p className="text-xs text-white/40 font-medium line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xl font-black text-primary">${item.price.toFixed(2)}</span>
                       <div className="flex items-center gap-4 bg-background/50 rounded-2xl p-1 border border-white/5 shadow-inner-glossy">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                             <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-black text-white w-6 text-center">{cart[item.id] || 0}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-all font-black"
                          >
                             <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 glass-card rounded-[2.5rem] border-dashed border-white/10 flex items-center gap-8 shadow-inner-glossy">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner-gold">
                   <Info className="w-8 h-8" />
                </div>
                <div className="flex-1">
                   <h4 className="text-lg font-black text-white uppercase tracking-tight">VIP Experience?</h4>
                   <p className="text-sm text-white/40 font-medium">Order through our mobile app while in the theater for contactless delivery directly to your seat.</p>
                </div>
            </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-[3rem] p-10 sticky top-24 shadow-2xl shadow-inner-glossy flex flex-col gap-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Order Detail</h2>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Cinema Tickets</p>
                    <div className="flex justify-between items-center text-sm font-bold text-white">
                       <span>{seats.length} x Regular Seats</span>
                       <span>${ticketPrice.toFixed(2)}</span>
                    </div>
                 </div>

                 {foodTotal > 0 && (
                   <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Food & Drinks</p>
                      <div className="space-y-3">
                         {MOCK_FOOD.filter(item => cart[item.id] > 0).map(item => (
                           <div key={item.id} className="flex justify-between items-center text-sm font-bold text-white/80">
                              <span>{cart[item.id]} x {item.name}</span>
                              <span>${(item.price * cart[item.id]).toFixed(2)}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 <div className="pt-10 border-t border-white/5 space-y-8">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Total Payable</span>
                          <p className="text-4xl font-black text-white leading-none">${grandTotal.toFixed(2)}</p>
                       </div>
                    </div>
                    
                    <button
                     onClick={() => navigate('/payment-success')}
                     className="w-full py-6 bg-primary text-primary-foreground font-black rounded-3xl hover:scale-105 transition-all btn-glossy shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] uppercase tracking-[0.2em] text-sm"
                    >
                      Make Payment
                    </button>
                    
                    <div className="flex items-center justify-center gap-3 py-4 border border-white/5 rounded-2xl bg-white/5 shadow-inner-glossy">
                       <Ticket className="w-5 h-5 text-primary opacity-50" />
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Secure Checkout</span>
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodSelection;
