'use client';

import { BusinessProfile } from '@/types';
import { FileText, Loader2 } from 'lucide-react';

interface Props {
  profile: BusinessProfile | null;
}

export default function BusinessProfileCard({ profile }: Props) {
  if (!profile) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-2 text-gray-500">
          <FileText className="h-5 w-5" />
          <p>No profile yet. Upload a capability statement to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold">Business Profile</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Sector:</span> {profile.sector}
        </div>
        <div>
          <span className="font-medium">Confidence:</span> {profile.confidenceScore}%
        </div>
        <div className="col-span-2">
          <span className="font-medium">NAICS:</span> {profile.naicsCodes?.join(', ')}
        </div>
        <div className="col-span-2">
          <span className="font-medium">Service Areas:</span> {profile.serviceAreas?.join(', ')}
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Core Services</h4>
        <ul className="text-sm space-y-1">
          {profile.coreServices?.slice(0, 4).map((service, idx) => (
            <li key={idx} className="flex items-center">
              <span className="text-primary-600 mr-2">•</span>
              {service}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-primary-50 p-3 rounded text-xs">
        <span className="font-medium">Summary:</span> {profile.summary.substring(0, 150)}...
      </div>
    </div>
  );
}
