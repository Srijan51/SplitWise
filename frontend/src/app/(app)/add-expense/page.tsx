"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import { BottomNav } from "@/components/BottomNav";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

function AddExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const initialGroupId =
    searchParams.get("groupId") || searchParams.get("group_id") || "";

  const [form, setForm] = useState({
    groupId: initialGroupId,
    description: searchParams.get("desc") || "",
    amount: searchParams.get("amount") || "",
    paidById: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiFetch("/api/users/me");
        if (userRes.ok) {
          const u = await userRes.json();
          setUser(u);
          setForm((f) => ({ ...f, paidById: u.id }));
        } else {
          router.push("/login");
          return;
        }

        const groupsRes = await apiFetch("/api/groups");
        if (groupsRes.ok) {
          const g = await groupsRes.json();
          setGroups(g);
          if (g.length > 0 && !initialGroupId) {
            setForm((f) => ({ ...f, groupId: g[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load user or groups", err);
      }
    };
    fetchData();
  }, [router, initialGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.groupId || !form.amount || !form.description) return;
    setLoading(true);

    try {
      // Fetch group members to split equally
      const groupRes = await apiFetch(`/api/groups/${form.groupId}`);
      const group = await groupRes.json();

      const members = group.members || [];
      if (members.length === 0) throw new Error("Group has no members");

      const amount = parseFloat(form.amount);
      const splitAmount = Math.round((amount / members.length) * 100) / 100;

      const splits = members.map((m: any) => ({
        userId: m.userId || m.user?.id,
        amountOwed: splitAmount,
      }));

      const res = await apiFetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: form.groupId,
          description: form.description,
          amount: amount,
          paidById: form.paidById || user?.id,
          splitType: "EQUAL",
          splits: splits,
        }),
      });

      if (res.ok) {
        toast.success("Expense added successfully! 🧾");
        router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.detail || data.error || "Failed to add expense");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
        <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="responsive-container-md mt-6 p-4 pb-28 min-h-screen">
      <button
        onClick={() => router.back()}
        className="btn-ghost flex items-center gap-2 mb-6 text-sm hover:text-[#335c52]"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <SplitText
        text="Add Expense"
        className="text-2xl font-bold mb-6"
        delay={30}
        duration={0.4}
        splitType="chars"
        textAlign="left"
        tag="h1"
      />

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-gray-600">Group</label>
          <select
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
            className="w-full bg-[#fdfaf5] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#335c52] font-medium text-[14px]"
            required
          >
            {groups.length === 0 && <option value="">No groups available</option>}
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-gray-600">Description</label>
          <input
            type="text"
            placeholder="e.g. Dinner at Biryani Blues"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#fdfaf5] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#335c52] font-medium text-[14px]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 text-gray-600">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-[#fdfaf5] border border-gray-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-[#335c52] font-bold text-[16px]"
              required
              min="0.01"
              step="0.01"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || groups.length === 0}
          className="w-full py-4 px-6 rounded-2xl text-[15px] font-semibold text-white bg-[#335c52] flex items-center justify-center gap-2 hover:bg-[#284a42] shadow-[0_8px_20px_rgba(51,92,82,0.25)] transition-colors mt-8 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> Save Expense
            </>
          )}
        </button>
      </form>

      <BottomNav />
    </div>
  );
}

export default function AddExpensePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
          <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin" />
        </div>
      }
    >
      <AddExpenseForm />
    </Suspense>
  );
}
