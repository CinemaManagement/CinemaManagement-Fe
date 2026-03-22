import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Save, Monitor } from 'lucide-react';
import { showtimeApi } from '@/services/api/showtimeApi';
import { cinemaRoomApi } from '@/services/api/cinemaRoomApi';
import type { CinemaRoom } from '@/types/document';
import toast from 'react-hot-toast';

interface AddShowtimeModalProps {
  movieId: string;
  movieTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddShowtimeModal = ({ movieId, movieTitle, isOpen, onClose, onSuccess }: AddShowtimeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    roomId: '',
    priceNormal: 12,
    priceVip: 18,
    priceCouple: 35,
  });

  useEffect(() => {
    if (isOpen) {
      const fetchRooms = async () => {
        try {
          const response = await cinemaRoomApi.getRooms();
          const data = response.data?.data || response.data || [];
          setRooms(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, roomId: data[0]._id }));
          }
        } catch {
          toast.error('Failed to fetch rooms.');
        }
      };
      fetchRooms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const payload = {
        movieId,
        cinemaRoomId: formData.roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        pricingRule: {
          NORMAL: formData.priceNormal,
          VIP: formData.priceVip,
          COUPLE: formData.priceCouple,
        },
        status: 'ACTIVE',
      };

      await showtimeApi.createShowtime(payload);
      toast.success('Showtime added successfully!');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to add showtime.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="glass-card w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 md:p-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Add Showtime</h2>
            <p className="text-primary text-xs font-bold tracking-widest uppercase mt-1">{movieTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Select Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-glossy"
                    required
                  />
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Cinema Room</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-glossy appearance-none"
                    required
                  >
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id} className="bg-background text-white">
                        {room.roomName}
                      </option>
                    ))}
                    {rooms.length === 0 && (
                      <option value="" className="bg-background text-white">No rooms available</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/40">
                    {/* Simple chevron icon could be added here */}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Start Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-glossy"
                    required
                  />
                </div>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">End Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner-glossy"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Pricing Rules (USD)</p>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Normal Price */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/60 uppercase tracking-tighter ml-1 text-center block">Normal</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="priceNormal"
                      value={formData.priceNormal}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white text-center focus:border-primary outline-none transition-all shadow-inner-glossy"
                      required
                    />
                  </div>
                </div>

                {/* VIP Price */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/60 uppercase tracking-tighter ml-1 text-center block">VIP</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="priceVip"
                      value={formData.priceVip}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white text-center focus:border-primary outline-none transition-all shadow-inner-glossy"
                      required
                    />
                  </div>
                </div>

                {/* Couple Price */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-white/60 uppercase tracking-tighter ml-1 text-center block">Couple</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="priceCouple"
                      value={formData.priceCouple}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white text-center focus:border-primary outline-none transition-all shadow-inner-glossy"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-4 rounded-2xl shadow-[0_10px_30px_-5px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 btn-glossy"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Showtime
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddShowtimeModal;
