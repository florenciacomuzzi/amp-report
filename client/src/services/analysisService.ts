import api from './api';
import { trpcClient } from '../trpcStandalone';
import { TenantProfile } from '../types';

const analysisService = {
  generateTenantProfile: (propertyId: string | number) => trpcClient.analysis.generateTenantProfile.mutate({ propertyId: String(propertyId) }),

  getRecommendations: (propertyId: string | number, tenantProfile: TenantProfile) =>
    trpcClient.analysis.recommendations.mutate({ propertyId: String(propertyId), tenantProfileId: (tenantProfile as any).id }),

  chatWithAI: (propertyId: string | number, message: string, conversationHistory: any[] = []) =>
    trpcClient.analysis.chat.mutate({ propertyId: String(propertyId), message, conversationHistory }),

  getReport: (analysisId: number) => trpcClient.analysis.get.query(String(analysisId)),

  exportReport: (analysisId: number, format: 'pdf' | 'excel') => {
    return api.post(`/analysis/report/${analysisId}/export`, { format }, {
      responseType: 'blob',
    });
  },
};

export default analysisService;