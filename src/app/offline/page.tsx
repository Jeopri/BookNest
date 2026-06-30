export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-2xl">📚</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">You&apos;re Offline</h1>
        <p className="text-sm text-gray-500">Connect to the internet to use Book Inventory.</p>
      </div>
    </div>
  );
}
