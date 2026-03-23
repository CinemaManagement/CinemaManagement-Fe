import {useState, useEffect, useCallback} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {roomApi} from "@/services/api/roomApi";
import {SeatType} from "@/types/document";
import type {CinemaRoom} from "@/types/document";
import {Save, ArrowLeft, Grid3X3, Info} from "lucide-react";
import toast from "react-hot-toast";
import URL from "@/constants/url";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

const RoomForm = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [numRows, setNumRows] = useState(8);
  const [numCols, setNumCols] = useState(10);
  const [seats, setSeats] = useState<Record<string, SeatType | "NONE">>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await roomApi.getRoomById(id!);
      const room: CinemaRoom = res.data || res;
      setRoomName(room.roomName);

      const seatMap: Record<string, SeatType | "NONE"> = {};
      let maxR = 0;
      let maxC = 0;

      const processSeats = (codes: string[], type: SeatType) => {
        codes.forEach((code) => {
          seatMap[code] = type;
          const rIndex = ROWS.indexOf(code.charAt(0));
          const cNum = parseInt(code.substring(1));
          if (rIndex > maxR) maxR = rIndex;
          if (cNum > maxC) maxC = cNum;

          if (type === SeatType.COUPLE) {
            const neighbor = `${code.charAt(0)}${cNum + 1}`;
            seatMap[neighbor] = "NONE";
            if (cNum + 1 > maxC) maxC = cNum + 1;
          }
        });
      };

      processSeats(room.seats.NORMAL, SeatType.NORMAL);
      processSeats(room.seats.VIP, SeatType.VIP);
      processSeats(room.seats.COUPLE, SeatType.COUPLE);

      setSeats(seatMap);
      setNumRows(maxR + 1);
      setNumCols(maxC);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch room data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id, fetchRoom]);

  const generateMatrix = () => {
    const newSeats: Record<string, SeatType | "NONE"> = {};
    for (let r = 0; r < numRows; r++) {
      for (let c = 1; c <= numCols; c++) {
        const code = `${ROWS[r]}${c}`;
        newSeats[code] = SeatType.NORMAL;
      }
    }
    setSeats(newSeats);
  };

  const toggleSeatType = (code: string) => {
    setSeats((prev) => {
      const current = prev[code];
      const row = code.charAt(0);
      const col = parseInt(code.substring(1));
      const nextCode = `${row}${col + 1}`;

      let next: SeatType | "NONE";
      if (current === SeatType.NORMAL) next = SeatType.VIP;
      else if (current === SeatType.VIP) {
        if (col < numCols) next = SeatType.COUPLE;
        else next = "NONE";
      } else if (current === SeatType.COUPLE) next = "NONE";
      else next = SeatType.NORMAL;

      const newSeats = {...prev, [code]: next};
      if (next === SeatType.COUPLE && nextCode in prev) {
        newSeats[nextCode] = "NONE";
      }
      if (current === SeatType.COUPLE && next === "NONE" && nextCode in prev) {
        newSeats[nextCode] = "NONE";
      }
      return newSeats;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName) return toast.error("Please enter room name");

    const payloadSeats: Record<string, string[]> = {
      NORMAL: [],
      VIP: [],
      COUPLE: [],
    };

    Object.entries(seats).forEach(([code, type]) => {
      const rIndex = ROWS.indexOf(code.charAt(0));
      const cNum = parseInt(code.substring(1));

      // ONLY include seats within the current visible grid dimensions
      if (rIndex < numRows && cNum <= numCols) {
        if (type !== "NONE" && type in payloadSeats) {
          // Special check for COUPLE seats at the right edge
          if (type === SeatType.COUPLE && cNum === numCols) {
            payloadSeats.NORMAL.push(code); // Fallback to Normal
          } else {
            payloadSeats[type].push(code);
          }
        }
      }
    });

    const totalSeats =
      payloadSeats.NORMAL.length + payloadSeats.VIP.length + payloadSeats.COUPLE.length;
    if (totalSeats === 0) return toast.error("Please add at least one seat");

    try {
      setIsSubmitting(true);
      if (id) {
        await roomApi.updateRoom(id, {roomName, seats: payloadSeats});
        toast.success("Room updated successfully");
      } else {
        console.log({roomName, seats: payloadSeats});
        // await roomApi.createRoom({roomName, seats: payloadSeats});
        // toast.success("Room created successfully");
      }
      navigate(URL.AdminRooms);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeatColor = (type: SeatType | "NONE") => {
    switch (type) {
      case SeatType.NORMAL:
        return "bg-white/10 hover:bg-white/20 border-white/20 text-white/40";
      case SeatType.VIP:
        return "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-400";
      case SeatType.COUPLE:
        return "bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/40 text-pink-400 font-bold";
      default:
        return "bg-transparent border-dashed border-white/5 text-transparent";
    }
  };

  const renderGrid = () => {
    if (Object.keys(seats).length === 0) return null;

    const grid = [];
    for (let r = 0; r < numRows; r++) {
      const rowCode = ROWS[r];
      for (let c = 1; c <= numCols; c++) {
        const code = `${rowCode}${c}`;
        const type = seats[code];

        if (type === SeatType.COUPLE) {
          grid.push(
            <button
              key={code}
              type="button"
              onClick={() => toggleSeatType(code)}
              className={`flex h-10 items-center justify-center rounded-lg border text-[10px] font-black transition-all hover:scale-[1.05] ${getSeatColor(type)}`}
              style={{gridColumn: "span 2"}}
              title={`${code} (Couple)`}
            >
              {code}-{rowCode}${c + 1}
            </button>,
          );
          c++; // skip next cell
        } else {
          grid.push(
            <button
              key={code}
              type="button"
              onClick={() => toggleSeatType(code)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-[8px] font-black transition-all ${getSeatColor(type)}`}
              title={code}
            >
              {code}
            </button>,
          );
        }
      }
    }
    return grid;
  };

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-8 pt-24 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(id ? URL.AdminRoomDetail.replace(":id", id) : URL.AdminRooms)}
          className="mb-8 flex items-center gap-2 text-xs font-black tracking-widest text-white/40 uppercase transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {id ? "Detail" : "Rooms"}
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-1">
            <div className="glass-card rounded-[2rem] border border-white/5 bg-white/5 p-8 shadow-2xl">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-black tracking-tight uppercase">
                <Info className="text-primary h-6 w-6" />
                {id ? "Edit" : "Room"} Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Cinema 01 - IMAX"
                    className="focus:border-primary w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                      Rows
                    </label>
                    <input
                      type="number"
                      value={numRows}
                      onChange={(e) => setNumRows(Number(e.target.value))}
                      min={1}
                      max={15}
                      className="focus:border-primary w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                      Cols
                    </label>
                    <input
                      type="number"
                      value={numCols}
                      onChange={(e) => setNumCols(Number(e.target.value))}
                      min={1}
                      max={20}
                      className="focus:border-primary w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateMatrix}
                  className="text-primary border-primary/30 hover:bg-primary/5 w-full rounded-xl border border-dashed py-3 font-bold transition-all"
                >
                  Generate Grid
                </button>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] border border-white/5 bg-white/5 p-8 shadow-2xl">
              <h3 className="mb-6 text-sm font-black tracking-widest text-white/60 uppercase">
                Legend & Controls
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border border-white/20 bg-white/10" />
                  <span className="text-xs font-bold text-white/60">Normal Seat</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border border-amber-500/40 bg-amber-500/20" />
                  <span className="text-xs font-bold text-white/60">VIP Seat</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border border-pink-500/40 bg-pink-500/20" />
                  <span className="text-xs font-bold text-white/60">Couple Seat (Double)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border border-dashed border-white/20" />
                  <span className="text-xs font-bold text-white/60">Empty (Hidden)</span>
                </div>
                <p className="mt-6 text-[10px] text-white/30 italic">
                  Click on seats in the grid to cycle through types or hide them. Large seats span
                  two units.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black tracking-[0.2em] uppercase shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSubmitting ? "Saving..." : id ? "Update Room" : "Create Room"}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card flex min-h-[600px] flex-col items-center justify-center overflow-auto rounded-[3rem] border border-white/5 bg-white/5 p-10 shadow-2xl">
              {Object.keys(seats).length > 0 && (
                <div className="mb-12 w-full max-w-md rounded-full border border-white/10 bg-white/5 px-10 py-2 text-center">
                  <span className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">
                    Screen This Way
                  </span>
                </div>
              )}

              {Object.keys(seats).length > 0 ? (
                <div
                  className="inline-grid gap-3 rounded-3xl bg-black/20 p-4"
                  style={{gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`}}
                >
                  {renderGrid()}
                </div>
              ) : (
                <div className="text-center text-white/20">
                  <Grid3X3 className="mx-auto mb-4 h-20 w-20 opacity-10" />
                  <p className="text-sm font-bold tracking-widest uppercase">Matrix Preview</p>
                  <p className="mt-2 px-20 text-xs italic">
                    Enter dimensions and click "Generate Grid" to start designing your layout.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
