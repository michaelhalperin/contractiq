import api from './api';

export interface SubscriptionStatus {
  plan: string;
  status: string;
  contractsUsed: number;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export const subscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get<SubscriptionStatus>('/subscription/status');
    return response.data;
  },

  cancelAtPeriodEnd: async (): Promise<{ message: string; cancelAtPeriodEnd: boolean }> => {
    const response = await api.post<{ message: string; cancelAtPeriodEnd: boolean }>('/subscription/cancel');
    return response.data;
  },
};

