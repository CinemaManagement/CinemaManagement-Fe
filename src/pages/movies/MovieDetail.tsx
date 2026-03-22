import {useParams, useNavigate} from "react-router-dom";
import {Star, Clock, Calendar, Ticket, ChevronRight, MapPin, Info, Plus} from "lucide-react";
import {useState, useEffect} from "react";
import {movieApi} from "@/services/api/movieApi";
import {useAppSelector} from "@/store";
import {UserRole} from "@/types/document";
import AddShowtimeModal from "./components/AddShowtimeModal";
import toast from "react-hot-toast";
import type {Movie} from "@/types/document";

interface PersonItem {
  name: string;
  avatar?: string;
  _id?: string;
}

interface Showtime {
  _id: string;
  movieId: string;
  startTime: string;
  endTime: string;
  status: string;
  pricingRule: {
    NORMAL: number;
    VIP: number;
    COUPLE: number;
  };
  cinemaRoomId: {
    _id: string;
    roomName: string;
    status: string;
  };
}

interface ExtendedMovie extends Omit<Partial<Movie>, "director" | "actors"> {
  id?: string;
  category?: string[];
  director?: PersonItem[] | string;
  cast?: PersonItem[] | string[];
  actors?: PersonItem[] | string[];
  releaseDate?: string;
  rating?: string | number;
  description?: string;
}

const MovieDetail = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [movie, setMovie] = useState<ExtendedMovie | null>(null);
  const [showtimesData, setShowtimesData] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {user} = useAppSelector((state) => state.auth);
  const isManager = user?.role === UserRole.MANAGER;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!id) return;

        const [movieRes, showtimesRes] = await Promise.all([
          movieApi.getMovieById(id),
          movieApi.getShowtimesByMovieId(id),
        ]);

        const mData = movieRes.data?.data || movieRes.data;
        const sData = showtimesRes.data?.data || showtimesRes.data;

        setMovie(mData);
        console.log(mData);
        setShowtimesData(sData || []);
      } catch (err) {
        console.error("Error fetching movie data:", err);
        toast.error("Failed to fetch movie details.");
        navigate("/movies");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Process showtimes to get unique dates
  const availableDates = Array.from(
    new Set(showtimesData.map((s) => new Date(s.startTime).toDateString())),
  ).map((dateStr) => {
    const d = new Date(dateStr);
    return {
      fullDate: dateStr,
      day: d.toLocaleDateString("en-US", {weekday: "short"}).toUpperCase(),
      date: d.getDate().toString(),
      month: d.toLocaleDateString("en-US", {month: "short"}).toUpperCase(),
    };
  });

  const selectedDateRecord = availableDates[selectedDateIndex];
  const filteredShowtimes = selectedDateRecord
    ? showtimesData.filter(
        (s) => new Date(s.startTime).toDateString() === selectedDateRecord.fullDate,
      )
    : [];

  const getRoomType = (roomName: string) => {
    if (roomName.includes("-")) {
      return roomName.split("-")[1].trim().toUpperCase();
    }
    return "Standard";
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-20">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-20 text-white">
        Movie not found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden pb-32">
        {/* Movie Hero Header */}
        <section className="relative h-[80vh] w-full pt-10">
          <div className="absolute inset-0">
            <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            <div className="from-background via-background/60 absolute inset-0 bg-linear-to-t to-transparent" />
            <div className="from-background/20 absolute inset-0 bg-linear-to-b via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 mx-auto flex w-full max-w-7xl flex-col items-end gap-12 p-8 md:flex-row md:p-20">
            <div className="hidden aspect-2/3 w-72 shrink-0 -translate-y-12 -rotate-1 transform overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] md:block">
              <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col gap-6 duration-700">
              <div className="flex flex-wrap gap-2">
                {movie.category?.map((g: string) => (
                  <span
                    key={g}
                    className="bg-primary/20 text-primary border-primary/30 shadow-inner-gold rounded-lg border px-4 py-1.5 text-[8px] font-black tracking-widest uppercase backdrop-blur-md"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="text-5xl leading-none font-black tracking-tighter text-white uppercase drop-shadow-2xl md:text-8xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-sm font-black tracking-[0.2em] text-white/80 uppercase">
                <span className="shadow-inner-glossy flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                  <Star className="text-primary fill-primary h-4 w-4" /> {movie.rating} IMDB
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="text-primary h-4 w-4" /> {movie.duration}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" /> {movie.releaseDate}
                </span>
                <span className="bg-secondary rounded-md px-3 py-1 text-xs text-white">
                  {movie.ageRestriction}+
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          {/* Left Column: Movie Info */}
          <div className="space-y-16 lg:col-span-3">
            <div className="space-y-6">
              <h2 className="flex items-center gap-4 text-3xl font-black tracking-tighter text-white uppercase">
                <div className="bg-primary shadow-inner-gold h-8 w-2 rounded-full" /> Synopsis
              </h2>
              <p className="text-lg leading-relaxed font-medium text-white/60">
                {movie.description}
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Director card */}
              <div className="glass-card shadow-inner-glossy rounded-[2.5rem] p-8">
                <p className="text-primary mb-5 text-[10px] font-black tracking-[0.4em] uppercase">
                  Director
                </p>
                {(() => {
                  const dir = movie.director;
                  if (!dir || (Array.isArray(dir) && dir.length === 0))
                    return <p className="text-sm text-white/40">N/A</p>;
                  const list: PersonItem[] = Array.isArray(dir)
                    ? dir.map((d) => (typeof d === "string" ? {name: d} : d))
                    : [{name: dir as string}];
                  return (
                    <div className="flex flex-wrap gap-5">
                      {list.map((d, i) => (
                        <div key={i} className="flex w-24 flex-col items-center gap-1.5">
                          {d.avatar ? (
                            <img
                              src={d.avatar}
                              alt={d.name}
                              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/10"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="bg-primary/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-2 ring-white/10">
                              <span className="text-primary text-xl font-black">
                                {d.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span
                            title={d.name}
                            className="w-full truncate text-center text-[11px] leading-tight font-semibold text-white/70"
                          >
                            {d.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Cast card */}
              <div className="glass-card shadow-inner-glossy rounded-[2.5rem] p-8">
                <p className="text-primary mb-5 text-[10px] font-black tracking-[0.4em] uppercase">
                  Principal Cast
                </p>
                {(() => {
                  const raw = movie.actors || movie.cast;
                  if (!raw || (Array.isArray(raw) && raw.length === 0))
                    return <p className="text-sm text-white/40">N/A</p>;
                  const list: PersonItem[] = (raw as (PersonItem | string)[]).map((c) =>
                    typeof c === "string" ? {name: c} : c,
                  );
                  return (
                    <div className="flex flex-wrap gap-5">
                      {list.map((a, i) => (
                        <div key={i} className="flex w-24 flex-col items-center gap-1.5">
                          {a.avatar ? (
                            <img
                              src={a.avatar}
                              alt={a.name}
                              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/10"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="bg-primary/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-2 ring-white/10">
                              <span className="text-primary text-xl font-black">
                                {a.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span
                            title={a.name}
                            className="w-full truncate text-center text-[11px] leading-tight font-semibold text-white/70"
                          >
                            {a.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Trailer Section */}
            <div className="space-y-6">
              <h2 className="flex items-center gap-4 text-3xl font-black tracking-tighter text-white uppercase">
                <div className="bg-primary shadow-inner-gold h-8 w-2 rounded-full" /> Official
                Trailer
              </h2>
              <div className="group relative aspect-video overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={movie.trailerUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="transition-opacity group-hover:grayscale-0"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Column: Showtime Selection */}
          <div className="lg:col-span-2">
            <div className="glass-card shadow-inner-glossy sticky top-24 rounded-[3rem] p-10 shadow-2xl">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="flex items-center gap-4 text-2xl font-black tracking-tighter text-white uppercase">
                  <Ticket className="text-primary h-7 w-7" /> Plan Your Visit
                </h2>
                {isManager && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground shadow-inner-gold group rounded-2xl border p-3 transition-all"
                    title="Add Showtime"
                  >
                    <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </button>
                )}
              </div>

              {/* Date Selection */}
              <div className="mb-12 space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    Select Date
                  </p>
                  <span className="text-xs font-bold text-white/40 italic">
                    {selectedDateRecord
                      ? new Date(selectedDateRecord.fullDate).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "No Date Selected"}
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {availableDates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDateIndex(i)}
                      className={`flex min-w-[60px] transform flex-col items-center rounded-lg border py-2 transition-all active:scale-95 ${
                        selectedDateIndex === i
                          ? "bg-primary text-primary-foreground border-primary btn-glossy z-10 scale-110 shadow-[0_0_25px_rgba(var(--primary),0.3)]"
                          : "shadow-inner-glossy border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <span className="mb-1 text-[9px] font-black tracking-widest uppercase opacity-60">
                        {d.day}
                      </span>
                      <span className="text-2xl leading-none font-black">{d.date}</span>
                      <span className="mt-1 text-[8px] font-black tracking-widest uppercase opacity-40">
                        {d.month}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theater Location (Mock) */}
              <div className="mb-10">
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    CineLux Cinema
                  </p>
                  <span className="flex items-center gap-2 text-xs font-bold text-white/80">
                    <MapPin className="text-primary h-4 w-4" /> Central Mall
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredShowtimes.length > 0 ? (
                    filteredShowtimes.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => navigate(`/booking/${s._id}`)}
                        className="group hover:border-primary/50 shadow-inner-glossy flex w-full transform items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-6 transition-all hover:-translate-x-1"
                      >
                        <div className="flex items-center gap-5">
                          <span className="group-hover:text-primary text-2xl font-black text-white transition-colors">
                            {new Date(s.startTime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                          <span className="group-hover:text-primary/60 group-hover:border-primary/20 rounded border border-white/5 bg-white/5 px-2.5 py-1 text-[9px] font-black text-white/40 uppercase transition-all">
                            {getRoomType(s.cinemaRoomId.roomName)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-primary text-lg font-black drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                            {s.pricingRule.NORMAL.toLocaleString("vi-VN")}đ
                          </span>
                          <div className="group-hover:bg-primary group-hover:text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-sm text-white/20 italic">
                        No showtimes available for this date.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                <Info className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-[11px] leading-relaxed font-medium text-white/40">
                  Booking confirms your choice of movie and time. Seat selection and food ordering
                  follow in the next steps.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AddShowtimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movieId={id || ""}
        movieTitle={movie.title || ""}
      />
    </>
  );
};

export default MovieDetail;
