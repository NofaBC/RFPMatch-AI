import { NextRequest, NextResponse } from 'next/server';
import { rfpMatcher } from '@/lib/rfp-matcher';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get matches
    const matches = await rfpMatcher.findMatches(userId, 20);

    return NextResponse.json({ matches });

  } catch (error) {
    console.error('Matching API error:', error);
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
  }
}
