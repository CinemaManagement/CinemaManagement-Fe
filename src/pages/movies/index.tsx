/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAppSelector} from "@/store";
import {UserRole, ShowingStatus, MovieStatus} from "@/types/document";
import type {Movie} from "@/types/document";
import {movieApi} from "@/services/api/movieApi";
import {Plus, Edit, Trash2, Star, Clock} from "lucide-react";
import toast from "react-hot-toast";
import URL from "@/constants/url";
import InfinitePremiumCarousel from "@/components/common/InfinitePremiumCarousel";

const Movies = () => {
  const navigate = useNavigate();
  const {user} = useAppSelector((state) => state.auth);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ShowingStatus | "ALL">("ALL");

  const canAddMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const canEditMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const canDeleteMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      if (user?.role !== UserRole.MANAGER) {
        const [allRes, nowRes, soonRes] = await Promise.all([
          movieApi.getMovies(),
          movieApi.getMoviesByStatus(ShowingStatus.NOW_SHOWING),
          movieApi.getMoviesByStatus(ShowingStatus.COMING_SOON),
        ]);
        const all = allRes.data || [];
        const now = nowRes.data || [];
        const soon = soonRes.data || [];
        setAllMovies(all);
        setMovies([...now, ...soon]);
      } else {
        const response = await movieApi.getMoviesByManager();
        setAllMovies(response.data || []);
        setMovies(response.data || []);
      }
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

  console.log("allMovies", allMovies);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32 font-sans">
      {(!user?.role || user?.role !== UserRole.MANAGER) && (
        <section className="relative overflow-hidden bg-black px-4 pt-16 md:px-8">
          <div className="pointer-events-none absolute top-0 left-1/2 h-[1000px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]" />

          <div className="relative z-20 mx-auto max-w-[1800px]">
            <div className="relative text-center">
              <h2 className="text-5xl leading-none font-black tracking-[-0.08em] text-[#d4af37] uppercase drop-shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                Phim đang chiếu
              </h2>
              <div className="mx-auto mt-8 h-2 w-56 rounded-full bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
            </div>

            <InfinitePremiumCarousel
              items={nowShowingMovies}
              sectionType="NOW"
              canEdit={canEditMovie}
              canDelete={canDeleteMovie}
              onEdit={handleEditMovie}
              onDelete={handleDelete}
              navigate={navigate}
            />
          </div>
        </section>
      )}

      {(!user?.role || user?.role !== UserRole.MANAGER) && (
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
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="shadow-3xl mt-14 rounded-[3rem] border border-white/5 bg-[#111] p-10 md:p-16">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-center justify-between gap-6 border-b border-white/5 pb-10 md:flex-row">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="h-10 w-2 bg-yellow-400"></div>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                  Tất cả phim
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {canAddMovie && (
                  <button
                    onClick={handleAddMovie}
                    className="flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-2.5 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105 hover:bg-white active:scale-95"
                  >
                    <Plus className="h-5 w-5 stroke-[3px]" />
                    <span className="text-xs font-black tracking-widest uppercase">Thêm phim</span>
                  </button>
                )}

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
            </div>

            <div className="space-y-6">
              {allMovies
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
                            {movie.rate}
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
                        {(() => {
                          if (
                            (!user?.role || user?.role === UserRole.CUSTOMER) &&
                            movie.showingStatus === ShowingStatus.NOW_SHOWING &&
                            movie.status === MovieStatus.ACTIVE
                          ) {
                            return (
                              <button
                                onClick={() => navigate(URL.MovieDetail.replace(":id", movie._id))}
                                className="cursor-pointer rounded-full bg-[#d4af37] px-10 py-3.5 text-sm font-black tracking-[0.2em] text-black uppercase shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
                              >
                                Đặt vé ngay
                              </button>
                            );
                          }
                        })()}
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

export default Movies;
