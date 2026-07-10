"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, LogOut, User, Mail } from "lucide-react";
import dynamic from "next/dynamic";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) return router.push("/login");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const res = await fetch("http://localhost:8000/api/users/me", { headers });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="responsive-container-md mt-8 p-4 pb-24">
      <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <SplitText text="Your Profile" className="text-2xl font-bold mb-6" delay={30} duration={0.4} splitType="chars" textAlign="left" tag="h1" />

      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin" /></div>
      ) : user ? (
        <div className="space-y-6">
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#335c52] text-white flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a2b3c]">{user.name}</h2>
              <p className="text-sm text-[#8e98a3] flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-4 px-6 rounded-2xl text-[15px] font-semibold text-white bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-500">Failed to load profile.</div>
      )}
    </div>
  );
}
