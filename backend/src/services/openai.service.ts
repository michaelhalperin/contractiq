import OpenAI from 'openai';
import type { ContractAnalysis, RiskFlag, ClauseExplanation, SubscriptionPlan } from '../../../shared/types.js';

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey,
    });
  }
  return openai;
};

export const analyzeContract = async (contractText: string, plan: SubscriptionPlan = 'free'): Promise<ContractAnalysis> => {
  try {
    const isPremium = plan === 'business' || plan === 'enterprise';
    const isAdvanced = plan === 'pro' || isPremium;
    
    // Adjust text length based on plan
    const maxTextLength = isPremium ? 16000 : isAdvanced ? 12000 : 8000;
    const contractTextSnippet = contractText.substring(0, maxTextLength);

    // Step 1: Extract comprehensive structured data
    const structurePrompt = `Perform a comprehensive analysis of the following contract. Extract ALL available information and return a JSON object with the following structure:

{
  "keyParties": { "party1": string, "party2": string },
  "duration": string (if applicable),
  "paymentTerms": string (if applicable),
  "obligations": string[],
  "dates": {
    "startDate": string (ISO format or readable date),
    "endDate": string (ISO format or readable date),
    "signingDate": string (ISO format or readable date),
    "effectiveDate": string (ISO format or readable date)
  },
  "financialDetails": {
    "totalValue": string (total contract value/amount),
    "currency": string (e.g., USD, EUR),
    "paymentAmounts": [
      {
        "amount": string,
        "schedule": string (e.g., "Monthly", "Quarterly", "Upon delivery"),
        "dueDate": string (if specified)
      }
    ]
  },
  "legalInfo": {
    "governingLaw": string (e.g., "Laws of California"),
    "jurisdiction": string (e.g., "California State Courts"),
    "disputeResolution": string (e.g., "Arbitration", "Mediation", "Litigation"),
    "venue": string (location for disputes)
  },
  "contractMetadata": {
    "contractType": string (e.g., "Service Agreement", "NDA", "Employment Contract"),
    "category": string (e.g., "Commercial", "Employment", "Intellectual Property"),
    "signatories": [
      {
        "name": string,
        "title": string (job title),
        "role": string (e.g., "Signatory", "Authorized Representative"),
        "party": string ("party1" or "party2")
      }
    ]
  },
  "structuredTerms": {
    "renewal": {
      "autoRenewal": boolean,
      "noticePeriod": string (e.g., "30 days"),
      "renewalTerm": string (e.g., "1 year"),
      "conditions": string (any conditions for renewal)
    },
    "termination": {
      "noticePeriod": string,
      "terminationFees": string (if applicable),
      "conditions": string[] (list of termination conditions)
    },
    "intellectualProperty": {
      "ownership": string (who owns IP),
      "licensing": string (licensing terms),
      "restrictions": string (any IP restrictions)
    },
    "confidentiality": {
      "scope": string (what is confidential),
      "duration": string (how long confidentiality lasts),
      "exceptions": string[] (exceptions to confidentiality)
    },
    "forceMajeure": {
      "definition": string (what constitutes force majeure),
      "consequences": string (what happens in force majeure)
    },
    "insurance": {
      "requirements": string[] (types of insurance required),
      "minimumCoverage": string (minimum coverage amounts)
    }
  },
  "performanceMetrics": {
    "slas": string[] (Service Level Agreements),
    "kpis": string[] (Key Performance Indicators),
    "deliverables": string[] (list of deliverables),
    "milestones": [
      {
        "name": string,
        "date": string (ISO format or readable date),
        "description": string
      }
    ]
  }
}

IMPORTANT: Only include fields that are actually present in the contract. Use null or omit fields that are not found. Extract dates in ISO format (YYYY-MM-DD) when possible, or readable format if exact dates are not specified.

Contract text:
${contractTextSnippet}`;

    const structureResponse = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a legal contract analyst. Extract comprehensive structured information from contracts and return valid JSON only. Be thorough and extract all available data.',
        },
        { role: 'user', content: structurePrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const structure = JSON.parse(structureResponse.choices[0].message.content || '{}');

    // Step 2: Generate plain English summary (with depth based on plan)
    const summaryLength = isPremium ? '4-5 paragraphs' : isAdvanced ? '3-4 paragraphs' : '2-3 paragraphs';
    const summaryDetail = isPremium
      ? 'Include key dates, financial terms, obligations, risks, and important clauses. Highlight any unusual or noteworthy terms.'
      : isAdvanced
      ? 'Include key dates, financial terms, and main obligations. Mention any important clauses.'
      : 'Focus on what the contract is about, who the parties are, what they\'re agreeing to, and the main terms.';

    const summaryPrompt = `Summarize the following contract in clear, plain English (${summaryLength}). ${summaryDetail}

Contract text:
${contractTextSnippet}`;

    const summaryResponse = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a legal translator who explains contracts in simple, understandable language.',
        },
        { role: 'user', content: summaryPrompt },
      ],
      temperature: 0.4,
    });

    const summary = summaryResponse.choices[0].message.content || '';

    // Step 3: Detect risks (with depth based on plan)
    const risks = await detectRisks(contractTextSnippet, plan);

    // Step 4: Explain clauses (with depth based on plan)
    const explanations = await explainClauses(contractTextSnippet, plan);

    return {
      summary,
      keyParties: structure.keyParties || { party1: 'Unknown', party2: 'Unknown' },
      duration: structure.duration,
      paymentTerms: structure.paymentTerms,
      obligations: structure.obligations || [],
      riskFlags: risks,
      clauseExplanations: explanations,
      dates: structure.dates || undefined,
      financialDetails: structure.financialDetails || undefined,
      legalInfo: structure.legalInfo || undefined,
      contractMetadata: structure.contractMetadata || undefined,
      structuredTerms: structure.structuredTerms || undefined,
      performanceMetrics: structure.performanceMetrics || undefined,
      metadata: {
        totalClauses: explanations.length,
        analyzedAt: new Date().toISOString(),
        model: 'gpt-4o',
      },
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Failed to analyze contract');
  }
};

const detectRisks = async (contractText: string, plan: SubscriptionPlan = 'free'): Promise<RiskFlag[]> => {
  const isPremium = plan === 'business' || plan === 'enterprise';
  const isAdvanced = plan === 'pro' || isPremium;

  const riskDetail = isPremium
    ? `Perform a comprehensive risk analysis. Look for:
- Non-compete clauses (scope, duration, geographic restrictions)
- Auto-renewal terms (notice requirements, opt-out procedures)
- Unilateral termination rights (termination fees, notice periods)
- Unfavorable payment terms (late fees, interest rates, payment schedules)
- Excessive liability clauses (caps, indemnification, warranties)
- Intellectual property concerns
- Data privacy and security obligations
- Force majeure and dispute resolution clauses
- Hidden fees and charges
- Other concerning terms

For each risk found, provide:
- type: one of "non-compete", "auto-renewal", "termination", "liability", "payment", "other"
- severity: "high", "medium", or "low" (with detailed reasoning)
- title: descriptive title
- description: comprehensive explanation of the risk and potential impact
- clauseText: the actual clause text
- suggestion: actionable recommendation to mitigate or negotiate the risk`
    : isAdvanced
    ? `Analyze the following contract for potential red flags and risks. Look for:
- Non-compete clauses
- Auto-renewal terms
- Unilateral termination rights
- Unfavorable payment terms
- Excessive liability clauses
- Other concerning terms

For each risk found, provide:
- type: one of "non-compete", "auto-renewal", "termination", "liability", "payment", "other"
- severity: "high", "medium", or "low"
- title: short title
- description: detailed explanation of the risk
- clauseText: the actual clause text
- suggestion: recommendation`
    : `Analyze the following contract for potential red flags and risks. Look for:
- Non-compete clauses
- Auto-renewal terms
- Unilateral termination rights
- Unfavorable payment terms
- Excessive liability clauses
- Other concerning terms

For each risk found, provide:
- type: one of "non-compete", "auto-renewal", "termination", "liability", "payment", "other"
- severity: "high", "medium", or "low"
- title: short title
- description: explanation of the risk
- clauseText: the actual clause text
- suggestion: optional recommendation`;

  const riskPrompt = `${riskDetail}

Return as JSON array of risk objects.

Contract text:
${contractText}`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a risk analyst specializing in contract review. Identify potential legal and financial risks.',
        },
        { role: 'user', content: riskPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const risks: RiskFlag[] = result.risks || [];

    // Add IDs to risks
    return risks.map((risk, index) => ({
      ...risk,
      id: `risk-${index + 1}`,
    }));
  } catch (error) {
    console.error('Risk detection error:', error);
    return [];
  }
};

const explainClauses = async (contractText: string, plan: SubscriptionPlan = 'free'): Promise<ClauseExplanation[]> => {
  const isPremium = plan === 'business' || plan === 'enterprise';
  const isAdvanced = plan === 'pro' || isPremium;

  const clauseDetail = isPremium
    ? `Perform a comprehensive clause analysis. Identify and explain ALL important clauses including:
- Contract parties and definitions
- Scope of work/services
- Payment terms and schedules
- Delivery and performance obligations
- Intellectual property rights
- Confidentiality and non-disclosure
- Termination and renewal clauses
- Dispute resolution and governing law
- Liability, indemnification, and warranties
- Force majeure and change of control
- Assignment and subcontracting
- Any other material clauses

For each clause, provide:
- clauseTitle: descriptive name of the clause
- clauseText: the actual clause text (include full text for critical clauses)
- explanation: comprehensive plain English explanation with implications
- importance: "critical", "important", or "standard" (with reasoning)

Also provide suggestions for negotiation points where applicable.`
    : isAdvanced
    ? `Identify and explain the key clauses in the following contract. For each important clause:
- clauseTitle: name of the clause
- clauseText: the actual clause text (truncate if too long)
- explanation: detailed plain English explanation
- importance: "critical", "important", or "standard"

Focus on the most important clauses that affect the parties' rights and obligations.`
    : `Identify and explain the key clauses in the following contract. For each important clause:
- clauseTitle: name of the clause
- clauseText: the actual clause text (truncate if too long)
- explanation: plain English explanation
- importance: "critical", "important", or "standard"`;

  const explanationPrompt = `${clauseDetail}

Return as JSON array of clause objects.

Contract text:
${contractText}`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a legal educator who explains complex legal clauses in simple terms.',
        },
        { role: 'user', content: explanationPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.clauses || [];
  } catch (error) {
    console.error('Clause explanation error:', error);
    return [];
  }
};

