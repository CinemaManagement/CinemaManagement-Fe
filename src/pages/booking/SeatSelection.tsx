import {useState, useRef, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {ChevronLeft, Info, Ticket, Maximize, Minimize, Move, ChevronRight} from "lucide-react";
import toast from "react-hot-toast";
import type {Movie, Showtime} from "@/types/document";
import {showtimeApi} from "@/services/api/showtimeApi";
import {createMovieBooking} from "@/services/api/bookingApi";

const SeatSelection = () => {
  const {showtimeId} = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const movieId = showtimeId?.split("-")[0];
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  // useEffect(() => {
  //   if(movieId)
  //     movieApi.getMovieById(movieId).then((res) => {
  //       setMovie(res.data);
  //     }).catch((err) => {
  //       toast.error(err.response.data.message);
  //     });
  // },[movieId])

  useEffect(() => {
    if (showtimeId)
      showtimeApi
        .getShowtimeById(showtimeId)
        .then((res) => {
          setShowtime(res.data);
          setMovie(res.data.movieId);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
  }, [showtimeId]);

  // useEffect(() => {
  //   const fetchMovie = async () => {
  //     try {
  //       const res = await movieApi.getMovieById(movieId as string);
  //       setMovie(res.data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   if (movieId) fetchMovie();
  // }, [movieId]);
  // Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({x: 0, y: 0});
  const [isPanning, setIsPanning] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(2, prev * delta)));
  };

  const handleMouseDown = () => {
    setIsPanning(true);
    setHasMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) {
      setHasMoved(true);
    }
    setPosition((prev) => ({
      x: prev.x + e.movementX / scale,
      y: prev.y + e.movementY / scale,
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({x: 0, y: 0});
  };
  const allSeatCodes = showtime?.seats?.map((s) => s.seatCode) || [];
  const rows =
    allSeatCodes.length > 0
      ? Array.from(new Set(allSeatCodes.map((s) => s.charAt(0)))).sort()
      : ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  const maxCol =
    allSeatCodes.length > 0 ? Math.max(...allSeatCodes.map((s) => parseInt(s.substring(1)))) : 8;
  const cols = Array.from({length: maxCol}, (_, i) => i + 1);

  const getSeatType = (id: string) => {
    if (!(showtime?.cinemaRoomId as any)?.seats) return "NONE";
    const seatsLayout = (showtime?.cinemaRoomId as any).seats;
    if (seatsLayout.COUPLE?.includes(id)) return "COUPLE";
    if (seatsLayout.VIP?.includes(id)) return "VIP";
    if (seatsLayout.NORMAL?.includes(id)) return "NORMAL";
    return "NONE";
  };

  const getSeatPrice = (id: string) => {
    const seatObj = showtime?.seats?.find((s) => s.seatCode === id);
    return seatObj?.price || 0;
  };

  const isSeatOccupied = (id: string) => {
    const seatObj = showtime?.seats?.find((s) => s.seatCode === id);
    return seatObj ? seatObj.status !== "AVAILABLE" : true;
  };

  const toggleSeat = (id: string) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== id));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error("Maximum 8 seats per booking");
        return;
      }
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, id) => {
    return sum + getSeatPrice(id);
  }, 0);

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;
    setIsHolding(true);
    try {
      const res = await createMovieBooking(showtimeId as string, selectedSeats);
      const movieBookingId = res._id || res.data?._id;
      const expiredAt = res.expiredAt || res.data?.expiredAt;
      toast.success("Thrones reserved! You have 10 minutes to grab snacks.");
      navigate(`/food-selection?movieId=${movieId}&showtimeId=${showtimeId}&movieBookingId=${movieBookingId}&expiredAt=${encodeURIComponent(expiredAt)}&seats=${selectedSeats.join(",")}&ticketTotal=${totalPrice}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reserve seats");
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <div className="animate-in fade-in mx-auto min-h-screen max-w-7xl px-4 pt-12 pb-32 duration-700 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="glass-card hover:text-primary shadow-inner-glossy rounded-2xl p-4 text-white/40 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Choose Your Throne
            </h1>
            <p className="text-primary mt-1 flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
              {movie?.title} <span className="bg-primary/40 h-1.5 w-1.5 rounded-full" />{" "}
              {showtime?.startTime
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(showtime.startTime))
                : "Loading time..."}
            </p>
          </div>
        </div>

        <div className="shadow-inner-glossy flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-2">
          <div className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2 shadow-lg">
            <Ticket className="h-4 w-4" />
            <span className="text-sm font-black whitespace-nowrap">STEP 02/04</span>
          </div>
          <span className="hidden px-4 text-[10px] font-black tracking-widest text-white/40 uppercase md:block">
            Seat Selection
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
        {/* Seat Map Area */}
        <div className="space-y-16 lg:col-span-3">
          {/* Seat Map Container with Zoom/Pan */}
          <div className="group/map relative">
            <div
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative overflow-hidden rounded-[3rem] border border-white/5 bg-black/40 p-12 shadow-2xl md:p-20 ${isPanning ? "cursor-grabbing" : "cursor-grab"} transition-colors duration-500 hover:bg-black/60`}
            >
              <div
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  transition: isPanning ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                }}
                className="origin-center transition-transform"
              >
                {/* Screen */}
                <div className="relative mb-32 flex flex-col items-center">
                  <div className="bg-primary/40 h-1.5 w-full max-w-2xl rounded-full shadow-[0_0_60px_rgba(var(--primary),1)] blur-[2px]" />
                  <div className="from-primary/10 mt-4 h-32 w-4/5 rounded-[100%] bg-linear-to-b to-transparent opacity-30" />
                  <p className="absolute -bottom-6 text-center text-[10px] font-black tracking-[1.5em] text-white/20 uppercase">
                    Silver Screen
                  </p>
                </div>

                <div className="relative flex flex-col items-center gap-6 pb-12 focus:outline-none">
                  {rows.map((row) => (
                    <div key={row} className="z-10 flex items-center gap-6">
                      <span className="w-8 text-center text-[10px] font-black tracking-widest text-white/20 uppercase">
                        {row}
                      </span>
                      <div className="flex gap-3">
                        {cols.map((col) => {
                          const id = `${row}${col}`;
                          const type = getSeatType(id);

                          if (type === "NONE") {
                            // If previous column was a COUPLE seat, we skip the empty space to keep the grid perfectly aligned.
                            const prevId = `${row}${col - 1}`;
                            if (getSeatType(prevId) === "COUPLE") return null;

                            return (
                              <div
                                key={id}
                                className="h-10 w-10 shrink-0 border border-transparent sm:h-12 sm:w-12"
                              ></div>
                            );
                          }

                          const isSelected = selectedSeats.includes(id);
                          const isOccupied = isSeatOccupied(id);
                          const price = getSeatPrice(id);

                          return (
                            <button
                              key={id}
                              disabled={isOccupied}
                              onClick={() => !hasMoved && toggleSeat(id)}
                              className={`group/seat relative flex h-10 shrink-0 items-center justify-center rounded-[12px] transition-all md:h-12 ${type === "COUPLE" ? "w-[92px] md:w-[108px]" : "w-10 md:w-12"} ${isOccupied ? "cursor-not-allowed bg-white/5 opacity-20" : ""} ${isSelected ? "bg-primary text-primary-foreground btn-glossy z-10 scale-105 shadow-[0_0_20px_rgba(var(--primary),0.6)]" : "bg-card/40 hover:border-primary/50 hover:bg-card/60 shadow-inner-glossy border border-white/10"} ${type === "VIP" && !isSelected && !isOccupied ? "border-primary/20 bg-primary/20 shadow-inner-primary" : ""} ${type === "COUPLE" && !isSelected && !isOccupied ? "bg-secondary/10 border-secondary/20" : ""} `}
                            >
                              <span
                                className={`text-[10px] font-black tracking-normal transition-all md:text-xs ${isSelected ? "text-primary-foreground" : isOccupied ? "text-white/20" : type === "VIP" ? "text-primary/70 group-hover/seat:text-primary" : type === "COUPLE" ? "text-secondary/70 group-hover/seat:text-secondary" : "text-white/40 group-hover/seat:text-white/80"}`}
                              >
                                {id}
                              </span>
                              {!isOccupied && (
                                <div className="glass-card border-primary/20 pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 rounded-lg px-3 py-1.5 text-[9px] font-black tracking-widest whitespace-nowrap uppercase opacity-0 transition-all group-hover/seat:opacity-100">
                                  {id} • {type} •{" "}
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(price)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-8 text-center text-[10px] font-black tracking-widest text-white/20 uppercase">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute right-6 bottom-6 flex scale-90 flex-col gap-2 md:scale-100">
                <button
                  onClick={() => setScale((s) => Math.min(2, s + 0.1))}
                  className="glass-card hover:text-primary hover:border-primary/30 rounded-xl border border-white/5 p-3 text-white/60 transition-all active:scale-90"
                >
                  <Maximize className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                  className="glass-card hover:text-primary hover:border-primary/30 rounded-xl border border-white/5 p-3 text-white/60 transition-all active:scale-90"
                >
                  <Minimize className="h-4 w-4" />
                </button>
                <button
                  onClick={resetZoom}
                  className="glass-card hover:text-primary hover:border-primary/30 rounded-xl border border-white/5 p-3 text-white/60 transition-all active:scale-90"
                >
                  <Move className="h-4 w-4" />
                </button>
              </div>

              {/* Interaction Hint */}
              <div className="pointer-events-none absolute top-6 left-6 flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4 py-2 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover/map:opacity-100">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                  <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">
                    DRAG TO PAN • SCROLL TO ZOOM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-10 border-t border-white/5 pt-12">
            {[
              {color: "bg-card/40 border-white/10", label: "Available"},
              {color: "bg-primary shadow-lg", label: "Selected"},
              {color: "bg-white/5 opacity-30", label: "Occupied"},
              {color: "bg-primary/5 border-primary/30", label: "VIP Area"},
              {color: "bg-secondary/10 border-secondary/30", label: "Couple Seat"},
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-md border ${item.color} shadow-inner-glossy`} />
                <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="border-primary/50 h-5 w-10 rounded border-2 border-dashed bg-transparent" />
            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              Prime Viewing Zone
            </span>
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card shadow-inner-glossy sticky top-24 flex max-h-[calc(100vh-6rem)] flex-col gap-10 overflow-y-auto rounded-[3rem] p-10 shadow-2xl [&::-webkit-scrollbar]:hidden">
            <div>
              <h2 className="mb-8 text-2xl font-black tracking-tighter text-white uppercase">
                Booking Pass
              </h2>
              <div className="flex flex-col gap-6">
                <div className="space-y-1">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    Movie Choice
                  </p>
                  <p className="text-xl leading-tight font-black tracking-tight text-white uppercase">
                    {movie?.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                      Cinema
                    </p>
                    <p className="text-sm font-black text-white uppercase">
                      {(showtime?.cinemaRoomId as any)?.roomName || "Selected Room"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                      Time
                    </p>
                    <p className="text-sm font-black text-white uppercase">
                      {showtime?.startTime
                        ? new Intl.DateTimeFormat("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(showtime.startTime))
                        : "--:--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                    Selected Throne(s)
                  </p>
                  <div className="flex min-h-16 flex-wrap items-start gap-3">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((id) => (
                        <span
                          key={id}
                          className="bg-primary/10 border-primary/20 text-primary animate-in zoom-in shadow-inner-gold rounded-sm border px-2 py-1 text-xs font-black duration-300"
                        >
                          {id}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm font-medium tracking-widest text-white/20 uppercase italic">
                        No seats picked...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 border-t border-white/5">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                    Total Price
                  </span>
                  <p className="text-4xl leading-none font-black text-white">
                    {new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(
                      totalPrice,
                    )}
                  </p>
                </div>
              </div>

              <button
                disabled={selectedSeats.length === 0 || isHolding}
                onClick={handleContinue}
                className="bg-primary text-primary-foreground btn-glossy flex w-full items-center justify-between rounded-xl px-4 py-6 text-left text-xs font-black tracking-widest uppercase shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] transition-all hover:scale-105 disabled:opacity-30 disabled:grayscale"
              >
                {isHolding ? "Holding Seats..." : "Continue to Snacks"} <ChevronRight />
              </button>

              <div className="shadow-inner-glossy flex items-start gap-4 rounded-[2rem] border border-white/5 bg-white/5 p-5">
                <Info className="text-primary mt-0.5 size-4 shrink-0" />
                <p className="text-[11px] leading-relaxed font-medium tracking-tighter text-white/40 uppercase">
                  Your thrones are reserved for 10 minutes. please proceed to choose snacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
