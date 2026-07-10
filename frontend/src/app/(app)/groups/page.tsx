"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Settings, Receipt, ScanLine, ArrowRightLeft, Bell, Home, Users, Plus, Clock, User, ChevronRight, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

export default function GroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [groups, setGroups] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        if (!token) return router.push("/login");
        const headers = { "Authorization": `Bearer ${token}` };
        
        const userRes = await fetch("http://localhost:8000/api/users/me", { headers });
        if (userRes.ok) {
          setSession({ user: await userRes.json() });
        }

        const res = await fetch("http://localhost:8000/api/groups", { headers });
        if (res.ok) {
          const baseGroups = await res.json();
          let allActivities: any[] = [];
          const fullGroups = [];

          for (const group of baseGroups) {
            try {
              const [groupRes, balRes] = await Promise.all([
                fetch(`http://localhost:8000/api/groups/${group.id}`, { headers }),
                fetch(`http://localhost:8000/api/groups/${group.id}/balances`, { headers })
              ]);

              if (groupRes.ok && balRes.ok) {
                const groupData = await groupRes.json();
                const balData = await balRes.json();
                fullGroups.push(groupData);
                setBalances((prev: any) => ({ ...prev, [group.id]: balData }));

                if (groupData.expenses) {
                  groupData.expenses.forEach((exp: any) => {
                    const mySplit = exp.splits?.find((s: any) => s.userId === session?.user?.id)?.amountOwed || 0;
                    const iPaid = exp.paidById === session?.user?.id;
                    const myShare = iPaid ? (exp.amount - mySplit) : -mySplit;

                    allActivities.push({
                      id: exp.id,
                      description: exp.description,
                      groupName: groupData.name,
                      paidBy: exp.paidBy?.name || "Someone",
                      amount: exp.amount,
                      myShare,
                      createdAt: new Date(exp.createdAt)
                    });
                  });
                }
              }
            } catch (e) {
              console.error(e);
            }
          }
          setGroups(fullGroups);
          allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setActivities(allActivities);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, session?.user?.id]);

  const getMyBalance = (groupId: string) => {
    const bal = balances[groupId];
    if (!bal || !session?.user?.id) return 0;
    return bal.memberBalances?.find((m: any) => m.userId === session.user.id)?.netBalance || 0;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Math.abs(amount));
  };

  const getCoverImage = (index: number) => {
    const covers = ["/cover_travel.png", "/cover_food.png", "/cover_home.png", "/cover_event.png"];
    return covers[index % covers.length];
  };

  const getAvatar = (index: number) => {
    const avatars = ["/avatar_1.png", "/avatar_2.png", "/avatar_1.png", "/avatar_2.png"];
    return avatars[index % avatars.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
        <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin"></div>
      </div>
    );
  }

  const featuredGroup = groups.length > 0 ? groups[0] : null;
  const otherGroups = groups.length > 1 ? groups.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#fdfaf5] pb-28 relative">
      {/* Dynamic Header Image (similar to dashboard) */}
      <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 pointer-events-none opacity-90 z-0">
        <img src="/logo.png" alt="Decoration" className="w-full h-full object-contain object-right-top" style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.05))" }} />
      </div>

      <div className="relative z-10 responsive-container-md pt-8 px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1a2b3c] hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1a2b3c] hover:bg-gray-50 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Title Area */}
        <div className="mb-6">
          <SplitText text="My Groups" className="text-3xl font-bold mb-2 text-[#1a2b3c]" delay={30} duration={0.4} splitType="chars" textAlign="left" tag="h1" />
          <p className="text-[#8e98a3] text-sm max-w-[240px] leading-relaxed">
            Manage your groups, members and shared expenses.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="bg-[#f0f6f4] rounded-2xl p-1.5 flex mb-8">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'my' ? 'bg-white text-[#335c52] shadow-sm' : 'text-[#8e98a3]'}`}
            onClick={() => setActiveTab('my')}
          >
            <Users className="w-4 h-4" /> My Groups
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'discover' ? 'bg-white text-[#335c52] shadow-sm' : 'text-[#8e98a3]'}`}
            onClick={() => setActiveTab('discover')}
          >
            <Search className="w-4 h-4" /> Discover Groups
          </button>
        </div>

        {activeTab === 'my' && (
          <div className="space-y-6">
            {featuredGroup ? (
              <div className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                {/* Featured Group Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm relative">
                    <img src={getCoverImage(0)} alt="Cover" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center text-3xl">{featuredGroup.emoji}</div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-xl font-bold text-[#1a2b3c] mb-1.5">{featuredGroup.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8e98a3] mb-2">
                      <span className="flex items-center gap-1 text-[#335c52] bg-[#f0f6f4] px-2 py-0.5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#335c52]"></div> Active
                      </span>
                      <span>•</span>
                      <span>{featuredGroup.members?.length || 0} members</span>
                    </div>
                    <p className="text-[13px] text-[#8e98a3]">Let's make some unforgettable memories! ✨</p>
                  </div>
                  <button className="shrink-0 text-[#335c52] text-xs font-bold border border-[#dce4e1] rounded-full px-3 py-1.5 flex items-center gap-1 hover:bg-[#f0f6f4] transition-colors">
                    <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Group Settings</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-6">
                  <div>
                    <p className="text-[11px] text-[#8e98a3] font-medium mb-1">
                      {getMyBalance(featuredGroup.id) >= 0 ? "You are owed" : "You owe"}
                    </p>
                    <p className={`text-lg font-bold flex items-center gap-1 ${getMyBalance(featuredGroup.id) >= 0 ? 'text-[#335c52]' : 'text-red-500'}`}>
                      {formatMoney(getMyBalance(featuredGroup.id))}
                      {getMyBalance(featuredGroup.id) >= 0 && <span className="w-4 h-4 rounded-full bg-[#f0f6f4] text-[#335c52] flex items-center justify-center text-[10px]">↑</span>}
                    </p>
                  </div>
                  <div className="border-l border-gray-100 pl-4">
                    <p className="text-[11px] text-[#8e98a3] font-medium mb-1">Total Spent</p>
                    <p className="text-lg font-bold text-[#1a2b3c]">
                      {formatMoney(featuredGroup.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0)}
                    </p>
                  </div>
                  <div className="border-l border-gray-100 pl-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-[#8e98a3] font-medium mb-1">Expenses</p>
                      <p className="text-lg font-bold text-[#1a2b3c]">{featuredGroup.expenses?.length || 0}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#f0f6f4] flex items-center justify-center shrink-0 ml-1">
                      <Receipt className="w-4 h-4 text-[#335c52]" />
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-[#1a2b3c]">Members ({featuredGroup.members?.length || 0})</h3>
                    <button className="text-[11px] font-bold text-[#335c52] flex items-center hover:underline">View all <ChevronRight className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {featuredGroup.members?.map((m: any, i: number) => (
                      <div key={m.userId} className="flex flex-col items-center gap-1.5 shrink-0">
                        <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-sm overflow-hidden bg-[#f0f6f4]">
                           <img src={getAvatar(i)} alt={m.user.name} className="w-full h-full object-cover scale-110" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                        <span className="text-[11px] font-medium text-[#8e98a3]">
                          {m.userId === session?.user?.id ? "You" : m.user.name.split(' ')[0]}
                        </span>
                        {m.role === 'ADMIN' && <span className="text-[9px] text-[#335c52] bg-[#f0f6f4] px-1.5 rounded font-medium">Admin</span>}
                      </div>
                    ))}
                    <button className="flex flex-col items-center gap-1.5 shrink-0 ml-2">
                      <div className="w-14 h-14 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#335c52] hover:text-[#335c52] transition-colors bg-gray-50">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-[#8e98a3]">Add</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <Link href="/add-expense" className="flex flex-col items-center gap-2 p-3 rounded-[1rem] bg-white border border-gray-100 shadow-sm hover:border-[#335c52]/30 hover:shadow-md transition-all group">
                    <Receipt className="w-5 h-5 text-[#335c52] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-tight">Add Expense</span>
                  </Link>
                  <Link href="/scan-receipt" className="flex flex-col items-center gap-2 p-3 rounded-[1rem] bg-white border border-gray-100 shadow-sm hover:border-[#335c52]/30 hover:shadow-md transition-all group">
                    <ScanLine className="w-5 h-5 text-[#335c52] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-tight">Scan Receipt</span>
                  </Link>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-[1rem] bg-white border border-gray-100 shadow-sm hover:border-[#335c52]/30 hover:shadow-md transition-all group">
                    <ArrowRightLeft className="w-5 h-5 text-[#335c52] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-tight">View Balances</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-[1rem] bg-white border border-gray-100 shadow-sm hover:border-[#335c52]/30 hover:shadow-md transition-all group">
                    <Bell className="w-5 h-5 text-[#335c52] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-center leading-tight">Payment Reminder</span>
                  </button>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-[#1a2b3c]">Recent Activity</h3>
                    <button className="text-[11px] font-bold text-[#335c52] flex items-center hover:underline">View all <ChevronRight className="w-3 h-3" /></button>
                  </div>
                  <div className="space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                    {activities.filter(a => a.groupName === featuredGroup.name).slice(0, 2).map((act, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 relative bg-white">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${i % 2 === 0 ? 'bg-[#fff0e6] text-[#ff8c42]' : 'bg-[#e6f0ff] text-[#4287ff]'}`}>
                          {i % 2 === 0 ? <Receipt className="w-4 h-4" /> : <ScanLine className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0 pt-1 border-b border-gray-50 pb-3">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className="text-[13px] font-bold text-[#1a2b3c] truncate">{act.description}</p>
                            <p className={`text-[13px] font-bold shrink-0 ${act.myShare >= 0 ? 'text-[#335c52]' : 'text-red-500'}`}>
                              {formatMoney(act.myShare)} <ChevronRight className="w-3 h-3 text-gray-300 inline-block" />
                            </p>
                          </div>
                          <p className="text-[11px] text-[#8e98a3]">
                            Paid by {act.paidBy} • {act.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activities.filter(a => a.groupName === featuredGroup.name).length === 0 && (
                      <p className="text-[11px] text-center text-gray-400 py-4">No activity yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
               <div className="text-center py-12">
                 <p className="text-gray-500">You haven't joined any groups yet.</p>
               </div>
            )}

            {/* Other Groups */}
            {otherGroups.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[1.1rem] font-bold text-[#1a2b3c] mb-4 px-1">Other Groups</h3>
                <div className="space-y-3">
                  {otherGroups.map((g, i) => {
                    const bal = getMyBalance(g.id);
                    return (
                      <div key={g.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 relative bg-[#f0f6f4]">
                           <img src={getCoverImage(i + 1)} alt="Cover" className="w-full h-full object-cover p-1.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                           <div className="absolute inset-0 bg-black/5 flex items-center justify-center text-xl">{g.emoji}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#1a2b3c] text-[15px] truncate flex items-center gap-1">
                            {g.name}
                          </h4>
                          <p className="text-[11px] text-[#8e98a3] mt-0.5">{g.members?.length || 0} members</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[12px] font-bold ${bal >= 0 ? 'text-[#335c52]' : 'text-red-500'}`}>
                            {bal >= 0 ? `You are owed ${formatMoney(bal)}` : `You owe ${formatMoney(bal)}`}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 p-1 pl-2 border-l border-gray-100 ml-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1a2b3c] mb-2">Discover Groups</h3>
            <p className="text-sm text-[#8e98a3]">Join public groups or use an invite code.</p>
            <Link href="/groups/join" className="btn btn-primary mt-6 inline-flex shadow-[0_8px_20px_rgba(51,92,82,0.25)] hover:shadow-lg">Enter Invite Code</Link>
          </div>
        )}
      </div>

      {/* Floating Action Button & Bottom Nav (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Link href="/add-expense" className="w-14 h-14 bg-[#335c52] rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(51,92,82,0.4)] hover:bg-[#284a42] transition-transform hover:scale-105">
            <Plus className="w-6 h-6" />
          </Link>
        </div>
        <div className="bg-white border-t border-gray-100 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] flex justify-between items-center px-6 py-4 pb-safe relative">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#8e98a3] hover:text-[#335c52] transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </Link>
          <Link href="/groups" className="flex flex-col items-center gap-1 text-[#335c52] transition-colors pr-8">
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">Groups</span>
          </Link>
          
          <Link href="/activity" className="flex flex-col items-center gap-1 text-[#8e98a3] hover:text-[#335c52] transition-colors pl-8">
            <Receipt className="w-6 h-6" />
            <span className="text-[10px] font-bold">Activity</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-[#8e98a3] hover:text-[#335c52] transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
