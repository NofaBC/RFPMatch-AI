'use client';
import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

<<<<<<< HEAD
const AuthContext = createContext({ user: null, loading: true });
=======
interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

>>>>>>> origin/main
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
