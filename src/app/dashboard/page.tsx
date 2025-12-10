import AuthGate from '@/components/auth/AuthGate';

export default function DashboardPage() {
  return (
    <AuthGate>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">RFPMatch AI Dashboard</h1>
        <p className="mt-4">✅ Firebase Auth Active</p>
        <p>Protected route - only visible when signed in</p>
      </div>
    </AuthGate>
  );
}
