import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Property from '../models/Property';
import TenantProfile from '../models/TenantProfile';
import Analysis from '../models/Analysis';
import Amenity from '../models/Amenity';
import { AppError } from '../middleware/errorHandler';
import * as openaiService from '../services/openaiService';
import PDFDocument from 'pdfkit';

interface AuthRequest extends Request {
  user?: any;
}

export const generateTenantProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { propertyId } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Get transit information if coordinates are available
    let transitInfo = null;
    if (property.latitude && property.longitude) {
      try {
        const { getNearbyTransit } = require('../services/googleMapsService');
        transitInfo = await getNearbyTransit(property.latitude, property.longitude);
      } catch (error) {
        console.error('Error fetching transit info:', error);
      }
    }

    const profileData = await openaiService.generateTenantProfile(property, [], transitInfo);

    const tenantProfile = await TenantProfile.create({
      propertyId,
      ...profileData,
      generationMethod: 'chat'
    });

    res.status(201).json({
      success: true,
      tenantProfile
    });
  } catch (error) {
    next(error);
  }
};

export const chatWithAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { propertyId, message, conversationHistory = [] } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const response = await openaiService.chatWithAI(
      message,
      conversationHistory,
      { property: property.toJSON() }
    );

    res.json({
      success: true,
      response
    });
  } catch (error) {
    next(error);
  }
};

export const generateRecommendations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { propertyId, tenantProfileId } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const tenantProfile = await TenantProfile.findByPk(tenantProfileId);
    if (!tenantProfile) {
      throw new AppError('Tenant profile not found', 404);
    }

    const amenities = await Amenity.findAll({ where: { isActive: true } });

    const recommendations = await openaiService.generateAmenityRecommendations(
      property,
      tenantProfile,
      amenities
    );

    const analysis = await Analysis.create({
      propertyId,
      tenantProfileId,
      marketInsights: [
        {
          category: 'Demographics',
          insight: 'Target demographic aligns with local market trends',
          dataPoints: []
        }
      ],
      competitiveAnalysis: {
        nearbyProperties: [],
        marketPosition: 'Competitive',
        advantages: ['Modern amenities', 'Prime location'],
        opportunities: ['Upgrade common areas', 'Add smart home features']
      },
      status: 'draft'
    });

    for (const rec of recommendations) {
      await analysis.$add('recommendedAmenities', rec.amenityId, {
        through: {
          score: rec.score,
          rationale: rec.rationale,
          roi: rec.roi,
          priority: rec.priority
        }
      });
    }

    res.status(201).json({
      success: true,
      analysis,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { analysisId } = req.params;

    const analysis = await Analysis.findByPk(analysisId, {
      include: [
        'property',
        'tenantProfile',
        {
          model: Amenity,
          as: 'recommendedAmenities',
          through: { attributes: ['score', 'rationale', 'roi', 'priority'] }
        }
      ]
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { analysisId } = req.params;
    const { format } = req.body;

    const analysis = await Analysis.findByPk(analysisId, {
      include: ['property', 'tenantProfile', 'recommendedAmenities']
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=analysis-${analysisId}.pdf`);
      
      doc.pipe(res);
      
      doc.fontSize(20).text('AMP Report Analysis', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(`Property: ${analysis.property.name || analysis.property.address.street}`);
      doc.moveDown();
      doc.fontSize(12).text('Executive Summary', { underline: true });
      doc.text(analysis.executiveSummary || 'Analysis summary pending...');
      
      doc.end();
    } else {
      res.json({
        success: true,
        message: 'Excel export not yet implemented'
      });
    }
  } catch (error) {
    next(error);
  }
};