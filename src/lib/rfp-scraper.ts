import axios from 'axios';
import cheerio from 'cheerio';
import { db } from './firebase-admin';

export interface RFP {
  title: string;
  agency: string;
  description: string;
  naicsCodes: string[];
  dueDate: string;
  link: string;
  postedDate: string;
  setAside: string[];
  keywords: string[];
  embedding?: number[];
}

export class RFPScraper {
  async scrapeSAMGov(): Promise<RFP[]> {
    try {
      // Use Grants.gov RSS feed for demo (SAM.gov requires API key)
      const response = await axios.get('https://www.grants.gov/rss/GrantsDBExtract.xml');
      const $ = cheerio.load(response.data, { xmlMode: true });
      
      const rfps: RFP[] = [];
      
      $('item').each((_, elem) => {
        const item = $(elem);
        const title = item.find('title').text();
        const description = item.find('description').text();
        const link = item.find('link').text();
        
        // Extract NAICS from description
        const naicsMatches = description.match(/\b\d{6}\b/g) || [];
        
        // Extract keywords
        const keywords = this.extractKeywords(title + ' ' + description);
        
        rfps.push({
          title,
          agency: 'Federal Government', // From Grants.gov
          description: description.substring(0, 2000),
          naicsCodes: naicsMatches,
          dueDate: item.find('closeDate').text() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          link,
          postedDate: item.find('postDate').text() || new Date().toISOString(),
          setAside: this.extractSetAsides(description),
          keywords,
        });
      });

      return rfps.slice(0, 20); // Limit to 20 for demo
    } catch (error) {
      console.error('Scraping failed:', error);
      return [];
    }
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'and', 'or', 'but', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'been', 'will', 'shall']);
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 4) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }

  private extractSetAsides(text: string): string[] {
    const setAsides: string[] = [];
    const lower = text.toLowerCase();
    
    if (lower.includes('8(a)')) setAsides.push('8(a)');
    if (lower.includes('hubzone')) setAsides.push('HUBZone');
    if (lower.includes('woman-owned')) setAsides.push('WOSB');
    if (lower.includes('veteran')) setAsides.push('SDVOSB');
    if (lower.includes('small business')) setAsides.push('Small Business');

    return setAsides;
  }

  async saveRFPsToFirestore(rfps: RFP[]) {
    const batch = db.batch();
    const collection = db.collection('rfps');

    for (const rfp of rfps) {
      const docRef = collection.doc();
      batch.set(docRef, {
        ...rfp,
        createdAt: new Date().toISOString(),
        status: 'active',
      });
    }

    await batch.commit();
    console.log(`Saved ${rfps.length} RFPs to Firestore`);
  }
}

export const rfpScraper = new RFPScraper();
