import React, { useState } from "react";
import { Activity, Eye, EyeOff, CheckCircle } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (email: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("aaishasiddiqua78614@gmail.com");
  const [password, setPassword] = useState<string>("••••••••");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isLogin) {
      if (password.length < 6 && password !== "••••••••") {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Simulate registration
      localStorage.setItem(`user_${email}`, password);
      setSuccess("Account successfully created! Please sign in.");
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // Simulate login
    // Accept standard pre-filled password or stored ones
    const storedPassword = localStorage.getItem(`user_${email}`);
    if (email === "aaishasiddiqua78614@gmail.com" || password === "123456" || password === "••••••••" || storedPassword === password) {
      onLoginSuccess(email);
    } else {
      setError("Invalid credentials. Please use the default pre-filled credentials or create a new account.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[460px] bg-white border border-[#E4DFD5] rounded-3xl p-8 sm:p-10 shadow-lg space-y-8">
        
        {/* App Logo & Header Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#08332E] flex items-center justify-center text-[#FAF8F5] shadow-md">
            <Activity className="w-8 h-8" />
          </div>
          
          <div className="text-center space-y-1">
            <h2 className="font-sans font-extrabold text-2xl tracking-tight text-[#08332E]">
              {isLogin ? "Aether Health" : "Create account"}
            </h2>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8C877A]">
              {isLogin ? "Multi-Agent Healthcare System" : "Join Aether Health"}
            </p>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              className="w-full px-4 py-3 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] border border-[#E4DFD5] focus:border-[#08332E] rounded-xl text-sm text-[#1A2E26] placeholder-[#8C877A] outline-hidden transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-4 pr-11 py-3 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] border border-[#E4DFD5] focus:border-[#08332E] rounded-xl text-sm text-[#1A2E26] placeholder-[#8C877A] outline-hidden transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C877A] hover:text-[#08332E] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-[#8C877A]">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-4 py-3 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] border border-[#E4DFD5] focus:border-[#08332E] rounded-xl text-sm text-[#1A2E26] placeholder-[#8C877A] outline-hidden transition-all"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#08332E] hover:bg-[#062622] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Auth Toggle Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
              if (isLogin) {
                // reset passwords when switching to signup
                setPassword("");
              } else {
                setEmail("aaishasiddiqua78614@gmail.com");
                setPassword("••••••••");
              }
            }}
            className="font-sans text-xs text-[#635F54] hover:text-[#08332E] transition-colors"
          >
            {isLogin ? (
              <>
                Don't have an account? <span className="font-bold text-[#00A254] hover:underline">Create account</span>
              </>
            ) : (
              <>
                Already have an account? <span className="font-bold text-[#00A254] hover:underline">Sign in</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
