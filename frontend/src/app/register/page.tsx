"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [agreed, setAgreed] = useState(false);

  // Simple password validation checks
  const hasEightChars = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumberOrSymbol = /[\d!@#$%^&*]/.test(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!hasEightChars || !hasUppercase || !hasNumberOrSymbol) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name }),
      });

      if (res.ok) {
        toast.success("Account created! You can now log in. 🚀");
        router.push("/login");
      } else {
        toast.error("Registration failed — email might already exist");
      }
    } catch {
      toast.error("Ensure the Python backend (port 8000) is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-[#fdfaf5] overflow-hidden sm:items-center sm:justify-center">
      <div className="w-full max-w-lg bg-[#fdfaf5] min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col">
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Top Header Section (Split Layout) */}
        <div className="relative pt-16 pb-6 px-6 z-20 flex items-center h-[260px]">
          {/* Hero Illustration Left */}
          <div className="w-1/2 h-full relative -ml-4">
             <div className="absolute inset-0 bg-no-repeat" style={{ 
              backgroundImage: "url('/register-hero.png')", 
              backgroundSize: 'contain', 
              backgroundPosition: 'center left', 
              mixBlendMode: 'multiply',
            }} />
          </div>

          {/* Text Right */}
          <div className="w-1/2 pl-2 flex flex-col justify-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 mb-4">
              <div className="flex gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1a2b3c]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#528f80]"></div>
              </div>
            </div>
            
            <h1 className="text-[2rem] font-bold tracking-tight text-[#1a2b3c] leading-none mb-3">
              Split<span className="text-[#335c52]">Wise</span>
            </h1>
            <h2 className="text-[1.35rem] font-bold text-[#1a2b3c] mb-2 leading-tight">
              Let&apos;s get you<br />started! ✨
            </h2>
            <p className="text-[#8e98a3] text-[13px] leading-snug">
              Create your account and<br />start splitting smarter.
            </p>
          </div>
        </div>

        {/* Registration Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-30 bg-white rounded-t-[40px] px-8 pt-8 pb-10 flex-grow shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
        >
          {/* Progress Tracker */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gray-200 -z-10"></div>
            
            <div className="flex flex-col items-center mx-4">
              <div className="w-8 h-8 rounded-full bg-[#335c52] text-white flex items-center justify-center text-sm font-bold mb-1 shadow-sm border-2 border-white">
                1
              </div>
              <span className="text-[11px] font-semibold text-[#335c52]">Create Account</span>
            </div>
            
            <div className="flex flex-col items-center mx-4">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold mb-1">
                2
              </div>
              <span className="text-[11px] font-semibold text-gray-400">Verify Email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-20">
            {/* Name Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#335c52]" />
              </div>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="block w-full pl-11 pr-4 py-3 border border-[#e5e9ed] rounded-xl text-[14px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                required
              />
              <div className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-semibold text-[#1a2b3c]">Full name</div>
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#1a2b3c]" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="block w-full pl-11 pr-4 py-3 border border-[#e5e9ed] rounded-xl text-[14px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                required
              />
              <div className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-semibold text-[#1a2b3c]">Email address</div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#1a2b3c]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full pl-11 pr-12 py-3 border border-[#e5e9ed] rounded-xl text-[14px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                required
              />
              <div className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-semibold text-[#1a2b3c]">Password</div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? <Eye className="h-5 w-5 text-[#1a2b3c]" /> : <EyeOff className="h-5 w-5 text-[#1a2b3c]" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#1a2b3c]" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="block w-full pl-11 pr-12 py-3 border border-[#e5e9ed] rounded-xl text-[14px] placeholder-[#a8b3be] text-[#1a2b3c] focus:outline-none focus:ring-2 focus:ring-[#335c52]/20 focus:border-[#335c52] transition-colors bg-white"
                required
              />
              <div className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-semibold text-[#1a2b3c]">Confirm password</div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showConfirmPassword ? <Eye className="h-5 w-5 text-[#1a2b3c]" /> : <EyeOff className="h-5 w-5 text-[#1a2b3c]" />}
              </button>
            </div>

            {/* Password Requirements Box */}
            <div className="bg-[#f2f7f4] border border-[#e2ece5] rounded-xl p-4 mt-2">
              <p className="text-[11px] font-semibold text-[#335c52] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 fill-[#335c52] text-white" /> Password must contain:
              </p>
              <div className="flex gap-4 text-[10px] font-medium text-[#467366]">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasEightChars ? "opacity-100" : "opacity-40"}`} />
                  At least 8 characters
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? "opacity-100" : "opacity-40"}`} />
                  1 uppercase letter
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumberOrSymbol ? "opacity-100" : "opacity-40"}`} />
                  1 number or symbol
                </div>
              </div>
            </div>

            {/* Terms of Service Checkbox */}
            <div className="flex items-center mt-6">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded-full border-gray-300 text-[#335c52] focus:ring-[#335c52]" 
              />
              <label htmlFor="terms" className="ml-2 text-[12px] font-medium text-[#8e98a3]">
                I agree to the <a href="#" className="text-[#335c52] hover:underline font-semibold">Terms of Service</a> and <a href="#" className="text-[#335c52] hover:underline font-semibold">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-6 rounded-xl text-[15px] font-semibold text-white transition-all flex items-center justify-center gap-2 bg-[#446f64] hover:bg-[#335c52] shadow-[0_8px_20px_rgba(51,92,82,0.25)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* OAuth Options */}
          <div className="mt-8 relative z-20">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e9ed]" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="px-4 bg-white text-[#8e98a3] font-medium">or sign up with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 relative z-20">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#e5e9ed] bg-white hover:bg-gray-50 transition-colors text-[13px] font-semibold text-[#1a2b3c]">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#e5e9ed] bg-white hover:bg-gray-50 transition-colors text-[13px] font-semibold text-[#1a2b3c]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.83 2.32-3.19 1.85-2.58 6.07.6 7.36-.67 1.48-1.58 3.12-3.08 4.33zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.54-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center mt-6 text-[13px] text-[#1a2b3c] font-medium relative z-20">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#335c52] hover:underline">
              Login
            </Link>
          </p>

          {/* Footer Landscape Illustration - Now inside the card */}
          <div className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none z-10">
            <div className="absolute inset-0 bg-no-repeat" style={{ 
              backgroundImage: "url('/footer-landscape.png')", 
              backgroundSize: 'cover', 
              backgroundPosition: 'bottom center', 
              mixBlendMode: 'multiply',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
            }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
