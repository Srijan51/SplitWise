"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatCurrency, EXPENSE_CATEGORIES } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";

const CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7",
];

type Expense = {
  id: string;
  amount: number;
  category: string;
  createdAt: string;
  paidBy: { id: string; name: string };
};

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
      }
      setLoading(false);
    };
    fetchData();
  }, [groupId]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  // Category breakdown
  const categoryData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => {
      const cat = EXPENSE_CATEGORIES.find((c) => c.value === name);
      return { name: cat?.label || name, value, emoji: cat?.emoji || "📝" };
    })
    .sort((a, b) => b.value - a.value);

  // Spend over time (by date)
  const timeData = (() => {
    const byDate: Record<string, number> = {};
    expenses.forEach((exp) => {
      const date = new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      byDate[date] = (byDate[date] || 0) + exp.amount;
    });
    return Object.entries(byDate)
      .map(([date, amount]) => ({ date, amount }))
      .reverse();
  })();

  // Who pays most
  const payerData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.paidBy.name] = (acc[exp.paidBy.name] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="p-4 max-w-lg mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="btn btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Where&apos;s all the money going? 📊
        </p>
      </motion.div>

      {expenses.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="font-semibold text-sm">No data yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Add some expenses to see charts here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <h3 className="text-sm font-semibold mb-3">Spend by Category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.20 0.015 260)",
                      border: "1px solid oklch(0.28 0.02 260)",
                      borderRadius: "0.75rem",
                      color: "oklch(0.95 0.01 260)",
                      fontSize: "0.75rem",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span style={{ color: "var(--color-text-muted)" }}>{cat.emoji} {cat.name}</span>
                  <span className="font-medium">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Spend Over Time */}
          {timeData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4"
            >
              <h3 className="text-sm font-semibold mb-3">Spend Over Time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.50 0.02 260)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "oklch(0.50 0.02 260)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.20 0.015 260)",
                        border: "1px solid oklch(0.28 0.02 260)",
                        borderRadius: "0.75rem",
                        color: "oklch(0.95 0.01 260)",
                        fontSize: "0.75rem",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Who Pays Most */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <h3 className="text-sm font-semibold mb-3">Who Pays Most 💰</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.50 0.02 260)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.70 0.02 260)" }} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.20 0.015 260)",
                      border: "1px solid oklch(0.28 0.02 260)",
                      borderRadius: "0.75rem",
                      color: "oklch(0.95 0.01 260)",
                      fontSize: "0.75rem",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Total Stats */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-2">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-brand-400)" }}>
                  {expenses.length}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Expenses</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-brand-400)" }}>
                  {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Total Spent</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--color-brand-400)" }}>
                  {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0) / (expenses.length || 1))}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Avg Expense</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
