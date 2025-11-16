import api from './api';

export interface CreateShareResponse {
  shareUrl: string;
  token: string;
}

export const shareService = {
  createShare: async (contractId: string, password?: string, expiresInDays?: number): Promise<CreateShareResponse> => {
    const response = await api.post<CreateShareResponse>('/share/create', {
      contractId,
      password,
      expiresInDays,
    });
    return response.data;
  },
};

