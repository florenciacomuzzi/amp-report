import { router, publicProcedure } from '../core';
import Amenity from '../../models/Amenity';
import { Op } from 'sequelize';
import { z } from 'zod';
import { AmenityRecommendationService } from '../../services/amenityRecommendation.service';

export const amenityRouter = router({
  // List amenities with optional filters
  list: publicProcedure
    .input(z
      .object({
        category: z.string().optional(),
        minCost: z.number().optional(),
        maxCost: z.number().optional(),
      })
      .optional())
    .query(async ({ input }: { input: { category?: string; minCost?: number; maxCost?: number } | undefined }) => {
      const where: any = { isActive: true };
      if (input?.category) where.category = input.category;
      if (input?.minCost) where.estimatedCostLow = { [Op.gte]: input.minCost };
      if (input?.maxCost) where.estimatedCostHigh = { [Op.lte]: input.maxCost };
      const amenities = await Amenity.findAll({ where });
      return { amenities };
    }),

  categories: publicProcedure.query(async () => {
    const categories = await Amenity.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true,
    });
    return { categories: categories.map((c: any) => c.category) };
  }),

  get: publicProcedure
    .input(z.string())
    .query(async ({ input: id }: { input: string }) => {
      const amenity = await Amenity.findByPk(id);
      if (!amenity) {
        throw new Error('Amenity not found');
      }
      return { amenity };
    }),

  // Get amenity recommendations based on tenant profile
  recommend: publicProcedure
    .input(z.object({
      tenantProfileId: z.string(),
      budget: z.object({
        min: z.number(),
        max: z.number()
      }).optional()
    }))
    .query(async ({ input }) => {
      const recommendations = await AmenityRecommendationService.getRecommendations(
        input.tenantProfileId,
        input.budget
      );
      return { recommendations };
    }),

  // Get cost estimates for specific amenities
  getCostEstimates: publicProcedure
    .input(z.object({
      amenityIds: z.array(z.string()),
      propertySize: z.number().optional()
    }))
    .query(async ({ input }) => {
      const estimates = await AmenityRecommendationService.getAmenitiesWithCostEstimates(
        input.amenityIds,
        input.propertySize
      );
      return { estimates };
    }),
});
