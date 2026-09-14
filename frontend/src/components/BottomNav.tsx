"use client";

import Link from "next/link";
import { Home, Users, Plus, FileText, User } from "lucide-react";

export type NavTab = "dashboard" | "groups" | "activity" | "profile";

export function BottomNav({ active }: { active?: NavTab }) {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#fdfaf5] border-t border-gray-100 px-6 h-[76px] flex justify-between items-center rounded-t-3xl shadow-[0_-4px_25px_rgba(0,0,0,0.04)] pb-1 md:hidden"
    >
      <Link
        href="/dashboard"
        className={`flex flex-col items-center gap-1 transition-colors ${
          active === "dashboard" ? "text-[#335c52]" : "text-gray-400 hover:text-[#335c52]"
        }`}
      >
        <Home className="w-5 h-5" strokeWidth={active === "dashboard" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "dashboard" ? "font-bold" : "font-medium"}`}>
          Dashboard
        </span>
      </Link>

      <Link
        href="/groups"
        className={`flex flex-col items-center gap-1 transition-colors ${
          active === "groups" ? "text-[#335c52]" : "text-gray-400 hover:text-[#335c52]"
        }`}
      >
        <Users className="w-5 h-5" strokeWidth={active === "groups" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "groups" ? "font-bold" : "font-medium"}`}>
          Groups
        </span>
      </Link>

      <Link href="/add-expense" className="flex flex-col items-center -mt-7 group">
        <div className="w-14 h-14 bg-[#335c52] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#335c52]/30 group-hover:scale-105 group-hover:bg-[#284a42] transition-all border-4 border-[#fdfaf5]">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-[#1a2b3c] mt-1 whitespace-nowrap">
          Add Expense
        </span>
      </Link>

      <Link
        href="/activity"
        className={`flex flex-col items-center gap-1 transition-colors ${
          active === "activity" ? "text-[#335c52]" : "text-gray-400 hover:text-[#335c52]"
        }`}
      >
        <FileText className="w-5 h-5" strokeWidth={active === "activity" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "activity" ? "font-bold" : "font-medium"}`}>
          Activity
        </span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center gap-1 transition-colors ${
          active === "profile" ? "text-[#335c52]" : "text-gray-400 hover:text-[#335c52]"
        }`}
      >
        <User className="w-5 h-5" strokeWidth={active === "profile" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "profile" ? "font-bold" : "font-medium"}`}>
          Profile
        </span>
      </Link>
    </nav>
  );
}
