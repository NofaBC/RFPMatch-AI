'use client';

import { ReactNode } from 'react';
import TopNav from './TopNav';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
