'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import CapabilityUploadForm from '@/components/capability/CapabilityUploadForm';
import BusinessProfileCard from '@/components/capability/BusinessProfileCard';
import RfpResultsTable from '@/components/rfp/RfpResultsTable';
import RfpRunStatus from '@/components/rfp/RfpRunStatus';
import { Button } from '@/components/ui/Button';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScoredRfp } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [rfps, setRfps] = useState<ScoredRfp[]>([]);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  if (loading) return <div>Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleUploadComplete = async (statementId: string) => {
    // Trigger analysis
    const response = await fetch('/api/capability/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statementId }),
    });
    const { profile } = await response.json();
    setProfile(profile);
  };

  const handleFindRfPs = async () => {
    if (!profile) return;
    
    setRunStatus('running');
    const response = await fetch('/api/agent/find-rfps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile.id }),
    });
    
    const { runId } = await response.json();
    
    // Poll for completion
    const interval = setInterval(async () => {
      const runRes = await fetch(`/api/runs/${runId}`);
      const run = await runRes.json();
      
      if (run.status === 'completed') {
        clearInterval(interval);
        setRunStatus('completed');
        // Fetch results
        const results = await fetch(`/api/runs/${runId}/results`);
        const { rfps } = await results.json();
        setRfps(rfps);
      } else if (run.status === 'failed') {
        clearInterval(interval);
        setRunStatus('failed');
      }
    }, 2000);
  };

  const handleRfpAction = async (rfpId: string, action: 'send' | 'dismiss' | 'snooze') => {
    await fetch('/api/rfps/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfpId, action }),
    });
    setRfps(rfps.filter(rfp => rfp.id !== rfpId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">RFP Dashboard</h1>
        <span className="text-sm text-gray-500">{user.email}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CapabilityUploadForm onUploadComplete={handleUploadComplete} />
        <BusinessProfileCard profile={profile} />
      </div>

      {profile && (
        <div className="bg-white p-4 rounded-lg shadow">
          <Button onClick={handleFindRfPs} disabled={runStatus === 'running'}>
            <Play className="mr-2 h-4 w-4" />
            Find RFPs for This Profile
          </Button>
        </div>
      )}

      <RfpRunStatus status={runStatus} />

      {rfps.length > 0 && (
        <RfpResultsTable rfps={rfps} onAction={handleRfpAction} />
      )}
    </div>
  );
}
