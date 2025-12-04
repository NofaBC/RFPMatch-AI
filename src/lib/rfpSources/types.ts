export interface QueryPlan {
  keywords: string[];
  naicsCodes: string[];
  geographicScope: string[];
  minAward?: number;
  maxAward?: number;
  dueWindowStart?: Date;
  dueWindowEnd?: Date;
  certifications?: string[];
}

export interface ParsedRfp {
  id: string;
  title: string;
  sponsor: string;
  url: string;
  dueDate: Date;
  amountMin?: number;
  amountMax?: number;
  amountText?: string;
  eligibilitySnippet: string;
  naicsCodes?: string[];
  certifications?: string[];
  setAside?: string[];
  location?: string;
  sourceName: string;
}
