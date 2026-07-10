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
  
  const { socket } = useSocket();
  const [session, setSession] = useState<any>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [balances, setBalances] = useState<Record<string, BalanceData>>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      if (!token) {
        router.push("/login");
        return;
      }
      const headers = { "Authorization": `Bearer ${token}` };
      
      const userRes = await fetch("http://localhost:8000/api/users/me", { headers });
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      setSession({ user: userData });

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
                  const mySplit = exp.splits?.find((s: any) => s.userId === userData.id)?.amountOwed || 0;
                  const iPaid = exp.paidById === userData.id;
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

  let totalOwed = 0;
  if (session) {
    Object.values(balances).forEach((bal: any) => {
      const myBal = bal.memberBalances?.find((m: any) => m.userId === session.user.id)?.netBalance || 0;
      totalOwed += myBal;
    });
  }

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'User';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
        <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin"></div>
      </div>
    );
  }


  const renderGroups = () => (
    <div className="mt-10 md:mt-8">
      <div className="flex items-center justify-between px-6 md:px-8 mb-4">
        <h2 className="text-[1.1rem] md:text-[1.15rem] font-bold text-[#1a2b3c]">Your groups</h2>
        <button className="text-[13px] font-bold text-[#335c52] flex items-center gap-0.5 hover:underline">
          View all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {groups.length === 0 ? (
        <div className="px-6 text-center text-sm text-[#8e98a3] py-4 bg-[#f9fafa] md:bg-white mx-6 md:mx-8 rounded-[1.25rem] border border-gray-100 shadow-sm">
          No groups yet. Create one to get started!
        </div>
      ) : (
        <div className="flex overflow-x-auto px-6 md:px-8 gap-4 pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {groups.map(group => {
            const balance = getMyBalance(group.id);
            return (
              <div key={group.id} onClick={() => router.push(`/groups/${group.id}`)} className="min-w-[150px] cursor-pointer bg-white rounded-[1.25rem] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col snap-start hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                <div className="h-20 flex items-center justify-center text-4xl relative" style={{ backgroundColor: `${group.accentColor}15` }}>
                  {group.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1a2b3c] text-[15px] truncate mb-0.5">{group.name}</h3>
                  <p className="text-[11px] font-medium text-[#8e98a3] mb-3">{group.members?.length || 0} members</p>
                  <p className="text-[11px] font-semibold text-[#8e98a3] mb-0.5">
                    {balance > 0 ? "You are owed" : balance < 0 ? "You owe" : "All settled"}
                  </p>
                  <p className={`font-bold text-[16px] tracking-tight ${balance > 0 ? "text-[#335c52]" : balance < 0 ? "text-[#e75a5a]" : "text-[#8e98a3]"}`}>
                    {balance === 0 ? "₹0.00" : formatCurrency(Math.abs(balance))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="mt-6 md:mt-10 px-6 md:px-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[1.1rem] md:text-[1.15rem] font-bold text-[#1a2b3c]">Recent activity</h2>
        <button className="text-[13px] font-bold text-[#335c52] flex items-center gap-0.5 hover:underline">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {recentActivities.length === 0 ? (
        <div className="text-center text-sm text-[#8e98a3] py-4 bg-[#f9fafa] md:bg-white rounded-[1.25rem] border border-gray-100 shadow-sm mx-6 md:mx-0">
          No recent activity.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentActivities.slice(0, 4).map(act => (
            <div key={act.id} className="flex items-center gap-3.5 bg-white p-3.5 rounded-[1.25rem] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:bg-[#fcfdfd] transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-[#f4f7f6] group-hover:bg-white border border-gray-100 group-hover:border-[#e0ebe7] flex items-center justify-center text-xl shadow-sm transition-colors duration-300">
                {act.groupEmoji || '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-[#1a2b3c] truncate group-hover:text-[#335c52] transition-colors">{act.description}</h4>
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
  );

  const renderAIBanner = () => (
    <div className="mt-8 md:mt-10 px-6 md:px-8 mb-20 md:mb-8">
      <div className="bg-gradient-to-r from-[#eff6f3] to-[#e4f0ea] rounded-[1.25rem] p-4 flex items-center relative overflow-hidden border border-[#d2e4dd] shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="w-[85px] h-[85px] flex-shrink-0 relative -ml-3 -mb-8 transition-transform duration-500 hover:scale-110">
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
          <h3 className="text-[13px] font-bold text-[#1a2b3c]">Settle smart.</h3>
          <p className="text-[11px] text-[#5c6e7d] mt-0.5 mb-2.5 leading-tight font-medium pr-2">Let AI suggest the easiest way to settle up.</p>
        </div>
        <button className="bg-[#335c52] text-white text-[11px] font-bold px-3 py-2 rounded-full flex items-center gap-1.5 flex-shrink-0 relative z-10 shadow-sm hover:bg-[#2a4d44]">
          <Sparkles className="w-3.5 h-3.5 text-[#a8dfc8]" /> Try AI
        </button>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="hidden md:block px-6 md:px-10 mt-10 relative z-20">
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-50 w-full hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)] transition-shadow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-[#1a2b3c] text-[18px]">Weekly Spending</h3>
            <p className="text-[#8e98a3] text-[13px] font-medium mt-1">Your expenses across all groups</p>
          </div>
          <select className="bg-[#fdfaf5] border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1a2b3c] outline-none cursor-pointer hover:bg-gray-50 transition-colors">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        
        <div className="flex items-end justify-between h-40 gap-3 mt-4">
          {/* Mon */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#335c52] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '40%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Mon</span>
          </div>
          {/* Tue */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#a8dfc8] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '70%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Tue</span>
          </div>
          {/* Wed */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#335c52] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '30%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Wed</span>
          </div>
          {/* Thu */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#335c52] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '90%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Thu</span>
          </div>
          {/* Fri */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#a8dfc8] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '50%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Fri</span>
          </div>
          {/* Sat */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#335c52] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '20%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Sat</span>
          </div>
          {/* Sun */}
          <div className="flex flex-col items-center flex-1 gap-3 group">
            <div className="w-full bg-[#fdfaf5] rounded-t-xl relative flex items-end justify-center h-full overflow-hidden">
              <div className="w-full bg-[#335c52] rounded-t-xl group-hover:bg-[#528f80] transition-colors" style={{ height: '60%' }}></div>
            </div>
            <span className="text-[12px] font-bold text-[#8e98a3] group-hover:text-[#1a2b3c] transition-colors">Sun</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#fdfaf5] min-h-screen relative flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR (Desktop Only) */}
      <div className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-100 h-screen sticky top-0 py-8 px-6 z-20">
        {/* Logo */}
        <div className="flex items-center mb-10 px-0 cursor-pointer">
          <img src="/logo.png" alt="SplitWise Logo" className="h-auto w-[200px] md:w-[220px] object-contain" />
        </div>
        
        <div className="flex flex-col gap-2">
           <SidebarNavItem icon={Home} label="Dashboard" active onClick={() => router.push('/dashboard')} />
           <SidebarNavItem icon={Users} label="Groups" onClick={() => router.push('/groups')} />
           <SidebarNavItem icon={FileText} label="Activity" onClick={() => router.push('/activity')} />
           <SidebarNavItem icon={User} label="Profile" onClick={() => router.push('/profile')} />
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button onClick={() => router.push('/add-expense')} className="w-full bg-[#335c52] text-white py-3.5 rounded-[1rem] font-bold flex items-center justify-center gap-2 hover:bg-[#284a42] transition-all shadow-[0_8px_20px_rgba(51,92,82,0.25)]">
            <Plus className="w-5 h-5" /> Add Expense
          </button>
        </div>
      </div>

      {/* CENTER COLUMN (Main Dashboard) */}
      <div className="w-full max-w-lg mx-auto md:max-w-none md:flex-1 md:h-screen md:overflow-y-auto flex flex-col relative pb-28 md:pb-8 hide-scrollbar">
        
        {/* Desktop Top Header (Moved outside max-w-3xl to push to the far right) */}
        <div className="hidden md:flex items-center justify-between px-8 lg:px-12 pt-8 pb-4 relative z-20">
          <div className="flex-1"></div>
          <div className="flex items-center gap-5">
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-[#1a2b3c] hover:text-[#335c52] transition-colors" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#e75a5a] rounded-full border-2 border-[#fdfaf5]"></span>
            </div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'user'}`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#1a2b3c] group-hover:text-[#335c52] transition-colors">{session?.user?.name || 'User'}</span>
                <span className="text-[11px] font-medium text-[#8e98a3]">My Account</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:max-w-3xl md:mx-auto md:relative">

        {/* Mobile Top Header */}
        <div className="flex md:hidden items-center justify-between px-6 pt-12 pb-4 relative z-20">
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
               {getInitials(session?.user?.name || 'User')}
            </div>
          </div>
        </div>

        {/* Greeting & Hero */}
        <div className="px-7 md:px-10 relative z-10 mt-6 md:mt-4 max-w-[70%]">
          <h1 className="text-[1.75rem] md:text-[2.5rem] font-bold text-[#1a2b3c] mb-1.5 md:mb-3 tracking-tight">
            Good morning, <span className="text-[#335c52]">{firstName}</span>! 👋
          </h1>
          <p className="text-[#8e98a3] text-[15px] md:text-[17px] font-medium">Let&apos;s settle up and stress less.</p>
        </div>

        <div className="absolute top-[0px] right-[-30px] md:top-[60px] md:right-[-120px] w-[360px] h-[360px] md:w-[420px] md:h-[420px] z-0 pointer-events-none group">
          <div className="absolute inset-0 bg-no-repeat transition-transform duration-1000 ease-out group-hover:scale-[1.03] group-hover:-translate-y-1" style={{ 
            backgroundImage: "url('/dashboard-hero.png')", 
            backgroundSize: 'contain', 
            backgroundPosition: 'right top', 
            mixBlendMode: 'multiply',
            maskImage: 'radial-gradient(circle at 60% 40%, black 35%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 60% 40%, black 35%, transparent 70%)'
          }} />
        </div>

        {/* Balance Card */}
        <div className="px-6 md:px-10 mt-10 md:mt-12 relative z-20">
          <div className="relative md:max-w-[90%] group/card">
            {/* Main Left Card Body - Restored to White */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-7 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-50 relative z-10 w-[95%] md:w-full group-hover/card:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500">
              
              <div className="flex items-center gap-1.5 text-[13.5px] md:text-[16px] text-[#1a2b3c] font-semibold mb-2.5 md:mb-4">
                Your overall balance <Eye className="w-4 h-4 md:w-5 md:h-5 text-[#8e98a3] ml-1" />
              </div>
              
              <div className="flex items-baseline gap-2 md:gap-3 mb-1 md:mb-2">
                <span className="text-[2.4rem] md:text-[3.5rem] font-bold text-[#335c52] tracking-tight">{formatCurrency(totalOwed)}</span>
                {totalOwed > 0 && (
                  <span className="text-[11px] md:text-[13px] font-bold text-[#335c52] bg-[#335c52]/10 px-2.5 md:px-4 py-1 md:py-1.5 rounded-full whitespace-nowrap">
                    you are owed
                  </span>
                )}
              </div>
              <p className="text-[13px] md:text-[16px] text-[#8e98a3] mb-7 md:mb-10 font-medium">Across {groups.length} groups</p>
              
              <button className="bg-[#335c52] text-white px-7 md:px-9 py-3 md:py-4 rounded-full font-bold text-[13px] md:text-[16px] flex items-center gap-2 hover:bg-[#2a4d44] transition-colors shadow-sm md:shadow-md">
                Settle up <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Wallet image (Popping out) */}
            <div className="absolute -right-[5px] -top-[45px] md:-right-[20px] md:-top-[65px] w-[180px] h-[180px] md:w-[240px] md:h-[240px] pointer-events-none z-20 transition-transform duration-700 group-hover/card:scale-110 group-hover/card:-translate-y-2 group-hover/card:rotate-2">
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
        <div className="px-6 md:px-10 mt-8 md:mt-12 grid grid-cols-4 md:grid-cols-4 gap-2 md:max-w-[90%] md:gap-6 relative z-20">
          <ActionButton icon={Users} label="Create Group" onClick={() => router.push("/groups/create")} />
          <ActionButton icon={ArrowRightSquare} label="Join Group" onClick={() => router.push("/groups/join")} />
          <ActionButton icon={Plus} label="Add Expense" onClick={() => router.push("/add-expense")} />
          <ActionButton icon={Receipt} label="Scan Receipt" badge="NEW" onClick={() => router.push("/scan-receipt")} />
        </div>

        {/* Analytics Section (Desktop Only) */}
        {renderAnalytics()}

        {/* Mobile-only wrappers (Hidden on Desktop) */}
        <div className="md:hidden">
          {renderGroups()}
          {renderActivity()}
          {renderAIBanner()}
        </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR (Desktop Only) */}
      <div className="hidden md:flex flex-col w-[380px] bg-white border-l border-gray-100 h-screen sticky top-0 overflow-y-auto pb-8 z-40 flex-shrink-0 shadow-[-5px_0_30px_rgba(0,0,0,0.02)] hide-scrollbar">
        <div className="pt-8">
          {renderGroups()}
          <div className="mx-8 my-8 border-t border-gray-100"></div>
          {renderActivity()}
          {renderAIBanner()}
        </div>
      </div>

      {/* Bottom Nav Dock (Hidden on Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] pointer-events-none pb-safe md:hidden">
        <div className="w-full max-w-md mx-auto flex justify-between items-center px-6 py-3 pointer-events-auto">
          <NavItem icon={Home} label="Dashboard" active onClick={() => router.push('/dashboard')} />
          <NavItem icon={Users} label="Groups" onClick={() => router.push('/groups')} />
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

      {/* Global styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

function ActionButton({ icon: Icon, label, badge, onClick }: { icon: any, label: string, badge?: string, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2.5 md:gap-4 cursor-pointer group" onClick={onClick}>
      <div className="relative">
        <div className="w-[4rem] h-[4rem] md:w-[5.5rem] md:h-[5.5rem] rounded-[1.25rem] md:rounded-[1.5rem] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] md:shadow-[0_8px_25px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center justify-center text-[#1a2b3c] group-hover:bg-[#f3f8f6] group-hover:text-[#335c52] group-hover:-translate-y-1 transition-all duration-300">
          <Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.2} />
        </div>
        {badge && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#618a7d] text-white text-[9px] md:text-[11px] font-extrabold px-1.5 md:px-2 py-0.5 rounded-full border-2 border-[#fdfaf5] shadow-sm group-hover:border-[#f3f8f6] transition-colors duration-300">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[12px] md:text-[14px] font-bold text-[#1a2b3c] text-center leading-tight px-1 group-hover:text-[#335c52] transition-colors">{label}</span>
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

function SidebarNavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-colors ${active ? 'bg-[#f0f6f4] text-[#335c52]' : 'text-[#8e98a3] hover:bg-gray-50 hover:text-[#1a2b3c]'}`}>
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[14px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
    </div>
  );
}
