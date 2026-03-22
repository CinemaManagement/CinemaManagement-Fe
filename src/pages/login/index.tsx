import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Mail, Lock, Eye, EyeOff, Film, ArrowRight} from "lucide-react";
import {useAppDispatch} from "../../store";
import {loginSuccess} from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import {authApi} from "../../services/api/authApi";
import URL from "@/constants/url";
import { userApi } from "@/services/api/userApi";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login({email, password});
      localStorage.setItem("token", response.data?.accessToken);

      const userResponse = await userApi.getProfile();
      dispatch(
        loginSuccess({
          user: userResponse.data,
          token: response.data?.accessToken,
        }),
      );
      toast.success(response.data?.message || "Welcome to CineLux!");
      navigate(URL.Home);
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="bg-primary/10 absolute top-0 -left-1/4 h-1/2 w-1/2 animate-pulse rounded-full blur-[120px]" />
      <div className="bg-secondary/10 absolute -right-1/4 bottom-0 h-1/2 w-1/2 animate-pulse rounded-full blur-[120px] delay-700" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-card/40 animate-in fade-in zoom-in rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-2xl duration-500 md:p-12">
          <div className="mb-10 flex flex-col items-center gap-6">
            <div className="bg-primary rotate-3 rounded-2xl p-4 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              <Film className="text-primary-foreground h-10 w-10" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                Welcome Back
              </h1>
              <p className="text-muted-foreground mt-2">
                The magic awaits. Log in to your account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold tracking-wider text-white uppercase">
                Email Address
              </label>
              <div className="group relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary block w-full rounded-2xl border border-white/5 py-4 pr-4 pl-12 text-white transition-all focus:ring-1 focus:outline-none"
                  placeholder="admin@cinelux.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="ml-1 flex items-center justify-between">
                <label className="text-sm font-bold tracking-wider text-white uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary block w-full rounded-2xl border border-white/5 py-4 pr-12 pl-12 text-white transition-all focus:ring-1 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground absolute inset-y-0 right-0 flex items-center pr-4 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black tracking-widest uppercase transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] disabled:translate-y-0 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="border-primary-foreground h-6 w-6 animate-spin rounded-full border-4 border-t-transparent" />
              ) : (
                <>
                  Sign In <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-black tracking-tighter uppercase hover:underline"
              >
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
