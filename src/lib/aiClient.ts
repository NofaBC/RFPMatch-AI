const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mixtral-8x7b-instruct';

interface AIRequest {
  prompt: string;
  schema?: Record<string, any>;
  maxTokens?: number;
  temperature?: number;
}

interface AIResponse<T = any> {
  data: T;
  tokensUsed: number;
  model: string;
}

export async function callAI<T = any>({
  prompt,
  schema,
  maxTokens = 2000,
  temperature = 0.1,
}: AIRequest): Promise<AIResponse<T>> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'RFPMatch AI',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a business analyst specializing in government contracting. 
                     Extract structured business profiles from capability statements.
                     Be precise, factual, and focus on quantifiable capabilities.
                     ${schema ? `Return JSON matching this schema: ${JSON.stringify(schema)}` : ''}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
        response_format: schema ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let parsedData;
    if (schema) {
      parsedData = JSON.parse(content);
      // Validate against Zod schema if provided
      if (schema instanceof Function) {
        schema.parse(parsedData);
      }
    } else {
      parsedData = content;
    }

    return {
      data: parsedData as T,
      tokensUsed: data.usage.total_tokens,
      model: data.model,
    };
  } catch (error) {
    console.error('AI call error:', error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Specific function for capability statement analysis
export async function analyzeCapabilityStatement(documentUrl: string): Promise<BusinessProfile> {
  const prompt = `
Analyze this capability statement document: ${documentUrl}

Extract the following information:
1. **Sector**: Primary industry sector (e.g., IT Services, Construction, Professional Services)
2. **NAICS Codes**: Relevant NAICS codes as an array of strings
3. **Service Areas**: Geographic regions served (states, cities, regions)
4. **Core Services**: Key service offerings with brief descriptions
5. **Client Types**: Typical client categories (federal, state, local, commercial)
6. **Summary**: A comprehensive 3-paragraph business profile summary
7. **Key Differentiators**: Unique capabilities or certifications (8(a), HUBZone, SDVOSB, etc.)
8. **Past Performance**: Notable contracts or projects mentioned

Consider the following:
- Look for specific contract vehicles (GSA Schedule, GWACs, IDIQs)
- Identify security clearances (FedRAMP, CMMC, Secret, TS/SCI)
- Note any socioeconomic certifications
- Extract contract values and timeframes if available

Return a structured JSON object.`;

  const schema = {
    type: 'object',
    properties: {
      sector: { type: 'string' },
      naicsCodes: { type: 'array', items: { type: 'string' } },
      serviceAreas: { type: 'array', items: { type: 'string' } },
      coreServices: { type: 'array', items: { type: 'string' } },
      clientTypes: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
      keyDifferentiators: { type: 'array', items: { type: 'string' } },
      pastPerformance: { type: 'array', items: { type: 'string' } },
      confidenceScore: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: ['sector', 'summary', 'confidenceScore'],
  };

  const result = await callAI<BusinessProfile>({
    prompt,
    schema,
    maxTokens: 3000,
    temperature: 0.2,
  });

  return result.data;
}
