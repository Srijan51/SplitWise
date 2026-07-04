"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="p-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => router.back()} className="btn btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold mb-1">Join a Group</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Got an invite code? Enter it below to join your friends 🤝
        </p>
      </motion.div>

      <form onSubmit={handleJoin} className="space-y-4">
        <div className="glass-card p-6 text-center">
          <Ticket className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--color-brand-400)" }} />
          <label className="block text-xs font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
            Invite Code
          </label>
          <input
            type="text"
            placeholder="Enter 6-character code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="input-base text-center text-2xl font-mono tracking-[0.3em] uppercase"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.trim().length < 4}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Join Group
            </>
          )}
        </button>
      </form>
    </div>
  );
}
