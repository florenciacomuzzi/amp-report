import { Client } from '@googlemaps/google-maps-services-js';
import logger from '../utils/logger';

const client = new Client({});

export const geocodeAddress = async (address: string) => {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });

    if (response.data.results.length === 0) {
      throw new Error('No results found for address');
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
      components: result.address_components
    };
  } catch (error) {
    logger.error('Geocoding error:', error);
    throw error;
  }
};

export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  types: string[] = ['school', 'shopping_mall', 'transit_station', 'park']
) => {
  try {
    const places: any[] = [];

    for (const type of types) {
      const response = await client.placesNearby({
        params: {
          location: { lat: latitude, lng: longitude },
          radius: 2000, // 2km radius
          type,
          key: process.env.GOOGLE_MAPS_API_KEY!
        }
      });

      places.push(...response.data.results.map(place => ({
        name: place.name,
        type,
        address: place.vicinity,
        rating: place.rating,
        distance: place.geometry ? calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ) : 0
      })));
    }

    return places.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    logger.error('Places search error:', error);
    throw error;
  }
};

export const getNearbyTransit = async (
  latitude: number,
  longitude: number
) => {
  try {
    const transitTypes = ['subway_station', 'train_station', 'bus_station', 'transit_station'];
    const transitPlaces: any[] = [];

    for (const type of transitTypes) {
      const response = await client.placesNearby({
        params: {
          location: { lat: latitude, lng: longitude },
          radius: 1000, // 1km radius for transit
          type,
          key: process.env.GOOGLE_MAPS_API_KEY!
        }
      });

      transitPlaces.push(...response.data.results.map(place => ({
        name: place.name,
        type: type.replace('_', ' '),
        address: place.vicinity,
        distance: place.geometry ? calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ) : 0,
        walkingTime: place.geometry ? Math.round(calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ) / 0.08) : 0 // Assuming 80m/min walking speed
      })));
    }

    // Sort by distance and group by type
    const sortedTransit = transitPlaces.sort((a, b) => a.distance - b.distance);
    
    return {
      nearest: sortedTransit[0] || null,
      byType: transitTypes.reduce((acc, type) => {
        acc[type] = sortedTransit.filter(t => t.type === type.replace('_', ' ')).slice(0, 3);
        return acc;
      }, {} as any),
      all: sortedTransit.slice(0, 10),
      walkableCount: sortedTransit.filter(t => t.distance <= 500).length // Within ~6 min walk
    };
  } catch (error) {
    logger.error('Transit search error:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'photos', 'types', 'vicinity'],
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });

    return response.data.result;
  } catch (error) {
    logger.error('Place details error:', error);
    throw error;
  }
};

export const getStaticMapUrl = (
  latitude: number,
  longitude: number,
  zoom: number = 15,
  size: string = '600x400'
) => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: zoom.toString(),
    size,
    maptype: 'satellite',
    markers: `color:red|${latitude},${longitude}`,
    key: process.env.GOOGLE_MAPS_API_KEY!
  });

  return `${baseUrl}?${params.toString()}`;
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}