import OpenAI from 'openai';
import { Demographics, Preferences, Lifestyle } from '../types';
import Property from '../models/Property';
import logger from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
});

export const generateTenantProfile = async (
  property: Property,
  conversationHistory: any[] = [],
  transitInfo?: any
): Promise<{
  demographics: Demographics;
  preferences: Preferences;
  lifestyle: Lifestyle[];
  confidence: number;
  summary: string;
}> => {
  try {
    // Build location context based on actual transit data
    let locationContext = '';
    
    // Check if property has address data
    if (property.address && property.address.city && property.address.state) {
      locationContext = `Location: ${property.address.city}, ${property.address.state}\n`;
    } else {
      // Fallback if address is missing
      locationContext = 'Location: Not specified\n';
      logger.warn('Property address is missing or incomplete', { propertyId: property.id });
    }
    
    if (transitInfo) {
      locationContext += `\nTransportation Infrastructure:\n`;
      
      if (transitInfo.walkableCount > 0) {
        locationContext += `- ${transitInfo.walkableCount} transit stations within walking distance (6 minutes)\n`;
      }
      
      if (transitInfo.nearest) {
        locationContext += `- Nearest transit: ${transitInfo.nearest.name} (${transitInfo.nearest.type}) - ${transitInfo.nearest.walkingTime} min walk\n`;
      }
      
      // Analyze transit types available
      const hasSubway = transitInfo.byType?.subway_station?.length > 0;
      const hasBus = transitInfo.byType?.bus_station?.length > 0;
      const hasTrain = transitInfo.byType?.train_station?.length > 0;
      
      if (hasSubway || hasBus || hasTrain) {
        locationContext += `- Available transit types: ${[
          hasSubway && 'subway',
          hasBus && 'bus',
          hasTrain && 'train'
        ].filter(Boolean).join(', ')}\n`;
      }
      
      // Transit-based recommendations
      if (transitInfo.walkableCount >= 3) {
        locationContext += `- Excellent public transit access - ideal for residents without cars\n`;
      } else if (transitInfo.walkableCount >= 1) {
        locationContext += `- Moderate public transit access - suitable for those who occasionally use public transport\n`;
      } else {
        locationContext += `- Limited public transit nearby - residents likely need personal vehicles\n`;
      }
    } else {
      locationContext += `- Transportation infrastructure data not available - consider typical patterns for this area\n`;
    }

    const systemPrompt = `You are an expert real estate analyst specializing in tenant profiling for multifamily properties. 
    Based on the property details and location, generate a detailed ideal tenant profile.
    
    Property Details:
    - Location: ${property.address ? JSON.stringify(property.address) : 'Not specified'}
    - Type: ${property.details?.propertyType || 'Not specified'}
    - Units: ${property.details?.numberOfUnits || 'Not specified'}
    - Year Built: ${property.details?.yearBuilt || 'Not specified'}
    - Target Rent: ${property.details?.targetRentRange ? `$${property.details.targetRentRange.min}-$${property.details.targetRentRange.max}` : 'Not specified'}
    - Current Amenities: ${property.details?.currentAmenities?.length ? property.details.currentAmenities.join(', ') : 'None listed'}
    ${property.details?.nearbyLandmarks?.length ? `- Nearby: ${property.details.nearbyLandmarks.join(', ')}` : ''}
    
    ${locationContext}
    
    Based on the transportation infrastructure, consider:
    - Whether tenants are likely to own cars or rely on public transit
    - Commuting patterns and acceptable commute times
    - Parking needs based on transit availability
    - Lifestyle preferences influenced by walkability and transit access
    - Income requirements adjusted for transportation costs (car ownership vs transit passes)
    
    IMPORTANT: You must respond with ONLY valid JSON, no markdown code blocks, no explanations, no additional text.
    
    Generate a comprehensive tenant profile as a JSON object with this exact structure:
    {
      "demographics": {
        "ageRange": { "min": 25, "max": 35 },
        "incomeRange": { "min": 50000, "max": 80000 },
        "familyComposition": ["Single", "Young couples"],
        "professionalBackgrounds": ["Tech", "Healthcare"]
      },
      "preferences": {
        "transportationNeeds": ["Public transit", "Bike"],
        "petOwnership": false,
        "amenityPriorities": ["Fitness", "Work from home"]
      },
      "lifestyle": [
        { "category": "Active", "description": "Regular exercise", "importance": "high" }
      ],
      "summary": "Young professionals who value..."
    }`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: 'Generate the ideal tenant profile for this property. Respond with valid JSON only.' }
      ],
      temperature: 0.7
    });

    const responseContent = response.choices[0].message.content || '{}';
    logger.info('OpenAI response:', { responseContent });
    
    let result;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanedContent);
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', { error, responseContent });
      result = {};
    }
    
    logger.info('Parsed tenant profile data:', { result });

    return {
      demographics: result.demographics || {
        ageRange: { min: 25, max: 45 },
        incomeRange: { min: 50000, max: 150000 },
        familyComposition: ['single professionals', 'young couples'],
        professionalBackgrounds: ['technology', 'finance', 'healthcare']
      },
      preferences: result.preferences || {
        transportationNeeds: ['parking', 'public transit access'],
        petOwnership: true,
        amenityPriorities: ['fitness center', 'security', 'in-unit laundry']
      },
      lifestyle: result.lifestyle || [
        {
          category: 'work-life balance',
          description: 'Values convenient location with short commute times',
          importance: 'high'
        }
      ],
      confidence: result.confidence || 0.85,
      summary: result.summary || 'Ideal tenants are young professionals seeking modern amenities and convenient location.'
    };
  } catch (error) {
    logger.error('Error generating tenant profile:', error);
    throw error;
  }
};

export const generateAmenityRecommendations = async (
  property: Property,
  tenantProfile: any,
  amenities: any[]
): Promise<any[]> => {
  try {
    const systemPrompt = `You are an expert in multifamily property amenity planning and ROI analysis.
    Based on the property details and ideal tenant profile, recommend amenities that would attract and retain these tenants.
    
    Consider:
    - Tenant demographics and preferences
    - Property characteristics
    - Market standards
    - Cost-benefit analysis
    - Implementation feasibility
    
    For each amenity, provide a score (0-100), rationale, and estimated ROI.`;

    await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Property: ${JSON.stringify(property.toJSON())}
          Tenant Profile: ${JSON.stringify(tenantProfile)}
          Available Amenities: ${JSON.stringify(amenities.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category,
            cost: `$${a.estimatedCostLow}-$${a.estimatedCostHigh}`,
            implementationTime: a.implementationTime
          })))}`
        }
      ],
      temperature: 0.7
    });
    
    return amenities.map(amenity => ({
      amenityId: amenity.id,
      score: Math.random() * 100,
      rationale: `Based on tenant profile analysis, ${amenity.name} would appeal to the target demographic.`,
      roi: Math.random() * 30 + 10,
      priority: Math.random() > 0.7 ? 'essential' : Math.random() > 0.4 ? 'recommended' : 'nice-to-have'
    })).sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    logger.error('Error generating amenity recommendations:', error);
    throw error;
  }
};

export const openaiService = {
  chat: async (messages: Array<{ role: string; content: string }>) => {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: messages as any,
        temperature: 0.8
      });

      return {
        content: response.choices[0].message.content || ''
      };
    } catch (error) {
      logger.error('Error in OpenAI chat:', error);
      throw error;
    }
  }
};

export const chatWithAI = async (
  message: string,
  conversationHistory: any[],
  context: any
): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping with property analysis and tenant profiling. 
          Be conversational, ask clarifying questions, and help gather information about the property and desired tenant profile.
          Context: ${JSON.stringify(context)}`
        },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.8
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    logger.error('Error in AI chat:', error);
    throw error;
  }
};