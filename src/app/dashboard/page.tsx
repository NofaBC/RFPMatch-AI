'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DocumentUpload } from '@/components/dashboard/DocumentUpload';
import { Loader } from '@/components/shared/Loader';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface MatchedRFP {
  id: string;
  title: string;
  agency: string;
  matchScore: number;
  dueDate: string;
  link: string;
  reasons: string[];
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<MatchedRFP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load profile
        const profileRef = doc(db, 'userProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        // Load matches
        const token = await user.getIdToken();
        const response = await fetch('/api/match-rfps', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (authLoading || isLoading) {
    return <Loader size="lg" />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">RFPMatch AI Dashboard</h1>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <DocumentUpload onUploadComplete={() => window.location.reload()} />
          </div>

          {/* Profile & Matches Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Profile */}
            {profile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Business Profile</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Company:</span>
                    <p className="mt-1">{profile.companyName || 'Not specified'}</p>
                  </div>
                  
                  {profile.naicsCodes?.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">NAICS Codes:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile.naicsCodes.map((code: string, idx: number) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Matched RFPs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Matched RFPs ({matches.length > 0 ? matches.length : 'Loading...'})
              </h3>
              
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((rfp) => (
                    <div key={rfp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg flex-1">{rfp.title}</h4>
                        <span className={`ml-4 px-2 py-1 rounded text-sm font-medium ${
                          rfp.matchScore >= 70 ? 'bg-green-100 text-green-800' :
                          rfp.matchScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rfp.matchScore}% Match
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{rfp.agency}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span>Due: {new Date(rfp.dueDate).toLocaleDateString()}</span>
                        <a 
                          href={rfp.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View RFP →
                        </a>
                      </div>

                      {rfp.reasons.length > 0 && (
                        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                          <span className="font-medium">Why this matches:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {rfp.reasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>
                    {profile 
                      ? 'No matches found yet. Upload your capability statement or check back soon.' 
                      : 'Upload your capability statement to see matched RFPs.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
