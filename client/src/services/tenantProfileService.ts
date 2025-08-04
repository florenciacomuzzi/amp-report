import api from './api';
import { Demographics, Preferences, Lifestyle } from '../types';

export interface TenantProfile {
  id: string;
  propertyId: string;
  demographics: Demographics;
  preferences: Preferences;
  lifestyle: Lifestyle[];
  confidence: number;
  summary?: string;
  conversationHistory?: any[];
  generationMethod: 'chat' | 'questionnaire' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantProfileData {
  propertyId: number;
  demographics: Demographics;
  preferences: Preferences;
  lifestyle: Lifestyle[];
  conversationHistory?: any[];
  generationMethod: 'chat' | 'questionnaire' | 'manual';
}

export const tenantProfileService = {
  async createTenantProfile(data: CreateTenantProfileData): Promise<TenantProfile> {
    const response = await api.post('/tenant-profiles', data);
    return response.data;
  },

  async getTenantProfile(propertyId: number): Promise<TenantProfile | null> {
    try {
      const response = await api.get(`/tenant-profiles/property/${propertyId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateTenantProfile(
    id: string,
    data: Partial<CreateTenantProfileData>
  ): Promise<TenantProfile> {
    const response = await api.put(`/tenant-profiles/${id}`, data);
    return response.data;
  },

  async deleteTenantProfile(id: string): Promise<void> {
    await api.delete(`/tenant-profiles/${id}`);
  },

  async generateTenantProfileSummary(id: string): Promise<TenantProfile> {
    const response = await api.post(`/tenant-profiles/${id}/generate-summary`);
    return response.data;
  },
};