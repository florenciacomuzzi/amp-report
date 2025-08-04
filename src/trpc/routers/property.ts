import { router, protectedProcedure } from '../core';
import { z } from 'zod';
import Property from '../../models/Property';
import * as googleMapsService from '../../services/googleMapsService';
import * as rentEstimationService from '../../services/rentEstimationService';
import { TRPCError } from '@trpc/server';

export const propertyRouter = router({
  // GET /properties → list current user's or public properties
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const where: any = { isActive: true };
      if (ctx.user) {
        where.userId = ctx.user.id;
      } else {
        where.userId = null;
      }
      const properties = await Property.findAll({ where });
      return { properties };
    }),

  // GET /properties/:id
  get: protectedProcedure
    .input(z.string())
    .query(async ({ input: id, ctx }) => {
      const property = await Property.findByPk(id, {
        include: ['tenantProfiles', 'analyses'],
      });
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      
      console.log('Property get:', {
        propertyId: id,
        propertyUserId: property.userId,
        currentUserId: ctx.user?.id,
        hasUserId: !!property.userId
      });
      
      if (property.userId && property.userId !== ctx.user!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return { property };
    }),

  // POST /properties
  create: protectedProcedure
    .input(z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string().optional(),
      }),
      details: z.object({
        numberOfUnits: z.number(),
        propertyType: z.enum(['apartment', 'condo', 'townhouse', 'other']),
        yearBuilt: z.number(),
        currentAmenities: z.array(z.string()).optional(),
        specialFeatures: z.string().optional(),
        targetRentRange: z.object({
          min: z.number(),
          max: z.number(),
        }),
        nearbyLandmarks: z.array(z.string()).optional(),
      }),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      name: z.string(),
      description: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Set default coordinates if not provided
      let { latitude, longitude } = input;
      if (!latitude || !longitude) {
        // Default to Brooklyn coordinates
        latitude = 40.6782;
        longitude = -73.9442;
      }

      // Check if rent range needs estimation
      if (!rentEstimationService.isRentRangeReasonable(
        input.details.targetRentRange.min,
        input.details.targetRentRange.max
      )) {
        try {
          const estimate = await rentEstimationService.estimateRentRange({
            address: input.address,
            details: input.details,
            latitude,
            longitude,
          });
          
          // Use estimated values if current values are not reasonable
          if (!input.details.targetRentRange.min || input.details.targetRentRange.min <= 0) {
            input.details.targetRentRange.min = estimate.min;
          }
          if (!input.details.targetRentRange.max || input.details.targetRentRange.max <= 0) {
            input.details.targetRentRange.max = estimate.max;
          }
          
          // Ensure max is greater than min
          if (input.details.targetRentRange.min >= input.details.targetRentRange.max) {
            // If user provided a min, set max to be 50% higher
            if (input.details.targetRentRange.min > 0) {
              input.details.targetRentRange.max = Math.round(input.details.targetRentRange.min * 1.5 / 50) * 50;
            } else {
              // Otherwise use the estimates
              input.details.targetRentRange.min = estimate.min;
              input.details.targetRentRange.max = estimate.max;
            }
          }
        } catch (error) {
          console.error('Failed to estimate rent range:', error);
          // Continue with provided values
        }
      }

      const property = await Property.create({
        userId: ctx.user!.id,
        address: input.address,
        details: input.details,
        latitude,
        longitude,
        name: input.name,
        description: input.description,
      });
      return { property };
    }),

  // PUT /properties/:id
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zip: z.string(),
          country: z.string().optional(),
        }).optional(),
        details: z.object({
          numberOfUnits: z.number(),
          propertyType: z.enum(['apartment', 'condo', 'townhouse', 'other']),
          yearBuilt: z.number(),
          currentAmenities: z.array(z.string()).optional(),
          specialFeatures: z.string().optional(),
          targetRentRange: z.object({
            min: z.number(),
            max: z.number(),
          }),
          nearbyLandmarks: z.array(z.string()).optional(),
        }).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
      }),
    }))
    .mutation(async ({ input: { id, data }, ctx }) => {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      
      console.log('Property update:', {
        propertyId: id,
        propertyUserId: property.userId,
        currentUserId: ctx.user?.id,
        hasUserId: !!property.userId
      });
      
      // Only check authorization if property has a userId
      // Properties without userId are considered public/demo properties
      if (property.userId && property.userId !== ctx.user!.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update this property' });
      }
      
      await property.update(data);
      return { property };
    }),

  // Geocode address (POST)
  geocode: protectedProcedure
    .input(z.object({ address: z.string() }))
    .mutation(async ({ input }) => {
      const { address } = input;
      if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
        return {
          result: {
            formattedAddress: address,
            latitude: 40.6782 + (Math.random() - 0.5) * 0.1,
            longitude: -73.9442 + (Math.random() - 0.5) * 0.1,
            placeId: 'mock_place_id_' + Date.now(),
          },
        };
      }
      const result = await googleMapsService.geocodeAddress(address);
      return { result };
    }),

  // Estimate rent range
  estimateRent: protectedProcedure
    .input(z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      details: z.object({
        numberOfUnits: z.number(),
        propertyType: z.enum(['apartment', 'condo', 'townhouse', 'other']),
        yearBuilt: z.number(),
        currentAmenities: z.array(z.string()).optional(),
        specialFeatures: z.string().optional(),
      }),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const estimate = await rentEstimationService.estimateRentRange(input);
      return { estimate };
    }),

  // GET nearby places for propertyId
  nearbyPlaces: protectedProcedure
    .input(z.object({ id: z.string(), types: z.array(z.string()).optional() }))
    .query(async ({ input }) => {
      const property = await Property.findByPk(input.id);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      const nearbyPlaces = await googleMapsService.getNearbyPlaces(
        property.latitude,
        property.longitude,
        input.types,
      );
      const mapUrl = googleMapsService.getStaticMapUrl(property.latitude, property.longitude);
      return { nearbyPlaces, mapUrl };
    }),

  // DELETE /properties/:id (soft delete)
  remove: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: id, ctx }) => {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      
      console.log('Delete attempt:', {
        propertyId: id,
        propertyUserId: property.userId,
        currentUserId: ctx.user?.id,
        userIdType: typeof ctx.user?.id,
        propertyUserIdType: typeof property.userId
      });
      
      // Allow deletion if property has no userId (legacy data) or if user owns it
      if (property.userId && property.userId !== ctx.user!.id) {
        // Double-check with string comparison in case of type mismatch
        if (String(property.userId) !== String(ctx.user!.id)) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own properties' });
        }
      }
      await property.update({ isActive: false });
      return { success: true };
    }),
});
