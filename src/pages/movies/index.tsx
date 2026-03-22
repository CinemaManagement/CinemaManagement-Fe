import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store";
import { UserRole } from "@/types/document";
import type { Movie } from "@/types/document";
import { movieApi } from "@/services/api/movieApi";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Movies = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Computed permissions based on image
  const canAddMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const canEditMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const canDeleteMovie = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response = await movieApi.getMovies();
      // Assume the data is in response.data.data or response.data
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
    navigate("/movies/add");
  };

  const handleEditMovie = (id: string) => {
    navigate(`/movies/edit/${id}`);
  };

  return (
    <div className="bg-background relative min-h-screen p-8 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
              Movies
            </h1>
            <p className="mt-2 text-muted-foreground">Discover and manage all movies.</p>
          </div>
          {canAddMovie && (
            <button
              onClick={handleAddMovie}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:shadow-primary/20 hover:-translate-y-1"
            >
              <Plus className="h-5 w-5" /> Add Movie
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <div key={movie._id || (movie as Movie & { id?: string }).id} className="group relative flex flex-col gap-4">
                  <div className="relative aspect-2/3 overflow-hidden rounded-3xl border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-primary/50">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x600?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      {canEditMovie && (
                        <button
                          onClick={() => handleEditMovie(movie._id || (movie as Movie & { id?: string }).id || '')}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white shadow-lg transition-colors hover:bg-secondary/80"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteMovie && (
                        <button
                          onClick={() => handleDelete(movie._id || (movie as Movie & { id?: string }).id || '')}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/80 text-white shadow-lg transition-colors hover:bg-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link to={`/movies/${movie._id || (movie as Movie & { id?: string }).id}`}>
                      <h3 className="truncate text-lg font-black uppercase tracking-tight text-white transition-colors hover:text-primary">
                        {movie.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>{movie.duration} min</span>
                      {movie.ageRestriction && <span className="text-primary">{movie.ageRestriction}+</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full pt-10 text-center text-xl text-muted-foreground">
                No movies available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
