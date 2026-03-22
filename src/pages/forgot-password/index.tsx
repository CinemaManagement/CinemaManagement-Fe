import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/services/api/authApi";
import { otpApi } from "@/services/api/otpApi";
import URL from "@/constants/url";

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    
    setIsLoading(true);
    try {
      await otpApi.sendOtp({ email });
      toast.success("OTP has been sent to your email!");
      setStep(2);
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    
    setIsLoading(true);
    try {
      await otpApi.verifyOtp({ email, otp });
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, newPassword });
      toast.success("Password reset successfully! You can now log in.");
      navigate(URL.Login);
    } catch {
      toast.error("Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="bg-primary/10 absolute top-0 -left-1/4 h-1/2 w-1/2 animate-pulse rounded-full blur-[120px]" />
      <div className="bg-secondary/10 absolute -right-1/4 bottom-0 h-1/2 w-1/2 animate-pulse rounded-full blur-[120px] delay-700" />

      <div className="relative z-10 w-full max-w-lg">
        <button
          onClick={() => navigate(URL.Login)}
          className="text-muted-foreground hover:text-white mb-6 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-bold tracking-wider uppercase">Back to Login</span>
        </button>

        <div className="bg-card/40 animate-in fade-in zoom-in rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-2xl duration-500 md:p-12">
          <div className="mb-10 flex flex-col items-center gap-6">
            <div className="bg-primary rotate-3 rounded-2xl p-4 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              {step === 1 && <Mail className="text-primary-foreground h-10 w-10" />}
              {step === 2 && <KeyRound className="text-primary-foreground h-10 w-10" />}
              {step === 3 && <ShieldCheck className="text-primary-foreground h-10 w-10" />}
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                {step === 1 && "Forgot Password"}
                {step === 2 && "Enter OTP"}
                {step === 3 && "New Password"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {step === 1 && "Enter your email to receive a recovery code."}
                {step === 2 && `We sent a code to ${email}`}
                {step === 3 && "Create a new strong password for your account."}
              </p>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
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
                    placeholder="name@example.com"
                    required
                  />
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
                    Send Code <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold tracking-wider text-white uppercase">
                  Security Code (OTP)
                </label>
                <div className="group relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <KeyRound className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-background/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary block w-full rounded-2xl border border-white/5 py-4 pr-4 pl-12 text-white transition-all focus:ring-1 focus:outline-none"
                    placeholder="Enter 6-digit code"
                    required
                  />
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
                    Verify OTP <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold tracking-wider text-white uppercase">
                  New Password
                </label>
                <div className="group relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary block w-full rounded-2xl border border-white/5 py-4 pr-4 pl-12 text-white transition-all focus:ring-1 focus:outline-none"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold tracking-wider text-white uppercase">
                  Confirm Password
                </label>
                <div className="group relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <ShieldCheck className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary block w-full rounded-2xl border border-white/5 py-4 pr-4 pl-12 text-white transition-all focus:ring-1 focus:outline-none"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
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
                    Reset Password <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
