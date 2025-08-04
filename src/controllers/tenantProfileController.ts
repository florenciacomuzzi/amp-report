import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import TenantProfile from '../models/TenantProfile';
import Property from '../models/Property';
import { openaiService } from '../services/openaiService';
import { Demographics, Preferences, Lifestyle } from '../types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const tenantProfileController = {
  async createTenantProfile(req: Request, res: Response) {
    try {
      const {
        propertyId,
        demographics,
        preferences,
        lifestyle,
        conversationHistory,
        generationMethod = 'manual'
      } = req.body;

      const property = await Property.findByPk(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const confidence = calculateConfidence(demographics, preferences, lifestyle);
      
      const summary = await generateProfileSummary({
        demographics,
        preferences,
        lifestyle,
        propertyDetails: property.details
      });

      const tenantProfile = await TenantProfile.create({
        id: uuidv4(),
        propertyId,
        demographics,
        preferences,
        lifestyle,
        confidence,
        summary,
        conversationHistory,
        generationMethod
      });

      return res.status(201).json(tenantProfile);
    } catch (error) {
      console.error('Error creating tenant profile:', error);
      return res.status(500).json({ error: 'Failed to create tenant profile' });
    }
  },

  async getTenantProfileByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      const tenantProfile = await TenantProfile.findOne({
        where: { propertyId },
        include: [Property]
      });

      if (!tenantProfile) {
        return res.status(404).json({ error: 'Tenant profile not found' });
      }

      return res.json(tenantProfile);
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
      return res.status(500).json({ error: 'Failed to fetch tenant profile' });
    }
  },

  async updateTenantProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const tenantProfile = await TenantProfile.findByPk(id);
      if (!tenantProfile) {
        return res.status(404).json({ error: 'Tenant profile not found' });
      }

      if (updates.demographics || updates.preferences || updates.lifestyle) {
        updates.confidence = calculateConfidence(
          updates.demographics || tenantProfile.demographics,
          updates.preferences || tenantProfile.preferences,
          updates.lifestyle || tenantProfile.lifestyle
        );

        const property = await Property.findByPk(tenantProfile.propertyId);
        updates.summary = await generateProfileSummary({
          demographics: updates.demographics || tenantProfile.demographics,
          preferences: updates.preferences || tenantProfile.preferences,
          lifestyle: updates.lifestyle || tenantProfile.lifestyle,
          propertyDetails: property!.details
        });
      }

      await tenantProfile.update(updates);
      return res.json(tenantProfile);
    } catch (error) {
      console.error('Error updating tenant profile:', error);
      return res.status(500).json({ error: 'Failed to update tenant profile' });
    }
  },

  async deleteTenantProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tenantProfile = await TenantProfile.findByPk(id);
      if (!tenantProfile) {
        return res.status(404).json({ error: 'Tenant profile not found' });
      }

      await tenantProfile.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting tenant profile:', error);
      return res.status(500).json({ error: 'Failed to delete tenant profile' });
    }
  },

  async chatWithAI(req: Request, res: Response) {
    try {
      const { messages, propertyId } = req.body;

      const property = await Property.findByPk(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Get transit information for the property if coordinates are available
      let transitInfo = null;
      if (property.latitude && property.longitude) {
        try {
          const { getNearbyTransit } = require('../services/googleMapsService');
          transitInfo = await getNearbyTransit(property.latitude, property.longitude);
        } catch (error) {
          console.error('Error fetching transit info:', error);
        }
      }

      // Build location-specific guidance based on actual transit data
      let locationGuidance = `For ${property.address?.city || 'this location'}, consider asking about:\n`;
      
      if (transitInfo) {
        if (transitInfo.walkableCount >= 3) {
          locationGuidance += `- Whether they prefer public transit over driving (excellent transit access available)
         - Which transit lines/routes are important for their commute
         - If proximity to transit stations is a priority`;
        } else if (transitInfo.walkableCount >= 1) {
          locationGuidance += `- Balance between car ownership and public transit use
         - Parking needs if they own a vehicle
         - Acceptable walking distance to transit`;
        } else {
          locationGuidance += `- Car ownership and parking requirements (limited public transit nearby)
         - Commute distance tolerance
         - Whether lack of nearby transit is a concern`;
        }
        
        if (transitInfo.nearest) {
          locationGuidance += `\n- Note: Nearest transit is ${transitInfo.nearest.name} (${transitInfo.nearest.walkingTime} min walk)`;
        }
      } else {
        locationGuidance += `- Transportation preferences (car vs public transit)
         - Parking needs
         - Commute requirements`;
      }

      const systemPrompt = `You are a helpful assistant gathering information to create an ideal tenant profile for a property. 
      The property is located at: ${property.address?.street}, ${property.address?.city}, ${property.address?.state} ${property.address?.zip}
      Property details: ${JSON.stringify(property.details, null, 2)}
      
      ${transitInfo ? `Transit Information:
      - ${transitInfo.walkableCount} transit stations within walking distance
      - Nearest: ${transitInfo.nearest?.name || 'None'} (${transitInfo.nearest?.walkingTime || 'N/A'} min walk)
      - Available transit types: ${Object.keys(transitInfo.byType || {}).filter(k => transitInfo.byType[k].length > 0).map(k => k.replace('_station', '')).join(', ') || 'None'}
      ` : ''}
      
      ${locationGuidance}
      
      Your goal is to ask questions and gather information about:
      1. Demographics (age range, income range, family composition, professional backgrounds)
      2. Preferences (transportation needs based on available options, pet ownership, amenity priorities)
      3. Lifestyle factors
      
      Be conversational but focused. Ask one question at a time and guide the conversation naturally.
      When asking about transportation, reference the actual transit options available.
      When you have enough information, summarize what you've learned.`;

      const chatMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await openaiService.chat(chatMessages);
      
      const extractedProfile = await extractProfileFromConversation(messages);

      return res.json({ 
        response: response.content,
        extractedProfile 
      });
    } catch (error) {
      console.error('Error in AI chat:', error);
      return res.status(500).json({ error: 'Failed to process chat request' });
    }
  },

  async generateSummary(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tenantProfile = await TenantProfile.findByPk(id, {
        include: [Property]
      });

      if (!tenantProfile) {
        return res.status(404).json({ error: 'Tenant profile not found' });
      }

      const summary = await generateProfileSummary({
        demographics: tenantProfile.demographics,
        preferences: tenantProfile.preferences,
        lifestyle: tenantProfile.lifestyle,
        propertyDetails: tenantProfile.property.details
      });

      await tenantProfile.update({ summary });
      return res.json(tenantProfile);
    } catch (error) {
      console.error('Error generating summary:', error);
      return res.status(500).json({ error: 'Failed to generate summary' });
    }
  }
};

function calculateConfidence(
  demographics: Demographics,
  preferences: Preferences,
  lifestyle: Lifestyle[]
): number {
  let score = 0;
  let totalFields = 0;

  if (demographics.ageRange.min > 0) score += 1;
  if (demographics.incomeRange.min > 0) score += 1;
  if (demographics.familyComposition.length > 0) score += 1;
  if (demographics.professionalBackgrounds.length > 0) score += 1;
  totalFields += 4;

  if (preferences.transportationNeeds.length > 0) score += 1;
  if (preferences.amenityPriorities.length > 0) score += 1;
  totalFields += 2;

  if (lifestyle.length > 0) score += 1;
  totalFields += 1;

  return Math.round((score / totalFields) * 100);
}

async function generateProfileSummary(data: {
  demographics: Demographics;
  preferences: Preferences;
  lifestyle: Lifestyle[];
  propertyDetails: any;
}): Promise<string> {
  const prompt = `Create a concise summary of this ideal tenant profile:
  
  Demographics:
  - Age range: ${data.demographics.ageRange.min}-${data.demographics.ageRange.max}
  - Income range: $${data.demographics.incomeRange.min}-$${data.demographics.incomeRange.max}
  - Family composition: ${data.demographics.familyComposition.join(', ')}
  - Professional backgrounds: ${data.demographics.professionalBackgrounds.join(', ')}
  
  Preferences:
  - Transportation: ${data.preferences.transportationNeeds.join(', ')}
  - Pets: ${data.preferences.petOwnership ? 'Yes' : 'No'}
  - Amenity priorities: ${data.preferences.amenityPriorities.join(', ')}
  
  Lifestyle: ${data.lifestyle.map(l => l.description).join(', ')}
  
  Property type: ${data.propertyDetails.propertyType}
  
  Write a 2-3 sentence summary describing the ideal tenant for this property.`;

  const response = await openaiService.chat([
    { role: 'user', content: prompt }
  ]);

  return response.content;
}

async function extractProfileFromConversation(
  messages: ChatMessage[]
): Promise<Partial<{
  demographics: Partial<Demographics>;
  preferences: Partial<Preferences>;
  lifestyle: Lifestyle[];
}>> {
  const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  
  const prompt = `Based on this conversation about creating a tenant profile, extract any mentioned information:
  
  ${conversation}
  
  Extract and return in JSON format:
  {
    "demographics": {
      "ageRange": { "min": number or null, "max": number or null },
      "incomeRange": { "min": number or null, "max": number or null },
      "familyComposition": [],
      "professionalBackgrounds": []
    },
    "preferences": {
      "transportationNeeds": [],
      "petOwnership": boolean or null,
      "amenityPriorities": []
    },
    "lifestyle": []
  }
  
  Only include fields that were explicitly mentioned. Return valid JSON.`;

  try {
    const response = await openaiService.chat([
      { role: 'user', content: prompt }
    ]);
    
    return JSON.parse(response.content);
  } catch (error) {
    console.error('Error extracting profile:', error);
    return {};
  }
}