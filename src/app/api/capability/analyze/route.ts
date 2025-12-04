import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { analyzeCapabilityStatement } from '@/lib/aiClient';
import { getDownloadURL } from 'firebase-admin/storage';

export const runtime = 'nodejs';
export const maxDuration = 120; // Extended for AI processing

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { statementId } = await request.json();
    
    if (!statementId) {
      return NextResponse.json({ error: 'statementId required' }, { status: 400 });
    }

    // Verify user owns this statement
    const statementDoc = await adminDb
      .collection('capabilityStatements')
      .doc(statementId)
      .get();

    if (!statementDoc.exists || statementDoc.data()?.userId !== user.uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const statement = statementDoc.data()!;
    
    // Check if already analyzed
    if (statement.businessProfileId) {
      const profileDoc = await adminDb
        .collection('businessProfiles')
        .doc(statement.businessProfileId)
        .get();
      
      if (profileDoc.exists) {
        return NextResponse.json({ profile: profileDoc.data() });
      }
    }

    // Get signed URL for document
    const bucket = adminDb.firestore.app.options.storageBucket;
    const filePath = statement.filePath;
    const signedUrl = await getDownloadURL(`gs://${bucket}/${filePath}`);

    // Analyze document
    const analysis = await analyzeCapabilityStatement(signedUrl);

    // Store business profile
    const profileRef = adminDb.collection('businessProfiles').doc();
    const profileData = {
      id: profileRef.id,
      userId: user.uid,
      capabilityStatementId: statementId,
      ...analysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationStatus: 'pending',
    };

    await profileRef.set(profileData);

    // Update capability statement with profile reference
    await statementDoc.ref.update({
      businessProfileId: profileRef.id,
      analysisStatus: 'completed',
      analyzedAt: new Date().toISOString(),
    });

    // Log usage for billing
    await adminDb.collection('usageLogs').add({
      userId: user.uid,
      action: 'document_analysis',
      tokensUsed: analysis.confidenceScore,
      timestamp: new Date().toISOString(),
      plan: (await adminDb.collection('users').doc(user.uid).get()).data()?.plan || 'free',
    });

    return NextResponse.json({
      success: true,
      profile: profileData,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Log failure
    if (error instanceof Error) {
      await adminDb.collection('errorLogs').add({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        context: 'capability_analysis',
      });
    }

    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
