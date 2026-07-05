"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("@/components/Antigravity"), {
  ssr: false,
});

const SplitText = dynamic(() => import("@/components/SplitText"), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // FastAPI OAuth2PasswordRequestForm expects form-encoded data
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0e6ff 0%, #e8f0fe 30%, #fce4ec 60%, #f3e5f5 100%)",
      }}
    >
      {/* Antigravity particle background — needs pointer events for canvas rendering */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Antigravity
          count={200}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.2}
          lerpSpeed={0.05}
          color="#b388ff"
          autoAnimate={true}
          particleVariance={0.8}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
        style={{ zIndex: 10 }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #7c4dff, #e040fb)",
              boxShadow: "0 8px 32px rgba(124, 77, 255, 0.3)",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#1a1a2e" }}
          >
            Split<span style={{ color: "#7c4dff" }}>Wise</span>
          </h1>
          <div className="mt-2">
            <SplitText
              text="Split bills, not friendships ✌️"
              className="text-sm"
              delay={30}
              duration={0.5}
              splitType="chars"
              textAlign="center"
              tag="p"
            />
          </div>
        </div>

        {/* Card */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(0, 0, 0, 0.04)" }}
          >
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all"
              style={
                isLogin
                  ? {
                      background: "linear-gradient(135deg, #7c4dff, #e040fb)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(124, 77, 255, 0.3)",
                    }
                  : { color: "#666" }
              }
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all"
              style={
                !isLogin
                  ? {
                      background: "linear-gradient(135deg, #7c4dff, #e040fb)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(124, 77, 255, 0.3)",
                    }
                  : { color: "#666" }
              }
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (only for register) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "#555" }}
                >
                  Your Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#999" }}
                  />
                  <input
                    type="text"
                    placeholder="What should we call you?"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "rgba(0, 0, 0, 0.03)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      color: "#1a1a2e",
                    }}
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#555" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#999" }}
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(0, 0, 0, 0.03)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    color: "#1a1a2e",
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#555" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#999" }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(0, 0, 0, 0.03)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    color: "#1a1a2e",
                  }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7c4dff, #e040fb)",
                boxShadow: "0 4px 15px rgba(124, 77, 255, 0.35)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "#888" }}
        >
          Made with ❤️ for friends who split bills
        </p>
      </motion.div>
    </div>
  );
}

