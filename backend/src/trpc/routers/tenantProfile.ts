import { router, protectedProcedure } from '../core';
import { z } from 'zod';
import TenantProfile from '../../models/TenantProfile';
import Property from '../../models/Property';
import { TRPCError } from '@trpc/server';
import { openaiService } from '../../services/openaiService';
import { calculateTenantProfileConfidence } from '../../utils/calculateConfidence';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const profileSchema = z.object({
  propertyId: z.string().uuid(),
  demographics: z.any(),
  preferences: z.any(),
  lifestyle: z.any(),
  conversationHistory: z.any().optional(),
  generationMethod: z.string().optional(),
  confidence: z.number().optional(),
  summary: z.string().optional(),
});

async function extractProfileFromConversation(messages: ChatMessage[], property?: any, transitInfo?: any) {
  try {
    // Build transportation context based on actual transit data
    let transportationContext = `For transportation needs in ${property?.address?.city || 'this location'}:\n`;
    
    if (transitInfo) {
      if (transitInfo.walkableCount >= 3) {
        transportationContext += `- Property has excellent public transit access (${transitInfo.walkableCount} stations nearby)
        - Note preferences for specific transit lines or routes mentioned
        - Car ownership may be optional - note if they prefer not to own a car
        - Walking distance preferences to transit are important`;
      } else if (transitInfo.walkableCount >= 1) {
        transportationContext += `- Property has moderate public transit access
        - Consider mixed transportation needs (both car and transit)
        - Note parking requirements if they own a vehicle
        - Include any transit proximity preferences`;
      } else {
        transportationContext += `- Property has limited public transit access
        - Car ownership is likely necessary - note parking needs
        - Consider commute distance tolerance by car
        - Note if lack of transit is mentioned as a concern`;
      }
      
      if (transitInfo.nearest) {
        transportationContext += `\n- Nearest transit: ${transitInfo.nearest.name} (${transitInfo.nearest.walkingTime} min walk)`;
      }
    } else {
      transportationContext += `- Transit data unavailable - note any transportation preferences mentioned
      - Include both car ownership/parking and public transit needs if discussed`;
    }

    const extractionPrompt = `Based on the following conversation, extract the tenant profile information.
    Property location: ${property?.address?.city}, ${property?.address?.state}
    
    ${transportationContext}
    
    Return a JSON object with:
    - demographics: { ageRange: { min, max }, incomeRange: { min, max }, familyComposition: [], professionalBackgrounds: [] }
    - preferences: { transportationNeeds: [], petOwnership: boolean, amenityPriorities: [] }
    - lifestyle: [{ category: string, description: string, importance: 'high' | 'medium' | 'low' }]
    - summary: A brief summary of the ideal tenant profile
    
    For age ranges, intelligently interpret natural language:
    - "young professionals" typically means 22-35 years
    - "recent graduates" typically means 22-28 years
    - "middle aged" typically means 35-55 years
    - "established professionals" typically means 30-50 years
    - "empty nesters" typically means 50-70 years
    - "retirees" typically means 60+ years
    - "young couples" typically means 25-35 years
    - "families with young children" typically means 28-45 years
    - Consider the context and adjust ranges accordingly
    
    For income ranges:
    - If only minimum is mentioned, estimate a reasonable maximum based on the context
    - Consider the property rent (if mentioned) - tenants typically need 3x monthly rent as annual income
    - If descriptive terms are used (e.g., "high earners", "moderate income"), translate to numeric ranges
    - Adjust for local cost of living if mentioned
    
    For transportation needs based on available transit:
    - Extract specific transit preferences (bus, subway, train) if mentioned
    - Note car ownership intentions and parking needs
    - Include walking distance preferences to transit
    - Consider commute patterns and acceptable distances
    
    Be specific and avoid generic/default values when possible.
    Always provide numeric values for age and income ranges, not null or 0.
    
    Conversation:
    ${JSON.stringify(messages)}`;

    const response = await openaiService.chat([
      { role: 'system', content: 'You are a data extraction assistant. Extract structured data from conversations.' },
      { role: 'user', content: extractionPrompt }
    ]);

    try {
      const extracted = JSON.parse(response.content);
      
      // Validate and fix data
      if (extracted) {
        // Fix income range if min > max or max is 0
        if (extracted.demographics?.incomeRange) {
          const { min, max } = extracted.demographics.incomeRange;
          
          // Calculate sensible max based on property rent if available
          let sensibleMax = min * 2; // Default to 2x min
          
          if (property?.details?.targetRentRange) {
            // Generally, tenants should earn 3x the monthly rent annually
            const monthlyRent = property.details.targetRentRange.max || property.details.targetRentRange.min;
            if (monthlyRent > 0) {
              const minIncomeForRent = monthlyRent * 12 * 3; // 3x rent rule
              sensibleMax = Math.max(minIncomeForRent * 1.5, min * 1.5); // Allow up to 50% more than minimum required
            }
          }
          
          if (min > max && min > 0) {
            // If max is 0 or less than min, use sensible max
            if (max === 0) {
              extracted.demographics.incomeRange = { min: min, max: sensibleMax };
            } else {
              // Otherwise swap them
              extracted.demographics.incomeRange = { min: max, max: min };
            }
          } else if (max === 0 && min > 0) {
            // If only max is 0, use sensible max
            extracted.demographics.incomeRange = { min: min, max: sensibleMax };
          } else if (min === 0 && max === 0) {
            // If both are 0, use defaults based on property rent
            if (property?.details?.targetRentRange) {
              const monthlyRent = property.details.targetRentRange.max || property.details.targetRentRange.min;
              if (monthlyRent > 0) {
                const minIncome = monthlyRent * 12 * 3; // 3x rent rule
                extracted.demographics.incomeRange = { min: minIncome, max: minIncome * 1.5 };
              }
            }
          }
        }
        
        // Fix age range if min > max
        if (extracted.demographics?.ageRange) {
          const { min, max } = extracted.demographics.ageRange;
          
          // Swap if reversed
          if (min > max && max > 0) {
            extracted.demographics.ageRange = { min: max, max: min };
          }
          
          // Ensure we have valid age ranges (AI should handle this, but as a safety check)
          if (!min || min === 0 || !max || max === 0) {
            // Default range for working professionals if AI fails to extract
            extracted.demographics.ageRange = { min: 25, max: 45 };
          }
        }
        
        // Calculate confidence based on extracted data
        extracted.confidence = calculateTenantProfileConfidence({
          demographics: extracted.demographics,
          preferences: extracted.preferences,
          lifestyle: extracted.lifestyle,
          conversationHistory: messages,
          generationMethod: 'chat',
        });
      }
      
      return extracted;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Error extracting profile:', error);
    return null;
  }
}

export const tenantProfileRouter = router({
  create: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ input }) => {
      const property = await Property.findByPk(input.propertyId);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }
      
      // Calculate confidence if not provided
      const confidence = input.confidence || calculateTenantProfileConfidence({
        demographics: input.demographics,
        preferences: input.preferences,
        lifestyle: input.lifestyle,
        conversationHistory: input.conversationHistory,
        generationMethod: input.generationMethod || 'chat',
      });
      
      const profile = await TenantProfile.create({
        ...input,
        confidence,
        summary: input.summary || 'Tenant profile created through chat conversation',
      });
      return { tenantProfile: profile };
    }),

  getByProperty: protectedProcedure
    .input(z.string())
    .query(async ({ input: propertyId }) => {
      const profile = await TenantProfile.findOne({ where: { propertyId } });
      // Return null instead of throwing error if no profile exists
      return { tenantProfile: profile };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), updates: z.any() }))
    .mutation(async ({ input: { id, updates } }) => {
      const profile = await TenantProfile.findByPk(id);
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant profile not found' });
      }
      await profile.update(updates);
      return { tenantProfile: profile };
    }),

  remove: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      const profile = await TenantProfile.findByPk(id);
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant profile not found' });
      }
      await profile.destroy();
      return { success: true };
    }),

  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })),
      propertyId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { messages, propertyId } = input;

      const property = await Property.findByPk(propertyId);
      if (!property) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
      }

      // Get transit information for the property if coordinates are available
      let transitInfo = null;
      if (property.latitude && property.longitude) {
        try {
          const { getNearbyTransit } = require('../../services/googleMapsService');
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
      
      const extractedProfile = await extractProfileFromConversation(messages, property, transitInfo);

      return { 
        response: response.content,
        extractedProfile 
      };
    }),
});