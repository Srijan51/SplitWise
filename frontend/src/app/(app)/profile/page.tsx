"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Mail, ShieldCheck, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { apiFetch, removeToken } from "@/lib/api";
import { BottomNav } from "@/components/BottomNav";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groupCount, setGroupCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiFetch("/api/users/me");
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data);
        } else {
          router.push("/login");
          return;
        }

        const groupsRes = await apiFetch("/api/groups");
        if (groupsRes.ok) {
          const groups = await groupsRes.json();
          setGroupCount(groups.length);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="responsive-container-md mt-6 p-4 pb-28 min-h-screen">
      <button
        onClick={() => router.push("/dashboard")}
        className="btn-ghost flex items-center gap-2 mb-6 text-sm hover:text-[#335c52]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <SplitText
        text="Your Profile"
        className="text-2xl font-bold mb-6"
        delay={30}
        duration={0.4}
        splitType="chars"
        textAlign="left"
        tag="h1"
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="glass-card p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-[#f4f7f5]">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "user"}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#1a2b3c] truncate">{user.name}</h2>
              <p className="text-sm text-[#8e98a3] flex items-center gap-1.5 mt-1 truncate">
                <Mail className="w-4 h-4 shrink-0" /> {user.email}
              </p>
            </div>
          </div>

          {/* User stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eef5f3] flex items-center justify-center text-[#335c52]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#8e98a3] font-medium">Joined Groups</p>
                <p className="text-lg font-bold text-[#1a2b3c]">{groupCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eef5f3] flex items-center justify-center text-[#335c52]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#8e98a3] font-medium">Account Status</p>
                <p className="text-sm font-bold text-[#335c52]">Verified</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 px-6 rounded-2xl text-[15px] font-semibold text-white bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">Failed to load profile.</div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav active="profile" />
    </div>
  );
}
