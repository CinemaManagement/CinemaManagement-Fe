import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <footer className="bg-card border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
               <span className="text-2xl font-bold tracking-tighter text-white uppercase">
                Cine<span className="text-primary italic">Lux</span>
              </span>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Experience the magic of cinema in ultra-luxury. The best screens, the best sound, and the best service.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/movies" className="hover:text-primary transition-colors">Movies</a></li>
                <li><a href="/showtimes" className="hover:text-primary transition-colors">Showtimes</a></li>
                <li><a href="/theaters" className="hover:text-primary transition-colors">Theaters</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/help" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Newsletter</h3>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary w-full"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CineLux Premium Cinemas. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
