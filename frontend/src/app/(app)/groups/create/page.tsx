"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GROUP_EMOJIS, ACCENT_COLORS } from "@/lib/utils";
import { ArrowLeft, Sparkles, Plane, RefreshCw, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

const SplitText = dynamic(() => import("@/components/SplitText"), {
  ssr: false,
});

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "ONGOING" as "ONGOING" | "TRIP",
    currency: "INR",
    emoji: "👥",
    accentColor: "#6366f1",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch("http://localhost:8000/api/groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Group created! 🎉");
        router.push(`/groups/${data.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create group");
      }
    } catch {
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="responsive-container-md mt-8 p-4 pb-24">
      <button
        onClick={() => router.back()}
        className="btn-ghost flex items-center gap-2 mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <SplitText
          text="Create a Group"
          className="text-2xl font-bold mb-1"
          delay={30}
          duration={0.4}
          splitType="chars"
          textAlign="left"
          tag="h1"
        />
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Start splitting expenses with your crew ✌️
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Group Name */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
            Group Name
          </label>
          <input
            type="text"
            placeholder="e.g. Hostel 42 Mess, Goa Trip 2025"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-base"
            required
          />
        </div>

        {/* Group Type */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Group Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "ONGOING" })}
              className={`glass-card p-4 text-left transition-all ${
                form.type === "ONGOING" ? "ring-2" : ""
              }`}
              style={form.type === "ONGOING" ? { borderColor: "var(--color-brand-500)", boxShadow: "0 0 12px oklch(0.58 0.2 260 / 0.2)" } : {}}
            >
              <RefreshCw className="w-5 h-5 mb-2" style={{ color: "var(--color-brand-400)" }} />
              <div className="font-semibold text-sm">Ongoing</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Roommates, mess groups
              </div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "TRIP" })}
              className={`glass-card p-4 text-left transition-all ${
                form.type === "TRIP" ? "ring-2" : ""
              }`}
              style={form.type === "TRIP" ? { borderColor: "oklch(0.60 0.22 50)", boxShadow: "0 0 12px oklch(0.60 0.22 50 / 0.2)" } : {}}
            >
              <Plane className="w-5 h-5 mb-2" style={{ color: "oklch(0.65 0.18 50)" }} />
              <div className="font-semibold text-sm">Trip</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                One-time trips, events
              </div>
            </button>
          </div>
        </div>

        {/* Trip dates */}
        {form.type === "TRIP" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Calendar className="w-3 h-3 inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Calendar className="w-3 h-3 inline mr-1" /> End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-base text-sm"
              />
            </div>
          </motion.div>
        )}

        {/* Emoji Picker */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Group Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUP_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, emoji })}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                  form.emoji === emoji ? "ring-2 scale-110" : ""
                }`}
                style={{
                  background: form.emoji === emoji ? "var(--color-surface-hover)" : "var(--color-surface-card)",
                  borderColor: form.emoji === emoji ? "var(--color-brand-500)" : "transparent",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, accentColor: color })}
                className={`w-8 h-8 rounded-full transition-all ${
                  form.accentColor === color ? "ring-2 ring-offset-2 scale-110" : ""
                }`}
                style={{
                  background: color,
                  "--tw-ring-color": color,
                  "--tw-ring-offset-color": "var(--color-surface)",
                } as React.CSSProperties}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Create Group
            </>
          )}
        </button>
      </form>
    </div>
  );
}
