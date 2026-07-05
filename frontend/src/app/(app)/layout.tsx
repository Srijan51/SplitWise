"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import dynamic from "next/dynamic";

const GooeyNav = dynamic(() => import("@/components/GooeyNav"), {
  ssr: false,
});

const Antigravity = dynamic(() => import("@/components/Antigravity"), {
  ssr: false,
});

const navItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Join", href: "/groups/join" },
  { label: "Create", href: "/groups/create" },
  { label: "Profile", href: "/profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hardcoded mock user to bypass login for now
  const user = { name: "Alice", email: "alice@example.com" };

  const initialActiveIndex = Math.max(
    0,
    navItems.findIndex(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href))
    )
  );

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <div className="app-layout">
      {/* Antigravity particle background */}
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

      {/* GooeyNav Dock */}
      <div className="dock-wrapper">
        <div className="dock-container justify-center">
          <GooeyNav
            items={navItems}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={initialActiveIndex}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
      </div>
    </div>
  );
}

