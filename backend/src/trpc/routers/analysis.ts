import { router, protectedProcedure } from '../core';
import { z } from 'zod';
import Analysis from '../../models/Analysis';
import Amenity from '../../models/Amenity';
import Property from '../../models/Property';
import TenantProfile from '../../models/TenantProfile';
import { TRPCError } from '@trpc/server';
import * as openaiService from '../../services/openaiService';
import { AmenityRecommendationService } from '../../services/amenityRecommendation.service';

export const analysisRouter = router({
  // Get analysis by id
  get: protectedProcedure
    .input(z.string())
    .query(async ({ input: analysisId }) => {
      const analysis = await Analysis.findByPk(analysisId, {
        include: [
          'property',
          'tenantProfile',
          {
            model: Amenity,
            as: 'recommendedAmenities',
            through: { attributes: ['score', 'rationale', 'roi', 'priority'] },
          },
        ],
      });
      if (!analysis) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Analysis not found' });
      }
      return { analysis };
    }),

  // Generate tenant profile for a property
  generateTenantProfile: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .mutation(async ({ input }) => {
      const property = await Property.findByPk(input.propertyId);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      
      console.log('Property data being sent to OpenAI:', JSON.stringify(property.toJSON(), null, 2));

      const profileData = await openaiService.generateTenantProfile(property);
      console.log('Profile data from OpenAI:', JSON.stringify(profileData, null, 2));
      
      const tenantProfile = await TenantProfile.create({
        propertyId: input.propertyId,
        demographics: profileData.demographics,
        preferences: profileData.preferences,
        lifestyle: profileData.lifestyle,
        confidence: profileData.confidence,
        summary: profileData.summary,
        generationMethod: 'chat',
      });
      
      console.log('Created tenant profile:', JSON.stringify(tenantProfile.toJSON(), null, 2));
      return { tenantProfile };
    }),

  // Generate amenity recommendations & create analysis record
  recommendations: protectedProcedure
    .input(z.object({ 
      propertyId: z.string(), 
      tenantProfileId: z.string(),
      budget: z.object({
        min: z.number(),
        max: z.number()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      const property = await Property.findByPk(input.propertyId);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      const tenantProfile = await TenantProfile.findByPk(input.tenantProfileId);
      if (!tenantProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant profile not found' });
      }
      
      console.log('Retrieved tenant profile for recommendations:', JSON.stringify(tenantProfile.toJSON(), null, 2));
      
      // Use our new recommendation service
      const recommendations = await AmenityRecommendationService.getRecommendations(
        input.tenantProfileId,
        input.budget
      );

      // Get full amenity details for the recommendations
      const amenityIds = recommendations.map(r => r.amenityId);
      const amenities = await Amenity.findAll({
        where: { id: amenityIds }
      });
      const amenitiesData = amenities.map(a => a.toJSON());

      // Create analysis with default market insights and competitive data
      const analysis = await Analysis.create({
        propertyId: input.propertyId,
        tenantProfileId: input.tenantProfileId,
        marketInsights: [],
        competitiveAnalysis: {
          nearbyProperties: [],
          marketPosition: 'To be analyzed',
          advantages: [],
          opportunities: []
        },
        status: 'draft',
      });

      // Add recommended amenities to the analysis
      for (const rec of recommendations) {
        await analysis.$add('recommendedAmenities', rec.amenityId, {
          through: {
            score: rec.score,
            rationale: rec.rationale,
            roi: rec.roi,
            priority: rec.priority,
          },
        });
      }

      // Get cost estimates for the recommendations
      const costEstimates = await AmenityRecommendationService.getAmenitiesWithCostEstimates(
        amenityIds,
        property.details?.numberOfUnits
      );

      return { 
        analysis, 
        recommendations: recommendations.map(rec => {
          const amenity = amenitiesData.find(a => a.id === rec.amenityId);
          const costEstimate = costEstimates.find(ce => ce.amenity.id === rec.amenityId);
          return {
            ...rec,
            amenity,
            estimatedCost: costEstimate?.estimatedCost
          };
        })
      };
    }),

  // Chat with AI helper
  chat: protectedProcedure
    .input(z.object({ propertyId: z.string(), message: z.string(), conversationHistory: z.array(z.any()).optional() }))
    .mutation(async ({ input }) => {
      const property = await Property.findByPk(input.propertyId);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      const response = await openaiService.chatWithAI(
        input.message,
        input.conversationHistory || [],
        { property: property.toJSON() },
      );
      return { response };
    }),
});