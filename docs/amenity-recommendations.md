# Amenity Recommendations Feature

## Overview

The amenity recommendation system analyzes tenant profiles to suggest suitable amenities that would appeal to the target demographic, along with cost estimates and ROI projections.

## How It Works

### 1. Profile Analysis
The system evaluates tenant profiles based on:
- **Demographics**: Age, income, family composition, professional backgrounds
- **Preferences**: Transportation needs, pet ownership, amenity priorities
- **Lifestyle**: Categories like active, professional, social, with importance levels

### 2. Scoring Algorithm
Each amenity is scored (0-1) based on:
- Demographic match (e.g., fitness centers for young professionals)
- Preference alignment (e.g., pet amenities for pet owners)
- Lifestyle compatibility (e.g., co-working spaces for remote workers)
- Base popularity and impact scores

### 3. Priority Classification
Amenities are categorized as:
- **Essential**: Score > 70% or critical for specific profiles
- **Recommended**: Score > 50%
- **Nice-to-have**: Score > 30%

### 4. ROI Calculation
ROI is estimated based on:
- Average implementation cost
- Potential rent increase
- Property size and occupancy
- Target demographic income levels

## API Endpoints

### tRPC Endpoints

```typescript
// Get amenity recommendations
trpc.amenity.recommend.query({
  tenantProfileId: string,
  budget?: { min: number, max: number }
})

// Get cost estimates
trpc.amenity.getCostEstimates.query({
  amenityIds: string[],
  propertySize?: number
})
```

### REST API Endpoints

```
GET /api/amenities/recommendations?tenantProfileId=xxx&minBudget=50000&maxBudget=150000
POST /api/amenities/cost-estimates
```

## Example Recommendations

### Young Tech Professional
1. **Co-working Space** (85% match) - Essential for remote work
2. **High-Speed Internet** (95% match) - Critical infrastructure
3. **Fitness Center** (80% match) - Popular with age group
4. **Smart Home Features** (80% match) - Appeals to tech-savvy residents
5. **EV Charging Stations** (75% match) - Future-proofing

### Family with Children
1. **Pet Park/Pet Wash** (82% match) - Essential for pet owners
2. **Swimming Pool** (85% match) - Family-friendly amenity
3. **BBQ/Picnic Area** (75% match) - Social gatherings
4. **Playground** (90% match) - Critical for families
5. **Package Lockers** (85% match) - Convenience for busy parents

### High-Income Executive
1. **Concierge Service** (85% match) - Luxury convenience
2. **Valet Parking** (80% match) - Premium service
3. **Package Lockers** (90% match) - Essential for deliveries
4. **Wine Storage** (75% match) - Luxury amenity
5. **Business Center** (85% match) - Professional needs

## Cost Considerations

The system adjusts cost estimates based on:
- Property size (larger properties have higher implementation costs)
- Regional variations
- Quality/luxury level of implementation

## Usage in Analysis

When creating a property analysis:
1. Generate or select a tenant profile
2. Request amenity recommendations
3. Review suggestions with scores and rationale
4. Select amenities within budget
5. View ROI projections and implementation timeline