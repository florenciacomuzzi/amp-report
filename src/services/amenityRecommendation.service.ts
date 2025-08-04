import Amenity from '../models/Amenity';
import TenantProfile from '../models/TenantProfile';
import { Demographics, Preferences, Lifestyle, AmenityRecommendation } from '../types';
import { Op } from 'sequelize';

interface RecommendationScore {
  amenity: Amenity;
  score: number;
  rationale: string;
  priority: 'essential' | 'recommended' | 'nice-to-have';
}

export class AmenityRecommendationService {
  /**
   * Generate amenity recommendations based on tenant profile
   */
  static async getRecommendations(
    tenantProfileId: string,
    budget?: { min: number; max: number }
  ): Promise<AmenityRecommendation[]> {
    // Get tenant profile with full details
    const tenantProfile = await TenantProfile.findByPk(tenantProfileId);
    if (!tenantProfile) {
      throw new Error('Tenant profile not found');
    }
    
    // Use getDataValue to access JSON fields properly
    const profileData = tenantProfile.toJSON();
    console.log('Tenant profile in recommendation service:', {
      id: profileData.id,
      demographics: profileData.demographics,
      preferences: profileData.preferences,
      lifestyle: profileData.lifestyle
    });

    // Get all active amenities, optionally filtered by budget
    const whereClause: Record<string, any> = { isActive: true };
    if (budget) {
      whereClause.estimatedCostLow = { [Op.lte]: budget.max };
    }

    const amenities = await Amenity.findAll({ where: whereClause });

    // Score each amenity based on tenant profile match
    const scoredAmenities = amenities.map(amenity => {
      const amenityData = amenity.toJSON();
      return this.scoreAmenity(amenityData as Amenity, profileData as TenantProfile);
    });

    console.log('Scored amenities count:', scoredAmenities.length);
    console.log('Sample scores:', scoredAmenities.slice(0, 5).map(s => ({
      name: s.amenity.name,
      score: s.score,
      rationale: s.rationale
    })));
    
    // Sort by score and filter out low-scoring amenities
    const recommendations = scoredAmenities
      .filter(item => item.score > 0.1) // Only keep amenities with >10% match
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Top 15 recommendations
      
    console.log('Filtered recommendations count:', recommendations.length);

    // Convert to AmenityRecommendation format with ROI calculations
    return recommendations.map(rec => ({
      amenityId: rec.amenity.id,
      score: Math.round(rec.score * 100) / 100,
      rationale: rec.rationale,
      roi: this.calculateROI(rec.amenity, profileData as TenantProfile),
      priority: rec.priority
    }));
  }

  /**
   * Score an amenity based on how well it matches the tenant profile
   */
  private static scoreAmenity(
    amenity: Amenity,
    profile: TenantProfile
  ): RecommendationScore {
    let score = 0;
    const rationale: string[] = [];
    const { demographics, preferences, lifestyle } = profile;

    // Score based on demographics
    score += this.scoreDemographics(amenity, demographics, rationale);
    
    // Score based on preferences
    score += this.scorePreferences(amenity, preferences, rationale);
    
    // Score based on lifestyle
    score += this.scoreLifestyle(amenity, lifestyle, rationale);

    // Add base popularity and impact scores
    score += (amenity.popularityScore / 100) * 0.2;
    score += (amenity.impactScore / 100) * 0.2;

    // Normalize score to 0-1 range
    score = Math.min(1, score);
    
    console.log(`Amenity: ${amenity.name}, Score: ${score}, Rationale: ${rationale.join(', ')}`);

    // Determine priority based on score and amenity characteristics
    let priority: 'essential' | 'recommended' | 'nice-to-have' = 'nice-to-have';
    if (score > 0.7 || this.isEssential(amenity, profile)) {
      priority = 'essential';
    } else if (score > 0.5) {
      priority = 'recommended';
    }

    return {
      amenity,
      score,
      rationale: rationale.join('. '),
      priority
    };
  }

  /**
   * Score based on demographics match
   */
  private static scoreDemographics(
    amenity: Amenity,
    demographics: Demographics,
    rationale: string[]
  ): number {
    let score = 0;

    // Check if demographics exists and has required properties
    if (!demographics || !demographics.ageRange) {
      return score;
    }

    // Young professionals (age 25-35) preferences
    if (demographics.ageRange.min <= 35 && demographics.ageRange.max >= 25) {
      if (['Fitness Center', 'Co-working Space', 'High-Speed Internet Infrastructure'].includes(amenity.name)) {
        score += 0.15;
        rationale.push('Popular with young professionals');
      }
    }

    // Families (diverse age ranges, family composition)
    if (demographics.familyComposition && demographics.familyComposition.some(comp => 
      comp.toLowerCase().includes('family') || comp.toLowerCase().includes('children')
    )) {
      if (['Swimming Pool', 'Playground', 'BBQ/Picnic Area', 'Pet Park/Pet Wash Station'].includes(amenity.name)) {
        score += 0.2;
        rationale.push('Family-friendly amenity');
      }
    }

    // High-income tenants
    if (demographics.incomeRange && demographics.incomeRange.min >= 100000) {
      if (['Concierge Service', 'Valet Parking', 'Wine Storage', 'Smart Home Features'].includes(amenity.name)) {
        score += 0.15;
        rationale.push('Appeals to high-income residents');
      }
    }

    // Tech professionals
    if (demographics.professionalBackgrounds && demographics.professionalBackgrounds.some(bg => 
      bg.toLowerCase().includes('tech') || bg.toLowerCase().includes('engineer') || bg.toLowerCase().includes('developer')
    )) {
      if (amenity.category === 'Technology') {
        score += 0.2;
        rationale.push('Attractive to tech professionals');
      }
    }

    // Healthcare workers
    if (demographics.professionalBackgrounds && demographics.professionalBackgrounds.some(bg => 
      bg.toLowerCase().includes('healthcare') || bg.toLowerCase().includes('medical') || bg.toLowerCase().includes('nurse')
    )) {
      if (['24/7 Security', 'On-site Maintenance Team', 'Package Lockers'].includes(amenity.name)) {
        score += 0.15;
        rationale.push('Convenient for shift workers');
      }
    }

    return score;
  }

  /**
   * Score based on preferences match
   */
  private static scorePreferences(
    amenity: Amenity,
    preferences: Preferences,
    rationale: string[]
  ): number {
    let score = 0;

    // Check if preferences exists
    if (!preferences) {
      return score;
    }

    // Transportation needs
    if (preferences.transportationNeeds && preferences.transportationNeeds.some(need => 
      need.toLowerCase().includes('car') || need.toLowerCase().includes('driving')
    )) {
      if (['Covered Parking', 'EV Charging Stations', 'Valet Parking'].includes(amenity.name)) {
        score += 0.15;
        rationale.push('Matches transportation preferences');
      }
    }

    if (preferences.transportationNeeds && preferences.transportationNeeds.some(need => 
      need.toLowerCase().includes('bike') || need.toLowerCase().includes('bicycle')
    )) {
      if (['Bike Storage', 'Bike Repair Station'].includes(amenity.name)) {
        score += 0.2;
        rationale.push('Supports cycling lifestyle');
      }
    }

    // Pet ownership
    if (preferences.petOwnership !== undefined && preferences.petOwnership) {
      if (['Pet Park/Pet Wash Station', 'Pet Grooming Service'].includes(amenity.name)) {
        score += 0.25;
        rationale.push('Essential for pet owners');
      }
    }

    // Amenity priorities
    if (preferences.amenityPriorities && Array.isArray(preferences.amenityPriorities)) {
      preferences.amenityPriorities.forEach(priority => {
        const priorityLower = priority.toLowerCase();
        
        if (priorityLower.includes('fitness') && amenity.category === 'Fitness & Wellness') {
          score += 0.2;
          rationale.push('Matches fitness priority');
        }
        
        if (priorityLower.includes('work') && ['Co-working Space', 'High-Speed Internet Infrastructure'].includes(amenity.name)) {
          score += 0.2;
          rationale.push('Supports remote work needs');
        }
        
        if (priorityLower.includes('community') && amenity.category === 'Community') {
          score += 0.15;
          rationale.push('Aligns with community preferences');
        }
        
        if (priorityLower.includes('convenience') && amenity.category === 'Convenience') {
          score += 0.15;
          rationale.push('Provides desired convenience');
        }
        
        if (priorityLower.includes('eco') || priorityLower.includes('green') || priorityLower.includes('sustain')) {
          if (amenity.category === 'Sustainability' || ['EV Charging Stations', 'Bike Storage'].includes(amenity.name)) {
            score += 0.2;
            rationale.push('Supports eco-friendly lifestyle');
          }
        }
      });
    }

    return score;
  }

  /**
   * Score based on lifestyle match
   */
  private static scoreLifestyle(
    amenity: Amenity,
    lifestyle: Lifestyle[],
    rationale: string[]
  ): number {
    let score = 0;

    // Check if lifestyle exists and is an array
    if (!lifestyle || !Array.isArray(lifestyle)) {
      return score;
    }

    lifestyle.forEach(style => {
      const categoryLower = style.category.toLowerCase();
      const descriptionLower = style.description.toLowerCase();
      const importanceMultiplier = style.importance === 'high' ? 1.5 : style.importance === 'medium' ? 1 : 0.5;

      // Active/fitness lifestyle
      if (categoryLower.includes('active') || categoryLower.includes('fitness') || 
          descriptionLower.includes('exercise') || descriptionLower.includes('health')) {
        if (amenity.category === 'Fitness & Wellness') {
          score += 0.15 * importanceMultiplier;
          rationale.push('Supports active lifestyle');
        }
      }

      // Social lifestyle
      if (categoryLower.includes('social') || descriptionLower.includes('social') || 
          descriptionLower.includes('entertain')) {
        if (['Clubhouse/Community Room', 'BBQ/Picnic Area', 'Rooftop Terrace'].includes(amenity.name)) {
          score += 0.15 * importanceMultiplier;
          rationale.push('Facilitates social activities');
        }
      }

      // Professional/work-focused
      if (categoryLower.includes('professional') || categoryLower.includes('work') || 
          descriptionLower.includes('career') || descriptionLower.includes('remote')) {
        if (['Co-working Space', 'High-Speed Internet Infrastructure', 'Business Center'].includes(amenity.name)) {
          score += 0.2 * importanceMultiplier;
          rationale.push('Supports professional lifestyle');
        }
      }

      // Outdoor enthusiast
      if (categoryLower.includes('outdoor') || descriptionLower.includes('outdoor') || 
          descriptionLower.includes('nature')) {
        if (['BBQ/Picnic Area', 'Rooftop Terrace', 'Garden/Green Space', 'Bike Storage'].includes(amenity.name)) {
          score += 0.15 * importanceMultiplier;
          rationale.push('Appeals to outdoor enthusiasts');
        }
      }

      // Convenience-focused
      if (categoryLower.includes('convenience') || descriptionLower.includes('convenient') || 
          descriptionLower.includes('busy')) {
        if (amenity.category === 'Convenience' || ['Package Lockers', 'On-site Laundry'].includes(amenity.name)) {
          score += 0.15 * importanceMultiplier;
          rationale.push('Provides time-saving convenience');
        }
      }
    });

    return score;
  }

  /**
   * Determine if an amenity is essential based on profile
   */
  private static isEssential(amenity: Amenity, profile: TenantProfile): boolean {
    // Check if profile and its properties exist
    if (!profile || !profile.preferences || !profile.demographics) {
      return false;
    }

    // Pet amenities are essential for pet owners
    if (profile.preferences.petOwnership && 
        ['Pet Park/Pet Wash Station'].includes(amenity.name)) {
      return true;
    }

    // High-speed internet is essential for remote workers
    if (profile.demographics.professionalBackgrounds && 
        profile.demographics.professionalBackgrounds.some(bg => 
          bg.toLowerCase().includes('remote') || bg.toLowerCase().includes('tech')) &&
        amenity.name === 'High-Speed Internet Infrastructure') {
      return true;
    }

    // Package lockers essential for busy professionals
    if (profile.demographics.professionalBackgrounds && 
        profile.demographics.professionalBackgrounds.some(bg => 
          bg.toLowerCase().includes('healthcare') || bg.toLowerCase().includes('consultant')) &&
        amenity.name === 'Package Lockers') {
      return true;
    }

    return false;
  }

  /**
   * Calculate estimated ROI for an amenity
   */
  private static calculateROI(amenity: Amenity, profile: TenantProfile): number {
    // Base ROI calculation factors
    const avgCost = (amenity.estimatedCostLow + amenity.estimatedCostHigh) / 2;
    
    // Estimate monthly rent increase potential (in dollars)
    let rentIncreasePotential = 0;

    // High-impact amenities can command higher rent premiums
    if (amenity.impactScore > 80) {
      rentIncreasePotential += 50;
    } else if (amenity.impactScore > 60) {
      rentIncreasePotential += 30;
    } else {
      rentIncreasePotential += 15;
    }

    // Adjust based on income level
    if (profile.demographics && profile.demographics.incomeRange && 
        profile.demographics.incomeRange.min > 100000) {
      rentIncreasePotential *= 1.5;
    }

    // Category-specific adjustments
    switch (amenity.category) {
      case 'Fitness & Wellness':
        rentIncreasePotential *= 1.2;
        break;
      case 'Technology':
        if (profile.demographics && profile.demographics.professionalBackgrounds &&
            profile.demographics.professionalBackgrounds.some(bg => 
              bg.toLowerCase().includes('tech'))) {
          rentIncreasePotential *= 1.3;
        }
        break;
      case 'Luxury':
        if (profile.demographics && profile.demographics.incomeRange &&
            profile.demographics.incomeRange.min > 150000) {
          rentIncreasePotential *= 1.4;
        }
        break;
    }

    // Calculate annual additional revenue (assuming 80% occupancy)
    const unitsAffected = 50; // Default assumption, should be property-specific
    const annualRevenue = rentIncreasePotential * 12 * unitsAffected * 0.8;

    // Simple ROI calculation (annual revenue / cost)
    const roi = (annualRevenue / avgCost) * 100;

    return Math.round(roi * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get amenities with cost estimates within a budget range
   */
  static async getAmenitiesWithCostEstimates(
    amenityIds: string[],
    propertySize?: number
  ): Promise<Array<{
    amenity: Amenity;
    estimatedCost: {
      low: number;
      high: number;
      average: number;
    };
    implementationTime: string;
  }>> {
    const amenities = await Amenity.findAll({
      where: {
        id: {
          [Op.in]: amenityIds
        }
      }
    });

    return amenities.map(amenity => {
      const amenityData = amenity.toJSON();
      // Adjust costs based on property size if provided
      let costMultiplier = 1;
      if (propertySize) {
        if (propertySize > 200) {
          costMultiplier = 1.5;
        } else if (propertySize > 100) {
          costMultiplier = 1.25;
        }
      }

      const low = Math.round(amenityData.estimatedCostLow * costMultiplier);
      const high = Math.round(amenityData.estimatedCostHigh * costMultiplier);

      return {
        amenity: amenityData,
        estimatedCost: {
          low,
          high,
          average: Math.round((low + high) / 2)
        },
        implementationTime: amenityData.implementationTime
      };
    });
  }
}