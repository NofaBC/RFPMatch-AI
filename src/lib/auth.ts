import { cookies } from 'next/headers';
import { adminDb, adminAuth } from './firebase-admin';

export async function getServerUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    const decodedToken = await adminAuth.verifySessionCookie(token, true);
    const userRecord = await adminAuth.getUser(decodedToken.uid);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function createSessionCookie(idToken: string, expiresIn: number) {
  return adminAuth.createSessionCookie(idToken, { expiresIn });
}

export async function revokeAllSessions(uid: string) {
  return adminAuth.revokeRefreshTokens(uid);
}
