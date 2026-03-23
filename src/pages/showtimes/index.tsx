import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { showtimeApi } from "@/services/api/showtimeApi";
import type { Showtime, Movie, CinemaRoom } from "@/types/document";
import { Clock, Film, Star, Play, Calendar, Zap } from "lucide-react";

function getWeekDays(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

const VI_WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_WEEKDAY_FULL = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function formatDayLabel(date: Date) {
  const wd = VI_WEEKDAY_SHORT[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const moonthShort = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return {
    weekday: wd,
    date: dd,
    month: moonthShort,
    full: VI_WEEKDAY_FULL[date.getDay()]
  };
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface GroupedShowtime {
  movie: Movie;
  showtimes: Showtime[];
}

const ShowtimesPage = () => {
  const navigate = useNavigate();
  const weekDays = useMemo(() => getWeekDays(), []);
  const [selectedDay, setSelectedDay] = useState<Date>(weekDays[0]);
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setIsLoading(true);
        const res = await showtimeApi.getAllShowtimes();
        const data: Showtime[] = res.data?.data || res.data || [];
        setAllShowtimes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShowtimes();
  }, []);

  const grouped = useMemo<GroupedShowtime[]>(() => {
    const dayShowtimes = allShowtimes.filter((st) =>
      isSameDay(new Date(st.startTime), selectedDay)
    );

    const map = new Map<string, GroupedShowtime>();
    for (const st of dayShowtimes) {
      const movie = st.movieId as Movie;
      if (!movie || !movie._id) continue;
      const key = movie._id;
      if (!map.has(key)) {
        map.set(key, { movie, showtimes: [] });
      }
      map.get(key)!.showtimes.push(st);
    }

    const result = Array.from(map.values());
    result.forEach((g) =>
      g.showtimes.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    );
    return result;
  }, [allShowtimes, selectedDay]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020202]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-2 border-[#d4af37]/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-[#d4af37] rounded-full animate-spin" />
          <div className="absolute inset-4 bg-[#d4af37]/5 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#d4af37] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#d4af37] selection:text-black font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="relative pt-16 pb-10 px-4 md:px-8 z-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px w-20 bg-linear-to-r from-transparent to-[#d4af37]" />
            <Calendar className="w-6 h-6 text-[#d4af37] animate-bounce" />
            <div className="h-px w-20 bg-linear-to-l from-transparent to-[#d4af37]" />
          </div>

          <div className="text-center space-y-4 mb-10 px-4">
            <h4 className="text-[#d4af37] text-xs font-black uppercase tracking-[0.6em] opacity-60">Cinematic Experience</h4>
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none italic">
              <span className="text-outline-white">Lịch </span>Chiếu
            </h1>
          </div>

          <div className="relative w-full overflow-x-auto pb-10 no-scrollbar snap-x flex">
            <div className="flex gap-4 px-8 pt-2">
              {weekDays.map((day) => {
                const { weekday, date, month } = formatDayLabel(day);
                const isActive = isSameDay(day, selectedDay);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`
                       flex flex-col items-center min-w-[70px] py-3 rounded-xl transition-all border transform active:scale-95 snap-center
                       ${isActive
                        ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)] btn-glossy scale-110 z-10'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 shadow-inner-glossy'
                      }
                     `}
                  >
                    <span className={`text-[9px] font-black uppercase mb-1 tracking-widest ${isActive ? "opacity-60" : "opacity-60"}`}>{weekday}</span>
                    <span className="text-3xl font-black leading-none tracking-tighter">{date}</span>
                    <span className={`text-[8px] font-black uppercase mt-1 tracking-widest ${isActive ? "opacity-40" : "opacity-40"}`}>{month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Label */}
          <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.4em] bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
              {formatDayLabel(selectedDay).full}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Schedule Content ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pb-40">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white/1 rounded-[4rem] border border-white/5 backdrop-blur-3xl">
            <div className="relative mb-8">
              <Film className="w-20 h-20 text-white/5" />
              <Zap className="w-10 h-10 text-[#d4af37] absolute -top-4 -right-4 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.2em]">Cửa sổ lịch trống</h3>
            <p className="text-white/10 text-sm mt-4 font-bold uppercase tracking-widest">Hãy quay lại sau hoặc chọn ngày khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {grouped.map(({ movie, showtimes }) => (
              <CyberMovieCard
                key={movie._id}
                movie={movie}
                showtimes={showtimes}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .text-outline-white { -webkit-text-stroke: 1px rgba(255,255,255,0.3); color: transparent; }
        .glass-card-dark { background: rgba(10,10,10,0.8); backdrop-filter: blur(20px); }
        .shadow-neon-gold { box-shadow: 0 0 20px rgba(212,175,55,0.1); }
      `}</style>
    </div>
  );
};

// ─── Cyberpunk Movie Card ──────────────────────────────────────────────────

const CyberMovieCard = ({ movie, showtimes, navigate }: { movie: Movie, showtimes: Showtime[], navigate: (path: string) => void }) => {
  return (
    <div className="group relative flex flex-col md:flex-row gap-8 bg-[#0a0a0a] rounded-[3rem] p-6 border border-white/3 hover:border-[#d4af37]/30 transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,1)]">

      {/* 3D Holographic Poster */}
      <div
        onClick={() => navigate(`/movies/${movie._id}`)}
        className="relative shrink-0 w-full md:w-[240px] aspect-2/3 rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl group/poster"
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />

        {/* Animated Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[#d4af37] shadow-[0_0_15px_#d4af37] animate-scan opacity-0 group-hover:opacity-100" />

        {/* Floating Tag */}
        <div className="absolute top-4 left-4 bg-[#fedb39] text-black text-[9px] font-black px-3 py-1 rounded-full shadow-xl translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          HOT NOW
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500">
            <Play className="w-6 h-6 text-[#d4af37] fill-current translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Futuristic Info & Timeline */}
      <div className="flex-1 flex flex-col justify-between py-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-3 py-1 rounded border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-[10px] font-black tracking-widest uppercase">
                Cert {movie.ageRestriction || '13'}+
              </div>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-black tracking-widest uppercase">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span>{movie.duration} MINS</span>
              </div>
              <div className="flex items-center gap-2 text-[#d4af37] text-[10px] font-black tracking-widest uppercase">
                <Star className="w-4 h-4 fill-current" />
                <span>{movie.rate || '8.8'} SCORE</span>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-[#d4af37] transition-colors duration-500">
              {movie.title}
            </h2>

            <div className="flex flex-wrap gap-3 pt-2">
              {movie.category?.map((c) => (
                <span key={c} className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full border border-white/5">{c}</span>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-sm italic font-medium max-w-xl leading-relaxed">
            {movie.description || "In a world where cinema meets the future, witness an epic story that transcends time and space. Exclusively at CineLux."}
          </p>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Digital Slots</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="flex flex-wrap gap-4">
            {showtimes.map((st) => (
              <HolographicSlot key={st._id} showtime={st} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HolographicSlot = ({ showtime }: { showtime: Showtime }) => {
  const start = formatTime(showtime.startTime);
  const room = showtime.cinemaRoomId as CinemaRoom;

  return (
    <a
      href={`/booking/${showtime._id}`}
      className="
        group/slot relative flex flex-col items-center justify-center
        px-4 h-20 rounded-2xl
        bg-white/2 border border-white/10
        hover:bg-[#d4af37] hover:border-[#d4af37]
        transition-all duration-500 cursor-pointer overflow-hidden
      "
    >
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-white group-hover/slot:text-black font-black text-xl tracking-tight transition-colors">
          {start}
        </span>
        <span className="text-[9px] text-white/20 group-hover/slot:text-black/60 font-black uppercase tracking-widest">
          {room?.roomName || 'DX-1'}
        </span>
      </div>

      {/* Decorative scan line */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover/slot:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/20 animate-pulse" />
    </a>
  );
};

export default ShowtimesPage;
