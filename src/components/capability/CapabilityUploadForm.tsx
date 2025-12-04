'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import { uploadFile } from '@/lib/storage';
import { Loader2, Upload, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

interface CapabilityUploadFormProps {
  onUploadComplete?: (statementId: string) => void;
}

export default function CapabilityUploadForm({ onUploadComplete }: CapabilityUploadFormProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF or Word documents only.');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast.error('No file selected or user not authenticated');
      return;
    }

    setUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `capability-statement-${Date.now()}.${fileExt}`;
      
      const result = await uploadFile({
        file,
        userId: user.uid,
        fileName,
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      });

      toast.success('File uploaded successfully!');
      onUploadComplete?.(result.statementId);
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Capability Statement</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        {!file ? (
          <>
            <p className="text-gray-600 mb-2">Drop your PDF or Word document here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Choose File
            </label>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileCheck className="h-8 w-8 text-green-500" />
              <span className="font-medium">{file.name}</span>
            </div>
            <p className="text-sm text-gray-500">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="flex items-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Confirm Upload'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>• Supported formats: PDF, DOC, DOCX</p>
        <p>• Maximum file size: 10MB</p>
        <p>• Files are encrypted at rest</p>
      </div>
    </div>
  );
}
