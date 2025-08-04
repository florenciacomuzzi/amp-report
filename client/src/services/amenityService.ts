import { trpcClient } from '../trpcStandalone';

const amenityService = {
  getAmenities: (filters?: { category?: string; minCost?: number; maxCost?: number }) =>
    trpcClient.amenity.list.query(filters),

  getAmenity: (id: string | number) => trpcClient.amenity.get.query(String(id)),

  getCategories: () => trpcClient.amenity.categories.query(),
};

export default amenityService;