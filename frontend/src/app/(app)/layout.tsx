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
    <div className="app-layout">
      {/* Top Header */}
      <header className="app-header">
        <Link href="/dashboard" className="header-logo-container">
          <div className="header-logo-icon">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="header-title">SplitWise</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="user-avatar">
              {getInitials(user.name)}
            </div>
            <button onClick={handleLogout} className="btn-ghost p-2 rounded-xl" title="Sign Out">
              <LogOut className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {children}
      </main>

      {/* Glassmorphism Dock */}
      <div className="dock-wrapper">
        <nav className="dock-container">
          {navItems.map((item, i) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            // Make the middle button a primary FAB
            const isCenter = i === 2;

            return (
              <Link key={item.href} href={item.href} className="dock-item">
                {isCenter ? (
                  <div className="dock-fab">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="dock-icon-btn">
                    <Icon
                      className={`w-6 h-6 transition-colors ${isActive ? 'drop-shadow-[0_0_8px_var(--color-brand-400)]' : ''}`}
                      style={{ color: isActive ? "var(--color-brand-400)" : "var(--color-text-muted)" }}
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
