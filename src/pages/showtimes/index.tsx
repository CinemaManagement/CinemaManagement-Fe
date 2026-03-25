import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { showtimeApi } from "@/services/api/showtimeApi";
import type { Showtime, Movie, CinemaRoom } from "@/types/document";
import { Clock, Film, Star, Play, Calendar, Zap } from "lucide-react";
import { formatTime } from "@/lib/utils";

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
const VI_WEEKDAY_FULL = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

function formatDayLabel(date: Date) {
  const wd = VI_WEEKDAY_SHORT[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const moonthShort = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return {
    weekday: wd,
    date: dd,
    month: moonthShort,
    full: VI_WEEKDAY_FULL[date.getDay()],
  };
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
      isSameDay(new Date(st.startTime), selectedDay),
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
      g.showtimes.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    );
    return result;
  }, [allShowtimes, selectedDay]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020202]">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/20" />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-[#d4af37]/5">
            <Zap className="h-6 w-6 animate-pulse text-[#d4af37]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020202] font-sans text-white selection:bg-[#d4af37] selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-[#d4af37]/5 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-blue-500/5 blur-[120px] delay-700" />
      </div>

      <header className="relative z-10 px-4 pt-16 pb-10 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-20 bg-linear-to-r from-transparent to-[#d4af37]" />
            <Calendar className="h-6 w-6 animate-bounce text-[#d4af37]" />
            <div className="h-px w-20 bg-linear-to-l from-transparent to-[#d4af37]" />
          </div>

          <div className="mb-10 space-y-4 px-4 text-center">
            <h4 className="text-xs font-black tracking-[0.6em] text-[#d4af37] uppercase opacity-60">
              Cinematic Experience
            </h4>
            <h1 className="text-7xl leading-none font-black tracking-tighter uppercase italic">
              <span className="text-outline-white">Lịch </span>Chiếu
            </h1>
          </div>

          <div className="no-scrollbar relative flex w-full snap-x overflow-x-auto pb-10">
            <div className="flex gap-4 px-8 pt-2">
              {weekDays.map((day) => {
                const { weekday, date, month } = formatDayLabel(day);
                const isActive = isSameDay(day, selectedDay);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`flex min-w-[70px] transform snap-center flex-col items-center rounded-xl border py-3 transition-all active:scale-95 ${isActive
                        ? "btn-glossy z-10 scale-110 border-[#d4af37] bg-[#d4af37] text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                        : "shadow-inner-glossy border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      } `}
                  >
                    <span
                      className={`mb-1 text-[9px] font-black tracking-widest uppercase ${isActive ? "opacity-60" : "opacity-60"}`}
                    >
                      {weekday}
                    </span>
                    <span className="text-3xl leading-none font-black tracking-tighter">
                      {date}
                    </span>
                    <span
                      className={`mt-1 text-[8px] font-black tracking-widest uppercase ${isActive ? "opacity-40" : "opacity-40"}`}
                    >
                      {month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Label */}
          <div className="animate-in fade-in slide-in-from-top-4 mt-4 duration-700">
            <span className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[11px] font-black tracking-[0.4em] text-[#d4af37] uppercase backdrop-blur-md">
              {formatDayLabel(selectedDay).full}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Schedule Content ── */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-40 md:px-8">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[4rem] border border-white/5 bg-white/1 py-40 backdrop-blur-3xl">
            <div className="relative mb-8">
              <Film className="h-20 w-20 text-white/5" />
              <Zap className="absolute -top-4 -right-4 h-10 w-10 animate-pulse text-[#d4af37]" />
            </div>
            <h3 className="text-2xl font-black tracking-[0.2em] text-white/20 uppercase">
              Cửa sổ lịch trống
            </h3>
            <p className="mt-4 text-sm font-bold tracking-widest text-white/10 uppercase">
              Hãy quay lại sau hoặc chọn ngày khác
            </p>
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

const CyberMovieCard = ({
  movie,
  showtimes,
  navigate,
}: {
  movie: Movie;
  showtimes: Showtime[];
  navigate: (path: string) => void;
}) => {
  return (
    <div className="group relative flex flex-col gap-8 rounded-[3rem] border border-white/3 bg-[#0a0a0a] p-6 transition-all duration-700 hover:border-[#d4af37]/30 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] md:flex-row">
      {/* 3D Holographic Poster */}
      <div
        onClick={() => navigate(`/movies/${movie._id}`)}
        className="group/poster relative aspect-2/3 w-full shrink-0 cursor-pointer overflow-hidden rounded-[2rem] shadow-2xl md:w-[240px]"
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />

        {/* Animated Scanning Line */}
        <div className="animate-scan absolute top-0 left-0 h-0.5 w-full bg-[#d4af37] opacity-0 shadow-[0_0_15px_#d4af37] group-hover:opacity-100" />

        {/* Floating Tag */}
        <div className="absolute top-4 left-4 translate-y-[-10px] rounded-full bg-[#fedb39] px-3 py-1 text-[9px] font-black text-black opacity-0 shadow-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          HOT NOW
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="flex h-16 w-16 scale-50 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl transition-transform duration-500 group-hover:scale-100">
            <Play className="h-6 w-6 translate-x-0.5 fill-current text-[#d4af37]" />
          </div>
        </div>
      </div>

      {/* Futuristic Info & Timeline */}
      <div className="flex flex-1 flex-col justify-between py-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded border border-[#d4af37]/30 bg-[#d4af37]/5 px-3 py-1 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
                Cert {movie.ageRestriction || "13"}+
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/40 uppercase">
                <Clock className="h-4 w-4 text-[#d4af37]" />
                <span>{movie.duration} MINS</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
                <Star className="h-4 w-4 fill-current" />
                <span>{movie.rate || "8.8"} SCORE</span>
              </div>
            </div>

            <h2 className="text-4xl leading-none font-black tracking-tighter text-white uppercase transition-colors duration-500 group-hover:text-[#d4af37] md:text-5xl">
              {movie.title}
            </h2>

            <div className="flex flex-wrap gap-3 pt-2">
              {movie.category?.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <p className="max-w-xl text-sm leading-relaxed font-medium text-white/40 italic">
            {movie.description ||
              "In a world where cinema meets the future, witness an epic story that transcends time and space. Exclusively at CineLux."}
          </p>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="text-[9px] font-black tracking-[0.3em] text-[#d4af37] uppercase">
              Digital Slots
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="flex flex-wrap gap-4">
            {showtimes.map((st) => (
              <HolographicSlot key={st._id} showtime={st} navigate={navigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HolographicSlot = ({
  showtime,
  navigate,
}: {
  showtime: Showtime;
  navigate: (path: string) => void;
}) => {
  const start = formatTime(showtime.startTime);
  const room = showtime.cinemaRoomId as CinemaRoom;
  const status = showtime.status;

  const getStatusStyles = () => {
    switch (status) {
      // case "NOW_SHOWING":
      //   return "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20";
      // case "CANCELLED":
      //   return "bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed opacity-50";
      case "FINISHED":
        return "bg-green-500/10 border-green-500/30 text-green-400 cursor-not-allowed opacity-50";
      default:
        return "bg-white/2 border-white/10 hover:bg-[#d4af37] hover:border-[#d4af37] cursor-pointer";
    }
  };

  const handleBooking = (e: React.MouseEvent) => {
    if (status !== "ACTIVE") {
      e.preventDefault();
      return;
    }
    navigate(`/booking/${showtime._id}`);
  };

  return (
    <div
      onClick={handleBooking}
      className={`group/slot relative flex h-20 flex-col items-center justify-center overflow-hidden rounded-2xl border transition-all duration-500 px-4 ${getStatusStyles()}`}
    >
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span
          className={`text-xl font-black tracking-tight transition-colors ${status === "ACTIVE" ? "text-white group-hover/slot:text-black" : ""}`}
        >
          {start}
        </span>
        <span
          className={`text-[9px] font-black tracking-widest uppercase ${status === "ACTIVE" ? "text-white/20 group-hover/slot:text-black/60" : "opacity-60"}`}
        >
          {room?.roomName || "DX-1"}
        </span>
      </div>

      {status !== "ACTIVE" && (
        <div className="absolute top-1 right-2">
          <span className="text-[6px] font-black tracking-tighter opacity-40 uppercase">
            {status.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Decorative scan line */}
      {status === "ACTIVE" && (
        <>
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover/slot:opacity-100" />
          <div className="absolute top-0 left-0 h-0.5 w-full animate-pulse bg-white/20" />
        </>
      )}
    </div>
  );
};

export default ShowtimesPage;
