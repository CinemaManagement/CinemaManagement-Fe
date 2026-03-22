import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomApi } from '@/services/api/roomApi';
import { SeatType } from '@/types/document';
import type { CinemaRoom } from '@/types/document';
import { ArrowLeft, Edit, LayoutGrid, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import URL from '@/constants/url';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<CinemaRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roomApi.getRoomById(id!);
      setRoom(data.data || data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch room details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRoom();
  }, [id, fetchRoom]);

  const getSeatColor = (type: SeatType) => {
    switch (type) {
      case SeatType.NORMAL: return 'bg-white/10 border-white/20 text-white/40';
      case SeatType.VIP: return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
      case SeatType.COUPLE: return 'bg-pink-500/20 border-pink-500/40 text-pink-400 font-bold';
      default: return 'bg-transparent border-dashed border-white/5 text-transparent';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) return <div className="p-20 text-center text-white">Room not found</div>;

  // Determine grid dimensions and map seats
  const allSeatCodes = [
    ...room.seats.NORMAL,
    ...room.seats.VIP,
    ...room.seats.COUPLE
  ];
  
  const seatMap: Record<string, SeatType> = {};
  room.seats.NORMAL.forEach(code => { seatMap[code] = SeatType.NORMAL; });
  room.seats.VIP.forEach(code => { seatMap[code] = SeatType.VIP; });
  room.seats.COUPLE.forEach(code => { seatMap[code] = SeatType.COUPLE; });

  const maxRow = allSeatCodes.reduce((max, code) => Math.max(max, ROWS.indexOf(code.charAt(0))), 0) + 1;
  const maxCol = allSeatCodes.reduce((max, code) => {
    const col = parseInt(code.substring(1));
    return Math.max(max, seatMap[code] === SeatType.COUPLE ? col + 1 : col);
  }, 0);

  const renderGrid = () => {
    const grid = [];
    for (let r = 0; r < maxRow; r++) {
      const rowCode = ROWS[r];
      for (let c = 1; c <= maxCol; c++) {
        const code = `${rowCode}${c}`;
        const type = seatMap[code];

        if (type === SeatType.COUPLE) {
          grid.push(
            <div key={code} className={`h-10 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all hover:scale-[1.05] ${getSeatColor(type)}`} style={{ gridColumn: 'span 2' }}>
              {code}-{rowCode}{c+1}
            </div>
          );
          c++;
        } else if (type) {
          grid.push(
            <div key={code} className={`w-10 h-10 rounded-lg flex items-center justify-center text-[8px] font-black border ${getSeatColor(type)}`}>
              {code}
            </div>
          );
        } else {
          grid.push(<div key={code} className="w-10 h-10" />); // Empty space
        }
      }
    }
    return grid;
  };

  return (
    <div className="min-h-screen bg-background p-8 pt-24 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <button
              onClick={() => navigate(URL.AdminRooms)}
              className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors uppercase font-black tracking-widest text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Rooms
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-4">
              <LayoutGrid className="w-10 h-10 text-primary" />
              {room.roomName}
            </h1>
          </div>
          <button
            onClick={() => navigate(URL.AdminRoomEdit.replace(':id', room._id))}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black tracking-widest uppercase hover:scale-105 transition-all shadow-lg flex items-center gap-2"
          >
            <Edit className="w-5 h-5" /> Edit Layout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/5 shadow-2xl">
              <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                Info
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-2">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    room.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {room.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-1">Total Seats</p>
                  <p className="text-2xl font-black">
                    {room.seats.NORMAL.length + room.seats.VIP.length + room.seats.COUPLE.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/5 shadow-2xl">
              <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-white/60">Legend</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-white/10 border border-white/20" />
                  <span className="text-xs font-bold text-white/60">Normal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40" />
                  <span className="text-xs font-bold text-white/60">VIP</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-pink-500/20 border border-pink-500/40" />
                  <span className="text-xs font-bold text-white/60">Couple</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card p-10 rounded-[3rem] border border-white/5 bg-white/5 shadow-2xl flex flex-col items-center overflow-auto min-h-[600px]">
              <div className="mb-12 w-full max-w-lg border border-white/10 bg-white/5 px-10 py-2 text-center rounded-full">
                <span className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">Screen</span>
              </div>
              
              <div className="inline-grid gap-3 p-4 bg-black/20 rounded-3xl" 
                style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
                {renderGrid()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
