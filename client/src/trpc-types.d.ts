/**
 * TRPC Client Types
 * 
 * This file defines the client-side types for tRPC without importing server dependencies.
 * These types should match the server router structure defined in the API specs.
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Define the router structure based on the API specification
export interface AppRouter {
  auth: {
    register: {
      input: {
        email: string;
        password: string;
        name: string;
      };
      output: {
        user: {
          id: string;
          email: string;
          name: string;
        };
        token: string;
      };
    };
    login: {
      input: {
        email: string;
        password: string;
      };
      output: {
        user: {
          id: string;
          email: string;
          name: string;
        };
        token: string;
      };
    };
    logout: {
      input: void;
      output: { success: boolean };
    };
    refreshToken: {
      input: void;
      output: { token: string };
    };
  };
  property: {
    create: {
      input: {
        address: {
          street: string;
          city: string;
          state: string;
          zipCode: string;
          country?: string;
        };
        numberOfUnits: number;
        propertyType: 'apartment' | 'condo' | 'townhouse' | 'single-family';
        yearBuilt?: number;
        currentAmenities?: string[];
        targetRentRange?: {
          min: number;
          max: number;
        };
        preferences?: string;
      };
      output: {
        id: string;
        address: {
          street: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
        };
        coordinates: {
          latitude: number;
          longitude: number;
        };
        numberOfUnits: number;
        propertyType: string;
        yearBuilt?: number;
        currentAmenities: string[];
        targetRentRange?: {
          min: number;
          max: number;
        };
        preferences?: string;
        createdAt: string;
        updatedAt: string;
      };
    };
    update: {
      input: {
        id: string;
        data: {
          address?: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
          };
          numberOfUnits?: number;
          propertyType?: 'apartment' | 'condo' | 'townhouse' | 'single-family';
          yearBuilt?: number;
          currentAmenities?: string[];
          targetRentRange?: {
            min: number;
            max: number;
          };
          preferences?: string;
        };
      };
      output: {
        id: string;
        address: {
          street: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
        };
        coordinates: {
          latitude: number;
          longitude: number;
        };
        numberOfUnits: number;
        propertyType: string;
        yearBuilt?: number;
        currentAmenities: string[];
        targetRentRange?: {
          min: number;
          max: number;
        };
        preferences?: string;
        createdAt: string;
        updatedAt: string;
      };
    };
    delete: {
      input: { id: string };
      output: { success: boolean };
    };
    getById: {
      input: { id: string };
      output: {
        id: string;
        address: {
          street: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
        };
        coordinates: {
          latitude: number;
          longitude: number;
        };
        numberOfUnits: number;
        propertyType: string;
        yearBuilt?: number;
        currentAmenities: string[];
        targetRentRange?: {
          min: number;
          max: number;
        };
        preferences?: string;
        createdAt: string;
        updatedAt: string;
      };
    };
    list: {
      input: {
        limit?: number;
        offset?: number;
        search?: string;
      };
      output: {
        properties: Array<{
          id: string;
          address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
          };
          numberOfUnits: number;
          propertyType: string;
          createdAt: string;
        }>;
        total: number;
      };
    };
    validateAddress: {
      input: { address: string };
      output: {
        valid: boolean;
        suggestions: string[];
        coordinates?: {
          latitude: number;
          longitude: number;
        };
      };
    };
  };
  amenity: {
    getRecommendations: {
      input: {
        propertyId: string;
        tenantProfileId: string;
        budget?: {
          min: number;
          max: number;
        };
        categories?: string[];
      };
      output: {
        recommendations: Array<{
          id: string;
          name: string;
          category: string;
          description: string;
          estimatedCost: {
            low: number;
            high: number;
          };
          score: number;
          impact: string;
        }>;
      };
    };
    getCategories: {
      input: void;
      output: Array<{
        id: string;
        name: string;
        icon: string;
      }>;
    };
  };
  analysis: {
    createAnalysis: {
      input: {
        propertyId: string;
        tenantProfileId: string;
        selectedAmenities: string[];
      };
      output: {
        id: string;
        propertyId: string;
        tenantProfileId: string;
        selectedAmenities: string[];
        marketInsights: any;
        competitiveAnalysis: any;
        roiProjections: any;
        createdAt: string;
      };
    };
    getAnalysis: {
      input: { analysisId: string };
      output: {
        id: string;
        propertyId: string;
        tenantProfileId: string;
        selectedAmenities: string[];
        marketInsights: any;
        competitiveAnalysis: any;
        roiProjections: any;
        createdAt: string;
      };
    };
  };
  tenantProfile: {
    generateProfile: {
      input: {
        propertyId: string;
        conversationHistory?: Array<{
          role: 'user' | 'assistant';
          content: string;
        }>;
        preferences?: {
          targetDemographic?: string;
          incomeRange?: {
            min: number;
            max: number;
          };
          lifestylePreferences?: string[];
        };
      };
      output: {
        id: string;
        propertyId: string;
        demographics: {
          ageRange: string;
          incomeRange: string;
          education: string;
          occupation: string[];
        };
        preferences: {
          amenities: string[];
          location: string[];
          housing: string[];
        };
        lifestyle: string[];
        confidenceScore: number;
        createdAt: string;
      };
    };
    getByProperty: {
      input: { propertyId: string };
      output: {
        id: string;
        propertyId: string;
        demographics: {
          ageRange: string;
          incomeRange: string;
          education: string;
          occupation: string[];
        };
        preferences: {
          amenities: string[];
          location: string[];
          housing: string[];
        };
        lifestyle: string[];
        confidenceScore: number;
        createdAt: string;
      } | null;
    };
    chatWithAI: {
      input: {
        propertyId: string;
        message: string;
        conversationHistory: Array<{
          role: 'user' | 'assistant';
          content: string;
        }>;
      };
      output: {
        response: string;
        updatedProfile?: any;
      };
    };
  };
}

// Type utilities for easier use
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;