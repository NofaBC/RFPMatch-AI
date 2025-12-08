'use client';
import { ReactNode } from 'react';
import TopNav from './TopNav';
import { AuthProvider } from '@/contexts/AuthContext';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
