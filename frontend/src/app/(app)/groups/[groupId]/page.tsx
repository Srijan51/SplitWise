"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/socket-provider";
import { formatCurrency, getInitials, getRelativeTime, EXPENSE_CATEGORIES } from "@/lib/utils";
import type { GroupBalances, SimplifiedDebt } from "@/lib/balance-calculator";
import {
  ArrowLeft,
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Copy,
  Check,
  Plane,
  Wallet,
  Receipt,
  BarChart3,
  HandCoins,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type GroupData = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  accentColor: string;
  currency: string;
  inviteCode: string;
  finalized: boolean;
  currentUserId: string;
  members: {
    user: { id: string; name: string; email: string; avatarUrl: string | null };
    role: string;
  }[];
  expenses: {
    id: string;
    amount: number;
    description: string;
    category: string;
    splitType: string;
    createdAt: string;
    paidBy: { id: string; name: string; avatarUrl: string | null };
    splits: { userId: string; amountOwed: number; user: { id: string; name: string } }[];
  }[];
  settlements: {
    id: string;
    amount: number;
    method: string;
    confirmedByRecipient: boolean;
    createdAt: string;
    fromUser: { id: string; name: string };
    toUser: { id: string; name: string };
  }[];
};

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const { socket } = useSocket();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [balances, setBalances] = useState<GroupBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "balances" | "settle">("expenses");
  const [showMembers, setShowMembers] = useState(false);

  const fetchGroup = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) {
        router.push("/login");
        return;
      }
      const headers = { "Authorization": `Bearer ${token}` };
      
      const userRes = await fetch("http://localhost:8000/api/users/me", { headers });
      if (userRes.ok) {
        setSession({ user: await userRes.json() });
      } else {
        router.push("/login");
        return;
      }

      const [groupRes, balRes] = await Promise.all([
        fetch(`http://localhost:8000/api/groups/${groupId}`, { headers }),
        fetch(`http://localhost:8000/api/groups/${groupId}/balances`, { headers }),
      ]);
      if (groupRes.ok) setGroup(await groupRes.json());
      if (balRes.ok) setBalances(await balRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket) return;
    socket.emit("join-group", groupId);

    const handleExpenseCreated = () => fetchGroup();
    const handleBalanceUpdated = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/balances`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setBalances(await res.json());
    };
    const handleSettlementUpdate = () => fetchGroup();

    socket.on("expense:created", handleExpenseCreated);
    socket.on("balance:updated", handleBalanceUpdated);
    socket.on("settlement:created", handleSettlementUpdate);
    socket.on("settlement:updated", handleSettlementUpdate);

    return () => {
      socket.off("expense:created", handleExpenseCreated);
      socket.off("balance:updated", handleBalanceUpdated);
      socket.off("settlement:created", handleSettlementUpdate);
      socket.off("settlement:updated", handleSettlementUpdate);
      socket.emit("leave-group", groupId);
    };
  }, [socket, groupId]);

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const confirmSettlement = async (settlementId: string) => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/settlements`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ settlementId, confirmed: true }),
      });
      if (res.ok) {
        toast.success("Payment confirmed! ✅");
        fetchGroup();
      }
    } catch {
      toast.error("Failed to confirm");
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-20 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 text-center mt-20">
        <p className="text-lg">Group not found 😢</p>
        <button onClick={() => router.push("/dashboard")} className="btn btn-primary btn-sm mt-4">
          Go Home
        </button>
      </div>
    );
  }

  const isTrip = group.type === "TRIP";
  const myBalance = balances?.memberBalances.find((m) => m.userId === session?.user?.id)?.netBalance ?? 0;
  const pendingSettlements = (group.settlements || []).filter(
    (s) => !s.confirmedByRecipient && s.toUser.id === session?.user?.id
  );

  return (
    <div className="responsive-container-lg">
      {/* Header */}
      <div
        className={`relative px-4 pt-4 pb-6 ${isTrip ? "trip-banner" : ""}`}
        style={!isTrip ? { background: `linear-gradient(135deg, ${group.accentColor}dd, ${group.accentColor}88)` } : {}}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/dashboard")} className="btn btn-ghost text-white/80 -ml-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {isTrip && <span className="chip bg-white/20 text-white"><Plane className="w-3 h-3" /> Trip</span>}
            <button onClick={() => router.push(`/groups/${groupId}/analytics`)} className="btn btn-ghost text-white/80">
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/15 backdrop-blur-sm">
            {group.emoji}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{group.name}</h1>
            <button onClick={() => setShowMembers(!showMembers)} className="text-white/70 text-xs flex items-center gap-1">
              <Users className="w-3 h-3" /> {group.members.length} members
              {showMembers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* My Balance Hero */}
        <div className="glass-card p-4 bg-white/10 border-white/20">
          <p className="text-white/70 text-xs mb-1">Your balance</p>
          <p className={`text-2xl font-bold ${
            myBalance > 0.01 ? "text-green-300" : myBalance < -0.01 ? "text-red-300" : "text-white/60"
          }`}>
            {myBalance > 0.01
              ? `+${formatCurrency(myBalance, group.currency)}`
              : myBalance < -0.01
              ? `-${formatCurrency(Math.abs(myBalance), group.currency)}`
              : "All settled up! ✨"}
          </p>
          <p className="text-white/50 text-[11px] mt-0.5">
            {myBalance > 0.01 ? "you're owed money" : myBalance < -0.01 ? "you owe money" : "no pending dues"}
          </p>
        </div>
      </div>

      {/* Members dropdown */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 overflow-hidden"
          >
            <div className="glass-card p-3 mt-2 space-y-2">
              {group.members.map((m) => (
                <div key={m.user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)" }}
                  >
                    {getInitials(m.user.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {m.user.name} {m.user.id === session?.user?.id && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>(you)</span>}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{m.user.email}</p>
                  </div>
                  <span className="chip text-[10px]">{m.role}</span>
                </div>
              ))}
              {/* Invite code */}
              <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Invite Code</p>
                  <p className="font-mono font-bold tracking-wider">{group.inviteCode}</p>
                </div>
                <button onClick={copyInviteCode} className="btn btn-secondary btn-sm">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Confirmations Banner */}
      {pendingSettlements.length > 0 && (
        <div className="px-4 mt-3">
          <div className="glass-card p-3 border-amber-500/30" style={{ background: "oklch(0.35 0.08 70 / 0.3)" }}>
            <p className="text-xs font-semibold text-amber-300 mb-2">
              ⏳ {pendingSettlements.length} payment{pendingSettlements.length > 1 ? "s" : ""} awaiting your confirmation
            </p>
            {pendingSettlements.map((s) => (
              <div key={s.id} className="flex items-center justify-between mb-1">
                <p className="text-sm">
                  {s.fromUser.name} paid you {formatCurrency(s.amount, group.currency)}
                </p>
                <button
                  onClick={() => confirmSettlement(s.id)}
                  className="btn btn-sm text-xs"
                  style={{ background: "oklch(0.72 0.19 142)", color: "white" }}
                >
                  <Check className="w-3 h-3" /> Confirm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex rounded-xl p-1" style={{ background: "var(--color-surface-card)" }}>
          {(["expenses", "balances", "settle"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all capitalize`}
              style={activeTab === tab ? {
                background: "var(--color-surface-hover)",
                color: "var(--color-text-primary)",
              } : {
                color: "var(--color-text-muted)",
              }}
            >
              {tab === "settle" ? "Settle Up" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4 pb-6">
        {activeTab === "expenses" && (
          <div className="space-y-3">
            {group.expenses.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <div className="text-3xl mb-2">☕</div>
                <p className="font-semibold text-sm">No expenses yet</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  Treat someone to chai and add it here!
                </p>
              </div>
            ) : (
              group.expenses.map((exp, i) => {
                const category = EXPENSE_CATEGORIES.find((c) => c.value === exp.category);
                const mySplit = exp.splits.find((s) => s.userId === session?.user?.id);
                const isPayer = exp.paidBy.id === session?.user?.id;

                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                        style={{ background: "var(--color-surface-hover)" }}
                      >
                        {category?.emoji || "📝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{exp.description}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {exp.paidBy.name} paid · {getRelativeTime(new Date(exp.createdAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(exp.amount, group.currency)}</p>
                        {mySplit && (
                          <p className={`text-[11px] ${isPayer ? "balance-positive" : "balance-negative"}`}>
                            {isPayer
                              ? `you lent ${formatCurrency(exp.amount - mySplit.amountOwed, group.currency)}`
                              : `you owe ${formatCurrency(mySplit.amountOwed, group.currency)}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "balances" && balances && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
              Member Balances
            </h3>
            {balances.memberBalances.map((mb) => (
              <div key={mb.userId} className="glass-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)" }}
                >
                  {getInitials(mb.name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {mb.name} {mb.userId === session?.user?.id && <span style={{ color: "var(--color-text-muted)" }}>(you)</span>}
                  </p>
                </div>
                <p className={`font-bold text-sm ${
                  mb.netBalance > 0.01 ? "balance-positive" : mb.netBalance < -0.01 ? "balance-negative" : "balance-zero"
                }`}>
                  {mb.netBalance > 0.01
                    ? `+${formatCurrency(mb.netBalance, group.currency)}`
                    : mb.netBalance < -0.01
                    ? `-${formatCurrency(Math.abs(mb.netBalance), group.currency)}`
                    : "settled"}
                </p>
              </div>
            ))}

            {balances.simplifiedDebts.length > 0 && (
              <>
                <h3 className="text-sm font-semibold mt-4" style={{ color: "var(--color-text-secondary)" }}>
                  Simplified Debts
                </h3>
                {balances.simplifiedDebts.map((debt, i) => (
                  <div key={i} className="glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "oklch(0.63 0.24 25 / 0.15)", color: "var(--color-danger)" }}
                    >
                      {getInitials(debt.fromName)}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm">{debt.fromName}</span>
                      <ArrowRight className="w-3 h-3" style={{ color: "var(--color-text-muted)" }} />
                      <span className="text-sm">{debt.toName}</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: "var(--color-danger)" }}>
                      {formatCurrency(debt.amount, group.currency)}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === "settle" && (
          <SettleTab
            group={group}
            balances={balances}
            userId={session?.user?.id || ""}
            onSettle={fetchGroup}
          />
        )}
      </div>

      {/* FAB: Add Expense */}
      <button
        onClick={() => router.push(`/groups/${groupId}/add-expense`)}
        className="fab"
        title="Add Expense"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

// ─── Settle Tab Component ────────────────────────────────────────────────────
function SettleTab({
  group,
  balances,
  userId,
  onSettle,
}: {
  group: GroupData;
  balances: GroupBalances | null;
  userId: string;
  onSettle: () => void;
}) {
  const [settling, setSettling] = useState<string | null>(null);

  const myDebts =
    balances?.simplifiedDebts.filter((d) => d.fromUserId === userId) ?? [];

  const handleSettle = async (debt: SimplifiedDebt) => {
    setSettling(debt.toUserId);
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch(`http://localhost:8000/api/groups/${group.id}/settlements`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: debt.toUserId,
          amount: debt.amount,
          method: "CASH",
        }),
      });
      if (res.ok) {
        toast.success(`Marked ${formatCurrency(debt.amount, group.currency)} as paid to ${debt.toName}! Waiting for their confirmation.`);
        onSettle();
      }
    } catch {
      toast.error("Failed to create settlement");
    } finally {
      setSettling(null);
    }
  };

  if (myDebts.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="font-semibold text-sm">You&apos;re all settled up!</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          No pending payments — you&apos;re the responsible one 💪
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        These are the minimum transactions needed to settle all debts:
      </p>
      {myDebts.map((debt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm">
                Pay <span className="font-bold">{debt.toName}</span>
              </p>
              <p className="text-lg font-bold" style={{ color: "var(--color-danger)" }}>
                {formatCurrency(debt.amount, group.currency)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSettle(debt)}
              disabled={settling === debt.toUserId}
              className="btn btn-primary btn-sm flex-1"
            >
              {settling === debt.toUserId ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HandCoins className="w-3.5 h-3.5" /> Mark as Paid
                </>
              )}
            </button>
            <button
              onClick={() => {
                const upiLink = `upi://pay?pn=${encodeURIComponent(debt.toName)}&am=${debt.amount}&cu=${group.currency}`;
                window.open(upiLink);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Wallet className="w-3.5 h-3.5" /> UPI
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
