import { Link } from "react-router-dom";
import { CopyX, ArrowLeft, Home } from "lucide-react";
import URL from "@/constants/url";

const NotFound = () => {
  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="bg-primary/5 absolute top-0 -left-1/4 h-1/2 w-1/2 animate-pulse rounded-full blur-[150px]" />
      <div className="bg-secondary/5 absolute -right-1/4 bottom-0 h-1/2 w-1/2 animate-pulse rounded-full blur-[150px] delay-700" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-8">
          <h1 className="text-primary/10 text-[150px] font-black tracking-tighter sm:text-[200px] md:text-[250px] leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card/40 animate-in fade-in zoom-in flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl duration-700">
              <CopyX className="text-primary h-16 w-16" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase sm:text-4xl">
          Lost in Space?
        </h2>
        
        <p className="text-muted-foreground mb-10 max-w-md text-lg">
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          
          <Link
            to={URL.Home}
            className="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-black tracking-wider uppercase transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;