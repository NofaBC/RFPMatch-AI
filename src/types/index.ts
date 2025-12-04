// Central type definitions - CRITICAL for everything
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  plan: 'free' | 'pro';
  stripeCustomerId?: string;
  createdAt: string;
}

export interface CapabilityStatement {
  id: string;
  userId: string;
  filePath: string;
  fileName: string;
  downloadURL: string;
  businessProfileId?: string;
  metadata: Record<string, any>;
  status: 'pending-analysis' | 'completed';
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  capabilityStatementId: string;
  sector: string;
  naicsCodes: string[];
  serviceAreas: string[];
  coreServices: string[];
  clientTypes: string[];
  summary: string;
  keyDifferentiators: string[];
  pastPerformance: string[];
  confidenceScore: number;
  createdAt: string;
}

export interface RfpRun {
  id: string;
  userId: string;
  businessProfileId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  requestedFilters: {
    minAward?: number;
    maxAward?: number;
    dueWindowStart?: string;
    dueWindowEnd?: string;
    geo?: string[];
  };
  sourcesUsed: string[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  totalRfpsFound?: number;
  topScore?: number;
}

export interface ScoredRfp {
  id: string;
  userId: string;
  rfpRunId: string;
  title: string;
  sponsor: string;
  url: string;
  dueDate: string; // ISO date string
  amountMin?: number;
  amountMax?: number;
  amountText?: string;
  eligibilitySnippet: string;
  naicsCodes?: string[];
  certifications?: string[];
  setAside?: string[];
  location?: string;
  sourceName: string;
  score: number;
  eligibilityScore: number;
  awardScore: number;
  urgencyScore: number;
  keywordScore: number;
  matchReasons: string[];
  confidence: number;
  createdAt: string;
}

export interface Brief {
  id: string;
  userId: string;
  rfpRunId: string;
  contentMarkdown: string;
  evidenceTable: Array<{
    claim: string;
    url: string;
    confidence: number;
  }>;
  createdAt: string;
}

export interface RfpAction {
  id: string;
  userId: string;
  rfpId: string;
  action: 'send' | 'dismiss' | 'snooze';
  notes?: string;
  emailContent?: string;
  createdAt: string;
}
