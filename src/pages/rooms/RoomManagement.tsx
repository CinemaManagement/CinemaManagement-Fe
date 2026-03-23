import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {roomApi} from "@/services/api/roomApi";
import type {CinemaRoom} from "@/types/document";
import {Plus, Edit, Trash2, LayoutGrid} from "lucide-react";
import toast from "react-hot-toast";
import URL from "@/constants/url";

const RoomManagement = () => {
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await roomApi.getRooms();
      setRooms(data.data || data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="bg-background min-h-screen p-8 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-4 text-4xl font-black tracking-tighter text-white uppercase">
              <LayoutGrid className="text-primary h-10 w-10" />
              Room Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage cinema rooms and seat configurations.
            </p>
          </div>
          <button
            onClick={() => navigate(URL.AdminRoomAdd)}
            className="bg-primary text-primary-foreground flex items-center gap-2 rounded-2xl px-6 py-3 font-black tracking-widest uppercase shadow-lg transition-all hover:scale-105"
          >
            <Plus className="h-5 w-5" /> Add New Room
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => navigate(URL.AdminRoomDetail.replace(':id', room._id))}
                className="glass-card hover:border-primary/30 group cursor-pointer rounded-[2rem] border border-white/5 bg-white/5 p-6 shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-white">{room.roomName}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
                        room.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(URL.AdminRoomEdit.replace(':id', room._id));
                      }}
                      className="hover:bg-primary/20 hover:text-primary rounded-lg bg-white/5 p-2 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this room?")) {
                          roomApi.deleteRoom(room._id).then(() => {
                            toast.success("Room deleted successfully");
                            fetchRooms();
                          }).catch(() => {
                            toast.error("Failed to delete room");
                          });
                        }
                      }}
                      className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-red-500/20 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div className="bg-primary h-full" style={{width: "100%"}}></div>
                  </div>
                  <span className="font-bold">
                    {room.seats.NORMAL.length + room.seats.VIP.length + room.seats.COUPLE.length} Seats
                  </span>
                </div>
              </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
