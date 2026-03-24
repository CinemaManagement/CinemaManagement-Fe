import {useState, useEffect} from "react";
import {X, Calendar, Clock, Save, Monitor} from "lucide-react";
import {showtimeApi} from "@/services/api/showtimeApi";
import {cinemaRoomApi} from "@/services/api/cinemaRoomApi";
import {movieApi} from "@/services/api/movieApi";
import type {CinemaRoom, Showtime} from "@/types/document";
import toast from "react-hot-toast";
import dayjs from "dayjs";

interface EditShowtimeModalProps {
  showtime: Showtime;
  movieTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditShowtimeModal = ({
  showtime,
  movieTitle,
  isOpen,
  onClose,
  onSuccess,
}: EditShowtimeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    roomId: "",
    priceNormal: 0,
    priceVip: 0,
    priceCouple: 0,
  });
  const [movieDuration, setMovieDuration] = useState(120);
  const [existingShowtimes, setExistingShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    if (isOpen && showtime) {
      const startDate = dayjs(showtime.startTime);
      setFormData({
        date: startDate.format("YYYY-MM-DD"),
        startTime: startDate.format("HH:mm"),
        roomId:
          typeof showtime.cinemaRoomId === "string"
            ? showtime.cinemaRoomId
            : showtime.cinemaRoomId._id,
        priceNormal: showtime.pricingRule.NORMAL,
        priceVip: showtime.pricingRule.VIP,
        priceCouple: showtime.pricingRule.COUPLE,
      });

      const initData = async () => {
        try {
          const roomsRes = await cinemaRoomApi.getRooms();
          const roomsData = roomsRes.data?.data || roomsRes.data || [];
          setRooms(roomsData);

          const movieId =
            typeof showtime.movieId === "string" ? showtime.movieId : showtime.movieId._id;
          const movieRes = await movieApi.getMovieById(movieId);
          const movieData = movieRes.data?.data || movieRes.data;
          setMovieDuration(movieData.duration || 120);
        } catch {
          toast.error("Failed to load initial data.");
        }
      };
      initData();
    }
  }, [isOpen, showtime]);

  useEffect(() => {
    if (isOpen && formData.roomId && formData.date) {
      const fetchRoomShowtimes = async () => {
        try {
          const res = await showtimeApi.getShowtimesByRoom(formData.roomId);
          const all = (res.data?.data || res.data || []) as Showtime[];
          // Filter for ACTIVE and same day, exclude current showtime
          const filtered = all.filter((s) => {
            const sameDay = s.startTime.startsWith(formData.date);
            return s.status === "ACTIVE" && sameDay && s._id !== showtime._id;
          });
          setExistingShowtimes(filtered);
        } catch {
          console.error("Failed to fetch room showtimes");
        }
      };
      fetchRoomShowtimes();
    }
  }, [isOpen, formData.roomId, formData.date, showtime._id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value, type} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const dayStart = 8 * 60; // 08:00
  const dayEnd = 24 * 60; // 00:00
  const totalMinutes = dayEnd - dayStart;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const clickedMinutes = Math.round((percentage * totalMinutes + dayStart) / 5) * 5; // Snap to 5 mins

    setFormData((prev) => ({
      ...prev,
      startTime: minutesToTime(clickedMinutes),
    }));
  };

  const calculateEndTime = () => {
    if (!formData.startTime) return "";
    const startMins = timeToMinutes(formData.startTime);
    const endMins = startMins + movieDuration;
    return minutesToTime(endMins);
  };

  const getPercentage = (timeStr: string) => {
    const t = timeStr.includes("T") ? timeStr.split("T")[1].substring(0, 5) : timeStr;
    const mins = timeToMinutes(t);
    return ((mins - dayStart) / totalMinutes) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = timeToMinutes(start.includes("T") ? start.split("T")[1].substring(0, 5) : start);
    const e = timeToMinutes(end.includes("T") ? end.split("T")[1].substring(0, 5) : end);
    return ((e - s) / totalMinutes) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + movieDuration * 60000);

      const payload = {
        cinemaRoomId: formData.roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        pricingRule: {
          NORMAL: formData.priceNormal,
          VIP: formData.priceVip,
          COUPLE: formData.priceCouple,
        },
      };

      await showtimeApi.updateShowtime(showtime._id, payload);
      toast.success("Showtime updated successfully!");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to update showtime.");
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
              Edit Showtime
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

              {/* End Time (Display) */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black tracking-widest text-white/40 uppercase">
                  End Time (Auto)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 opacity-50">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <input
                    type="text"
                    value={calculateEndTime()}
                    className="shadow-inner-glossy w-full cursor-not-allowed rounded-2xl border border-white/5 bg-white/[0.02] py-3 pr-4 pl-11 text-sm text-white/40 transition-all outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Interactive Timeline */}
            {formData.date && formData.roomId && (
              <div className="space-y-3">
                <div className="ml-1 flex items-center justify-between">
                  <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                    Timeline Chart (Click to select time)
                  </label>
                </div>

                <div
                  className="relative h-12 w-full cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-inner"
                  onClick={handleTimelineClick}
                >
                  {/* Grid hour markers */}
                  {[8, 10, 12, 14, 16, 18, 20, 22].map((hour) => (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l border-white/5"
                      style={{left: `${((hour * 60 - dayStart) / totalMinutes) * 100}%`}}
                    >
                      <span className="absolute -bottom-0.5 left-1 text-[8px] font-black text-white/20">
                        {hour}h
                      </span>
                    </div>
                  ))}

                  {/* Already Scheduled sessions */}
                  {existingShowtimes.map((s) => (
                    <div
                      key={s._id}
                      className="absolute inset-y-2 flex items-center justify-center rounded border border-white/20 bg-white/10"
                      style={{
                        left: `${getPercentage(s.startTime)}%`,
                        width: `${getWidth(s.startTime, s.endTime)}%`,
                      }}
                    >
                      <span className="truncate px-1 text-[8px] font-bold text-white/20 uppercase">
                        Occupied
                      </span>
                    </div>
                  ))}

                  {/* Current selection preview */}
                  {formData.startTime && (
                    <div
                      className="border-primary bg-primary/20 absolute inset-y-1 flex items-center justify-center rounded-md border-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all"
                      style={{
                        left: `${getPercentage(formData.startTime)}%`,
                        width: `${getWidth(formData.startTime, calculateEndTime())}%`,
                      }}
                    >
                      <span className="text-primary text-[9px] font-black uppercase">Current</span>
                    </div>
                  )}
                </div>

                <p className="ml-1 text-[9px] text-white/30 italic">
                  * Duration: {movieDuration} minutes. Select Start Time by clicking on the chart.
                </p>
              </div>
            )}

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
                    <Save className="h-5 w-5" /> Update Showtime
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

export default EditShowtimeModal;
