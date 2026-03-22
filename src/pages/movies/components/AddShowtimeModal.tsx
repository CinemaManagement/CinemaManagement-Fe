import {useState, useEffect} from "react";
import {X, Calendar, Clock, Save, Monitor} from "lucide-react";
import {showtimeApi} from "@/services/api/showtimeApi";
import {cinemaRoomApi} from "@/services/api/cinemaRoomApi";
import type {CinemaRoom} from "@/types/document";
import toast from "react-hot-toast";

interface AddShowtimeModalProps {
  movieId: string;
  movieTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddShowtimeModal = ({
  movieId,
  movieTitle,
  isOpen,
  onClose,
  onSuccess,
}: AddShowtimeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    roomId: "",
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
            setFormData((prev) => ({...prev, roomId: data[0]._id}));
          }
        } catch {
          toast.error("Failed to fetch rooms.");
        }
      };
      fetchRooms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value, type} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);

      const payload = {
        movieId,
        cinemaRoomId: formData.roomId,
        startTime: startDateTime,
        pricingRule: {
          NORMAL: formData.priceNormal,
          VIP: formData.priceVip,
          COUPLE: formData.priceCouple,
        },
        status: "ACTIVE",
      };

      await showtimeApi.createShowtime(payload);
      toast.success("Showtime added successfully!");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to add showtime.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-300">
      <div
        className="glass-card animate-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 md:p-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/40 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
              Add Showtime
            </h2>
            <p className="text-primary mt-1 text-xs font-bold tracking-widest uppercase">
              {movieTitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Select Date
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Calendar className="text-primary h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="focus:border-primary focus:ring-primary shadow-inner-glossy w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white transition-all outline-none focus:ring-1"
                    required
                  />
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Cinema Room
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Monitor className="text-primary h-4 w-4" />
                  </div>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    className="focus:border-primary focus:ring-primary shadow-inner-glossy w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white transition-all outline-none focus:ring-1"
                    required
                  >
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id} className="bg-background text-white">
                        {room.roomName}
                      </option>
                    ))}
                    {rooms.length === 0 && (
                      <option value="" className="bg-background text-white">
                        No rooms available
                      </option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-white/40">
                    {/* Simple chevron icon could be added here */}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  Start Time
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Clock className="text-primary h-4 w-4" />
                  </div>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="focus:border-primary focus:ring-primary shadow-inner-glossy w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm text-white transition-all outline-none focus:ring-1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                Pricing Rules (USD)
              </p>

              <div className="grid grid-cols-3 gap-4">
                {/* Normal Price */}
                <div className="space-y-2">
                  <label className="ml-1 block text-center text-[9px] font-bold tracking-tighter text-white/60 uppercase">
                    Normal
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="priceNormal"
                      value={formData.priceNormal}
                      onChange={handleChange}
                      className="focus:border-primary shadow-inner-glossy w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* VIP Price */}
                <div className="space-y-2">
                  <label className="ml-1 block text-center text-[9px] font-bold tracking-tighter text-white/60 uppercase">
                    VIP
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="priceVip"
                      value={formData.priceVip}
                      onChange={handleChange}
                      className="focus:border-primary shadow-inner-glossy w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Couple Price */}
                <div className="space-y-2">
                  <label className="ml-1 block text-center text-[9px] font-bold tracking-tighter text-white/60 uppercase">
                    Couple
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="priceCouple"
                      value={formData.priceCouple}
                      onChange={handleChange}
                      className="focus:border-primary shadow-inner-glossy w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white transition-all outline-none"
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
                className="bg-primary text-primary-foreground btn-glossy flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black tracking-widest uppercase shadow-[0_10px_30px_-5px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="border-primary-foreground h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Save Showtime
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
