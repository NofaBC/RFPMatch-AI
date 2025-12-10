'use client';
import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
EOF

# 2. Update AppShell to wrap with AuthProvider
cat > src/components/layout/AppShell.tsx << 'EOF'
'use client';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="font-bold text-xl">RFPMatch AI</h1>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
EOF

# 3. TEST LOCALLY
npm run dev
# Should work

# 4. Push
git add src/contexts/AuthContext.tsx src/components/layout/AppShell.tsx
git commit -m "feat: add client-side auth"
git pull origin main && git push origin main
