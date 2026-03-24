import URL from "@/constants/url";
import type {Movie} from "@/types/document";
import {ChevronLeft, ChevronRight, Star, Plus, Edit, Trash2} from "lucide-react";
import {useState} from "react";
import type {useNavigate} from "react-router-dom";

interface CarouselProps {
  items: Movie[];
  sectionType: "NOW" | "SOON";
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}

const InfinitePremiumCarousel = ({
  items,
  sectionType,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  navigate,
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

  console.log(items);

  return (
    <div className="relative flex h-[750px] w-full items-center justify-center overflow-hidden">
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
                    [...Array(5)].map((_, i) => {
                      const roundedRate = Math.round((movie.rate || 0) * 2) / 2;
                      const fillPercent = Math.max(0, Math.min(100, (roundedRate - i) * 100));
                      return (
                        <div key={i} className="relative">
                          <Star className="h-4 w-4 fill-current text-white/20" />
                          {fillPercent > 0 && (
                            <Star
                              className="absolute top-0 left-0 h-4 w-4 fill-current text-[#d4af37]"
                              style={{clipPath: `inset(0 ${100 - fillPercent}% 0 0)`}}
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-sm font-black text-white">Chưa có đánh giá</span>
                  )}
                </div>
                {sectionType === "NOW" && (
                  <div className="absolute top-5 left-5 flex items-center rounded-full bg-[#fedb39] px-4 py-2 text-sm font-black tracking-[0.2em] text-black uppercase shadow-2xl ring-4 ring-black/50">
                    {movie.ageRestriction || "13"} <Plus size={12} strokeWidth={3} />
                  </div>
                )}
                <div className="absolute top-0 left-0 h-full w-full bg-linear-to-t from-black via-black/30 to-transparent"></div>
                <div
                  className={`absolute bottom-5 left-5 space-y-4 text-center transition-all duration-1000 ${isActive ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
                >
                  <h3 className="text-left text-3xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfinitePremiumCarousel;
