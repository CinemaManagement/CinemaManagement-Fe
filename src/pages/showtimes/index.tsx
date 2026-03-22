import { useState, useEffect, useMemo } from "react";
import { showtimeApi } from "@/services/api/showtimeApi";
import type { Showtime, Movie, CinemaRoom } from "@/types/document";
import { Calendar, Clock, Film } from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns array of the next 7 days starting from TOMORROW (index 0 = D+1) */
function getWeekDays(): Date[] {
  const days: Date[] = [];
  // Current time is 2026-03-22T19:13 +07 → tomorrow is Mon 23/3
  // But we use real Date.now() for accuracy
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

const VI_WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatDayLabel(date: Date) {
  const wd = VI_WEEKDAY[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return { weekday: wd, date: `${dd}/${mm}` };
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── types ───────────────────────────────────────────────────────────────────

interface GroupedShowtime {
  movie: Movie;
  showtimes: Showtime[];
}

// ─── component ───────────────────────────────────────────────────────────────

const ShowtimesPage = () => {
  const weekDays = useMemo(() => getWeekDays(), []);
  const [selectedDay, setSelectedDay] = useState<Date>(weekDays[0]);
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await showtimeApi.getAllShowtimes();
        const data: Showtime[] = res.data?.data || res.data || [];
        setAllShowtimes(data);
      } catch {
        setError("Không thể tải lịch chiếu. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShowtimes();
  }, []);

  // Filter showtimes for the selected day and group by movie
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

    // Sort showtimes within each group by startTime
    const result = Array.from(map.values());
    result.forEach((g) =>
      g.showtimes.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    );

    return result;
  }, [allShowtimes, selectedDay]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      {/* ── Page Header ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <Calendar className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              Lịch Chiếu Phim
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Chọn ngày để xem suất chiếu tại rạp
            </p>
          </div>
        </div>

        {/* ── Day Selector Strip ── */}
        <div className="relative mb-8">
          {/* glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {weekDays.map((day) => {
              const { weekday, date } = formatDayLabel(day);
              const isActive = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    relative flex-shrink-0 flex flex-col items-center gap-1
                    px-5 py-3 rounded-2xl font-bold transition-all duration-300
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_0_24px_rgba(197,160,89,0.5)] scale-105"
                        : "bg-card/50 border border-white/10 text-muted-foreground hover:bg-card hover:text-white hover:border-white/20"
                    }
                  `}
                >
                  <span
                    className={`text-xs uppercase tracking-widest font-black ${isActive ? "text-primary-foreground/80" : ""}`}
                  >
                    {weekday}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {date.split("/")[0]}
                  </span>
                  <span
                    className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}
                  >
                    /{date.split("/")[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium">Đang tải lịch chiếu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Film className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-muted-foreground text-center">{error}</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Film className="w-16 h-16 text-muted-foreground/30" />
            <p className="text-xl font-black text-muted-foreground uppercase tracking-tight">
              Không có suất chiếu
            </p>
            <p className="text-muted-foreground/60 text-sm">
              Hãy chọn ngày khác để xem lịch chiếu
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(({ movie, showtimes }) => (
              <MovieShowtimeCard
                key={movie._id}
                movie={movie}
                showtimes={showtimes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Movie Showtime Card ─────────────────────────────────────────────────────

interface MovieShowtimeCardProps {
  movie: Movie;
  showtimes: Showtime[];
}

const MovieShowtimeCard = ({ movie, showtimes }: MovieShowtimeCardProps) => {
  return (
    <div className="group bg-card/50 border border-white/8 rounded-3xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:bg-card/70">
      <div className="flex gap-0">
        {/* Poster */}
        <div className="relative flex-shrink-0 w-[90px] sm:w-[110px]">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            style={{ minHeight: 120 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/110x160?text=No+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50 pointer-events-none" />
        </div>

        {/* Info + Showtimes */}
        <div className="flex-1 p-5 flex flex-col justify-center gap-4">
          {/* Movie meta */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {movie.ageRestriction > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                      movie.ageRestriction >= 18
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : movie.ageRestriction >= 13
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    {movie.ageRestriction}+
                  </span>
                )}
                <h3 className="text-white font-black text-base sm:text-lg tracking-tight truncate">
                  {movie.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{movie.duration} phút</span>
              </div>
            </div>
          </div>

          {/* Showtime slots */}
          <div className="flex flex-wrap gap-2">
            {showtimes.map((st) => (
              <ShowtimeSlot key={st._id} showtime={st} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Single Showtime Slot Button ─────────────────────────────────────────────

interface ShowtimeSlotProps {
  showtime: Showtime;
}

const ShowtimeSlot = ({ showtime }: ShowtimeSlotProps) => {
  const start = formatTime(showtime.startTime);
  const end = formatTime(showtime.endTime);
  const room = showtime.cinemaRoomId as CinemaRoom;

  return (
    <a
      href={`/booking/${showtime._id}`}
      className="
        relative group/slot flex flex-col items-center
        px-4 py-2 rounded-xl
        border border-cyan-500/40 bg-cyan-950/30
        hover:bg-cyan-500/20 hover:border-cyan-400/70
        hover:shadow-[0_0_16px_rgba(6,182,212,0.3)]
        transition-all duration-200 cursor-pointer
        min-w-[100px]
      "
    >
      <span className="text-cyan-300 font-black text-sm tracking-wide">
        {start}
        <span className="text-cyan-500/60 mx-1 font-normal">~</span>
        {end}
      </span>
      {room?.roomName && (
        <span className="text-[10px] text-cyan-500/60 font-medium mt-0.5 group-hover/slot:text-cyan-400 transition-colors">
          {room.roomName}
        </span>
      )}
      {/* glossy shine overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    </a>
  );
};

export default ShowtimesPage;
