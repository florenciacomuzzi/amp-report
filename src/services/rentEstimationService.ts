import * as openaiService from './openaiService';

interface PropertyData {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  details: {
    numberOfUnits: number;
    propertyType: 'apartment' | 'condo' | 'townhouse' | 'other';
    yearBuilt: number;
    currentAmenities?: string[];
    specialFeatures?: string;
  };
  latitude?: number;
  longitude?: number;
}

interface RentEstimate {
  min: number;
  max: number;
  confidence: number;
  factors: string[];
  methodology: string;
}

// Base rent estimates by property type and location (simplified model)
const BASE_RENT_BY_TYPE = {
  apartment: { min: 1200, max: 2000 },
  condo: { min: 1500, max: 2500 },
  townhouse: { min: 2000, max: 3500 },
  other: { min: 1500, max: 2500 },
};

// Adjustment factors
const AGE_FACTOR = -0.01; // -1% per year older than 10 years
const AMENITY_BONUS = 50; // $50 per premium amenity
const LOCATION_MULTIPLIERS: Record<string, number> = {
  // Major cities get a multiplier
  'New York': 2.5,
  'San Francisco': 2.3,
  'Los Angeles': 1.8,
  'Chicago': 1.5,
  'Boston': 1.9,
  'Seattle': 1.8,
  'Washington': 1.7,
  'Miami': 1.6,
  'Austin': 1.5,
  'Denver': 1.4,
};

// Premium amenities that add value
const PREMIUM_AMENITIES = [
  'gym', 'fitness center', 'pool', 'parking', 'garage', 
  'concierge', 'doorman', 'rooftop', 'balcony', 'terrace',
  'washer', 'dryer', 'dishwasher', 'central air', 'elevator'
];

export async function estimateRentRange(propertyData: PropertyData): Promise<RentEstimate> {
  const factors: string[] = [];
  
  // Start with base rent for property type
  let baseMin = BASE_RENT_BY_TYPE[propertyData.details.propertyType].min;
  let baseMax = BASE_RENT_BY_TYPE[propertyData.details.propertyType].max;
  factors.push(`Base ${propertyData.details.propertyType} rent: $${baseMin}-$${baseMax}`);
  
  // Adjust for location
  const city = propertyData.address.city;
  let locationMultiplier = 1;
  
  // Check if it's a major city
  for (const [cityName, multiplier] of Object.entries(LOCATION_MULTIPLIERS)) {
    if (city.toLowerCase().includes(cityName.toLowerCase())) {
      locationMultiplier = multiplier;
      factors.push(`${cityName} market premium: ${((multiplier - 1) * 100).toFixed(0)}%`);
      break;
    }
  }
  
  // Apply location multiplier
  baseMin = Math.round(baseMin * locationMultiplier);
  baseMax = Math.round(baseMax * locationMultiplier);
  
  // Adjust for property age
  const currentYear = new Date().getFullYear();
  const propertyAge = currentYear - propertyData.details.yearBuilt;
  if (propertyAge > 10) {
    const ageAdjustment = 1 + (AGE_FACTOR * (propertyAge - 10));
    baseMin = Math.round(baseMin * ageAdjustment);
    baseMax = Math.round(baseMax * ageAdjustment);
    factors.push(`Property age (${propertyAge} years): ${(AGE_FACTOR * (propertyAge - 10) * 100).toFixed(0)}%`);
  } else if (propertyAge <= 5) {
    // New construction premium
    baseMin = Math.round(baseMin * 1.15);
    baseMax = Math.round(baseMax * 1.15);
    factors.push(`New construction premium: +15%`);
  }
  
  // Adjust for amenities
  if (propertyData.details.currentAmenities && propertyData.details.currentAmenities.length > 0) {
    const premiumAmenityCount = propertyData.details.currentAmenities
      .filter(amenity => PREMIUM_AMENITIES.some(premium => 
        amenity.toLowerCase().includes(premium)
      )).length;
    
    if (premiumAmenityCount > 0) {
      const amenityBonus = premiumAmenityCount * AMENITY_BONUS;
      baseMin += amenityBonus;
      baseMax += amenityBonus;
      factors.push(`Premium amenities (${premiumAmenityCount}): +$${amenityBonus}`);
    }
  }
  
  // Adjust for special features using AI if available
  if (propertyData.details.specialFeatures && process.env.OPENAI_API_KEY) {
    try {
      const prompt = `Based on these special features of a ${propertyData.details.propertyType} in ${city}, ${propertyData.address.state}, estimate the percentage premium or discount they would add to rent. Features: "${propertyData.details.specialFeatures}". Respond with just a number between -20 and +30 representing the percentage adjustment.`;
      
      const response = await openaiService.generateTenantProfile(prompt);
      const adjustment = parseFloat(response.content) || 0;
      
      if (adjustment !== 0) {
        const adjustmentFactor = 1 + (adjustment / 100);
        baseMin = Math.round(baseMin * adjustmentFactor);
        baseMax = Math.round(baseMax * adjustmentFactor);
        factors.push(`Special features adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}%`);
      }
    } catch (error) {
      console.error('Error getting AI rent adjustment:', error);
    }
  }
  
  // Ensure min is less than max
  if (baseMin > baseMax) {
    [baseMin, baseMax] = [baseMax, baseMin];
  }
  
  // Round to nearest $50
  baseMin = Math.round(baseMin / 50) * 50;
  baseMax = Math.round(baseMax / 50) * 50;
  
  // Calculate confidence based on data completeness
  let confidence = 0.7; // Base confidence
  if (locationMultiplier > 1) confidence += 0.1;
  if (propertyData.details.currentAmenities && propertyData.details.currentAmenities.length > 0) confidence += 0.1;
  if (propertyData.latitude && propertyData.longitude) confidence += 0.1;
  
  return {
    min: baseMin,
    max: baseMax,
    confidence: Math.min(confidence, 1),
    factors,
    methodology: 'Market-based estimation using property type, location, age, and amenities'
  };
}

// Function to check if rent range seems reasonable
export function isRentRangeReasonable(min: number, max: number): boolean {
  // Check if values are positive
  if (min <= 0 || max <= 0) return false;
  
  // Check if min is less than max
  if (min >= max) return false;
  
  // Check if range is too wide (more than 2x)
  if (max > min * 2) return false;
  
  // Check if values are within reasonable bounds ($500 - $10,000)
  if (min < 500 || max > 10000) return false;
  
  return true;
}