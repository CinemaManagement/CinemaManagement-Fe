import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAppSelector} from "@/store";
import {UserRole, ShowingStatus, MovieStatus} from "@/types/document";
import type {Movie} from "@/types/document";
import {movieApi} from "@/services/api/movieApi";
import {Plus, Edit, Trash2, Star, ChevronLeft, ChevronRight, Clock} from "lucide-react";
import toast from "react-hot-toast";
import URL from "@/constants/url";

const Movies = () => {
  const navigate = useNavigate();
  const {user} = useAppSelector((state) => state.auth);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ShowingStatus | "ALL">("ALL");

  const canAddMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const canEditMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const canDeleteMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response =
        user?.role === UserRole.CUSTOMER
          ? await movieApi.getMovies()
          : await movieApi.getMoviesByManager();
      setMovies(response.data?.data || response.data || []);
    } catch {
      toast.error("Failed to fetch movies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to hide this movie?")) return;
    try {
      await movieApi.deleteMovie(id);
      toast.success("Movie status changed to HIDDEN.");
      fetchMovies();
    } catch {
      toast.error("Failed to delete movie.");
    }
  };

  const handleAddMovie = () => {
    navigate(URL.MovieAdd);
  };

  const handleEditMovie = (id: string) => {
    navigate(URL.MovieEdit.replace(":id", id));
  };

  const nowShowingMovies = movies.filter((m) => m.showingStatus === ShowingStatus.NOW_SHOWING);
  const comingSoonMovies = movies.filter((m) => m.showingStatus === ShowingStatus.COMING_SOON);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#d4af37] opacity-20" />
          <div className="flex h-full w-full animate-pulse flex-col items-center justify-center rounded-full border-2 border-[#d4af37]/30 bg-[#d4af37]/5 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <div className="h-4 w-4 animate-spin rounded-sm bg-[#d4af37] shadow-[0_0_15px_#d4af37]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32 font-sans">
      {user?.role === UserRole.CUSTOMER && (
        <section className="relative overflow-hidden bg-black px-4 py-16 md:px-8">
          <div className="pointer-events-none absolute top-0 left-1/2 h-[1000px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]" />

          <div className="relative z-20 mx-auto max-w-[1800px]">
            <div className="relative text-center">
              <h2 className="text-5xl leading-none font-black tracking-[-0.08em] text-[#d4af37] uppercase drop-shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                Phim đang chiếu
              </h2>
              <div className="mx-auto mt-8 h-2 w-56 rounded-full bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />

              {canAddMovie && (
                <button
                  onClick={handleAddMovie}
                  className="absolute top-1/2 right-10 -translate-y-1/2 rounded-full bg-[#d4af37] p-6 text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all hover:scale-110 hover:bg-white active:scale-95"
                >
                  <Plus className="h-10 w-10 stroke-[3px]" />
                </button>
              )}
            </div>

            <InfinitePremiumCarousel
              items={nowShowingMovies}
              sectionType="NOW"
              canEdit={canEditMovie}
              canDelete={canDeleteMovie}
              onEdit={handleEditMovie}
              onDelete={handleDelete}
              navigate={navigate}
              URL={URL}
            />
          </div>
        </section>
      )}

      {user?.role === UserRole.CUSTOMER && (
        <section className="relative overflow-hidden px-4 py-32 md:px-8">
          <div className="relative z-20 mx-auto max-w-[1800px]">
            <div className="text-center">
              <h2 className="text-5xl leading-none font-black tracking-[-0.08em] text-[#d4af37] uppercase drop-shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                Phim sắp chiếu
              </h2>
              <div className="mx-auto mt-8 h-2 w-56 rounded-full bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
            </div>

            <InfinitePremiumCarousel
              items={comingSoonMovies}
              sectionType="SOON"
              canEdit={canEditMovie}
              canDelete={canDeleteMovie}
              onEdit={handleEditMovie}
              onDelete={handleDelete}
              navigate={navigate}
              URL={URL}
            />
          </div>
        </section>
      )}

      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="shadow-3xl rounded-[3rem] border border-white/5 bg-[#111] p-10 md:p-16">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-center justify-between gap-6 border-b border-white/5 pb-10 md:flex-row">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="h-10 w-2 bg-yellow-400"></div>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                  Tất cả phim
                </h2>
              </div>
              <div className="flex gap-2 rounded-2xl border border-white/5 bg-black/40 p-1.5">
                {["ALL", ShowingStatus.NOW_SHOWING, ShowingStatus.COMING_SOON].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab as ShowingStatus | "ALL")}
                    className={`rounded-xl px-6 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all ${
                      filter === tab
                        ? "bg-[#d4af37] text-black shadow-lg"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {movies
                .filter((m) => filter === "ALL" || m.showingStatus === filter)
                .map((movie) => (
                  <div
                    key={movie._id}
                    className="group/list relative flex flex-col gap-8 rounded-[2rem] border border-white/3 bg-white/2 p-6 transition-all duration-300 hover:bg-white/5 sm:flex-row"
                  >
                    {movie.status === MovieStatus.HIDDEN && (
                      <span className="absolute top-6 right-6 rounded-md bg-red-700 px-2 py-1 text-sm text-white">
                        Hidden
                      </span>
                    )}
                    <div
                      onClick={() => navigate(URL.MovieDetail.replace(":id", movie._id))}
                      className="aspect-2/3 w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-lg sm:w-44"
                    >
                      <img
                        src={movie.posterUrl}
                        className="h-full w-full object-cover transition-transform group-hover/list:scale-110"
                        alt={movie.title}
                      />
                    </div>

                    <div className="flex min-w-0 grow flex-col justify-between py-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-md px-3 py-1.5 text-[10px] font-black tracking-widest uppercase ${movie.showingStatus === ShowingStatus.NOW_SHOWING ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-blue-500/10 text-blue-400"}`}
                          >
                            {movie.showingStatus === ShowingStatus.NOW_SHOWING
                              ? "Đang chiếu"
                              : "Sắp chiếu"}
                          </span>
                          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-sm font-black text-yellow-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {movie.rate || "8.5"}
                          </div>
                        </div>
                        <h3
                          onClick={() => navigate(URL.MovieDetail.replace(":id", movie._id))}
                          className="cursor-pointer truncate text-2xl font-black text-white transition-all group-hover/list:text-[#d4af37] sm:text-3xl"
                        >
                          {movie.title}
                        </h3>
                        <p className="line-clamp-2 max-w-3xl leading-relaxed font-medium text-white/40">
                          {movie.description ||
                            "Khám phá thế giới điện ảnh qua bộ phim đặc sắc này..."}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-black tracking-tighter text-white/60 uppercase ring-1 ring-white/5">
                            <Clock className="h-3.5 w-3.5" />
                            {movie.duration} MINUTES
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {movie.category?.map((category: string) => (
                              <span
                                key={category}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black tracking-widest text-[#d4af37] uppercase backdrop-blur-sm"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center gap-4">
                        <button
                          onClick={() => navigate(URL.MovieDetail.replace(":id", movie._id))}
                          className="cursor-pointer rounded-full bg-[#d4af37] px-10 py-3.5 text-sm font-black tracking-[0.2em] text-black uppercase shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
                        >
                          Đặt vé ngay
                        </button>
                        <div className="flex gap-2">
                          {canEditMovie && (
                            <button
                              onClick={() => handleEditMovie(movie._id)}
                              className="rounded-full border border-white/5 bg-white/5 p-3.5 text-white transition-all outline-none hover:bg-[#d4af37] hover:text-black"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          )}
                          {canDeleteMovie && (
                            <button
                              onClick={() => handleDelete(movie._id)}
                              className="rounded-full border border-white/5 bg-white/5 p-3.5 text-white transition-all outline-none hover:bg-red-500 hover:text-black"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

interface CarouselProps {
  items: Movie[];
  sectionType: "NOW" | "SOON";
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  URL: typeof URL;
}

const InfinitePremiumCarousel = ({
  items,
  sectionType,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  navigate,
  URL,
}: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  if (items.length === 0)
    return (
      <div className="py-20 text-center text-xl font-black text-white/20 uppercase">
        Hiện tại chưa có phim
      </div>
    );

  const next = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev: number) => (prev + 1) % items.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev: number) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getPositionStyle = (index: number) => {
    const diff = (index - activeIndex + items.length) % items.length;
    let normalizedDiff = diff;
    if (diff > items.length / 2) normalizedDiff = diff - items.length;
    if (diff < -items.length / 2) normalizedDiff = diff + items.length;

    const isVisible = Math.abs(normalizedDiff) <= 2;
    if (!isVisible)
      return {opacity: 0, pointerEvents: "none" as const, transform: "scale(0.5) translateX(0)"};

    const scale = normalizedDiff === 0 ? 1.2 : 0.7;
    const opacity = normalizedDiff === 0 ? 1 : 0.25;
    const zIndex = 30 - Math.abs(normalizedDiff) * 10;
    const translateX = normalizedDiff * 380;
    const blur = normalizedDiff === 0 ? "none" : "blur(8px)";

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity,
      zIndex,
      filter: blur,
      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  return (
    <div className="relative flex h-[850px] w-full items-center justify-center overflow-hidden py-10">
      <button
        onClick={prev}
        className="group absolute top-[40%] left-10 z-50 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-2xl backdrop-blur-xl transition-all hover:bg-[#d4af37] hover:text-black"
      >
        <ChevronLeft className="h-10 w-10 stroke-[3px]" />
      </button>
      <button
        onClick={next}
        className="group absolute top-[40%] right-10 z-50 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-2xl backdrop-blur-xl transition-all hover:bg-[#d4af37] hover:text-black"
      >
        <ChevronRight className="h-10 w-10 stroke-[3px]" />
      </button>

      <div className="relative flex h-full w-full items-center justify-center">
        {items.map((movie: Movie, index: number) => {
          const style = getPositionStyle(index);
          const isActive = index === activeIndex;

          return (
            <div
              key={movie._id}
              style={style}
              onClick={() => isActive && navigate(URL.MovieDetail.replace(":id", movie._id))}
              className="group/item absolute w-[320px] cursor-pointer select-none"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
                <img
                  src={movie.posterUrl}
                  className="h-full w-full object-cover"
                  alt={movie.title}
                />
                <div
                  className={`absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent transition-opacity duration-700 ${isActive ? "opacity-80" : "opacity-90"}`}
                />
                <div className="absolute top-5 right-5 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  {movie.rate ? (
                    [...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 fill-current ${
                          i < Math.round((movie.rate || 0) / 2) ? "text-[#d4af37]" : "text-white/20"
                        }`}
                      />
                    ))
                  ) : (
                    <span className="text-sm font-black text-white">Chưa có đánh giá</span>
                  )}
                </div>
                {sectionType === "NOW" && (
                  <div className="absolute top-5 left-5 flex items-center rounded-full bg-[#fedb39] px-4 py-2 text-sm font-black tracking-[0.2em] text-black uppercase shadow-2xl ring-4 ring-black/50">
                    {movie.ageRestriction || "13"} <Plus size={12} strokeWidth={3} />
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-10 right-10 flex flex-col gap-5">
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(movie._id);
                        }}
                        className="rounded-2xl border border-white/10 bg-white/10 p-5 text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#d4af37] hover:text-black"
                      >
                        <Edit className="h-7 w-7" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(movie._id);
                        }}
                        className="rounded-2xl border border-red-500/20 bg-red-500/20 p-5 text-white shadow-xl backdrop-blur-md transition-all hover:bg-red-500"
                      >
                        <Trash2 className="h-7 w-7" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div
                className={`mt-8 space-y-4 text-center transition-all duration-1000 ${isActive ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
              >
                <h3 className="text-left text-xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">
                  {movie.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.category?.map((category: string) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[8px] font-black tracking-widest text-[#d4af37] uppercase backdrop-blur-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Movies;
