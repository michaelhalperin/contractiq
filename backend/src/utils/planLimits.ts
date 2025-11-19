import type { SubscriptionPlan } from '../../../shared/types.js';

export interface PlanLimits {
  contractsPerMonth: number;
  features: string[];
  maxFileSizeMB: number; // -1 for unlimited
  contractHistoryDays: number; // -1 for unlimited
  exportFormats: string[]; // ['pdf', 'word', 'excel', 'csv', 'json']
  analysisDepth: 'basic' | 'advanced' | 'premium';
  hasBulkProcessing: boolean;
  hasComparison: boolean;
  hasAnalytics: boolean;
  hasCustomNotifications: boolean;
  hasBrandedReports: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    contractsPerMonth: 2,
    features: ['Basic analysis', 'PDF reports'],
    maxFileSizeMB: 5,
    contractHistoryDays: 7,
    exportFormats: ['pdf'],
    analysisDepth: 'basic',
    hasBulkProcessing: false,
    hasComparison: false,
    hasAnalytics: false,
    hasCustomNotifications: false,
    hasBrandedReports: false,
  },
  pro: {
    contractsPerMonth: 10,
    features: ['Advanced analysis', 'PDF reports', 'Email support'],
    maxFileSizeMB: 25,
    contractHistoryDays: 30,
    exportFormats: ['pdf', 'word', 'excel'],
    analysisDepth: 'advanced',
    hasBulkProcessing: false,
    hasComparison: true,
    hasAnalytics: false,
    hasCustomNotifications: false,
    hasBrandedReports: false,
  },
  business: {
    contractsPerMonth: 50,
    features: ['Advanced analysis', 'PDF reports', 'Priority support', 'Team collaboration'],
    maxFileSizeMB: 100,
    contractHistoryDays: -1, // unlimited
    exportFormats: ['pdf', 'word', 'excel', 'csv', 'json'],
    analysisDepth: 'premium',
    hasBulkProcessing: true,
    hasComparison: true,
    hasAnalytics: true,
    hasCustomNotifications: true,
    hasBrandedReports: true,
  },
  enterprise: {
    contractsPerMonth: -1, // unlimited
    features: ['Advanced analysis', 'PDF reports', 'Dedicated support', 'Team collaboration', 'Custom integrations'],
    maxFileSizeMB: -1, // unlimited
    contractHistoryDays: -1, // unlimited
    exportFormats: ['pdf', 'word', 'excel', 'csv', 'json'],
    analysisDepth: 'premium',
    hasBulkProcessing: true,
    hasComparison: true,
    hasAnalytics: true,
    hasCustomNotifications: true,
    hasBrandedReports: true,
  }
};

// Helper functions
export const getMaxFileSize = (plan: SubscriptionPlan): number => {
  return PLAN_LIMITS[plan].maxFileSizeMB;
};

export const getContractHistoryDays = (plan: SubscriptionPlan): number => {
  return PLAN_LIMITS[plan].contractHistoryDays;
};

export const canExportFormat = (plan: SubscriptionPlan, format: string): boolean => {
  return PLAN_LIMITS[plan].exportFormats.includes(format.toLowerCase());
};

export const hasFeature = (plan: SubscriptionPlan, feature: keyof PlanLimits): boolean => {
  return PLAN_LIMITS[plan][feature] === true;
};

