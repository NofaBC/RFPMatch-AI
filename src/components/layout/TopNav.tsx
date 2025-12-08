'use client';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

export default function TopNav() {
  const router = useRouter();
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <FileText className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-xl">RFPMatch AI</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
