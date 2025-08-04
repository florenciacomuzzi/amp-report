import { trpcClient } from '../trpcStandalone';

const amenityService = {
  getAmenities: (filters?: { category?: string; minCost?: number; maxCost?: number }) =>
    trpcClient.amenity.list.query(filters),

  getAmenity: (id: string | number) => trpcClient.amenity.get.query(String(id)),

  getCategories: () => trpcClient.amenity.categories.query(),

  getRecommendations: (tenantProfileId: string, budget?: { min: number; max: number }) =>
    trpcClient.amenity.recommend.query({ tenantProfileId, budget }),

  getCostEstimates: (amenityIds: string[], propertySize?: number) =>
    trpcClient.amenity.getCostEstimates.query({ amenityIds, propertySize }),
};

export default amenityService;