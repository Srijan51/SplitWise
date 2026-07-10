"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Sparkles,
  Home,
  UserPlus,
  PlusCircle,
  User,
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
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Join Group", href: "/groups/join", icon: UserPlus },
  { label: "Create Group", href: "/groups/create", icon: PlusCircle },
  { label: "Profile", href: "/profile", icon: User },
];

// Labels for the bottom dock (shorter)
const dockItems = navItems.map((item) => ({
  label: item.label.split(" ")[0], // "Home", "Join", "Create", "Profile"
  href: item.href,
}));

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

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

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
          color="#a1a1aa"
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

      {/* GooeyNav Dock (mobile/tablet only — hidden on desktop via CSS) */}
      <div className="dock-wrapper">
        <div className="dock-container justify-center">
          <GooeyNav
            items={dockItems}
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
