"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, ScanLine, Sparkles, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const SplitText = dynamic(() => import("@/components/SplitText"), { ssr: false });

export default function ScanReceiptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Scanned: ${data.vendor} - ₹${data.total_amount}`);
        // Route to add-expense and prefill
        router.push(`/add-expense?amount=${data.total_amount}&desc=${encodeURIComponent(data.vendor)}`);
      } else {
        toast.error("Failed to scan receipt.");
      }
    } catch {
      toast.error("Error connecting to AI service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="responsive-container-md mt-8 p-4 pb-24">
      <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <SplitText text="Scan Receipt" className="text-2xl font-bold mb-1" delay={30} duration={0.4} splitType="chars" textAlign="left" tag="h1" />
      <p className="text-sm mb-8 text-[#8e98a3]">
        Let AI automatically read your bill and extract amounts! ✨
      </p>

      {loading ? (
        <div className="glass-card p-12 text-center flex flex-col items-center">
          <ScanLine className="w-16 h-16 text-[#335c52] animate-pulse mb-4" />
          <h3 className="text-lg font-bold text-[#1a2b3c] mb-2">Analyzing Receipt...</h3>
          <p className="text-sm text-[#8e98a3]">Our AI is crunching the numbers.</p>
        </div>
      ) : (
        <label className="block glass-card p-12 border-2 border-dashed border-[#dce4e1] cursor-pointer hover:bg-white transition-colors group">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f6f4] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-[#335c52]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a2b3c] mb-2">Upload a Receipt</h3>
            <p className="text-sm text-[#8e98a3]">Tap to select an image from your device</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </label>
      )}

      <div className="mt-8 glass-card p-6 border-l-4 border-l-[#528f80]">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#528f80] mt-0.5" />
          <div>
            <h4 className="font-bold text-[#1a2b3c] text-sm mb-1">How it works</h4>
            <p className="text-[13px] text-[#8e98a3] leading-relaxed">
              Snap a picture of your restaurant bill or grocery receipt. We'll automatically identify the total amount, tax, and merchant name to instantly pre-fill your expense!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
