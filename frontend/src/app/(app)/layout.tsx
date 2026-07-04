"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  BarChart3,
  LogOut,
  Sparkles,
  Wallet
} from "lucide-react";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/groups/join", icon: Users, label: "Join" },
  { href: "/groups/create", icon: PlusCircle, label: "Create" },
  { href: "/profile", icon: Wallet, label: "Profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hardcoded mock user to bypass login for now
  const user = { name: "Alice", email: "alice@example.com" };

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(114,31,280,0.5)]"
            style={{ background: "linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #fff, var(--color-brand-400))" }}>
            SplitWise
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)", color: "white" }}
            >
              {getInitials(user.name)}
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost p-2 rounded-xl hover:bg-white/5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-28 overflow-y-auto px-4">
        {children}
      </main>

      {/* Glassmorphism Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
        <nav className="relative flex items-center justify-around py-3 px-4 rounded-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
          style={{ 
            background: "rgba(20, 20, 25, 0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)"
          }}
        >
          {navItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            // Make the middle button a primary FAB
            const isCenter = i === 2;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all ${isCenter ? '-mt-8' : ''}`}
              >
                {isCenter ? (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(114,31,280,0.5)] transition-transform hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))" }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="relative p-2 rounded-xl transition-colors hover:bg-white/5">
                    <Icon
                      className={`w-6 h-6 transition-colors ${isActive ? 'drop-shadow-[0_0_8px_var(--color-brand-400)]' : ''}`}
                      style={{
                        color: isActive
                          ? "var(--color-brand-400)"
                          : "var(--color-text-muted)",
                      }}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="dock-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--color-brand-400)", boxShadow: "0 0 8px var(--color-brand-400)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
