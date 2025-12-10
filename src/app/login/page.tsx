'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import Loader from '@/components/shared/Loader';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In to RFPMatch AI</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          className="w-full mb-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M24 9.8c0-.6-.1-1.1-.2-1.6H12v3.1h6.8c-.3 1.5-1.1 2.8-2.3 3.6v2.2h3.7c2.2-2 3.5-4.9 3.5-8.3z"/>
            <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.7l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.3v2.9C3.2 21.5 7.3 24 12 24z"/>
            <path fill="#FBBC05" d="M5.6 14.1c-.2-.7-.2-1.4 0-2.1V9.1H1.3C.5 10.9 0 12.9 0 15s.5 4.1 1.3 5.9l3.3-2.6c-.2-.7-.2-1.4 0-2.2z"/>
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.1.6 4.3 1.6l3.2-3.2C17.7 1.2 15.1 0 12 0 7.3 0 3.2 2.5 1.3 6.1l3.3 2.6C6.5 6 9 4.8 12 4.8z"/>
          </svg>
          Sign in with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign in with Email
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary-600 hover:text-primary-700">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
