import { NextRequest, NextResponse } from 'next/server';
import { rfpScraper } from '@/lib/rfp-scraper';

export async function GET(request: NextRequest) {
  try {
    // Optional: Add secret key for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rfps = await rfpScraper.scrapeSAMGov();
    await rfpScraper.saveRFPsToFirestore(rfps);

    return NextResponse.json({ 
      success: true, 
      message: `Scraped and saved ${rfps.length} RFPs` 
    });

  } catch (error) {
    console.error('Scraper error:', error);
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}
