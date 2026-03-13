import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Film, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { loginSuccess } from '../../store/slices/authSlice';
import { UserRole, UserStatus } from '../../types/document';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login for demonstration
    setTimeout(() => {
      if (email === 'admin@cinelux.com' && password === 'admin123') {
        dispatch(loginSuccess({
          user: {
            _id: '1',
            fullName: 'CineLux Administrator',
            email: 'admin@cinelux.com',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
          },
          token: 'mock-token-admin',
        }));
        toast.success('Welcome back, Admin!');
        navigate('/');
      } else if (email && password) {
        dispatch(loginSuccess({
          user: {
            _id: '2',
            fullName: 'Guest User',
            email: email,
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
          },
          token: 'mock-token-guest',
        }));
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="p-4 bg-primary rounded-2xl shadow-[0_0_30px_rgba(var(--primary),0.3)] rotate-3">
              <Film className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome Back</h1>
              <p className="text-muted-foreground mt-2">The magic awaits. Log in to your account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-background/50 border border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="admin@cinelux.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 bg-background/50 border border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 mt-8 uppercase tracking-widest"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-black hover:underline uppercase tracking-tighter">
                Create One Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;