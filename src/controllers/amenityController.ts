import { Request, Response, NextFunction } from 'express';
import Amenity from '../models/Amenity';
import { AppError } from '../middleware/errorHandler';

export const getAmenities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, minCost, maxCost } = req.query;
    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (minCost) {
      where.estimatedCostLow = { $gte: Number(minCost) };
    }

    if (maxCost) {
      where.estimatedCostHigh = { $lte: Number(maxCost) };
    }

    const amenities = await Amenity.findAll({ where });

    res.json({
      success: true,
      amenities
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Amenity.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true
    });

    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    next(error);
  }
};

export const getAmenity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      throw new AppError('Amenity not found', 404);
    }

    res.json({
      success: true,
      amenity
    });
  } catch (error) {
    next(error);
  }
};

export const createAmenity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const amenity = await Amenity.create(req.body);

    res.status(201).json({
      success: true,
      amenity
    });
  } catch (error) {
    next(error);
  }
};

export const updateAmenity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      throw new AppError('Amenity not found', 404);
    }

    await amenity.update(req.body);

    res.json({
      success: true,
      amenity
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAmenity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      throw new AppError('Amenity not found', 404);
    }

    await amenity.update({ isActive: false });

    res.json({
      success: true,
      message: 'Amenity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};