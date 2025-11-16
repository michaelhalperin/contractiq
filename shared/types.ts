// Shared types between frontend and backend

export type SubscriptionPlan = 'free' | 'pro' | 'business' | 'enterprise';

export interface PlanLimits {
  contractsPerMonth: number;
  features: string[];
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    contractsPerMonth: 2,
    features: ['Basic analysis', 'PDF reports']
  },
  pro: {
    contractsPerMonth: 10,
    features: ['Advanced analysis', 'PDF reports', 'Email support']
  },
  business: {
    contractsPerMonth: 50,
    features: ['Advanced analysis', 'PDF reports', 'Priority support', 'Team collaboration']
  },
  enterprise: {
    contractsPerMonth: -1, // unlimited
    features: ['Advanced analysis', 'PDF reports', 'Dedicated support', 'Team collaboration', 'Custom integrations']
  }
};

export interface User {
  id: string;
  email: string;
  name?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trialing';
  contractsUsedThisMonth: number;
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

