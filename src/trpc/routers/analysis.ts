import { router, protectedProcedure } from '../core';
import { z } from 'zod';
import Analysis from '../../models/Analysis';
import Amenity from '../../models/Amenity';
import Property from '../../models/Property';
import TenantProfile from '../../models/TenantProfile';
import { TRPCError } from '@trpc/server';
import * as openaiService from '../../services/openaiService';

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

      const profileData = await openaiService.generateTenantProfile(property);
      const tenantProfile = await TenantProfile.create({
        propertyId: input.propertyId,
        ...profileData,
        generationMethod: 'chat',
      });
      return { tenantProfile };
    }),

  // Generate amenity recommendations & create analysis record
  recommendations: protectedProcedure
    .input(z.object({ propertyId: z.string(), tenantProfileId: z.string() }))
    .mutation(async ({ input }) => {
      const property = await Property.findByPk(input.propertyId);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      const tenantProfile = await TenantProfile.findByPk(input.tenantProfileId);
      if (!tenantProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant profile not found' });
      }
      const amenities = await Amenity.findAll({ where: { isActive: true } });
      const recommendations = await openaiService.generateAmenityRecommendations(
        property,
        tenantProfile,
        amenities,
      );

      const analysis = await Analysis.create({
        propertyId: input.propertyId,
        tenantProfileId: input.tenantProfileId,
        status: 'draft',
      });
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
      return { analysis, recommendations };
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