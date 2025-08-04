import { Demographics, Preferences, Lifestyle } from '../types';

interface ConfidenceFactors {
  demographics: Demographics;
  preferences: Preferences;
  lifestyle: Lifestyle[];
  conversationHistory?: any[];
  generationMethod?: string;
}

export function calculateTenantProfileConfidence(factors: ConfidenceFactors): number {
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Demographics completeness (weight: 30%)
  const demographicsScore = calculateDemographicsScore(factors.demographics);
  totalScore += demographicsScore * 0.3;
  totalWeight += 0.3;

  // 2. Preferences completeness (weight: 25%)
  const preferencesScore = calculatePreferencesScore(factors.preferences);
  totalScore += preferencesScore * 0.25;
  totalWeight += 0.25;

  // 3. Lifestyle details (weight: 20%)
  const lifestyleScore = calculateLifestyleScore(factors.lifestyle);
  totalScore += lifestyleScore * 0.2;
  totalWeight += 0.2;

  // 4. Data source quality (weight: 15%)
  const sourceScore = calculateSourceScore(factors.generationMethod, factors.conversationHistory);
  totalScore += sourceScore * 0.15;
  totalWeight += 0.15;

  // 5. Specificity of data (weight: 10%)
  const specificityScore = calculateSpecificityScore(factors);
  totalScore += specificityScore * 0.1;
  totalWeight += 0.1;

  // Calculate final confidence (0-1 scale)
  const confidence = totalWeight > 0 ? totalScore / totalWeight : 0.5;
  
  // Round to 2 decimal places
  return Math.round(confidence * 100) / 100;
}

function calculateDemographicsScore(demographics: Demographics): number {
  let score = 0;
  let fields = 0;
  let maxPossibleFields = 4; // Total possible demographic fields

  // Age range specificity
  if (demographics.ageRange?.min && demographics.ageRange?.max && demographics.ageRange.min > 0) {
    fields++;
    const ageSpread = demographics.ageRange.max - demographics.ageRange.min;
    // Narrower age range = higher confidence
    if (ageSpread <= 10) score += 1;
    else if (ageSpread <= 20) score += 0.85;
    else score += 0.7;
  }

  // Income range specificity
  if (demographics.incomeRange?.min && demographics.incomeRange?.max && demographics.incomeRange.min > 0) {
    fields++;
    const incomeRatio = demographics.incomeRange.max / demographics.incomeRange.min;
    // Narrower income range = higher confidence
    if (incomeRatio <= 1.5) score += 1;
    else if (incomeRatio <= 2) score += 0.85;
    else score += 0.7;
  }

  // Family composition
  if (demographics.familyComposition && demographics.familyComposition.length > 0) {
    fields++;
    score += demographics.familyComposition.length >= 2 ? 1 : 0.8;
  }

  // Professional backgrounds
  if (demographics.professionalBackgrounds && demographics.professionalBackgrounds.length > 0) {
    fields++;
    score += demographics.professionalBackgrounds.length >= 3 ? 1 : 0.8;
  }

  // Give partial credit for having some fields filled
  if (fields === 0) return 0.3; // Base score for starting
  
  // Calculate score based on filled fields, with bonus for completeness
  const baseScore = score / fields;
  const completenessBonus = (fields / maxPossibleFields) * 0.2;
  
  return Math.min(baseScore + completenessBonus, 1);
}

function calculatePreferencesScore(preferences: Preferences): number {
  let score = 0;
  let fields = 0;
  let maxPossibleFields = 3;

  // Transportation needs
  if (preferences.transportationNeeds && preferences.transportationNeeds.length > 0) {
    fields++;
    score += preferences.transportationNeeds.length >= 2 ? 1 : 0.8;
  }

  // Pet ownership (binary, so always complete if present)
  if (preferences.petOwnership !== undefined && preferences.petOwnership !== null) {
    fields++;
    score += 1;
  }

  // Amenity priorities
  if (preferences.amenityPriorities && preferences.amenityPriorities.length > 0) {
    fields++;
    score += Math.min(preferences.amenityPriorities.length / 5, 1); // Max score at 5+ amenities
  }

  // Give partial credit for having some fields filled
  if (fields === 0) return 0.3; // Base score for starting
  
  // Calculate score based on filled fields, with bonus for completeness
  const baseScore = score / fields;
  const completenessBonus = (fields / maxPossibleFields) * 0.15;
  
  return Math.min(baseScore + completenessBonus, 1);
}

function calculateLifestyleScore(lifestyle: Lifestyle[]): number {
  if (!lifestyle || lifestyle.length === 0) return 0;

  let score = 0;

  // More lifestyle factors = better understanding
  const countScore = Math.min(lifestyle.length / 5, 1); // Max score at 5+ factors
  score += countScore * 0.5;

  // Quality of lifestyle descriptions
  let qualityScore = 0;
  lifestyle.forEach(item => {
    if (item.category && item.description && item.importance) {
      // Longer descriptions indicate more detail
      const descLength = item.description.length;
      if (descLength > 100) qualityScore += 1;
      else if (descLength > 50) qualityScore += 0.8;
      else qualityScore += 0.5;
    }
  });
  
  if (lifestyle.length > 0) {
    score += (qualityScore / lifestyle.length) * 0.5;
  }

  return score;
}

function calculateSourceScore(generationMethod?: string, conversationHistory?: any[]): number {
  if (!generationMethod) return 0.5;

  switch (generationMethod) {
    case 'manual':
      return 0.9; // Manually entered data is most reliable
    case 'questionnaire':
      return 0.8; // Structured questionnaire is reliable
    case 'chat':
      // Chat reliability depends on conversation length/depth
      if (conversationHistory && conversationHistory.length > 20) {
        return 0.85;
      } else if (conversationHistory && conversationHistory.length > 10) {
        return 0.75;
      } else if (conversationHistory && conversationHistory.length > 5) {
        return 0.65;
      }
      return 0.55;
    default:
      return 0.5;
  }
}

function calculateSpecificityScore(factors: ConfidenceFactors): number {
  let specificityScore = 0;
  let checks = 0;

  // Check for default/generic values
  const { demographics, preferences } = factors;

  // Non-default age range
  if (demographics.ageRange?.min !== 25 || demographics.ageRange?.max !== 45) {
    specificityScore += 1;
  }
  checks++;

  // Non-default income range
  if (demographics.incomeRange?.min !== 50000 || demographics.incomeRange?.max !== 100000) {
    specificityScore += 1;
  }
  checks++;

  // Specific professional backgrounds (not generic)
  const genericProfessions = ['technology', 'finance', 'healthcare'];
  if (demographics.professionalBackgrounds?.length > 0) {
    const hasSpecific = demographics.professionalBackgrounds.some(
      prof => !genericProfessions.includes(prof.toLowerCase())
    );
    if (hasSpecific) specificityScore += 1;
  }
  checks++;

  // Specific amenity priorities
  if (preferences.amenityPriorities?.length > 3) {
    specificityScore += 1;
  }
  checks++;

  return checks > 0 ? specificityScore / checks : 0.5;
}