'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Loader from '@/components/shared/Loader';
import EmptyState from '@/components/shared/EmptyState';

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
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
