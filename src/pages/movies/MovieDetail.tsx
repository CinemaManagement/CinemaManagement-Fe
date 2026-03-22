import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Ticket, ChevronRight, MapPin, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { movieApi } from '@/services/api/movieApi';
import toast from 'react-hot-toast';
import type { Movie } from '@/types/document';

interface ExtendedMovie extends Partial<Movie> {
  id?: string;
  genre?: string[];
  director?: string;
  cast?: string[];
  releaseDate?: string;
  rating?: string | number;
  description?: string;
}

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(0);
  const [movie, setMovie] = useState<ExtendedMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        if (!id) return;
        const response = await movieApi.getMovieById(id);
        const data = response.data?.data || response.data;
        setMovie(data);
      } catch {
        toast.error('Failed to fetch movie details.');
        navigate('/movies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id, navigate]);

  const dates = [
    { day: 'FRI', date: '24', month: 'OCT' },
    { day: 'SAT', date: '25', month: 'OCT' },
    { day: 'SUN', date: '26', month: 'OCT' },
    { day: 'MON', date: '27', month: 'OCT' },
    { day: 'TUE', date: '28', month: 'OCT' },
  ];

  const showtimes = [
    { time: '10:30 AM', price: '$12', type: '2D LUX' },
    { time: '01:45 PM', price: '$15', type: '3D ULTRA' },
    { time: '04:15 PM', price: '$12', type: '2D LUX' },
    { time: '07:30 PM', price: '$22', type: 'IMAX GOLD' },
    { time: '10:15 PM', price: '$15', type: '3D ULTRA' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-20 bg-background">
        <div className="h-10 w-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center p-20 bg-background text-white">
        Movie not found.
      </div>
    );
  }

  return (
    <div className="pb-32 overflow-hidden">
      {/* Movie Hero Header */}
      <section className="relative h-[80vh] w-full pt-10">
        <div className="absolute inset-0">
          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 flex flex-col md:flex-row items-end gap-12 max-w-7xl mx-auto">
          <div className="hidden md:block w-72 aspect-2/3 rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 shrink-0 transform -translate-y-12 -rotate-1">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-wrap gap-2">
              {movie.genre?.map((g: string) => (
                <span key={g} className="px-4 py-1.5 bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/30 shadow-inner-gold">
                  {g}
                </span>
              ))}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 text-sm text-white/80 font-black uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shadow-inner-glossy">
                <Star className="w-4 h-4 text-primary fill-primary" /> {movie.rating} IMDB
              </span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {movie.duration}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {movie.releaseDate}</span>
              <span className="px-3 py-1 bg-secondary text-white rounded-md text-xs">{movie.ageRestriction}+</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-5 gap-16">
        {/* Left Column: Movie Info */}
        <div className="lg:col-span-3 space-y-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <div className="w-2 h-8 bg-primary rounded-full shadow-inner-gold" /> Synopsis
            </h2>
            <p className="text-xl text-white/60 leading-relaxed font-medium">
              {movie.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-[2.5rem] shadow-inner-glossy">
              <p className="text-[10px] text-primary uppercase font-black tracking-[0.4em] mb-3">Director</p>
              <p className="text-2xl text-white font-black">{movie.director || 'N/A'}</p>
            </div>
            <div className="glass-card p-8 rounded-[2.5rem] shadow-inner-glossy">
              <p className="text-[10px] text-primary uppercase font-black tracking-[0.4em] mb-3">Principal Cast</p>
              <p className="text-xl text-white font-black truncate">{movie.cast?.join(', ') || 'N/A'}</p>
            </div>
          </div>

          {/* Trailer Section */}
          <div className="space-y-6">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <div className="w-2 h-8 bg-primary rounded-full shadow-inner-gold" /> Official Trailer
            </h2>
            <div className="aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group">
              <iframe 
                width="100%" 
                height="100%" 
                src={movie.trailerUrl} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="group-hover:grayscale-0 transition-opacity"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Right Column: Showtime Selection */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-[3rem] p-10 shadow-2xl sticky top-24 shadow-inner-glossy">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
               <Ticket className="w-7 h-7 text-primary" /> Plan Your Visit
            </h2>

            {/* Date Selection */}
            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Select Date</p>
                 <span className="text-xs font-bold text-white/40 italic">October 2026</span>
              </div>
              <div className="flex gap-4 pb-4">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(i)}
                    className={`flex flex-col items-center min-w-[60px] py-2 rounded-lg transition-all border transform active:scale-95 ${
                      selectedDate === i 
                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_25px_rgba(var(--primary),0.3)] btn-glossy scale-110 z-10' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 shadow-inner-glossy'
                    }`}
                  >
                    <span className="text-[9px] font-black opacity-60 uppercase mb-1 tracking-widest">{d.day}</span>
                    <span className="text-2xl font-black leading-none">{d.date}</span>
                    <span className="text-[8px] font-black opacity-40 uppercase mt-1 tracking-widest">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theater Location (Mock) */}
            <div className="mb-10">
               <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">CineLux Cinema</p>
                  <span className="text-xs text-white/80 flex items-center gap-2 font-bold"><MapPin className="w-4 h-4 text-primary" /> Central Mall</span>
               </div>
               
               <div className="space-y-4">
                 {showtimes.map((s, i) => (
                   <button
                    key={i}
                    onClick={() => navigate(`/booking/${id}-${i}`)}
                    className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-primary/50 transition-all shadow-inner-glossy transform hover:-translate-x-1"
                   >
                     <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">{s.time}</span>
                        <span className="px-2.5 py-1 bg-white/5 text-[9px] font-black text-white/40 rounded uppercase border border-white/5 group-hover:text-primary/60 group-hover:border-primary/20 transition-all">
                          {s.type}
                        </span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">{s.price}</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                     </div>
                   </button>
                 ))}
               </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 items-start">
               <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
               <p className="text-[11px] text-white/40 font-medium leading-relaxed">
                  Booking confirms your choice of movie and time. Seat selection and food ordering follow in the next steps.
               </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetail;

