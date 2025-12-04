'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loader from '../shared/Loader';
import EmptyState from '../shared/EmptyState';
import { Shield } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function AuthGate({ children, requireAuth = true }: AuthGateProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <EmptyState
        icon={<Shield className="h-12 w-12 text-gray-400" />}
        title="Authentication Required"
        description="Please sign in to access this feature"
        action={
          <button
            onClick={() => router.push('/login')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Sign In
          </button>
        }
      />
    );
  }

  return <>{children}</>;
}
