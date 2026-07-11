"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Search, Settings, Plus, Receipt, ArrowRightLeft, Bell, ChevronRight, Home, Users as UsersIcon, FileText, User, ScanLine } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const AVATARS = ["/avatar_1.png", "/avatar_2.png", "/avatar_3.png", "/avatar_4.png"];
const DEFAULT_COVER = "/travel_cover.png";

export default function GroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my");
  const [groups, setGroups] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) return router.push("/login");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const userRes = await fetch("http://localhost:8000/api/users/me", { headers, cache: "no-store" });
      if (userRes.ok) setUser(await userRes.json());
      
      const res = await fetch("http://localhost:8000/api/groups", { headers, cache: "no-store" });
      if (res.ok) {
        const baseGroups = await res.json();
        
        let fullGroups = [];
        for (const group of baseGroups) {
          try {
            const [groupRes, balRes] = await Promise.all([
              fetch(`http://localhost:8000/api/groups/${group.id}`, { headers, cache: "no-store" }),
              fetch(`http://localhost:8000/api/groups/${group.id}/balances`, { headers, cache: "no-store" })
            ]);
            if (groupRes.ok && balRes.ok) {
              fullGroups.push(await groupRes.json());
              const balData = await balRes.json();
              setBalances((prev: any) => ({ ...prev, [group.id]: balData }));
            }
          } catch (e) {}
        }
        setGroups(fullGroups);
      }
    };
    fetchData();
  }, [router]);

  const featuredGroup = groups[0];
  const otherGroups = groups.slice(1);

  const getMyBalance = (groupId: string): number => {
    const bal = balances[groupId];
    if (!bal || !user?.id) return 0;
    const mine = bal.memberBalances.find((m: any) => m.userId === user.id);
    return mine?.netBalance ?? 0;
  };

  const getCoverForGroup = (g: any) => {
    if (g.type === "TRIP") return "/travel_cover.png";
    if (g.name.toLowerCase().includes("home") || g.name.toLowerCase().includes("room")) return "/home_cover.png";
    if (g.name.toLowerCase().includes("food") || g.name.toLowerCase().includes("eat")) return "/food_cover.png";
    return "/travel_cover.png"; 
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] pb-24 overflow-x-hidden font-sans relative">
      {/* Hero Section */}
      <div className="relative pt-12 px-6">
        <div className="absolute top-0 right-0 w-[200px] h-[150px] pointer-events-none opacity-90" style={{ backgroundImage: "url('/ai-cat.png')", backgroundSize: "contain", backgroundPosition: "top right", backgroundRepeat: "no-repeat" }} />
        
        <div className="flex items-center justify-between relative z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="mt-6 relative z-10">
          <h1 className="text-[28px] font-bold text-[#1a2b3c] tracking-tight">My Groups</h1>
          <p className="text-[13px] text-[#8e98a3] mt-1 max-w-[200px] leading-snug">
            Manage your groups, members and shared expenses.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mt-8 bg-white p-1 rounded-[1.25rem] flex items-center shadow-sm border border-gray-100 relative z-10">
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-3 text-sm font-semibold rounded-[1rem] transition-colors flex justify-center items-center gap-2 ${
              activeTab === "my" ? "bg-[#f4f7f5] text-[#335c52]" : "text-[#8e98a3]"
            }`}
          >
            <UsersIcon className="w-4 h-4" /> My Groups
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-3 text-sm font-semibold rounded-[1rem] transition-colors flex justify-center items-center gap-2 ${
              activeTab === "discover" ? "bg-[#f4f7f5] text-[#335c52]" : "text-[#8e98a3]"
            }`}
          >
            <Search className="w-4 h-4" /> Discover Groups
          </button>
        </div>

        {/* Actions Grid for Groups */}
        <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
          <Link href="/groups/create" className="bg-white rounded-[1.25rem] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="text-[14px] font-bold text-[#1a2b3c]">Create Group</span>
          </Link>
          <Link href="/groups/join" className="bg-white rounded-[1.25rem] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[14px] font-bold text-[#1a2b3c]">Join Group</span>
          </Link>
        </div>

      </div>

      {featuredGroup ? (
        <div className="px-5 mt-6 relative z-10">
          <div className="bg-[#fcfdfc] border border-[#f0f4f2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[2rem] p-5 pb-6">
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden relative shadow-sm shrink-0">
                  <img src={getCoverForGroup(featuredGroup)} className="w-full h-full object-cover" alt="Group Cover" />
                </div>
                <div>
                  <h2 className="text-[19px] font-bold text-[#1a2b3c] tracking-tight">{featuredGroup.name} {featuredGroup.emoji}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#528f80] bg-[#eef5f3] px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#528f80]"></span>
                      Active
                    </span>
                    <span className="text-[12px] text-[#8e98a3] font-medium">• {featuredGroup.members.length} members</span>
                  </div>
                  <p className="text-[12px] text-[#8e98a3] mt-2 leading-relaxed">Let's make some unforgettable memories! ✨</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-[-30px]">
              <button className="flex items-center gap-1.5 text-[11px] font-semibold text-[#528f80] bg-white border border-[#eef5f3] px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50">
                <Settings className="w-3.5 h-3.5" /> Group Settings
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-6 border border-[#f0f4f2] rounded-2xl p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[10px] text-[#8e98a3] font-medium uppercase tracking-wider mb-1">You are owed</p>
                <div className="flex items-center gap-1">
                  <p className="text-[16px] font-bold text-[#335c52]">₹{Math.max(0, getMyBalance(featuredGroup.id)).toLocaleString('en-IN')}.<span className="text-sm">00</span></p>
                  {getMyBalance(featuredGroup.id) > 0 && <span className="w-4 h-4 bg-[#eef5f3] text-[#335c52] rounded-full flex items-center justify-center text-[10px]">↑</span>}
                </div>
              </div>
              <div className="border-l border-gray-100 pl-3">
                <p className="text-[10px] text-[#8e98a3] font-medium uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-[16px] font-bold text-[#1a2b3c]">₹{featuredGroup.expenses.reduce((a:any,b:any)=>a+b.amount,0).toLocaleString('en-IN')}.<span className="text-sm">00</span></p>
              </div>
              <div className="border-l border-gray-100 pl-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#8e98a3] font-medium uppercase tracking-wider mb-1">Expenses</p>
                  <p className="text-[16px] font-bold text-[#1a2b3c]">{featuredGroup.expenses.length}</p>
                </div>
                <div className="w-7 h-7 bg-[#eef5f3] rounded-lg flex items-center justify-center text-[#335c52]">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1a2b3c]">Members ({featuredGroup.members.length})</h3>
                <button className="text-[11px] font-semibold text-[#528f80] flex items-center">
                  View all <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {featuredGroup.members.slice(0, 5).map((m: any, i: number) => {
                  const isMe = m.userId === user?.id;
                  return (
                    <div key={m.id} className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src={AVATARS[i % AVATARS.length]} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <p className={`text-[11px] font-semibold ${isMe ? "text-[#528f80]" : "text-[#1a2b3c]"}`}>
                          {isMe ? "You" : m.user.name.split(" ")[0]}
                        </p>
                        {m.role === "ADMIN" && <p className="text-[9px] bg-[#eef5f3] text-[#528f80] px-1.5 py-0.5 rounded-full mt-0.5">Admin</p>}
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-col items-center gap-1.5 shrink-0 ml-2">
                  <button className="w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#528f80] hover:border-[#528f80] transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <p className="text-[11px] font-medium text-gray-500">Add</p>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              <Link href={`/add-expense?groupId=${featuredGroup.id}`} className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">Add<br/>Expense</span>
              </Link>
              <Link href="/scan-receipt" className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <ScanLine className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">Scan<br/>Receipt</span>
              </Link>
              <button className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">View<br/>Balances</span>
              </button>
              <button className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">Payment<br/>Reminder</span>
              </button>
            </div>

            {/* Recent Activity Mini */}
            <div className="mt-6 pt-5 border-t border-[#f0f4f2]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1a2b3c]">Recent Activity</h3>
                <button className="text-[11px] font-semibold text-[#528f80] flex items-center">
                  View all <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="space-y-3">
                {featuredGroup.expenses.slice(0, 2).map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#fdf5ed] flex items-center justify-center text-[#e89b5c]">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1a2b3c]">{exp.description}</p>
                        <p className="text-[11px] text-[#8e98a3]">Paid by {exp.paidBy?.name.split(" ")[0] || "Someone"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#528f80]">₹{exp.amount.toLocaleString('en-IN')}.<span className="text-[10px]">00</span></span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))}
                {featuredGroup.expenses.length === 0 && (
                  <p className="text-[12px] text-[#8e98a3] py-2 text-center">No recent activity</p>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="px-5 mt-6 text-center text-gray-500">No active groups found.</div>
      )}

      {/* Other Groups List */}
      {otherGroups.length > 0 && (
        <div className="px-5 mt-8 mb-6 relative z-10">
          <h3 className="text-[15px] font-bold text-[#1a2b3c] mb-4">Other Groups</h3>
          <div className="space-y-3">
            {otherGroups.map(group => {
              const bal = getMyBalance(group.id);
              return (
                <Link href={`/groups/${group.id}`} key={group.id} className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                      <img src={getCoverForGroup(group)} alt="cover" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1a2b3c]">{group.name} {group.emoji}</h4>
                      <p className="text-[12px] text-[#8e98a3] mt-0.5">{group.members.length} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] font-semibold ${bal > 0 ? "text-[#528f80]" : bal < 0 ? "text-red-500" : "text-gray-400"}`}>
                      {bal > 0 ? `You are owed ₹${bal}` : bal < 0 ? `You owe ₹${Math.abs(bal)}` : "Settled up"}
                    </span>
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Floating Nav - Identical to Mockup */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#fdfaf5] border-t border-gray-100 px-6 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-2">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#335c52]">
          <Home className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>
        <Link href="/groups" className="flex flex-col items-center gap-1.5 text-[#335c52]">
          <UsersIcon className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-bold">Groups</span>
        </Link>
        <Link href="/add-expense" className="flex flex-col items-center -mt-8">
          <div className="w-[56px] h-[56px] bg-[#335c52] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#335c52]/30 hover:scale-105 transition-transform border-4 border-white">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 mt-1">Add Expense</span>
        </Link>
        <Link href="/activity" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#335c52]">
          <FileText className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Activity</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-[#335c52]">
          <User className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>

    </div>
  );
}
