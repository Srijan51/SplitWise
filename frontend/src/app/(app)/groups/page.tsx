"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Settings,
  Plus,
  Receipt,
  ArrowRightLeft,
  Bell,
  ChevronRight,
  Users as UsersIcon,
  ScanLine,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { BottomNav } from "@/components/BottomNav";

const AVATARS = ["/avatar_1.png", "/avatar_2.png", "/avatar_3.png", "/avatar_4.png"];

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await apiFetch("/api/users/me");
        if (userRes.ok) {
          setUser(await userRes.json());
        } else {
          router.push("/login");
          return;
        }

        const res = await apiFetch("/api/groups");
        if (res.ok) {
          const baseGroups = await res.json();

          const results = await Promise.all(
            baseGroups.map(async (group: any) => {
              try {
                const [groupRes, balRes] = await Promise.all([
                  apiFetch(`/api/groups/${group.id}`),
                  apiFetch(`/api/groups/${group.id}/balances`),
                ]);
                if (groupRes.ok && balRes.ok) {
                  const groupData = await groupRes.json();
                  const balData = await balRes.json();
                  return { groupData, balData };
                }
              } catch (e) {
                console.error("Error fetching group", group.id, e);
              }
              return null;
            })
          );

          const fullGroups: any[] = [];
          const newBalances: Record<string, any> = {};
          for (const item of results) {
            if (item) {
              fullGroups.push(item.groupData);
              newBalances[item.groupData.id] = item.balData;
            }
          }
          setGroups(fullGroups);
          setBalances(newBalances);
        }
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const featuredGroup = groups[0];
  const otherGroups = groups.slice(1);

  const getMyBalance = (groupId: string): number => {
    const bal = balances[groupId];
    if (!bal || !user?.id) return 0;
    const mine = bal.memberBalances?.find((m: any) => m.userId === user.id);
    return mine?.netBalance ?? 0;
  };

  const getCoverForGroup = (g: any) => {
    if (g.type === "TRIP") return "/travel_cover.png";
    if (g.name?.toLowerCase().includes("home") || g.name?.toLowerCase().includes("room"))
      return "/home_cover.png";
    if (g.name?.toLowerCase().includes("food") || g.name?.toLowerCase().includes("eat"))
      return "/food_cover.png";
    return "/travel_cover.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
        <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf5] pb-24 overflow-x-hidden font-sans relative">
      {/* Hero Section */}
      <div className="relative pt-2 px-6">
        <div
          className="absolute top-[40px] right-[-10px] md:top-[50px] md:right-[20px] w-[150px] h-[150px] md:w-[200px] md:h-[200px] pointer-events-none opacity-90 transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: "url('/ai-cat.png')",
            backgroundSize: "contain",
            backgroundPosition: "top right",
            backgroundRepeat: "no-repeat",
            mixBlendMode: "multiply",
            maskImage: "radial-gradient(circle at center, black 45%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 45%, transparent 70%)",
          }}
        />

        <div className="flex items-center justify-between relative z-10 mt-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="mt-4 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-[28px] font-bold text-[#1a2b3c] tracking-tight">My Groups</h1>
          <p className="text-[13px] text-[#8e98a3] mt-1 max-w-[260px] leading-snug">
            Manage your groups, members and shared expenses.
          </p>
        </div>

        {/* Actions Grid for Groups */}
        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
          <Link
            href="/groups/create"
            className="bg-white rounded-[1.25rem] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="text-[14px] font-bold text-[#1a2b3c]">Create Group</span>
          </Link>
          <Link
            href="/groups/join"
            className="bg-white rounded-[1.25rem] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-gray-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
          >
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
                  <img
                    src={getCoverForGroup(featuredGroup)}
                    className="w-full h-full object-cover"
                    alt="Group Cover"
                  />
                </div>
                <div>
                  <h2 className="text-[19px] font-bold text-[#1a2b3c] tracking-tight">
                    {featuredGroup.name} {featuredGroup.emoji}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#528f80] bg-[#eef5f3] px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#528f80]"></span>
                      Active
                    </span>
                    <span className="text-[12px] text-[#8e98a3] font-medium">
                      • {featuredGroup.members?.length || 0} members
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8e98a3] mt-2 leading-relaxed">
                    Let&apos;s make some unforgettable memories! ✨
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-[-30px] relative z-20">
              <Link
                href={`/groups/${featuredGroup.id}/settings`}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#528f80] bg-white border border-[#eef5f3] px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50"
              >
                <Settings className="w-3.5 h-3.5" /> Group Settings
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-6 border border-[#f0f4f2] rounded-2xl p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-[10px] text-[#8e98a3] font-medium uppercase tracking-wider mb-1">
                  You are owed
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-[16px] font-bold text-[#335c52]">
                    ₹{Math.max(0, getMyBalance(featuredGroup.id)).toLocaleString("en-IN")}.
                    <span className="text-sm">00</span>
                  </p>
                  {getMyBalance(featuredGroup.id) > 0 && (
                    <span className="w-4 h-4 bg-[#eef5f3] text-[#335c52] rounded-full flex items-center justify-center text-[10px]">
                      ↑
                    </span>
                  )}
                </div>
              </div>
              <div className="border-l border-gray-100 pl-3">
                <p className="text-[10px] text-[#8e98a3] font-medium uppercase tracking-wider mb-1">
                  Total Spent
                </p>
                <p className="text-[16px] font-bold text-[#1a2b3c]">
                  ₹
                  {(featuredGroup.expenses || [])
                    .reduce((a: any, b: any) => a + b.amount, 0)
                    .toLocaleString("en-IN")}
                  .<span className="text-sm">00</span>
                </p>
              </div>
              <div className="border-l border-gray-100 pl-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#8e98a3] font-medium uppercase tracking-wider mb-1">
                    Expenses
                  </p>
                  <p className="text-[16px] font-bold text-[#1a2b3c]">
                    {featuredGroup.expenses?.length || 0}
                  </p>
                </div>
                <div className="w-7 h-7 bg-[#eef5f3] rounded-lg flex items-center justify-center text-[#335c52]">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1a2b3c]">
                  Members ({featuredGroup.members?.length || 0})
                </h3>
                <Link
                  href={`/groups/${featuredGroup.id}`}
                  className="text-[11px] font-semibold text-[#528f80] flex items-center hover:underline"
                >
                  View all <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
              <div className="flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {(featuredGroup.members || []).slice(0, 5).map((m: any, i: number) => {
                  const isMe = m.userId === user?.id;
                  return (
                    <div key={m.id} className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={AVATARS[i % AVATARS.length]}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-[11px] font-semibold ${
                            isMe ? "text-[#528f80]" : "text-[#1a2b3c]"
                          }`}
                        >
                          {isMe ? "You" : m.user?.name?.split(" ")[0] || "User"}
                        </p>
                        {m.role === "ADMIN" && (
                          <p className="text-[9px] bg-[#eef5f3] text-[#528f80] px-1.5 py-0.5 rounded-full mt-0.5">
                            Admin
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              <Link
                href={`/groups/${featuredGroup.id}/add-expense`}
                className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">
                  Add<br />Expense
                </span>
              </Link>
              <Link
                href="/scan-receipt"
                className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <ScanLine className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">
                  Scan<br />Receipt
                </span>
              </Link>
              <Link
                href={`/groups/${featuredGroup.id}`}
                className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">
                  View<br />Balances
                </span>
              </Link>
              <Link
                href={`/groups/${featuredGroup.id}/settings`}
                className="bg-white border border-[#f0f4f2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#528f80]">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-[#1a2b3c] text-center">
                  Group<br />Settings
                </span>
              </Link>
            </div>

            {/* Recent Activity Mini */}
            <div className="mt-6 pt-5 border-t border-[#f0f4f2]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1a2b3c]">Recent Activity</h3>
                <Link
                  href={`/activity?group_id=${featuredGroup.id}`}
                  className="text-[11px] font-semibold text-[#528f80] flex items-center hover:underline"
                >
                  View all <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {(featuredGroup.expenses || []).slice(0, 3).map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#fdf5ed] flex items-center justify-center text-[#e89b5c]">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1a2b3c]">{exp.description}</p>
                        <p className="text-[11px] text-[#8e98a3]">
                          Paid by {exp.paidBy?.name?.split(" ")[0] || "Someone"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#528f80]">
                        ₹{exp.amount.toLocaleString("en-IN")}.
                        <span className="text-[10px]">00</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))}
                {(!featuredGroup.expenses || featuredGroup.expenses.length === 0) && (
                  <p className="text-[12px] text-[#8e98a3] py-2 text-center">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 mt-6 text-center text-gray-500 py-12 bg-white rounded-3xl mx-5 border border-gray-100">
          No active groups found. Create or join one to get started!
        </div>
      )}

      {/* Other Groups List */}
      {otherGroups.length > 0 && (
        <div className="px-5 mt-8 mb-6 relative z-10">
          <h3 className="text-[15px] font-bold text-[#1a2b3c] mb-4">Other Groups</h3>
          <div className="space-y-3">
            {otherGroups.map((group) => {
              const bal = getMyBalance(group.id);
              return (
                <Link
                  href={`/groups/${group.id}`}
                  key={group.id}
                  className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                      <img
                        src={getCoverForGroup(group)}
                        alt="cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1a2b3c]">
                        {group.name} {group.emoji}
                      </h4>
                      <p className="text-[12px] text-[#8e98a3] mt-0.5">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[12px] font-semibold ${
                        bal > 0 ? "text-[#528f80]" : bal < 0 ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      {bal > 0
                        ? `You are owed ₹${bal}`
                        : bal < 0
                        ? `You owe ₹${Math.abs(bal)}`
                        : "Settled up"}
                    </span>
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav active="groups" />
    </div>
  );
}
