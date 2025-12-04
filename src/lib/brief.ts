import { ScoredRfp, BusinessProfile } from '@/types';
import { callAI } from './aiClient';

export async function buildBrief(
  rfps: ScoredRfp[],
  profile: BusinessProfile
): Promise<{ contentMarkdown: string; evidenceTable: any[] }> {
  const prompt = `
You are a government contracting strategist. Create a tactical brief for these ${rfps.length} RFPs.

For each RFP, provide:
1. **Opportunity Summary** (2-3 sentences)
2. **Strategic Fit** (why we can win)
3. **Risk Factors** (challenges to address)
4. **Next 3 Actions** (specific steps)
5. **Evidence Table**: Claim → URL → Confidence%

Format as Markdown with clear headers.

RFPs to analyze:
${rfps.map(rfp => `
- ${rfp.title} (${rfp.sponsor})
  Score: ${rfp.score}%
  Due: ${new Date(rfp.dueDate).toLocaleDateString()}
  Award: ${rfp.amountText || 'N/A'}
  URL: ${rfp.url}
`).join('\n')}

Our business profile:
- Sector: ${profile.sector}
- Core Services: ${profile.coreServices.join(', ')}
- Certifications: ${profile.keyDifferentiators.join(', ')}
- Past Performance: ${profile.pastPerformance.slice(0, 3).join(', ')}
`;

  const result = await callAI({
    prompt,
    maxTokens: 4000,
    temperature: 0.3,
  });

  // Parse evidence table from response (simplified)
  const evidenceTable = rfps.map(rfp => ({
    claim: `${rfp.sponsor} opportunity`,
    url: rfp.url,
    confidence: rfp.confidence,
  }));

  return {
    contentMarkdown: result.data as string,
    evidenceTable,
  };
}
