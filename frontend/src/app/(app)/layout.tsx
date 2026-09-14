export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#fdfaf5]">
      {children}
    </div>
  );
}
