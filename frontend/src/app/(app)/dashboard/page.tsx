"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/providers/socket-provider";
import { formatCurrency, getInitials } from "@/lib/utils";
import {
  Menu,
  Bell,
  Eye,
  ArrowRight,
  Users,
  Plus,
  Receipt,
  ChevronRight,
  Sparkles,
  Home,
  FileText,
  User,
  ArrowRightSquare
} from "lucide-react";

type GroupData = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  accentColor: string;
  currency: string;
  members: { id: string; name: string; avatarUrl: string | null; role: string }[];
  expenses: any[];
};

type BalanceData = {
  memberBalances: { userId: string; name: string; netBalance: number }[];
};

export default function DashboardPage() {
  const router = useRouter();
  
  // Hardcoded mock session for now
  const session = {
    user: { id: "alice-id-123", name: "Alice Srijan", email: "alice@example.com" }
  };

  const { socket } = useSocket();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [balances, setBalances] = useState<Record<string, BalanceData>>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Fetch base groups
      const res = await fetch("http://localhost:8000/api/groups", { headers });
      if (res.ok) {
        const baseGroups = await res.json();
        
        let allActivities: any[] = [];
        const fullGroups: GroupData[] = [];
        
        // Fetch full details and balances for each group
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
              setBalances((prev) => ({ ...prev, [group.id]: balData }));

              // Process expenses for recent activity
              if (groupData.expenses) {
                groupData.expenses.forEach((exp: any) => {
                  const mySplit = exp.splits?.find((s: any) => s.userId === session.user.id)?.amountOwed || 0;
                  const iPaid = exp.paidById === session.user.id;
                  const myShare = iPaid ? (exp.amount - mySplit) : -mySplit;

                  allActivities.push({
                    id: exp.id,
                    description: exp.description,
                    groupName: groupData.name,
                    groupEmoji: groupData.emoji,
                    paidBy: exp.paidBy?.name || "Someone",
                    iPaid,
                    amount: exp.amount,
                    myShare,
                    createdAt: new Date(exp.createdAt)
                  });
                });
              }
            }
          } catch (e) {
            console.error("Error fetching details for group", group.id, e);
          }
        }

        setGroups(fullGroups);
        
        // Sort activities by date descending
        allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setRecentActivities(allActivities);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto min-h-screen bg-[#fdfaf5] p-6 space-y-6 flex flex-col justify-center">
        <div className="skeleton h-32 w-full rounded-3xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="w-full max-w-lg mx-auto bg-[#fdfaf5] min-h-screen relative overflow-x-hidden flex flex-col pb-28 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4 relative z-20">
        <button className="w-11 h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Menu className="w-5 h-5 text-[#1a2b3c]" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="w-11 h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-[#1a2b3c]" />
            </button>
            <div className="absolute top-1 right-1 w-3 h-3 bg-[#528f80] border-2 border-white rounded-full"></div>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#1a2b3c] overflow-hidden flex items-center justify-center text-white font-bold shadow-sm border border-gray-200">
             {getInitials(session.user.name)}
          </div>
        </div>
      </div>

      {/* Greeting & Hero */}
      <div className="px-7 relative z-10 mt-6 max-w-[70%]">
        <h1 className="text-[1.75rem] font-bold text-[#1a2b3c] mb-1.5 tracking-tight">
          Good morning, <span className="text-[#335c52]">{firstName}</span>! 👋
        </h1>
        <p className="text-[#8e98a3] text-[15px]">Let&apos;s settle up and stress less.</p>
      </div>

      <div className="absolute top-[10px] right-[-20px] w-[340px] h-[340px] z-0 pointer-events-none">
        <div className="absolute inset-0 bg-no-repeat" style={{ 
          backgroundImage: "url('/dashboard-hero.png')", 
          backgroundSize: 'contain', 
          backgroundPosition: 'right top', 
          mixBlendMode: 'multiply',
          maskImage: 'radial-gradient(circle at 55% 45%, black 35%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 55% 45%, black 35%, transparent 70%)'
        }} />
      </div>

      {/* Balance Card */}
      <div className="px-6 mt-10 relative z-20">
        <div className="relative">
          {/* Main Left Card Body */}
          <div className="bg-white rounded-[2rem] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-50 relative z-10 w-[90%]">
            <div className="flex items-center gap-1.5 text-[13.5px] text-[#1a2b3c] font-semibold mb-2.5">
              Your overall balance <Eye className="w-4 h-4 text-[#8e98a3] ml-1" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[2.3rem] font-bold text-[#335c52] tracking-tight">{formatCurrency(totalOwed)}</span>
              {totalOwed > 0 && (
                <span className="text-[11px] font-bold text-[#335c52] bg-[#335c52]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                  you are owed
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#8e98a3] mb-7 font-medium">Across {groups.length} groups</p>
            
            <button className="bg-[#335c52] text-white px-7 py-3 rounded-full font-bold text-[13px] flex items-center gap-2 hover:bg-[#2a4d44] transition-colors shadow-sm">
              Settle up <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Wallet image (Popping out) */}
          <div className="absolute -right-[15px] -top-[45px] w-[190px] h-[190px] pointer-events-none z-20">
            <div className="absolute inset-0 bg-no-repeat" style={{ 
              backgroundImage: "url('/wallet-balance.png')", 
              backgroundSize: 'contain', 
              backgroundPosition: 'center', 
              mixBlendMode: 'multiply',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
            }} />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-6 mt-8 grid grid-cols-4 gap-2">
        <ActionButton icon={Users} label="Create Group" onClick={() => router.push("/groups/create")} />
        <ActionButton icon={ArrowRightSquare} label="Join Group" onClick={() => router.push("/groups/join")} />
        <ActionButton icon={Plus} label="Add Expense" onClick={() => router.push("/add-expense")} />
        <ActionButton icon={Receipt} label="Scan Receipt" badge="NEW" onClick={() => router.push("/scan-receipt")} />
      </div>

      {/* Your Groups Scroll */}
      <div className="mt-10">
        <div className="flex items-center justify-between px-6 mb-4">
          <h2 className="text-[1.1rem] font-bold text-[#1a2b3c]">Your groups</h2>
          <button className="text-[13px] font-bold text-[#335c52] flex items-center gap-0.5 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {groups.length === 0 ? (
          <div className="px-6 text-center text-sm text-[#8e98a3] py-4 bg-white mx-6 rounded-[1.25rem] border border-gray-100 shadow-sm">
            No groups yet. Create one to get started!
          </div>
        ) : (
          <div className="flex overflow-x-auto px-6 gap-4 pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {groups.map(group => {
              const balance = getMyBalance(group.id);
              return (
                <div key={group.id} onClick={() => router.push(`/groups/${group.id}`)} className="min-w-[150px] cursor-pointer bg-white rounded-[1.25rem] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col snap-start hover:shadow-md transition-shadow">
                  <div className="h-20 flex items-center justify-center text-4xl relative" style={{ backgroundColor: `${group.accentColor}15` }}>
                    {group.emoji}
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-bold text-[#1a2b3c] text-[14px] truncate">{group.name}</h3>
                    <p className="text-[11px] font-medium text-[#8e98a3] mb-3">{group.members?.length || 0} members</p>
                    <p className="text-[11px] font-semibold text-[#8e98a3] mb-0.5">
                      {balance > 0 ? "You are owed" : balance < 0 ? "You owe" : "All settled"}
                    </p>
                    <p className={`font-bold text-[15px] tracking-tight ${balance > 0 ? "text-[#335c52]" : balance < 0 ? "text-[#e75a5a]" : "text-[#8e98a3]"}`}>
                      {balance === 0 ? "₹0.00" : formatCurrency(Math.abs(balance))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1.1rem] font-bold text-[#1a2b3c]">Recent activity</h2>
          <button className="text-[13px] font-bold text-[#335c52] flex items-center gap-0.5 hover:underline">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {recentActivities.length === 0 ? (
          <div className="text-center text-sm text-[#8e98a3] py-4 bg-white mx-6 rounded-[1.25rem] border border-gray-100 shadow-sm">
            No recent activity.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentActivities.slice(0, 3).map(act => (
              <div key={act.id} className="flex items-center gap-3.5 bg-white p-3.5 rounded-[1.25rem] border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#f8f9fa] border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                  {act.groupEmoji || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-[#1a2b3c] truncate">{act.description}</h4>
                  <p className="text-[11px] text-[#8e98a3] flex items-center gap-1.5 font-medium mt-0.5 truncate">
                    {act.groupName} <span className="w-1 h-1 rounded-full bg-[#cbd5e1]"></span> Paid by {act.iPaid ? "You" : act.paidBy}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-[14px] font-bold ${act.myShare > 0 ? 'text-[#335c52]' : act.myShare < 0 ? 'text-[#e75a5a]' : 'text-[#8e98a3]'}`}>
                    {act.myShare > 0 ? '+ ' : act.myShare < 0 ? '- ' : ''}{formatCurrency(Math.abs(act.myShare))}
                  </p>
                  <p className="text-[10px] font-medium text-[#8e98a3] mt-0.5">
                    {act.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Banner */}
      <div className="mt-8 px-6 mb-20">
        <div className="bg-gradient-to-r from-[#eff6f3] to-[#e4f0ea] rounded-[1.25rem] p-4 flex items-center relative overflow-hidden border border-[#d2e4dd] shadow-sm">
          <div className="w-[85px] h-[85px] flex-shrink-0 relative -ml-3 -mb-8">
             <div className="absolute inset-0 bg-no-repeat" style={{ 
               backgroundImage: "url('/ai-cat.png')", 
               backgroundSize: 'contain', 
               backgroundPosition: 'bottom center', 
               mixBlendMode: 'multiply',
               maskImage: 'radial-gradient(circle at center, black 45%, transparent 70%)',
               WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 70%)'
             }} />
          </div>
          <div className="ml-2 flex-1 relative z-10">
            <h3 className="text-[13px] font-bold text-[#1a2b3c]">Settle smart, not hard.</h3>
            <p className="text-[11px] text-[#5c6e7d] mt-0.5 mb-2.5 leading-tight font-medium pr-2">Let SplitWise AI suggest the easiest way to settle up.</p>
          </div>
          <button className="bg-[#335c52] text-white text-[11px] font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 flex-shrink-0 relative z-10 shadow-sm hover:bg-[#2a4d44] transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#a8dfc8]" /> Try AI Settle
          </button>
        </div>
      </div>

      {/* Bottom Nav Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] pointer-events-none pb-safe">
        <div className="w-full max-w-md mx-auto flex justify-between items-center px-6 py-3 pointer-events-auto">
          <NavItem icon={Home} label="Dashboard" active onClick={() => router.push('/dashboard')} />
          <NavItem icon={Users} label="Groups" onClick={() => router.push('/groups')} />
          
          {/* Floating Add Button */}
          <div className="relative -top-7 flex flex-col items-center cursor-pointer" onClick={() => router.push('/add-expense')}>
            <button className="w-14 h-14 bg-[#335c52] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(51,92,82,0.3)] border-[5px] border-[#fdfaf5] hover:scale-105 transition-transform">
              <Plus className="w-6 h-6" />
            </button>
            <span className="absolute -bottom-5 text-[10px] font-bold text-[#1a2b3c] whitespace-nowrap">Add Expense</span>
          </div>

          <NavItem icon={FileText} label="Activity" onClick={() => router.push('/activity')} />
          <NavItem icon={User} label="Profile" onClick={() => router.push('/profile')} />
        </div>
      </div>
      
      {/* Global styles for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}

function ActionButton({ icon: Icon, label, badge, onClick }: { icon: any, label: string, badge?: string, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2.5 cursor-pointer group" onClick={onClick}>
      <div className="relative">
        <div className="w-[3.75rem] h-[3.75rem] rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center text-[#335c52] group-hover:bg-[#f3f8f6] transition-colors">
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        {badge && (
          <span className="absolute -top-1 -right-2 bg-[#618a7d] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-[#fdfaf5]">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[12px] font-bold text-[#1a2b3c] text-center leading-tight px-1">{label}</span>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={onClick}>
      <Icon className={`w-5 h-5 ${active ? 'text-[#335c52]' : 'text-[#8e98a3] group-hover:text-[#335c52]'} transition-colors`} strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[10px] ${active ? 'font-bold text-[#335c52]' : 'font-medium text-[#8e98a3] group-hover:text-[#335c52]'} transition-colors`}>{label}</span>
    </div>
  );
}
