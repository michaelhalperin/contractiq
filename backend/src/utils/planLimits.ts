import type { SubscriptionPlan } from '../../../shared/types.js';

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

