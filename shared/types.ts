// Shared types between frontend and backend

export type SubscriptionPlan = 'free' | 'pro' | 'business' | 'enterprise';

export interface PlanLimits {
  contractsPerMonth: number;
  features: string[];
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    contractsPerMonth: 2,
    features: [
      'Basic AI analysis',
      'Standard PDF reports',
      'Up to 5MB file size',
      'Basic risk detection',
      'Email support (48h response)',
      '7-day contract history'
    ]
  },
  pro: {
    contractsPerMonth: 10,
    features: [
      'Advanced AI analysis',
      'Enhanced PDF reports',
      'Up to 25MB file size',
      'Advanced risk detection',
      'Priority email support (24h response)',
      '30-day contract history',
      'Export to Word & Excel',
      'Detailed clause explanations',
      'Contract comparison tool'
    ]
  },
  business: {
    contractsPerMonth: 50,
    features: [
      'Premium AI analysis with deep insights',
      'Professional branded PDF reports',
      'Up to 100MB file size',
      'AI-powered risk scoring & recommendations',
      'Priority support (12h response)',
      'Unlimited contract history',
      'Export to Word, Excel, CSV & JSON',
      'Advanced clause analysis & suggestions',
      'Bulk contract processing',
      'Advanced analytics dashboard',
      'Custom notification settings'
    ]
  },
  enterprise: {
    contractsPerMonth: -1, // unlimited
    features: [
      'Premium AI analysis with deep insights',
      'Professional branded PDF reports',
      'Unlimited file size',
      'AI-powered risk scoring & recommendations',
      'Dedicated account manager',
      'Unlimited contract history',
      'Export to Word, Excel, CSV & JSON',
      'Advanced clause analysis & suggestions',
      'Bulk contract processing',
      'Custom contract templates',
      'API access for integrations',
      'Advanced analytics dashboard',
      'Team collaboration (unlimited members)',
      'Custom notification settings',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment option'
    ]
  }
};

export type Language = 'en' | 'he';

export interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trialing';
  contractsUsedThisMonth: number;
  language?: Language;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileUrl: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  analysis?: ContractAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface ContractAnalysis {
  summary: string;
  keyParties: {
    party1: string;
    party2: string;
  };
  duration?: string;
  paymentTerms?: string;
  obligations: string[];
  riskFlags: RiskFlag[];
  clauseExplanations: ClauseExplanation[];
  // Enhanced structured data
  dates?: {
    startDate?: string;
    endDate?: string;
    signingDate?: string;
    effectiveDate?: string;
  };
  financialDetails?: {
    totalValue?: string;
    currency?: string;
    paymentAmounts?: Array<{
      amount: string;
      schedule: string;
      dueDate?: string;
    }>;
  };
  legalInfo?: {
    governingLaw?: string;
    jurisdiction?: string;
    disputeResolution?: string;
    venue?: string;
  };
  contractMetadata?: {
    contractType?: string;
    category?: string;
    signatories?: Array<{
      name: string;
      title?: string;
      role?: string;
      party: string;
    }>;
  };
  structuredTerms?: {
    renewal?: {
      autoRenewal: boolean;
      noticePeriod?: string;
      renewalTerm?: string;
      conditions?: string;
    };
    termination?: {
      noticePeriod?: string;
      terminationFees?: string;
      conditions?: string[];
    };
    intellectualProperty?: {
      ownership?: string;
      licensing?: string;
      restrictions?: string;
    };
    confidentiality?: {
      scope?: string;
      duration?: string;
      exceptions?: string[];
    };
    forceMajeure?: {
      definition?: string;
      consequences?: string;
    };
    insurance?: {
      requirements?: string[];
      minimumCoverage?: string;
    };
  };
  performanceMetrics?: {
    slas?: string[];
    kpis?: string[];
    deliverables?: string[];
    milestones?: Array<{
      name: string;
      date?: string;
      description?: string;
    }>;
  };
  metadata: {
    totalClauses: number;
    analyzedAt: string;
    model: string;
  };
}

export interface RiskFlag {
  id: string;
  type: 'non-compete' | 'auto-renewal' | 'termination' | 'liability' | 'payment' | 'other';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  clauseText: string;
  suggestion?: string;
}

export interface ClauseExplanation {
  clauseTitle: string;
  clauseText: string;
  explanation: string;
  importance: 'critical' | 'important' | 'standard';
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  plan: SubscriptionPlan;
  members: WorkspaceMember[];
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface ShareableReport {
  id: string;
  contractId: string;
  token: string;
  password?: string; // hashed
  expiresAt?: string;
  createdAt: string;
}

