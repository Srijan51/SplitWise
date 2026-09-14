"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Users, AlertTriangle, Copy, Check, Share2, Link2 } from "lucide-react";
import { GROUP_EMOJIS, ACCENT_COLORS, getInitials } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

export default function GroupSettingsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "ONGOING",
    emoji: "👥",
    accentColor: "#335c52",
  });
  const [copied, setCopied] = useState(false);

  const fetchGroup = async () => {
    try {
      const userRes = await apiFetch("/api/users/me");
      if (userRes.ok) setSession({ user: await userRes.json() });
      else {
        router.push("/login");
        return;
      }

      const res = await apiFetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data);
        setForm({
          name: data.name,
          type: data.type,
          emoji: data.emoji,
          accentColor: data.accentColor,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Settings updated!");
        fetchGroup();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Failed to update settings");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await apiFetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("Role updated");
        fetchGroup();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Failed to update role");
      }
    } catch {
      toast.error("Error updating role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await apiFetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Member removed");
        if (userId === session?.user?.id) {
          router.push("/dashboard");
        } else {
          fetchGroup();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Failed to remove member");
      }
    } catch {
      toast.error("Error removing member");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("Are you absolutely sure you want to delete this group? This action cannot be undone.")) return;
    try {
      const res = await apiFetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Group deleted");
        router.push("/groups");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Failed to delete group");
      }
    } catch {
      toast.error("Error deleting group");
    }
  };

  if (loading || !group) {
    return (
      <div className="min-h-screen bg-[#fdfaf5] p-6">
        <div className="w-full h-8 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="w-full h-32 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  const myMembership = group.members?.find((m: any) => m.userId === session?.user?.id);
  const isAdmin = myMembership?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#fdfaf5] font-sans pb-24 overflow-x-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#e5eee9] to-transparent z-0 opacity-50 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="px-6 pt-10 pb-6 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#1a2b3c] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-[#1a2b3c]">Group Settings</h1>
          <div className="w-10 h-10"></div>
        </div>

        <div className="px-6 space-y-6">
          {/* General Settings */}
          <form onSubmit={handleUpdateSettings} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-[15px] font-bold text-[#1a2b3c]">General Details</h2>
            
            <div>
              <label className="block text-[11px] font-bold text-[#8e98a3] uppercase tracking-wider mb-2">Group Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#f4f7f5] rounded-2xl p-4 border-none outline-none text-[#1a2b3c] font-semibold text-[15px] focus:ring-2 focus:ring-[#335c52]"
                disabled={!isAdmin}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8e98a3] uppercase tracking-wider mb-2">Group Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#f4f7f5] rounded-2xl p-4 border-none outline-none text-[#1a2b3c] font-semibold text-[15px] focus:ring-2 focus:ring-[#335c52]"
                disabled={!isAdmin}
              >
                <option value="ONGOING">Ongoing</option>
                <option value="TRIP">Trip</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8e98a3] uppercase tracking-wider mb-2">Group Icon</label>
              <div className="flex flex-wrap gap-2">
                {GROUP_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => isAdmin && setForm({ ...form, emoji })}
                    disabled={!isAdmin}
                    className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition-all ${
                      form.emoji === emoji 
                        ? "bg-[#335c52] shadow-md border-2 border-[#335c52]" 
                        : "bg-[#f4f7f5] hover:bg-[#e5eee9] border-2 border-transparent"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8e98a3] uppercase tracking-wider mb-2">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => isAdmin && setForm({ ...form, accentColor: color })}
                    disabled={!isAdmin}
                    className={`w-8 h-8 rounded-full transition-all relative flex items-center justify-center ${
                      form.accentColor === color ? "scale-110 shadow-md" : "hover:scale-105"
                    }`}
                    style={{ background: color }}
                  >
                    {form.accentColor === color && (
                       <div className="absolute inset-0 rounded-full border-[2px] border-white pointer-events-none"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isAdmin && (
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 bg-[#335c52] text-white py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>

          {/* Invite Members */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-[15px] font-bold text-[#1a2b3c] mb-1 flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Invite Members
            </h2>
            <p className="text-[11px] text-[#8e98a3] mb-4">Share this code with friends so they can join your group.</p>
            
            <div className="bg-[#f4f7f5] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#8e98a3] uppercase tracking-wider mb-1">Invite Code</p>
                <p className="font-mono font-bold text-[22px] text-[#1a2b3c] tracking-[0.3em]">{group?.inviteCode}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(group?.inviteCode || "");
                  setCopied(true);
                  toast.success("Invite code copied!");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-10 h-10 rounded-full bg-[#335c52] text-white flex items-center justify-center hover:bg-[#2a4d44] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Join ${group?.name} on SplitWise`,
                    text: `Join my group "${group?.name}" on SplitWise! Use invite code: ${group?.inviteCode}`,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(
                    `Join my group "${group?.name}" on SplitWise! Use invite code: ${group?.inviteCode}`
                  );
                  toast.success("Invite message copied to clipboard!");
                }
              }}
              className="w-full mt-3 bg-[#f4f7f5] text-[#335c52] py-3 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#e5eee9] transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share Invite
            </button>

            {isAdmin && (
              <button
                onClick={async () => {
                  if (!confirm("Regenerate invite code? The old code will stop working.")) return;
                  try {
                    const res = await apiFetch(`/api/groups/${groupId}/regenerate-code`, {
                      method: "POST",
                    });
                    if (res.ok) {
                      toast.success("New invite code generated!");
                      fetchGroup();
                    } else {
                      toast.error("Failed to regenerate code");
                    }
                  } catch {
                    toast.error("Error regenerating code");
                  }
                }}
                className="w-full mt-2 bg-white text-[#8e98a3] border border-gray-100 py-3 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                🔄 Regenerate Code
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-[15px] font-bold text-[#1a2b3c] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Members
            </h2>
            <div className="space-y-4">
              {(group.members || []).map((m: any) => (
                <div key={m.userId} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4f7f5] flex items-center justify-center font-bold text-[#528f80]">
                      {getInitials(m.user?.name || "User")}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1a2b3c]">
                        {m.user?.name || "User"} {m.userId === session?.user?.id && "(You)"}
                      </p>
                      <p className="text-[11px] text-[#8e98a3]">{m.user?.email || ""}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && m.userId !== session?.user?.id ? (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                          className="bg-[#f4f7f5] text-[11px] font-bold text-[#528f80] rounded-lg px-2 py-1 outline-none border-none cursor-pointer"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button 
                          onClick={() => handleRemoveMember(m.userId)}
                          className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="bg-[#f4f7f5] text-[11px] font-bold text-[#8e98a3] rounded-lg px-2 py-1">
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          {isAdmin && (
            <div className="bg-red-50 rounded-3xl p-5 border border-red-100">
              <h2 className="text-[15px] font-bold text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Danger Zone
              </h2>
              <p className="text-[12px] text-red-500/80 mb-4 leading-snug">
                Once you delete a group, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteGroup}
                className="w-full bg-red-500 text-white py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm hover:bg-red-600 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
