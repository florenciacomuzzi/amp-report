import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Property from '../models/Property';
import { AppError } from '../middleware/errorHandler';
import * as googleMapsService from '../services/googleMapsService';

interface AuthRequest extends Request {
  user?: any;
}

export const getProperties = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const where: any = { isActive: true };
    if (req.user) {
      where.userId = req.user.id;
    } else {
      where.userId = null;
    }

    const properties = await Property.findAll({ where });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    next(error);
  }
};

export const getProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id, {
      include: ['tenantProfiles', 'analyses']
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.userId && (!req.user || property.userId !== req.user.id)) {
      throw new AppError('Unauthorized', 403);
    }

    res.json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address, details, latitude, longitude, name, description } = req.body;

    const property = await Property.create({
      userId: req.user?.id,
      address,
      details,
      latitude,
      longitude,
      name,
      description
    });

    return res.status(201).json({
      success: true,
      property
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    await property.update(req.body);

    res.json({
      success: true,
      property
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    await property.update({ isActive: false });

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const geocodeAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.body;
    
    // Check if Google Maps API key is configured
    if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
      // Return mock data for development
      return res.json({
        success: true,
        result: {
          formattedAddress: address,
          latitude: 40.6782 + (Math.random() - 0.5) * 0.1, // Brooklyn, NY area
          longitude: -73.9442 + (Math.random() - 0.5) * 0.1,
          placeId: 'mock_place_id_' + Date.now()
        }
      });
    }
    
    const geocodeResult = await googleMapsService.geocodeAddress(address);

    return res.json({
      success: true,
      result: geocodeResult
    });
  } catch (error) {
    return next(error);
  }
};

export const getNearbyPlaces = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { types } = req.query;

    const property = await Property.findByPk(id);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const nearbyPlaces = await googleMapsService.getNearbyPlaces(
      property.latitude,
      property.longitude,
      types ? (types as string).split(',') : undefined
    );

    const mapUrl = googleMapsService.getStaticMapUrl(
      property.latitude,
      property.longitude
    );

    res.json({
      success: true,
      nearbyPlaces,
      mapUrl
    });
  } catch (error) {
    next(error);
  }
};