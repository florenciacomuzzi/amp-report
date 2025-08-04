export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Property {
  id: number;
  userId: number;
  name: string;
  address: Address;
  propertyDetails: PropertyDetails;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
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

export interface TenantProfile {
  demographics: Demographics;
  preferences: Preferences;
  lifestyles: Lifestyle[];
}

export interface Amenity {
  id: number;
  name: string;
  category: string;
  estimatedCost: number;
  maintenanceCost: number;
  description?: string;
}

export interface AmenityRecommendation {
  amenityId: number;
  amenity?: Amenity;
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

export interface Analysis {
  id: number;
  propertyId: number;
  property?: Property;
  tenantProfile: TenantProfile;
  amenityRecommendations: AmenityRecommendation[];
  marketInsights: MarketInsight[];
  competitiveData: CompetitiveData;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;
}

export interface AnalysisState {
  analyses: Analysis[];
  currentAnalysis: Analysis | null;
  loading: boolean;
  error: string | null;
}