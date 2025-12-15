import { db } from './firebase-admin';
import { generateEmbedding } from './embeddings';

export interface MatchedRFP {
  id: string;
  title: string;
  agency: string;
  matchScore: number;
  dueDate: string;
  link: string;
  reasons: string[];
}

export class RFPMatcher {
  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  // Calculate match score based on multiple factors
  private calculateMatchScore(
    userProfile: any,
    rfp: any,
    embeddingSimilarity: number
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // 1. NAICS code match (40% weight)
    const userNaics = userProfile.naicsCodes || [];
    const rfpNaics = rfp.naicsCodes || [];
    const naicsMatches = userNaics.filter((code: string) => 
      rfpNaics.includes(code)
    );
    
    if (naicsMatches.length > 0) {
      score += 40;
      reasons.push(`NAICS code match: ${naicsMatches.join(', ')}`);
    }

    // 2. Embedding similarity (30% weight)
    score += embeddingSimilarity * 30;
    if (embeddingSimilarity > 0.7) {
      reasons.push('High semantic similarity to your services');
    }

    // 3. Keyword overlap (20% weight)
    const userKeywords = new Set(userProfile.keywords || []);
    const rfpKeywords = new Set(rfp.keywords || []);
    const keywordOverlap = [...userKeywords].filter(k => rfpKeywords.has(k)).length;
    
    if (keywordOverlap > 0) {
      score += Math.min(keywordOverlap * 4, 20);
      reasons.push(`Keyword matches: ${keywordOverlap} terms`);
    }

    // 4. Set-aside match (10% weight)
    const userCertifications = userProfile.certifications?.map((c: any) => c.name) || [];
    const rfpSetAsides = rfp.setAside || [];
    const setAsideMatches = userCertifications.filter(cert => rfpSetAsides.includes(cert));
    
    if (setAsideMatches.length > 0) {
      score += 10;
      reasons.push(`Set-aside match: ${setAsideMatches.join(', ')}`);
    }

    return {
      score: Math.round(score),
      reasons
    };
  }

  async findMatches(userId: string, limit: number = 20): Promise<MatchedRFP[]> {
    try {
      // Get user profile
      const profileSnap = await db.collection('userProfiles').doc(userId).get();
      if (!profileSnap.exists) {
        return [];
      }

      const profile = profileSnap.data()!;
      
      // Generate profile embedding
      const profileText = `${profile.companyName || ''} ${profile.coreCompetencies?.join(' ') || ''} ${profile.keywords?.join(' ') || ''}`;
      const profileEmbedding = await generateEmbedding(profileText);

      // Get active RFPs (due in future)
      const rfpsSnapshot = await db.collection('rfps')
        .where('status', '==', 'active')
        .where('dueDate', '>', new Date().toISOString())
        .limit(100) // Process top 100
        .get();

      const matches: MatchedRFP[] = [];

      for (const doc of rfpsSnapshot.docs) {
        const rfp = doc.data();
        
        // Generate embedding if not exists
        if (!rfp.embedding || rfp.embedding.length === 0) {
          const rfpText = `${rfp.title} ${rfp.description}`;
          const rfpEmbedding = await generateEmbedding(rfpText);
          await db.collection('rfps').doc(doc.id).update({ embedding: rfpEmbedding });
          rfp.embedding = rfpEmbedding;
        }

        // Calculate similarity and score
        const embeddingSimilarity = this.cosineSimilarity(profileEmbedding, rfp.embedding);
        const { score, reasons } = this.calculateMatchScore(profile, rfp, embeddingSimilarity);

        // Only show relevant matches (score > 30)
        if (score > 30) {
          matches.push({
            id: doc.id,
            title: rfp.title,
            agency: rfp.agency,
            matchScore: score,
            dueDate: rfp.dueDate,
            link: rfp.link,
            reasons,
          });
        }
      }

      // Sort by match score and return top N
      return matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Matching failed:', error);
      return [];
    }
  }
}

export const rfpMatcher = new RFPMatcher();
