import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30; // Vercel max for hobby plan

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Check user's subscription tier limits
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    const plan = userData?.plan || 'free';
    const maxStorage = plan === 'pro' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB pro, 10MB free
    
    // Check current storage usage
    const statementsSnapshot = await adminDb
      .collection('capabilityStatements')
      .where('userId', '==', user.uid)
      .get();
    
    const currentUsage = statementsSnapshot.docs.reduce(
      (acc, doc) => acc + (doc.data().metadata?.size || 0),
      0
    );

    if (currentUsage + file.size > maxStorage) {
      return NextResponse.json(
        { error: 'Storage limit exceeded. Upgrade to Pro for more space.' },
        { status: 403 }
      );
    }

    // Process upload via storage utility
    const { uploadFile } = await import('@/lib/storage');
    const result = await uploadFile({
      file,
      userId: user.uid,
      fileName: file.name,
      metadata: {
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      statementId: result.statementId,
      filePath: result.filePath,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
