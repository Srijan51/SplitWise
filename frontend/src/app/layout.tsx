import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SplitWise — Split Expenses with Friends",
  description:
    "The friendliest way to split bills with your hostel roommates, mess groups, and trip crews. Real-time balances, smart debt simplification, and zero awkwardness.",
  keywords: ["expense splitting", "split bills", "roommates", "group expenses"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
