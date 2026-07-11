"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GROUP_EMOJIS, ACCENT_COLORS } from "@/lib/utils";
import { ArrowLeft, Sparkles, Plane, RefreshCw, Calendar, UsersIcon, Check } from "lucide-react";

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "ONGOING" as "ONGOING" | "TRIP",
    currency: "INR",
    emoji: "👥",
    accentColor: "#335c52", // Default to theme green
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
    <div className="min-h-screen bg-[#fdfaf5] font-sans pb-24 overflow-x-hidden relative">
      
      {/* Background Graphic (Subtle) */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#e5eee9] to-transparent z-0 opacity-50 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="px-6 pt-10 pb-6 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#1a2b3c] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <img src="/logo.png" alt="SplitWise Logo" className="h-8 object-contain" />
          
          <div className="w-10 h-10"></div> {/* Spacer for centering */}
        </div>

        <div className="px-6 md:px-8 mt-2">
          <h1 className="text-[2rem] font-bold text-[#1a2b3c] leading-tight mb-2 tracking-tight">Create a Group</h1>
          <p className="text-[#8e98a3] text-[15px] font-medium mb-8">Start splitting expenses with your crew ✌️</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Group Name Input */}
            <div className="bg-white rounded-[1.25rem] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100 focus-within:ring-2 focus-within:ring-[#335c52] transition-all">
              <label className="block text-[12px] font-bold text-[#8e98a3] uppercase tracking-wider mb-2">
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. Hostel 42 Mess, Goa Trip 2025"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-none outline-none text-[#1a2b3c] font-semibold text-[16px] placeholder-[#cbd5e1]"
                required
              />
            </div>

            {/* Group Type */}
            <div>
              <label className="block text-[12px] font-bold text-[#1a2b3c] uppercase tracking-wider mb-3 px-1">
                Group Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "ONGOING" })}
                  className={`relative p-4 rounded-[1.25rem] text-left transition-all border ${
                    form.type === "ONGOING" 
                      ? "bg-white border-[#335c52] shadow-[0_8px_20px_rgba(51,92,82,0.15)] ring-1 ring-[#335c52]" 
                      : "bg-white border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:border-gray-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${form.type === 'ONGOING' ? 'bg-[#335c52] text-white' : 'bg-[#f4f7f5] text-[#8e98a3]'}`}>
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-[#1a2b3c] text-[15px]">Ongoing</div>
                  <div className="text-[12px] font-medium text-[#8e98a3] mt-0.5 leading-tight">
                    Roommates, mess groups
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "TRIP" })}
                  className={`relative p-4 rounded-[1.25rem] text-left transition-all border ${
                    form.type === "TRIP" 
                      ? "bg-white border-[#335c52] shadow-[0_8px_20px_rgba(51,92,82,0.15)] ring-1 ring-[#335c52]" 
                      : "bg-white border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:border-gray-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${form.type === 'TRIP' ? 'bg-[#335c52] text-white' : 'bg-[#f4f7f5] text-[#8e98a3]'}`}>
                    <Plane className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-[#1a2b3c] text-[15px]">Trip</div>
                  <div className="text-[12px] font-medium text-[#8e98a3] mt-0.5 leading-tight">
                    One-time trips, events
                  </div>
                </button>
              </div>
            </div>

            {/* Trip dates */}
            {form.type === "TRIP" && (
              <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-white rounded-[1.25rem] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100">
                  <label className="block text-[11px] font-bold text-[#8e98a3] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-[#1a2b3c] font-semibold text-[14px]"
                  />
                </div>
                <div className="bg-white rounded-[1.25rem] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100">
                  <label className="block text-[11px] font-bold text-[#8e98a3] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-[#1a2b3c] font-semibold text-[14px]"
                  />
                </div>
              </div>
            )}

            {/* Emoji & Accent Color */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="mb-5">
                <label className="block text-[12px] font-bold text-[#1a2b3c] uppercase tracking-wider mb-3">
                  Group Icon
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {GROUP_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, emoji })}
                      className={`w-11 h-11 rounded-full text-xl flex items-center justify-center transition-all ${
                        form.emoji === emoji 
                          ? "bg-[#335c52] shadow-md border-2 border-[#335c52] -translate-y-1" 
                          : "bg-[#f4f7f5] hover:bg-[#e5eee9] border-2 border-transparent"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1a2b3c] uppercase tracking-wider mb-3">
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, accentColor: color })}
                      className={`w-9 h-9 rounded-full transition-all relative flex items-center justify-center ${
                        form.accentColor === color ? "scale-110 shadow-md" : "hover:scale-105"
                      }`}
                      style={{ background: color }}
                    >
                      {form.accentColor === color && (
                         <div className="absolute inset-0 rounded-full border-[3px] border-white pointer-events-none"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="w-full mt-4 bg-[#335c52] text-white py-4 rounded-[1.25rem] font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(51,92,82,0.3)] hover:shadow-[0_12px_35px_rgba(51,92,82,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UsersIcon className="w-5 h-5" /> Create Group
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
