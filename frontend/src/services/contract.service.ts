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

  exportContract: async (id: string, format: 'pdf' | 'word' | 'excel' | 'csv' | 'json'): Promise<Blob> => {
    const response = await api.get(`/contracts/${id}/export/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  compareContracts: async (contractIds: string[]): Promise<any> => {
    const response = await api.post('/contracts/compare', { contractIds });
    return response.data;
  },

  bulkUpload: async (files: File[]): Promise<any> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/contracts/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAnalytics: async (): Promise<any> => {
    const response = await api.get('/contracts/analytics/overview');
    return response.data;
  },
};

