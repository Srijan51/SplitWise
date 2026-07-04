"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/components/providers/socket-provider";
import { formatCurrency, getInitials } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plane,
  RefreshCw,
  Wallet,
} from "lucide-react";

type GroupData = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  accentColor: string;
  currency: string;
  memberCount: number;
  expenseCount: number;
  members: { id: string; name: string; avatarUrl: string | null; role: string }[];
};

type BalanceData = {
  memberBalances: { userId: string; name: string; netBalance: number }[];
};

export default function DashboardPage() {
  const router = useRouter();
  
  // Hardcoded mock session for now since we bypassed login
  const session = {
    user: { id: "alice-id-123", name: "Alice", email: "alice@example.com" }
  };

  const { socket } = useSocket();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [balances, setBalances] = useState<Record<string, BalanceData>>({});
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/groups", {
        headers: { "Authorization": `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);

        // Fetch balances for each group
        for (const group of data) {
          try {
            const balRes = await fetch(`http://localhost:8000/api/groups/${group.id}/balances`);
            if (balRes.ok) {
              const balData = await balRes.json();
              setBalances((prev) => ({ ...prev, [group.id]: balData }));
            }
          } catch (e) {
            console.error("Balance fetch error:", e);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Join socket rooms + listen for balance updates
  useEffect(() => {
    if (!socket || groups.length === 0) return;

    for (const group of groups) {
      socket.emit("join-group", group.id);
    }

    const handleBalanceUpdate = async (data: { groupId: string }) => {
      try {
        const res = await fetch(`http://localhost:8000/api/groups/${data.groupId}/balances`);
        if (res.ok) {
          const balData = await res.json();
          setBalances((prev) => ({ ...prev, [data.groupId]: balData }));
        }
      } catch (e) {
        // ignore
      }
    };

    socket.on("balance:updated", handleBalanceUpdate);

    return () => {
      socket.off("balance:updated", handleBalanceUpdate);
      for (const group of groups) {
        socket.emit("leave-group", group.id);
      }
    };
  }, [socket, groups]);

  const getMyBalance = (groupId: string): number => {
    const bal = balances[groupId];
    if (!bal || !session?.user?.id) return 0;
    const mine = bal.memberBalances.find((m) => m.userId === session.user.id);
    return mine?.netBalance ?? 0;
  };

  const totalOwed = groups.reduce((sum, g) => {
    const bal = getMyBalance(g.id);
    return bal > 0 ? sum + bal : sum;
  }, 0);

  const totalOwe = groups.reduce((sum, g) => {
    const bal = getMyBalance(g.id);
    return bal < 0 ? sum + Math.abs(bal) : sum;
  }, 0);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">
          Hey, {session?.user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Here&apos;s your balance overview
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 glow-green"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: "var(--color-success)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              You&apos;re owed
            </span>
          </div>
          <p className="text-xl font-bold balance-positive">
            {formatCurrency(totalOwed)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 glow-red"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4" style={{ color: "var(--color-danger)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              You owe
            </span>
          </div>
          <p className="text-xl font-bold balance-negative">
            {formatCurrency(totalOwe)}
          </p>
        </motion.div>
      </div>

      {/* Groups List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Groups</h2>

        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="text-4xl mb-3">🫂</div>
            <h3 className="font-semibold mb-1">No groups yet</h3>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Create a group with your friends and start splitting expenses!
            </p>
            <button
              onClick={() => router.push("/groups/create")}
              className="btn btn-primary btn-sm"
            >
              Create Your First Group
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {groups.map((group, i) => {
                const myBalance = getMyBalance(group.id);
                const isTrip = group.type === "TRIP";

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/groups/${group.id}`)}
                    className="glass-card glass-card-hover cursor-pointer overflow-hidden"
                  >
                    {/* Accent banner */}
                    <div
                      className={`h-1.5 ${isTrip ? "trip-banner" : ""}`}
                      style={!isTrip ? { background: group.accentColor } : {}}
                    />

                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: `${group.accentColor}22` }}
                          >
                            {group.emoji}
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {group.name}
                              {isTrip && (
                                <span className="chip text-[10px]">
                                  <Plane className="w-3 h-3" /> Trip
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Users className="w-3 h-3" style={{ color: "var(--color-text-muted)" }} />
                              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                {group.memberCount} members · {group.expenseCount} expenses
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            myBalance > 0.01
                              ? "balance-positive"
                              : myBalance < -0.01
                              ? "balance-negative"
                              : "balance-zero"
                          }`}>
                            {myBalance > 0.01
                              ? `+${formatCurrency(myBalance)}`
                              : myBalance < -0.01
                              ? `-${formatCurrency(Math.abs(myBalance))}`
                              : "settled ✓"}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {myBalance > 0.01 ? "you're owed" : myBalance < -0.01 ? "you owe" : "all clear"}
                          </p>
                        </div>
                      </div>

                      {/* Member avatars */}
                      <div className="flex items-center mt-3 -space-x-2">
                        {group.members.slice(0, 5).map((member) => (
                          <div
                            key={member.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                            style={{
                              background: "var(--color-surface-hover)",
                              borderColor: "var(--color-surface-card)",
                              color: "var(--color-text-secondary)",
                            }}
                            title={member.name}
                          >
                            {getInitials(member.name)}
                          </div>
                        ))}
                        {group.memberCount > 5 && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                            style={{
                              background: "var(--color-surface-hover)",
                              borderColor: "var(--color-surface-card)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            +{group.memberCount - 5}
                          </div>
                        )}
                        <div className="flex-1" />
                        <ArrowRight className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
