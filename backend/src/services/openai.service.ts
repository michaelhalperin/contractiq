import OpenAI from 'openai';
import type { ContractAnalysis, RiskFlag, ClauseExplanation } from '../../../shared/types.js';

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

export const analyzeContract = async (contractText: string): Promise<ContractAnalysis> => {
  try {
    // Step 1: Extract structure and key information
    const structurePrompt = `Analyze the following contract and extract key structural information. Return a JSON object with:
- keyParties: { party1: string, party2: string }
- duration: string (if applicable)
- paymentTerms: string (if applicable)
- obligations: string[] (list of main obligations)

Contract text:
${contractText.substring(0, 8000)}`;

    const structureResponse = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a legal contract analyst. Extract key information from contracts and return valid JSON only.',
        },
        { role: 'user', content: structurePrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const structure = JSON.parse(structureResponse.choices[0].message.content || '{}');

    // Step 2: Generate plain English summary
    const summaryPrompt = `Summarize the following contract in clear, plain English (2-3 paragraphs). Focus on what the contract is about, who the parties are, what they're agreeing to, and the main terms.

Contract text:
${contractText.substring(0, 8000)}`;

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

    // Step 3: Detect risks
    const risks = await detectRisks(contractText);

    // Step 4: Explain clauses
    const explanations = await explainClauses(contractText);

    return {
      summary,
      keyParties: structure.keyParties || { party1: 'Unknown', party2: 'Unknown' },
      duration: structure.duration,
      paymentTerms: structure.paymentTerms,
      obligations: structure.obligations || [],
      riskFlags: risks,
      clauseExplanations: explanations,
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

const detectRisks = async (contractText: string): Promise<RiskFlag[]> => {
  const riskPrompt = `Analyze the following contract for potential red flags and risks. Look for:
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
- suggestion: optional recommendation

Return as JSON array of risk objects.

Contract text:
${contractText.substring(0, 8000)}`;

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

const explainClauses = async (contractText: string): Promise<ClauseExplanation[]> => {
  const explanationPrompt = `Identify and explain the key clauses in the following contract. For each important clause:
- clauseTitle: name of the clause
- clauseText: the actual clause text (truncate if too long)
- explanation: plain English explanation
- importance: "critical", "important", or "standard"

Return as JSON array of clause objects.

Contract text:
${contractText.substring(0, 8000)}`;

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

