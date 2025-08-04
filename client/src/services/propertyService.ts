import { trpcClient } from '../trpcStandalone';
import { Property } from '../types';

const propertyService = {
  getProperties: () => trpcClient.property.list.query(),

  getProperty: (id: string | number) => trpcClient.property.get.query(String(id)),

  createProperty: (data: Partial<Property>) => trpcClient.property.create.mutate(data as any),

  updateProperty: (id: string | number, data: Partial<Property>) => trpcClient.property.update.mutate({ id: String(id), data }),

  deleteProperty: (id: string | number) => trpcClient.property.remove.mutate(String(id)),

  // These two endpoints still call the REST fallbacks until equivalent tRPC procedures exist
  geocodeAddress: (address: string) => trpcClient.property.geocode.mutate({ address }),

  getNearbyPlaces: (id: string | number, types?: string[]) => trpcClient.property.nearbyPlaces.query({ id: String(id), types }),
};

export default propertyService;