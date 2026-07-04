import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const EXPENSE_CATEGORIES = [
  { value: "Food", emoji: "🍕", label: "Food & Drinks" },
  { value: "Transport", emoji: "🚗", label: "Transport" },
  { value: "Shopping", emoji: "🛍️", label: "Shopping" },
  { value: "Entertainment", emoji: "🎬", label: "Entertainment" },
  { value: "Groceries", emoji: "🛒", label: "Groceries" },
  { value: "Rent", emoji: "🏠", label: "Rent & Bills" },
  { value: "Medical", emoji: "🏥", label: "Medical" },
  { value: "Travel", emoji: "✈️", label: "Travel" },
  { value: "Recurring", emoji: "🔄", label: "Recurring" },
  { value: "General", emoji: "📝", label: "General" },
] as const;

export const GROUP_EMOJIS = [
  "👥", "🏠", "🍕", "✈️", "🎓", "🏕️", "🎉", "💼",
  "🏖️", "⛺", "🎮", "🍳", "🏋️", "🎵", "📚", "🚗",
];

export const ACCENT_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
];
