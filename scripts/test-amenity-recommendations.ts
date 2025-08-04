#!/usr/bin/env ts-node

import { Sequelize } from 'sequelize-typescript';
import Amenity from '../src/models/Amenity';
import TenantProfile from '../src/models/TenantProfile';
import Property from '../src/models/Property';
import User from '../src/models/User';
import Analysis from '../src/models/Analysis';
import AnalysisAmenity from '../src/models/AnalysisAmenity';
import { AmenityRecommendationService } from '../src/services/amenityRecommendation.service';
import { seedAmenities } from '../src/seeders/amenitySeeder';

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amp_dev', {
  models: [User, Property, TenantProfile, Amenity, Analysis, AnalysisAmenity],
  logging: false,
});

async function testAmenityRecommendations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check if amenities exist, if not seed them
    const amenityCount = await Amenity.count();
    if (amenityCount === 0) {
      console.log('📦 Seeding amenities...');
      await seedAmenities();
    }

    // Create test profiles with different characteristics
    const testProfiles = [
      {
        name: 'Young Tech Professional',
        demographics: {
          ageRange: { min: 25, max: 35 },
          incomeRange: { min: 80000, max: 120000 },
          familyComposition: ['Single', 'No children'],
          professionalBackgrounds: ['Tech', 'Software Developer']
        },
        preferences: {
          transportationNeeds: ['Car', 'Bike'],
          petOwnership: false,
          amenityPriorities: ['Work from home', 'Fitness', 'Technology']
        },
        lifestyle: [
          { category: 'Professional', description: 'Remote work focused', importance: 'high' },
          { category: 'Active', description: 'Regular exercise routine', importance: 'medium' }
        ]
      },
      {
        name: 'Family with Children',
        demographics: {
          ageRange: { min: 30, max: 45 },
          incomeRange: { min: 100000, max: 150000 },
          familyComposition: ['Family', 'Two children'],
          professionalBackgrounds: ['Healthcare', 'Education']
        },
        preferences: {
          transportationNeeds: ['Car', 'Public Transit'],
          petOwnership: true,
          amenityPriorities: ['Family-friendly', 'Safety', 'Community']
        },
        lifestyle: [
          { category: 'Family-oriented', description: 'Focus on children activities', importance: 'high' },
          { category: 'Social', description: 'Community engagement', importance: 'medium' }
        ]
      },
      {
        name: 'High-Income Executive',
        demographics: {
          ageRange: { min: 35, max: 50 },
          incomeRange: { min: 150000, max: 300000 },
          familyComposition: ['Couple', 'No children'],
          professionalBackgrounds: ['Executive', 'Management Consultant']
        },
        preferences: {
          transportationNeeds: ['Car'],
          petOwnership: false,
          amenityPriorities: ['Luxury', 'Convenience', 'Security']
        },
        lifestyle: [
          { category: 'Professional', description: 'Busy schedule, values convenience', importance: 'high' },
          { category: 'Luxury', description: 'Appreciates high-end amenities', importance: 'high' }
        ]
      }
    ];

    // Create a test property
    const testProperty = await Property.create({
      name: 'Test Property',
      address: {
        street: '123 Test Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      details: {
        numberOfUnits: 100,
        propertyType: 'apartment',
        yearBuilt: 2010,
        currentAmenities: ['Basic Gym'],
        targetRentRange: { min: 2000, max: 4000 }
      },
      userId: 'test-user-id'
    });

    console.log('\n🏢 Testing amenity recommendations for different tenant profiles:\n');

    for (const profileData of testProfiles) {
      // Create tenant profile
      const profile = await TenantProfile.create({
        propertyId: testProperty.id,
        demographics: profileData.demographics,
        preferences: profileData.preferences,
        lifestyle: profileData.lifestyle,
        confidence: 0.9,
        summary: `Test profile for ${profileData.name}`,
        generationMethod: 'manual'
      });

      console.log(`\n👤 ${profileData.name}:`);
      console.log('━'.repeat(50));

      // Get recommendations without budget constraint
      const recommendations = await AmenityRecommendationService.getRecommendations(profile.id);

      // Display top 5 recommendations
      console.log('\nTop 5 Recommended Amenities:');
      for (let i = 0; i < Math.min(5, recommendations.length); i++) {
        const rec = recommendations[i];
        const amenity = await Amenity.findByPk(rec.amenityId);
        if (amenity) {
          console.log(`\n${i + 1}. ${amenity.name} (${amenity.category})`);
          console.log(`   Score: ${(rec.score * 100).toFixed(0)}%`);
          console.log(`   Priority: ${rec.priority}`);
          console.log(`   ROI: ${rec.roi}%`);
          console.log(`   Cost: $${amenity.estimatedCostLow.toLocaleString()} - $${amenity.estimatedCostHigh.toLocaleString()}`);
          console.log(`   Rationale: ${rec.rationale}`);
        }
      }

      // Test with budget constraint
      console.log('\n💰 With budget constraint ($50,000 - $150,000):');
      const budgetRecommendations = await AmenityRecommendationService.getRecommendations(
        profile.id,
        { min: 50000, max: 150000 }
      );

      const budgetAmenities = budgetRecommendations.slice(0, 3);
      for (const rec of budgetAmenities) {
        const amenity = await Amenity.findByPk(rec.amenityId);
        if (amenity) {
          console.log(`- ${amenity.name}: $${amenity.estimatedCostLow.toLocaleString()} - $${amenity.estimatedCostHigh.toLocaleString()}`);
        }
      }

      // Get cost estimates for recommended amenities
      const topAmenityIds = recommendations.slice(0, 3).map(r => r.amenityId);
      const costEstimates = await AmenityRecommendationService.getAmenitiesWithCostEstimates(
        topAmenityIds,
        testProperty.details.numberOfUnits
      );

      console.log('\n💵 Cost Estimates (adjusted for property size):');
      for (const estimate of costEstimates) {
        console.log(`- ${estimate.amenity.name}:`);
        console.log(`  Average: $${estimate.estimatedCost.average.toLocaleString()}`);
        console.log(`  Implementation: ${estimate.implementationTime}`);
      }

      // Clean up test data
      await profile.destroy();
    }

    // Clean up
    await testProperty.destroy();

    console.log('\n\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAmenityRecommendations();