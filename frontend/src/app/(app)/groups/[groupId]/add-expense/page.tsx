"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency, EXPENSE_CATEGORIES } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  Receipt,
  User,
  DollarSign,
  SplitSquareVertical,
} from "lucide-react";

type Member = {
  user: { id: string; name: string };
  role: string;
};

type SplitType = "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES";

export default function AddExpensePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "General",
    paidById: "",
    splitType: "EQUAL" as SplitType,
  });
  
  // AI Scanning state
  const [scanning, setScanning] = useState(false);

  // For unequal / percentage / shares
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMembers = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        const allIds = new Set(data.members.map((m: Member) => m.user.id));
        setSelectedMembers(allIds);
        setForm((f) => ({ ...f, paidById: session?.user?.id || data.members[0]?.user.id }));
        // Init split values
        const vals: Record<string, string> = {};
        data.members.forEach((m: Member) => {
          vals[m.user.id] = "";
        });
        setSplitValues(vals);
      }
    };
    fetchMembers();
  }, [groupId, session]);

  const amount = parseFloat(form.amount) || 0;
  const activeMemberIds = Array.from(selectedMembers);

  // Compute preview splits client-side for display only
  const previewSplits = (() => {
    if (amount <= 0 || activeMemberIds.length === 0) return [];

    switch (form.splitType) {
      case "EQUAL":
        return activeMemberIds.map((id) => ({
          userId: id,
          amount: Math.round((amount / activeMemberIds.length) * 100) / 100,
        }));

      case "UNEQUAL":
        return activeMemberIds.map((id) => ({
          userId: id,
          amount: parseFloat(splitValues[id] || "0") || 0,
        }));

      case "PERCENTAGE":
        return activeMemberIds.map((id) => ({
          userId: id,
          amount: Math.round(((parseFloat(splitValues[id] || "0") || 0) / 100) * amount * 100) / 100,
        }));

      case "SHARES": {
        const totalShares = activeMemberIds.reduce(
          (s, id) => s + (parseFloat(splitValues[id] || "0") || 0), 0
        );
        return activeMemberIds.map((id) => ({
          userId: id,
          amount: totalShares > 0
            ? Math.round(((parseFloat(splitValues[id] || "0") || 0) / totalShares) * amount * 100) / 100
            : 0,
        }));
      }
    }
  })();

  const previewTotal = previewSplits.reduce((s, p) => s + p.amount, 0);
  const isValid = amount > 0 && form.description.trim() && activeMemberIds.length > 0;
  const splitValid = (() => {
    if (form.splitType === "EQUAL") return true;
    if (form.splitType === "UNEQUAL") return Math.abs(previewTotal - amount) < 0.02;
    if (form.splitType === "PERCENTAGE") {
      const totalPct = activeMemberIds.reduce((s, id) => s + (parseFloat(splitValues[id] || "0") || 0), 0);
      return Math.abs(totalPct - 100) < 0.1;
    }
    if (form.splitType === "SHARES") {
      return activeMemberIds.some((id) => (parseFloat(splitValues[id] || "0") || 0) > 0);
    }
    return true;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !splitValid) return;
    setLoading(true);

    try {
      const splitDetails: Record<string, number> = {};
      if (form.splitType !== "EQUAL") {
        activeMemberIds.forEach((id) => {
          splitDetails[id] = parseFloat(splitValues[id] || "0") || 0;
        });
      }

      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const res = await fetch(`http://localhost:8000/api/expenses`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          description: form.description,
          category: form.category,
          paidById: form.paidById,
          splitType: form.splitType,
          memberIds: activeMemberIds,
          splitDetails: form.splitType !== "EQUAL" ? splitDetails : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Expense added! 🧾");
        router.push(`/groups/${groupId}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add expense");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAIScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    toast.info("Scanning receipt with AI...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(f => ({
          ...f,
          amount: data.total_amount.toString(),
          description: data.vendor ? `Dinner at ${data.vendor}` : f.description,
          category: data.category_guess || f.category
        }));
        toast.success(`Scanned! Found ${data.items.length} items totaling ${data.total_amount}`);
      } else {
        toast.error("Failed to scan receipt");
      }
    } catch (err) {
      toast.error("Ensure the AI service (port 8000) is running!");
    } finally {
      setScanning(false);
      // reset file input
      e.target.value = '';
    }
  };

  const getMemberName = (id: string) => members.find((m) => m.user.id === id)?.user.name || "Unknown";

  return (
    <div className="p-4 responsive-container-lg pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-6">
        <div>
          <button onClick={() => router.back()} className="btn btn-ghost mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold mb-1">Add Expense</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Who paid for what? Let&apos;s split it up 💸
          </p>
        </div>
        
        {/* AI Scan Button */}
        <label className="btn btn-secondary text-xs cursor-pointer relative overflow-hidden">
          {scanning ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="text-lg">✨</span> AI Scan
            </span>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleAIScan}
            disabled={scanning}
          />
        </label>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount — BIG input */}
        <div className="glass-card p-6 text-center">
          <DollarSign className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--color-brand-400)" }} />
          <input
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="bg-transparent text-center text-4xl font-bold outline-none w-full"
            style={{ color: "var(--color-text-primary)" }}
            min="0"
            step="0.01"
            required
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Enter amount in INR
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
            What&apos;s this for?
          </label>
          <input
            type="text"
            placeholder="e.g. Dinner at Biryani Blues"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-base"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value })}
                className={`chip transition-all ${form.category === cat.value ? "ring-1" : ""}`}
                style={form.category === cat.value ? {
                  background: "var(--color-brand-600)",
                  color: "white",
                  ringColor: "var(--color-brand-400)",
                } : {}}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Who paid */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            <User className="w-3 h-3 inline mr-1" /> Who paid?
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                key={m.user.id}
                type="button"
                onClick={() => setForm({ ...form, paidById: m.user.id })}
                className={`chip transition-all ${form.paidById === m.user.id ? "ring-1" : ""}`}
                style={form.paidById === m.user.id ? {
                  background: "var(--color-brand-600)",
                  color: "white",
                } : {}}
              >
                {m.user.name} {m.user.id === session?.user?.id && "(you)"}
              </button>
            ))}
          </div>
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
            <SplitSquareVertical className="w-3 h-3 inline mr-1" /> Split Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["EQUAL", "UNEQUAL", "PERCENTAGE", "SHARES"] as SplitType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, splitType: type })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  form.splitType === type ? "" : ""
                }`}
                style={form.splitType === type ? {
                  background: "var(--color-brand-600)",
                  color: "white",
                } : {
                  background: "var(--color-surface-card)",
                  color: "var(--color-text-muted)",
                }}
              >
                {type === "EQUAL" ? "Equal" : type === "UNEQUAL" ? "Exact" : type === "PERCENTAGE" ? "%" : "Shares"}
              </button>
            ))}
          </div>
        </div>

        {/* Split Details (for non-equal types) */}
        {form.splitType !== "EQUAL" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass-card p-4 space-y-3"
          >
            <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {form.splitType === "UNEQUAL"
                ? "Enter exact amounts for each person"
                : form.splitType === "PERCENTAGE"
                ? "Enter percentage for each person (must total 100%)"
                : "Enter share weight for each person"}
            </p>

            {members
              .filter((m) => selectedMembers.has(m.user.id))
              .map((m) => (
                <div key={m.user.id} className="flex items-center gap-3">
                  <span className="text-sm flex-1 truncate">{m.user.name}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="0"
                      value={splitValues[m.user.id] || ""}
                      onChange={(e) =>
                        setSplitValues({ ...splitValues, [m.user.id]: e.target.value })
                      }
                      className="input-base w-24 text-right text-sm py-2"
                      min="0"
                      step={form.splitType === "SHARES" ? "1" : "0.01"}
                    />
                    <span className="text-xs w-6" style={{ color: "var(--color-text-muted)" }}>
                      {form.splitType === "PERCENTAGE" ? "%" : form.splitType === "SHARES" ? "×" : "₹"}
                    </span>
                  </div>
                </div>
              ))}

            {/* Live Preview */}
            {amount > 0 && (
              <div className="pt-3 border-t space-y-1" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  Live Preview
                </p>
                {previewSplits.map((s) => (
                  <div key={s.userId} className="flex justify-between text-xs">
                    <span style={{ color: "var(--color-text-muted)" }}>{getMemberName(s.userId)}</span>
                    <span className="font-medium">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-1 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <span>Total</span>
                  <span className={Math.abs(previewTotal - amount) < 0.02 ? "balance-positive" : "balance-negative"}>
                    {formatCurrency(previewTotal)} / {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isValid || !splitValid}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Receipt className="w-4 h-4" /> Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
}
