import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { movieApi } from "@/services/api/movieApi";
import { MovieStatus } from "@/types/document";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Image as ImageIcon, Video, FileText, Clock, Percent, Shield } from "lucide-react";

export const MovieForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    duration: 0,
    ageRestriction: 0,
    posterUrl: "",
    trailerUrl: "",
    revenueSharePercent: 0,
    status: MovieStatus.ACTIVE,
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchMovie = async () => {
        try {
          // Pre-fill loading
          const response = await movieApi.getMovieById(id);
          const data = response.data?.data || response.data;
          setFormData({
            title: data.title || "",
            duration: data.duration || 0,
            ageRestriction: data.ageRestriction || 0,
            posterUrl: data.posterUrl || "",
            trailerUrl: data.trailerUrl || "",
            revenueSharePercent: data.revenueSharePercent || 0,
            status: data.status || MovieStatus.ACTIVE,
          });
        } catch {
          toast.error("Failed to load movie details.");
          navigate("/movies");
        }
      };
      fetchMovie();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Map number fields
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode && id) {
        await movieApi.updateMovie(id, formData);
        toast.success("Movie updated successfully!");
      } else {
        await movieApi.createMovie(formData);
        toast.success("Movie created successfully!");
      }
      navigate("/movies");
    } catch {
      toast.error(isEditMode ? "Failed to update movie." : "Failed to create movie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background relative min-h-screen p-8 pt-24 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/movies"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Movies
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {isEditMode ? "Edit Movie" : "Add New Movie"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isEditMode ? "Update the details of the movie." : "Fill out the information below to add a movie."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Movie Title</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <FileText className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 pr-4 pl-12 text-white placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Tôi muốn nghỉ Tết..."
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Duration (Minutes)</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Clock className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min={0}
                  className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 pr-4 pl-12 text-white placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="120"
                  required
                />
              </div>
            </div>

            {/* Age Restriction */}
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Age Restriction</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Shield className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="number"
                  name="ageRestriction"
                  value={formData.ageRestriction}
                  onChange={handleChange}
                  min={0}
                  className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 pr-4 pl-12 text-white placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="10"
                  required
                />
              </div>
            </div>

            {/* Poster URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Poster Image URL</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <ImageIcon className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 pr-4 pl-12 text-white placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="https://example.com/poster.jpg"
                  required
                />
              </div>
            </div>

            {/* Trailer URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Trailer URL (YouTube Embed)</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Video className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="url"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 pr-4 pl-12 text-white placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="https://youtube.com/embed/..."
                  required
                />
              </div>
            </div>

            {/* Revenue Share Percent */}
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Revenue Share (%)</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Percent className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                </div>
                <input
                  type="number"
                  name="revenueSharePercent"
                  value={formData.revenueSharePercent}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 pr-4 pl-12 text-white placeholder:text-muted-foreground transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold tracking-wider uppercase">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-2xl border border-white/5 bg-background/50 py-4 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {Object.values(MovieStatus).map((s) => (
                  <option key={s} value={s} className="bg-background text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-black tracking-widest text-primary-foreground uppercase transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] disabled:translate-y-0 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Save className="h-5 w-5" /> {isEditMode ? "Save Changes" : "Create Movie"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
