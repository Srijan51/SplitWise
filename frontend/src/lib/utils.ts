import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

export function formatCurrency(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const GROUP_EMOJIS = [
  "👥", "🏠", "✈️", "🍕", "🎉", "💼", "🎓", "🏖️",
  "🚗", "🎮", "🍽️", "☕", "🏋️", "🎬", "🎵", "🛒",
];

export const ACCENT_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
];

export function getRelativeTime(date: Date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round(
    (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysDifference === 0) return 'Today';
  if (daysDifference === -1) return 'Yesterday';
  if (daysDifference === 1) return 'Tomorrow';
  
  return rtf.format(daysDifference, 'day');
}

export const EXPENSE_CATEGORIES = [
  { value: "General", label: "General", emoji: "📝" },
  { value: "Food", label: "Food & Drink", emoji: "🍔" },
  { value: "Groceries", label: "Groceries", emoji: "🛒" },
  { value: "Transport", label: "Transport", emoji: "🚗" },
  { value: "Flights", label: "Flights", emoji: "✈️" },
  { value: "Hotel", label: "Accommodation", emoji: "🏨" },
  { value: "Entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "Utilities", label: "Utilities", emoji: "⚡" },
];
