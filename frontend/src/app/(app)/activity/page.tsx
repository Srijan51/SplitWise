"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) return router.push("/login");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const res = await fetch("http://localhost:8000/api/activities", { headers });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  return (
    <div className="responsive-container-md mt-8 p-4 pb-24">
      <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <SplitText text="Recent Activity" className="text-2xl font-bold mb-6" delay={30} duration={0.4} splitType="chars" textAlign="left" tag="h1" />

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin" /></div>
      ) : activities.length === 0 ? (
        <div className="text-center p-12 glass-card">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="glass-card p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">
                {act.groupEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a2b3c] truncate">{act.description}</p>
                <p className="text-xs text-[#8e98a3] mt-0.5 truncate">
                  {act.paidBy} paid ₹{act.amount.toFixed(2)} in {act.groupName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${act.myShare > 0 ? "text-[#335c52]" : act.myShare < 0 ? "text-red-500" : "text-gray-400"}`}>
                  {act.myShare > 0 ? "+" : ""}{act.myShare === 0 ? "Not involved" : `₹${act.myShare.toFixed(2)}`}
                </p>
                <p className="text-[10px] text-[#8e98a3] mt-1">{new Date(act.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
