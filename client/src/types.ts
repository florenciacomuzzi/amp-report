export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface PropertyDetails {
  numberOfUnits: number;
  propertyType: 'apartment' | 'condo' | 'townhouse' | 'other';
  yearBuilt: number;
  currentAmenities: string[];
  specialFeatures?: string;
  targetRentRange: {
    min: number;
    max: number;
  };
  nearbyLandmarks?: string[];
}

export interface Demographics {
  ageRange: {
    min: number;
    max: number;
  };
  incomeRange: {
    min: number;
    max: number;
  };
  familyComposition: string[];
  professionalBackgrounds: string[];
}

export interface Preferences {
  transportationNeeds: string[];
  petOwnership: boolean;
  amenityPriorities: string[];
}

export interface Lifestyle {
  category: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
}

export interface AmenityRecommendation {
  amenityId: string;
  score: number;
  rationale: string;
  roi: number;
  priority: 'essential' | 'recommended' | 'nice-to-have';
}

export interface MarketInsight {
  category: string;
  insight: string;
  dataPoints: any[];
}

export interface CompetitiveData {
  nearbyProperties: any[];
  marketPosition: string;
  advantages: string[];
  opportunities: string[];
}

export interface Property {
  id: string;
  userId?: string;
  name: string;
  address: Address;
  latitude?: number;
  longitude?: number;
  propertyDetails: PropertyDetails;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantProfile {
  id: string;
  propertyId: string;
  demographics: Demographics;
  preferences: Preferences;
  lifestyle: Lifestyle[];
  conversationHistory?: any;
  generationMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}