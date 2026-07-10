export default function ActivityPlaceholder() {
  return (
    <div className="p-8 mt-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Recent Activity</h1>
      <p className="text-gray-500 mb-8">Your full transaction history.</p>
      <a href="/dashboard" className="text-[#335c52] font-semibold underline">Back to Dashboard</a>
    </div>
  );
}
