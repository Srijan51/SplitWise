"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, getInitials } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Home,
  Users as UsersIcon,
  Plus,
  FileText,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  "Food": "#e8925a",
  "General": "#528f80",
  "Transport": "#6366f1",
  "Groceries": "#22c55e",
  "Hotel": "#a855f7",
  "Entertainment": "#ec4899",
  "Flights": "#0ea5e9",
  "Utilities": "#eab308",
  "Shopping": "#f97316",
  "Stay": "#8b5cf6",
  "Activities": "#14b8a6",
};

const CAT_EMOJIS: Record<string, string> = {
  "Food": "🍔",
  "General": "📝",
  "Transport": "🚗",
  "Groceries": "🛒",
  "Hotel": "🏨",
  "Entertainment": "🎬",
  "Flights": "✈️",
  "Utilities": "⚡",
  "Shopping": "🛍️",
  "Stay": "🏠",
  "Activities": "🎯",
};

type Analytics = {
  totalSpent: number;
  totalExpenses: number;
  categories: { name: string; amount: number; percentage: number }[];
  topSpenders: { name: string; amount: number; isYou: boolean }[];
  trend: { date: string; amount: number }[];
  settled: number;
  pending: number;
};

type Activity = {
  id: string;
  description: string;
  groupName: string;
  groupEmoji: string;
  paidBy: string;
  iPaid: boolean;
  amount: number;
  myShare: number;
  createdAt: string;
};

export default function ActivityPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "expenses">("overview");

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) return router.push("/login");
      const headers = { "Authorization": `Bearer ${token}` };

      const [analyticsRes, activitiesRes] = await Promise.all([
        fetch("http://localhost:8000/api/analytics", { headers }),
        fetch("http://localhost:8000/api/activities", { headers }),
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
        <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalSettledPending = (analytics?.settled || 0) + (analytics?.pending || 0);
  const settledPct = totalSettledPending > 0 ? Math.round((analytics?.settled || 0) / totalSettledPending * 100) : 0;
  const pendingPct = 100 - settledPct;

  // Find max for trend chart
  const maxTrend = Math.max(...(analytics?.trend || []).map((t) => t.amount), 1);

  return (
    <div className="min-h-screen bg-[#fdfaf5] pb-24 overflow-x-hidden font-sans relative">
      {/* Header */}
      <div className="relative pt-4 px-6">
        <div className="flex items-center justify-between relative z-10 mt-2">
          <button onClick={() => router.push("/dashboard")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <img src="/logo.png" alt="SplitWise Logo" className="h-10 object-contain" />
          <div className="w-10 h-10"></div>
        </div>

        <div className="mt-6 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-[26px] font-bold text-[#1a2b3c] tracking-tight">Activity & Analytics</h1>
          <p className="text-[13px] text-[#8e98a3] mt-1 max-w-[260px] leading-snug">
            Your spending overview across all groups.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mt-6 bg-white p-1 rounded-[1.25rem] flex items-center shadow-sm border border-gray-100 relative z-10 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 text-sm font-semibold rounded-[1rem] transition-colors flex justify-center items-center gap-2 ${
              activeTab === "overview" ? "bg-[#f4f7f5] text-[#335c52]" : "text-[#8e98a3]"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex-1 py-3 text-sm font-semibold rounded-[1rem] transition-colors flex justify-center items-center gap-2 ${
              activeTab === "expenses" ? "bg-[#f4f7f5] text-[#335c52]" : "text-[#8e98a3]"
            }`}
          >
            📋 Expenses
          </button>
        </div>
      </div>

      {activeTab === "overview" && analytics && (
        <div className="px-5 mt-6 space-y-4 relative z-10">
          {/* Total Spent Hero Card */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[13px] font-semibold text-[#8e98a3]">Total Spent</p>
              <p className="text-[2rem] font-bold text-[#1a2b3c] tracking-tight mt-1">
                {formatCurrency(analytics.totalSpent)}
              </p>
              <p className="text-[12px] text-[#8e98a3] mt-0.5">Across {analytics.totalExpenses} expenses</p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#528f80] bg-[#eef5f3] px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> All groups combined
                </span>
              </div>
            </div>
            {/* Couch/Plant illustration */}
            <div className="absolute top-0 right-0 w-[160px] h-[120px] pointer-events-none opacity-80" style={{
              backgroundImage: "url('/hero-couch.png')",
              backgroundSize: "contain",
              backgroundPosition: "top right",
              backgroundRepeat: "no-repeat",
              mixBlendMode: "multiply",
              maskImage: "radial-gradient(circle at 70% 40%, black 30%, transparent 65%)",
              WebkitMaskImage: "radial-gradient(circle at 70% 40%, black 30%, transparent 65%)",
            }} />
          </div>

          {/* Spending by Category + Top Categories */}
          <div className="grid grid-cols-2 gap-3">
            {/* Donut Chart Card */}
            <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100">
              <p className="text-[12px] font-bold text-[#1a2b3c] mb-3">Spending by Category</p>
              <div className="relative w-[100px] h-[100px] mx-auto mb-3">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {analytics.categories.length > 0 ? (
                    (() => {
                      let offset = 0;
                      return analytics.categories.slice(0, 5).map((cat, i) => {
                        const dash = cat.percentage;
                        const gap = 100 - dash;
                        const el = (
                          <circle
                            key={cat.name}
                            cx="18" cy="18" r="15.5"
                            fill="none"
                            stroke={CAT_COLORS[cat.name] || "#8e98a3"}
                            strokeWidth="3"
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()
                  ) : (
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-[#335c52]">{formatCurrency(analytics.totalSpent)}</p>
                  <p className="text-[8px] text-[#8e98a3]">Total</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {analytics.categories.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-[10px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[cat.name] || "#8e98a3" }}></span>
                    <span className="text-[#1a2b3c] font-medium truncate flex-1">{cat.name}</span>
                    <span className="text-[#8e98a3] font-semibold">{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories List */}
            <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100">
              <p className="text-[12px] font-bold text-[#1a2b3c] mb-3">Top Categories</p>
              <div className="space-y-3">
                {analytics.categories.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#f4f7f5] flex items-center justify-center text-sm">
                        {CAT_EMOJIS[cat.name] || "📝"}
                      </div>
                      <span className="text-[12px] font-semibold text-[#1a2b3c]">{cat.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-[#8e98a3]">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spending Trend */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold text-[#1a2b3c]">Spending Trend</p>
              <span className="text-[11px] font-medium text-[#8e98a3]">Last 14 days</span>
            </div>
            <div className="relative h-[120px]">
              <svg viewBox={`0 0 ${(analytics.trend.length - 1) * 50} 120`} className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="30" x2={(analytics.trend.length - 1) * 50} y2="30" stroke="#f0f4f2" strokeWidth="1" />
                <line x1="0" y1="60" x2={(analytics.trend.length - 1) * 50} y2="60" stroke="#f0f4f2" strokeWidth="1" />
                <line x1="0" y1="90" x2={(analytics.trend.length - 1) * 50} y2="90" stroke="#f0f4f2" strokeWidth="1" />
                
                {/* Area fill */}
                <path
                  d={`M 0 ${110 - (analytics.trend[0]?.amount / maxTrend) * 90} ${analytics.trend.map((t, i) => `L ${i * 50} ${110 - (t.amount / maxTrend) * 90}`).join(' ')} L ${(analytics.trend.length - 1) * 50} 110 L 0 110 Z`}
                  fill="url(#trendGradient)"
                />
                
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#335c52"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={analytics.trend.map((t, i) => `${i * 50},${110 - (t.amount / maxTrend) * 90}`).join(' ')}
                />
                
                {/* Dots */}
                {analytics.trend.map((t, i) => (
                  <circle key={i} cx={i * 50} cy={110 - (t.amount / maxTrend) * 90} r="3" fill="white" stroke="#335c52" strokeWidth="2" />
                ))}

                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#335c52" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#335c52" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between mt-2 px-1">
              {analytics.trend.filter((_, i) => i % 3 === 0 || i === analytics.trend.length - 1).map((t, i) => (
                <span key={i} className="text-[9px] text-[#8e98a3] font-medium">{t.date}</span>
              ))}
            </div>
          </div>

          {/* Who Spent the Most + Payment Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100">
              <p className="text-[12px] font-bold text-[#1a2b3c] mb-3">Who Spent the Most?</p>
              <div className="space-y-3">
                {analytics.topSpenders.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[10px] font-bold text-[#528f80]">
                        {getInitials(s.name)}
                      </div>
                      <span className={`text-[12px] font-semibold ${s.isYou ? "text-[#335c52]" : "text-[#1a2b3c]"}`}>
                        {s.isYou ? "You" : s.name.split(" ")[0]}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-[#1a2b3c]">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100">
              <p className="text-[12px] font-bold text-[#1a2b3c] mb-3">Payment Status</p>
              <div className="relative w-[90px] h-[90px] mx-auto mb-3">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#eef5f3" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#528f80" strokeWidth="4"
                    strokeDasharray={`${settledPct} ${pendingPct}`}
                    strokeDashoffset="25"
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[11px] font-bold text-[#e8925a]">{formatCurrency(analytics.pending)}</p>
                  <p className="text-[8px] text-[#8e98a3]">Pending</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-[#528f80]"></span>
                  <span className="text-[#1a2b3c] font-medium">Settled</span>
                  <span className="ml-auto text-[#8e98a3]">{formatCurrency(analytics.settled)} ({settledPct}%)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-[#e8925a]"></span>
                  <span className="text-[#1a2b3c] font-medium">Pending</span>
                  <span className="ml-auto text-[#8e98a3]">{formatCurrency(analytics.pending)} ({pendingPct}%)</span>
                </div>
              </div>
              <button onClick={() => router.push("/groups")} className="text-[11px] font-semibold text-[#528f80] flex items-center mt-3 hover:underline">
                View balances <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

          {/* AI Insight Banner */}
          <div className="bg-gradient-to-r from-[#eff6f3] to-[#e4f0ea] rounded-[1.25rem] p-4 flex items-center relative overflow-hidden border border-[#d2e4dd] shadow-sm">
            <div className="w-[70px] h-[70px] flex-shrink-0 relative -ml-2 -mb-6">
              <div className="absolute inset-0 bg-no-repeat" style={{
                backgroundImage: "url('/ai-cat.png')",
                backgroundSize: "contain",
                backgroundPosition: "bottom center",
                mixBlendMode: "multiply",
                maskImage: "radial-gradient(circle at center, black 45%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle at center, black 45%, transparent 70%)",
              }} />
            </div>
            <div className="ml-2 flex-1 relative z-10">
              <h3 className="text-[12px] font-bold text-[#1a2b3c]">AI Insight ✨</h3>
              <p className="text-[10px] text-[#5c6e7d] mt-0.5 leading-tight font-medium pr-2">
                {analytics.categories[0]
                  ? `You're spending the most on ${analytics.categories[0].name}. Try budgeting to save more! 🎯`
                  : "Add some expenses to get personalized insights!"}
              </p>
            </div>
            <button className="bg-[#335c52] text-white text-[10px] font-bold px-3 py-2 rounded-full flex items-center gap-1 flex-shrink-0 relative z-10 shadow-sm hover:bg-[#2a4d44]">
              <Sparkles className="w-3 h-3 text-[#a8dfc8]" /> View AI Tips
            </button>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="px-5 mt-6 space-y-3 relative z-10">
          {activities.length === 0 ? (
            <div className="bg-white rounded-[1.5rem] p-10 text-center shadow-sm border border-gray-100">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-[14px] font-bold text-[#1a2b3c]">No expenses yet</p>
              <p className="text-[12px] text-[#8e98a3] mt-1">Start adding expenses to see them here!</p>
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-full bg-[#f4f7f5] flex items-center justify-center text-lg shrink-0">
                  {act.groupEmoji || "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#1a2b3c] truncate">{act.description}</p>
                  <p className="text-[11px] text-[#8e98a3] mt-0.5 truncate">
                    {act.groupName} · Paid by {act.iPaid ? "You" : act.paidBy}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[13px] font-bold ${act.myShare > 0 ? "text-[#335c52]" : act.myShare < 0 ? "text-[#e75a5a]" : "text-[#8e98a3]"}`}>
                    {act.myShare > 0 ? "+" : ""}{act.myShare === 0 ? "—" : formatCurrency(Math.abs(act.myShare))}
                  </p>
                  <p className="text-[10px] text-[#8e98a3] mt-0.5">
                    {new Date(act.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bottom Floating Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#fdfaf5] border-t border-gray-100 px-6 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#335c52]">
          <Home className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <Link href="/groups" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#335c52]">
          <UsersIcon className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Groups</span>
        </Link>
        <Link href="/add-expense" className="flex flex-col items-center -mt-8">
          <div className="w-[56px] h-[56px] bg-[#335c52] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#335c52]/30 hover:scale-105 transition-transform border-4 border-white">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Add Expense</span>
        </Link>
        <Link href="/activity" className="flex flex-col items-center gap-1.5 text-[#335c52]">
          <FileText className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-bold">Activity</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#335c52]">
          <User className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
