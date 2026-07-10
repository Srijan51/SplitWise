"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, User } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append("username", form.email);
        formData.append("password", form.password);

        const res = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
          toast.success("Welcome back! 🎉");
          router.push("/dashboard");
          router.refresh();
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        const res = await fetch("http://localhost:8000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password, name: form.name }),
        });

        if (res.ok) {
          toast.success("Account created! You can now log in. 🚀");
          setIsLogin(true);
        } else {
          toast.error("Registration failed — email might already exist");
        }
      }
    } catch {
      toast.error("Ensure the Python backend (port 8000) is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-[#fdfaf5] overflow-hidden sm:items-center sm:justify-center">
      {/* Mobile-like container frame on desktop, full width on mobile */}
      <div className="w-full max-w-md bg-[#fdfaf5] min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col">
        
        {/* Top Header Section */}
        <div className="relative pt-6 pb-2 px-6 z-20">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <div className="text-center mt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 mb-3">
              <div className="flex gap-1">
                {/* Minimalist icon from reference */}
                <div className="w-4 h-4 rounded-full bg-[#1a2b3c]"></div>
                <div className="w-4 h-4 rounded-full bg-[#528f80]"></div>
              </div>
            </div>
            
            <h1 className="text-[2.5rem] font-bold tracking-tight text-[#1a2b3c] leading-tight">
              Split<span className="text-[#335c52]">Wise</span>
            </h1>
            <p className="text-[#6c757d] text-[15px] mt-1 font-medium">
              Split expenses. Share moments.
            </p>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative h-[320px] w-full -mt-2 z-10 flex-shrink-0">
          {/* Note: User must copy the generated hero-couch.png to frontend/public/ */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-couch.png')", backgroundSize: 'cover', backgroundPosition: 'bottom center', mixBlendMode: 'multiply' }}>
            {/* Fallback placeholder if image is missing */}
            <div className="w-full h-full flex flex-col items-center justify-end pb-8 opacity-20 bg-gray-200">
              <span className="text-xs font-semibold text-gray-600 px-4 text-center">Place hero-couch.png in public folder</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-30 bg-white rounded-t-[40px] px-8 pt-8 pb-32 flex-grow shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a2b3c] mb-1">
              {isLogin ? "Welcome back! 👋" : "Create Account 👋"}
            </h2>
            <p className="text-[#8e98a3] text-[15px]">
              {isLogin ? "Login to continue" : "Sign up to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#a8b3be]" />
                </div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="block w-full pl-11 pr-4 py-3.5 border border-[#e5e9ed] rounded-2xl text-[15px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#a8b3be]" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="block w-full pl-11 pr-4 py-3.5 border border-[#e5e9ed] rounded-2xl text-[15px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#a8b3be]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full pl-11 pr-12 py-3.5 border border-[#e5e9ed] rounded-2xl text-[15px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-[#a8b3be] hover:text-[#335c52] transition-colors" />
                ) : (
                  <EyeOff className="h-5 w-5 text-[#a8b3be] hover:text-[#335c52] transition-colors" />
                )}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end pt-1">
                <a href="#" className="text-[13px] font-medium text-[#335c52] hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-6 rounded-2xl text-[15px] font-semibold text-white transition-all flex items-center justify-center gap-2 bg-[#335c52] hover:bg-[#284a42] shadow-[0_8px_20px_rgba(51,92,82,0.25)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Login" : "Sign Up"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e9ed]" />
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="px-4 bg-white text-[#8e98a3]">or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#e5e9ed] bg-white hover:bg-gray-50 transition-colors text-[14px] font-semibold text-[#1a2b3c]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#e5e9ed] bg-white hover:bg-gray-50 transition-colors text-[14px] font-semibold text-[#1a2b3c]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.83 2.32-3.19 1.85-2.58 6.07.6 7.36-.67 1.48-1.58 3.12-3.08 4.33zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.54-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center mt-8 text-[14px] text-[#8e98a3]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-[#335c52] hover:underline"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </motion.div>

        {/* Footer Landscape Illustration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-40">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/footer-landscape.png')", backgroundSize: 'cover', backgroundPosition: 'bottom center', mixBlendMode: 'multiply' }}>
             {/* Fallback placeholder if image is missing */}
             <div className="w-full h-full flex flex-col items-center justify-end pb-2 opacity-20 bg-green-50/50">
              <span className="text-xs font-semibold text-green-900 px-4 text-center">Place footer-landscape.png in public folder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

