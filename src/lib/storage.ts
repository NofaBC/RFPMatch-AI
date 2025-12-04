import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adminDb } from './firebase-admin';
import { v4 as uuidv4 } from 'uuid';

interface UploadParams {
  file: File;
  userId: string;
  fileName: string;
  metadata?: Record<string, any>;
}

export async function uploadFile({ file, userId, fileName, metadata = {} }: UploadParams) {
  // Create secure file path with user isolation
  const storagePath = `capability-statements/${userId}/${uuidv4()}-${fileName}`;
  const storageRef = ref(storage, storagePath);

  // Upload file with metadata
  await uploadBytes(storageRef, file, {
    customMetadata: {
      userId,
      ...metadata,
    },
  });

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);

  // Create Firestore record
  const statementRef = adminDb.collection('capabilityStatements').doc();
  const statementData = {
    id: statementRef.id,
    userId,
    filePath: storagePath,
    fileName,
    downloadURL,
    metadata: {
      ...metadata,
      uploadedAt: new Date().toISOString(),
    },
    businessProfileId: null,
    status: 'pending-analysis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await statementRef.set(statementData);

  // Trigger analysis workflow
  await adminDb.collection('analysisQueue').add({
    statementId: statementRef.id,
    userId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  return {
    statementId: statementRef.id,
    filePath: storagePath,
    downloadURL,
  };
}
