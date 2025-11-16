import api from './api';
import type { Contract, ContractAnalysis } from '../../../shared/types';

export interface UploadResponse {
  id: string;
  fileName: string;
  status: string;
  analysis?: ContractAnalysis;
}

export const contractService = {
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/contracts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getContracts: async (): Promise<Contract[]> => {
    const response = await api.get<Contract[]>('/contracts');
    return response.data;
  },

  getContract: async (id: string): Promise<Contract> => {
    const response = await api.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  updateContract: async (id: string, updates: { fileName?: string }): Promise<Contract> => {
    const response = await api.patch<Contract>(`/contracts/${id}`, updates);
    return response.data;
  },

  deleteContract: async (id: string): Promise<void> => {
    await api.delete(`/contracts/${id}`);
  },
};

