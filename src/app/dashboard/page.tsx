import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">RFP Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
        <p className="text-gray-600 mb-4">
          Bricks 1-2 Complete ✅
        </p>
        <p className="text-gray-600 mb-4">
          Next: Copy files from Bricks 3-8 to add upload, analysis, and RFP search.
        </p>
        <Link 
          href="/" 
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
