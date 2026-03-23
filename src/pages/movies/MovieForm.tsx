import {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {movieApi} from "@/services/api/movieApi";
import {MovieStatus, ShowingStatus} from "@/types/document";
import toast from "react-hot-toast";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  FileText,
  Clock,
  Percent,
  Shield,
  Plus,
  Trash2,
  User,
  Users,
  UserCircle,
  Clapperboard,
  Calendar,
} from "lucide-react";

const MOVIE_GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Animation",
  "Adventure",
  "Biography",
  "History",
  "Crime",
  "Fantasy",
  "Mystery",
];

const inputCls =
  "bg-white/5 placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary block w-full rounded-xl border border-white/10 py-3 pr-4 pl-11 text-white text-sm transition-all focus:outline-none";
const labelCls = "block text-[11px] font-bold tracking-widest uppercase text-white/40 mb-1.5";

const SectionCard = ({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
    <div className={`flex items-center gap-3 border-b border-white/5 px-5 py-3.5 ${color}`}>
      <Icon className="h-4 w-4" />
      <span className="text-xs font-bold tracking-widest uppercase">{title}</span>
    </div>
    <div className="space-y-4 p-5">{children}</div>
  </div>
);

const FieldIcon = ({icon: Icon}: {icon: React.ElementType}) => (
  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
    <Icon className="group-focus-within:text-primary h-4 w-4 text-white/30 transition-colors" />
  </div>
);

export const MovieForm = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 0,
    ageRestriction: 0,
    posterUrl: "",
    trailerUrl: "",
    category: [] as string[],
    director: [{name: "", avatar: ""}] as {name: string; avatar: string}[],
    actors: [{name: "", avatar: ""}] as {name: string; avatar: string}[],
    revenueSharePercent: 0,
    status: MovieStatus.ACTIVE,
    showingStatus: ShowingStatus.COMING_SOON,
    releaseDate: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchMovie = async () => {
        try {
          const response = await movieApi.getMovieById(id);
          const data = response.data?.data || response.data;
          const mapToArrayOfObjects = (
            arr: (string | {name?: string; avatar?: string})[] | undefined,
          ) => {
            if (!arr || arr.length === 0) return [{name: "", avatar: ""}];
            return arr.map((item) => {
              if (typeof item === "string") return {name: item, avatar: ""};
              return {name: item.name || "", avatar: item.avatar || ""};
            });
          };
          setFormData({
            title: data.title || "",
            description: data.description || "",
            duration: data.duration || 0,
            ageRestriction: data.ageRestriction || 0,
            posterUrl: data.posterUrl || "",
            trailerUrl: data.trailerUrl || "",
            category: data.category || [],
            director: mapToArrayOfObjects(data.director),
            actors: mapToArrayOfObjects(data.actors),
            revenueSharePercent: data.revenueSharePercent || 0,
            status: data.status || MovieStatus.ACTIVE,
            showingStatus: data.showingStatus || ShowingStatus.COMING_SOON,
            releaseDate: data.releaseDate ? data.releaseDate.split("T")[0] : "",
          });
        } catch {
          toast.error("Failed to load movie details.");
          navigate("/movies");
        }
      };
      fetchMovie();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const {name, value, type} = e.target;
    if (type === "number") {
      setFormData((prev) => ({...prev, [name]: Number(value)}));
    } else {
      setFormData((prev) => ({...prev, [name]: value}));
    }
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(genre)
        ? prev.category.filter((g) => g !== genre)
        : [...prev.category, genre],
    }));
  };

  const handleArrayChange = (
    index: number,
    field: "name" | "avatar",
    value: string,
    type: "director" | "actors",
  ) => {
    const newArray = [...formData[type]];
    newArray[index] = {...newArray[index], [field]: value};
    setFormData((prev) => ({...prev, [type]: newArray}));
  };

  const addArrayItem = (type: "director" | "actors") => {
    setFormData((prev) => ({...prev, [type]: [...prev[type], {name: "", avatar: ""}]}));
  };

  const removeArrayItem = (index: number, type: "director" | "actors") => {
    if (formData[type].length <= 1) return;
    setFormData((prev) => ({...prev, [type]: prev[type].filter((_, i) => i !== index)}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        director: formData.director.filter((d) => d.name.trim() !== ""),
        actors: formData.actors.filter((a) => a.name.trim() !== ""),
      };
      if (isEditMode && id) {
        await movieApi.updateMovie(id, payload);
        toast.success("Movie updated successfully!");
      } else {
        await movieApi.createMovie(payload);
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
    <div className="bg-background min-h-screen pt-20 pb-16 text-white">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/movies"
            className="hover:text-primary mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/40 uppercase transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Movies
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
            <span className="bg-primary/10 text-primary rounded-xl p-2">
              <Clapperboard className="h-6 w-6" />
            </span>
            {isEditMode ? "Edit Movie" : "Add New Movie"}
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            {isEditMode
              ? "Update the details of this movie."
              : "Fill out the information below to add a new movie."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-6">
            {/* ── LEFT SIDEBAR ── */}
            <div className="sticky top-24 w-56 flex-shrink-0 space-y-4">
              {/* Poster preview */}
              <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
                {formData.posterUrl ? (
                  <img
                    src={formData.posterUrl}
                    alt="Poster preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0";
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "1";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/20">
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-xs font-medium">Poster Preview</span>
                  </div>
                )}
              </div>

              {/* Showing Status */}
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <label className={labelCls}>Showing Status</label>
                <select
                  name="showingStatus"
                  value={formData.showingStatus}
                  onChange={handleChange}
                  className="focus:border-primary focus:ring-primary block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-1 focus:outline-none"
                >
                  {Object.values(ShowingStatus).map((s) => (
                    <option key={s} value={s} className="bg-background text-white">
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <label className={labelCls}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="focus:border-primary focus:ring-primary block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-1 focus:outline-none"
                >
                  {Object.values(MovieStatus).map((s) => (
                    <option key={s} value={s} className="bg-background text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick numbers */}
              <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <div>
                  <label className={labelCls}>Duration (min)</label>
                  <div className="group relative">
                    <FieldIcon icon={Clock} />
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min={0}
                      className={inputCls}
                      placeholder="120"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Age Restriction</label>
                  <div className="group relative">
                    <FieldIcon icon={Shield} />
                    <input
                      type="number"
                      name="ageRestriction"
                      value={formData.ageRestriction}
                      onChange={handleChange}
                      min={0}
                      className={inputCls}
                      placeholder="0+"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Revenue Share (%)</label>
                  <div className="group relative">
                    <FieldIcon icon={Percent} />
                    <input
                      type="number"
                      name="revenueSharePercent"
                      value={formData.revenueSharePercent}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      className={inputCls}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT MAIN ── */}
            <div className="min-w-0 flex-1 space-y-5">
              {/* Basic Info */}
              <SectionCard
                icon={FileText}
                title="Basic Information"
                color="bg-blue-500/10 text-blue-400"
              >
                <div>
                  <label className={labelCls}>Movie Title</label>
                  <div className="group relative">
                    <FieldIcon icon={Clapperboard} />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Enter movie title..."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Release Date</label>
                  <div className="group relative">
                    <FieldIcon icon={Calendar} />
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="focus:border-primary focus:ring-primary block min-h-[100px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:ring-1 focus:outline-none"
                    placeholder="Write a compelling synopsis..."
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Genre</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {MOVIE_GENRES.map((g) => {
                      const active = formData.category.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                            active
                              ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.35)]"
                              : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                  {formData.category.length === 0 && (
                    <p className="mt-2 text-xs text-white/25">Click to select one or more genres</p>
                  )}
                </div>
              </SectionCard>

              {/* Media */}
              <SectionCard icon={Video} title="Media" color="bg-purple-500/10 text-purple-400">
                <div>
                  <label className={labelCls}>Poster Image URL</label>
                  <div className="group relative">
                    <FieldIcon icon={ImageIcon} />
                    <input
                      type="url"
                      name="posterUrl"
                      value={formData.posterUrl}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="https://example.com/poster.jpg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Trailer URL (YouTube Embed)</label>
                  <div className="group relative">
                    <FieldIcon icon={Video} />
                    <input
                      type="url"
                      name="trailerUrl"
                      value={formData.trailerUrl}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="https://youtube.com/embed/..."
                      required
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Directors */}
              <SectionCard icon={User} title="Directors" color="bg-amber-500/10 text-amber-400">
                <div className="space-y-3">
                  {formData.director.map((d, index) => (
                    <div
                      key={index}
                      className="animate-in fade-in slide-in-from-left-2 flex items-center gap-3 duration-200"
                    >
                      {d.avatar ? (
                        <img
                          src={d.avatar}
                          alt={d.name || "Director"}
                          className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-2 ring-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 ring-2 ring-white/10">
                          <User className="h-6 w-6 text-amber-400/60" />
                        </div>
                      )}
                      <div className="grid flex-1 grid-cols-2 gap-2">
                        <div className="group relative">
                          <FieldIcon icon={User} />
                          <input
                            type="text"
                            value={d.name}
                            onChange={(e) =>
                              handleArrayChange(index, "name", e.target.value, "director")
                            }
                            className={inputCls}
                            placeholder="Full name"
                            required
                          />
                        </div>
                        <div className="group relative">
                          <FieldIcon icon={UserCircle} />
                          <input
                            type="url"
                            value={d.avatar}
                            onChange={(e) =>
                              handleArrayChange(index, "avatar", e.target.value, "director")
                            }
                            className={inputCls}
                            placeholder="Photo URL (optional)"
                          />
                        </div>
                      </div>
                      {formData.director.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, "director")}
                          className="flex-shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("director")}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-2.5 text-xs font-bold text-white/40 transition-all hover:border-amber-400/40 hover:bg-amber-500/5 hover:text-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Director
                </button>
              </SectionCard>

              {/* Cast */}
              <SectionCard
                icon={Users}
                title="Principal Cast"
                color="bg-emerald-500/10 text-emerald-400"
              >
                <div className="space-y-3">
                  {formData.actors.map((a, index) => (
                    <div
                      key={index}
                      className="animate-in fade-in slide-in-from-left-2 flex items-center gap-3 duration-200"
                    >
                      {a.avatar ? (
                        <img
                          src={a.avatar}
                          alt={a.name || "Actor"}
                          className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-2 ring-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-white/10">
                          <Users className="h-6 w-6 text-emerald-400/60" />
                        </div>
                      )}
                      <div className="grid flex-1 grid-cols-2 gap-2">
                        <div className="group relative">
                          <FieldIcon icon={User} />
                          <input
                            type="text"
                            value={a.name}
                            onChange={(e) =>
                              handleArrayChange(index, "name", e.target.value, "actors")
                            }
                            className={inputCls}
                            placeholder="Full name"
                            required
                          />
                        </div>
                        <div className="group relative">
                          <FieldIcon icon={UserCircle} />
                          <input
                            type="url"
                            value={a.avatar}
                            onChange={(e) =>
                              handleArrayChange(index, "avatar", e.target.value, "actors")
                            }
                            className={inputCls}
                            placeholder="Photo URL (optional)"
                          />
                        </div>
                      </div>
                      {formData.actors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, "actors")}
                          className="flex-shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("actors")}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-2.5 text-xs font-bold text-white/40 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-emerald-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Actor
                </button>
              </SectionCard>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black tracking-widest uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(var(--primary),0.35)] disabled:translate-y-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="border-primary-foreground h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {isEditMode ? "Save Changes" : "Create Movie"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
