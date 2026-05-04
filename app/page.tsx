export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">W System v2</h1>
        <p className="text-lg text-gray-600">
          Multi-tenant project management powered by Supabase
        </p>
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900">✅ Supabase Connected</h2>
            <p className="text-sm text-blue-700 mt-1">
              Project: raelymffiajrtgbcxqse
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-900">✅ Database Ready</h2>
            <p className="text-sm text-green-700 mt-1">
              5 tables + RLS policies + triggers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
