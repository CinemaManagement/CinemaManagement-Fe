import { Play, Star, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_MOVIES } from '../../constants/mockData';

const Home = () => {
  const featuredMovie = MOCK_MOVIES[0];

  return (
    <div className="flex flex-col gap-16 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full group">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={featuredMovie.posterUrl} 
            alt="Hero Banner" 
            className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 top-[-44px] md:p-24 flex flex-col gap-6 max-w-5xl animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-primary/20 backdrop-blur-md text-primary text-xs font-black rounded-full uppercase tracking-[0.2em] border border-primary/30 shadow-inner-gold">
              Trending Now
            </span>
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-bold bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 text-primary fill-primary" /> {featuredMovie.rating} IMDB
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter drop-shadow-2xl">
            {featuredMovie.title.split(':')[0]} <br /> 
            <span className="text-gradient-gold italic">{featuredMovie.title.split(':')[1] || ''}</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-medium">
            {featuredMovie.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6">
            <Link 
              to={`/movies/${featuredMovie.id}`}
              className="px-10 py-5 bg-primary text-primary-foreground font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(var(--primary),0.4)] btn-glossy uppercase tracking-widest"
            >
              <Play className="w-6 h-6 fill-current" /> Book Tickets Now
            </Link>
            <button className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-inner-glossy uppercase tracking-widest">
              Watch Trailer
            </button>
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-xs">
              <TrendingUp className="w-4 h-4" /> Recommended
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Now Showing</h2>
          </div>
          <Link to="/movies" className="group flex items-center gap-2 text-muted-foreground font-black hover:text-primary transition-colors uppercase tracking-widest text-sm">
            View Schedule <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {MOCK_MOVIES.map((movie) => (
            <Link 
              key={movie.id} 
              to={`/movies/${movie.id}`}
              className="group flex flex-col gap-6"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-[2rem] shadow-2xl border border-white/5 group-hover:border-primary/50 transition-all duration-500 group-hover:-translate-y-3">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <div className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-lg uppercase shadow-lg">
                    {movie.ageRestriction}+
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl btn-glossy">
                    <Play className="w-8 h-8 fill-current translate-x-1" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                   <div className="flex flex-col gap-2 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex flex-wrap gap-1.5">
                        {movie.genre.slice(0, 2).map((g, i) => (
                          <span key={i} className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase border border-white/10">
                            {g}
                          </span>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-white truncate group-hover:text-primary transition-colors tracking-tight uppercase">{movie.title}</h3>
                   <div className="flex items-center gap-1 text-primary font-black text-sm">
                    <Star className="w-4 h-4 fill-current" /> {movie.rating}
                   </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>{movie.duration}</span>
                  <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                  <span>{movie.genre[0]}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Cinema Experience Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10">
        <div className="glass-card rounded-[3rem] p-12 md:p-24 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1 space-y-8">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic">
                  Premium <span className="text-gradient-gold">Imax</span> Experience
                </h2>
                <p className="text-xl text-white/60 font-medium leading-relaxed max-w-xl">
                  Crystal clear visuals and earth-shaking sound. The most immersive Way to witness cinematic masterpieces.
                </p>
                <div className="flex gap-4">
                   <button className="px-8 py-4 bg-primary text-primary-foreground font-black rounded-2xl btn-glossy uppercase tracking-widest">Explore Imax</button>
                   <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest">Upcoming List</button>
                </div>
             </div>
             <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square bg-linear-to-br from-primary/30 to-background rounded-[3rem] flex items-center justify-center p-8 border border-white/10 shadow-inner-gold group-hover:scale-105 transition-transform duration-700">
                   <div className="text-8xl font-black text-primary/20 absolute select-none">IMAX</div>
                   <TrendingUp className="w-32 h-32 text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

