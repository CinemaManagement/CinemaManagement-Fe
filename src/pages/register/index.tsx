import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock registration
    setTimeout(() => {
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="p-4 bg-secondary rounded-2xl shadow-[0_0_30px_rgba(var(--secondary),0.3)] -rotate-3">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Join CineLux</h1>
              <p className="text-muted-foreground mt-2">Become a member and unlock the ultimate cinema experience.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/5 rounded-2xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-secondary text-white font-black rounded-2xl hover:shadow-[0_0_30px_rgba(var(--secondary),0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 mt-6 uppercase tracking-widest"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-black hover:underline uppercase tracking-tighter">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
