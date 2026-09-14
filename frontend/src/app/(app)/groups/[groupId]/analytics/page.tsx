"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsRedirectPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/activity?group_id=${groupId}`);
  }, [groupId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
      <div className="w-8 h-8 border-4 border-[#335c52]/30 border-t-[#335c52] rounded-full animate-spin"></div>
    </div>
  );
}
