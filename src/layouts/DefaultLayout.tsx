import { type JSX } from "react";
import { Navbar } from "../components/common/Navbar";

interface DefaultLayoutProps {
  children: JSX.Element;
}

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children } = props;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      <Navbar />
      <main className="pt-24">{children}</main>
      <footer className="bg-card border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-bold tracking-tighter text-white uppercase">
                Cine<span className="text-primary italic">Lux</span>
              </span>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Experience the magic of cinema in ultra-luxury. The best screens, the best sound,
                and the best service.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li>
                  <a href="/movies" className="hover:text-primary transition-colors">
                    Movies
                  </a>
                </li>
                <li>
                  <a href="/showtimes" className="hover:text-primary transition-colors">
                    Showtimes
                  </a>
                </li>
                <li>
                  <a href="/theaters" className="hover:text-primary transition-colors">
                    Theaters
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-white">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li>
                  <a href="/help" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-white">Newsletter</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background border-border w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-border mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CineLux Premium Cinemas. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
