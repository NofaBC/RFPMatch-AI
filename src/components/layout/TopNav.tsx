'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, User, FileText } from 'lucide-react';

export default function TopNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
            <FileText className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-xl">RFPMatch AI</span>
          </div>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                Log In
              </Button>
              <Button size="sm" onClick={() => router.push('/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
