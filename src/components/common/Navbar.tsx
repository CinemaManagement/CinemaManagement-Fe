import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Menu, X, Search, Bell } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { UserRole } from '../../types/document';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Movies', path: '/movies' },
    { name: 'Showtimes', path: '/showtimes' },
    { name: 'Food & Drinks', path: '/food' },
    ...(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER 
      ? [{ name: 'Dashboard', path: '/admin' }] 
      : []),
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-lg group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                <Film className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white uppercase sm:block hidden">
                Cine<span className="text-primary italic">Lux</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-background"></span>
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 p-1.5 rounded-full bg-accent/20 hover:bg-accent/40 transition-colors border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white pr-2">{user?.fullName}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-secondary transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/20"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-muted-foreground hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-border" />
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 text-white">
                  <User className="w-5 h-5" /> Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 text-secondary text-left">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="w-full py-3 text-center bg-primary text-primary-foreground font-bold rounded-xl"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
