"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Ticket } from "lucide-react";

export default function JoinGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);

    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch("http://localhost:8000/api/groups/join", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.alreadyMember) {
          toast.info("You're already in this group!");
        } else {
          toast.success("Joined the group! 🎉");
        }
        router.push(`/groups/${data.groupId}`);
      } else {
        toast.error(data.error || "Failed to join group");
      }
    } catch {
      toast.error("Something went wrong");
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
          <h1 className="text-[2rem] font-bold text-[#1a2b3c] leading-tight mb-2 tracking-tight">Join a Group</h1>
          <p className="text-[#8e98a3] text-[15px] font-medium mb-8">Got an invite code? Enter it below to join your friends 🤝</p>

          <form onSubmit={handleJoin} className="space-y-6">
            
            <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#335c52]"></div>
              
              <div className="w-16 h-16 bg-[#f4f7f5] rounded-full mx-auto mb-6 flex items-center justify-center shadow-sm">
                <Ticket className="w-8 h-8 text-[#528f80]" />
              </div>
              
              <label className="block text-[12px] font-bold text-[#8e98a3] uppercase tracking-wider mb-4">
                Invite Code
              </label>
              
              <input
                type="text"
                placeholder="XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-[#fdfaf5] border border-gray-100 rounded-xl outline-none text-[#1a2b3c] font-bold text-[28px] tracking-[0.4em] text-center uppercase py-4 focus:border-[#335c52] focus:ring-1 focus:ring-[#335c52] transition-all placeholder:tracking-normal placeholder:font-medium placeholder:text-[#cbd5e1]"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length < 4}
              className="w-full mt-2 bg-[#335c52] text-white py-4 rounded-[1.25rem] font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(51,92,82,0.3)] hover:shadow-[0_12px_35px_rgba(51,92,82,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Join Group
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
