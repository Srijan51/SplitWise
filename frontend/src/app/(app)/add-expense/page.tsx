"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Receipt, Users } from "lucide-react";
import dynamic from "next/dynamic";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

function AddExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [form, setForm] = useState({
    groupId: "",
    description: searchParams.get("desc") || "",
    amount: searchParams.get("amount") || "",
    paidById: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) return router.push("/login");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const userRes = await fetch("http://localhost:8000/api/users/me", { headers });
      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u);
        setForm(f => ({ ...f, paidById: u.id }));
      }
      
      const groupsRes = await fetch("http://localhost:8000/api/groups", { headers });
      if (groupsRes.ok) {
        const g = await groupsRes.json();
        setGroups(g);
        if (g.length > 0) {
          setForm(f => ({ ...f, groupId: g[0].id }));
        }
      }
    };
    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.groupId || !form.amount || !form.description) return;
    setLoading(true);
    
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      
      // Fetch group members to split equally
      const groupRes = await fetch(`http://localhost:8000/api/groups/${form.groupId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const group = await groupRes.json();
      
      const members = group.members || [];
      if (members.length === 0) throw new Error("Group has no members");
      
      const amount = parseFloat(form.amount);
      const splitAmount = amount / members.length;
      
      const splits = members.map((m: any) => ({
        userId: m.userId,
        amountOwed: splitAmount
      }));
      
      const res = await fetch("http://localhost:8000/api/expenses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          groupId: form.groupId,
          description: form.description,
          amount: amount,
          paidById: form.paidById || user?.id,
          splitType: "EQUAL",
          splits: splits
        }),
      });

      if (res.ok) {
        toast.success("Expense added successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to add expense");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="responsive-container-md mt-8 p-4 pb-24">
      <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <SplitText text="Add Expense" className="text-2xl font-bold mb-6" delay={30} duration={0.4} splitType="chars" textAlign="left" tag="h1" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">Group</label>
          <select 
            value={form.groupId}
            onChange={(e) => setForm({...form, groupId: e.target.value})}
            className="input-base w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#335c52]"
            required
          >
            {groups.length === 0 && <option value="">No groups available</option>}
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">Description</label>
          <input
            type="text"
            placeholder="e.g. Dinner at Biryani Blues"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-base w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#335c52]"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-base w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-[#335c52]"
              required
              min="0.01"
              step="0.01"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || groups.length === 0}
          className="w-full py-4 px-6 rounded-2xl text-[15px] font-semibold text-white bg-[#335c52] flex items-center justify-center gap-2 hover:bg-[#284a42] shadow-[0_8px_20px_rgba(51,92,82,0.25)] transition-colors mt-8"
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
    </div>
  );
}

export default function AddExpensePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center mt-20">Loading...</div>}>
      <AddExpenseForm />
    </Suspense>
  );
}
