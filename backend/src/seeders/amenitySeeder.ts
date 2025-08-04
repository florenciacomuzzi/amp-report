import Amenity from '../models/Amenity';

export const seedAmenities = async () => {
  const amenities = [
    // Fitness & Wellness
    {
      name: 'Fitness Center',
      category: 'Fitness & Wellness',
      description: 'Fully equipped gym with cardio and strength training equipment',
      estimatedCostLow: 50000,
      estimatedCostHigh: 150000,
      implementationTime: '2-3 months',
      impactScore: 85,
      popularityScore: 90,
      requirements: ['Dedicated space', 'Ventilation', 'Equipment maintenance'],
      benefits: ['Attracts health-conscious tenants', 'Premium rent potential', 'Competitive advantage']
    },
    {
      name: 'Yoga Studio',
      category: 'Fitness & Wellness',
      description: 'Dedicated space for yoga and meditation classes',
      estimatedCostLow: 20000,
      estimatedCostHigh: 50000,
      implementationTime: '1-2 months',
      impactScore: 70,
      popularityScore: 75,
      requirements: ['Quiet space', 'Mirror walls', 'Storage for equipment'],
      benefits: ['Appeals to wellness-focused tenants', 'Community building', 'Low maintenance']
    },
    {
      name: 'Swimming Pool',
      category: 'Fitness & Wellness',
      description: 'Outdoor or indoor swimming pool with deck area',
      estimatedCostLow: 100000,
      estimatedCostHigh: 500000,
      implementationTime: '4-6 months',
      impactScore: 90,
      popularityScore: 85,
      requirements: ['Large space', 'Permits', 'Ongoing maintenance'],
      benefits: ['Major attraction', 'Summer amenity', 'Family-friendly']
    },
    
    // Technology
    {
      name: 'High-Speed Internet Infrastructure',
      category: 'Technology',
      description: 'Fiber optic internet with WiFi throughout common areas',
      estimatedCostLow: 30000,
      estimatedCostHigh: 80000,
      implementationTime: '1-2 months',
      impactScore: 95,
      popularityScore: 98,
      requirements: ['ISP partnership', 'Network infrastructure'],
      benefits: ['Essential for remote workers', 'Competitive necessity', 'Revenue opportunity']
    },
    {
      name: 'Smart Home Features',
      category: 'Technology',
      description: 'Smart locks, thermostats, and lighting in units',
      estimatedCostLow: 500,
      estimatedCostHigh: 2000,
      implementationTime: '1 week per unit',
      impactScore: 80,
      popularityScore: 85,
      requirements: ['Compatible systems', 'Tenant education'],
      benefits: ['Energy efficiency', 'Security', 'Modern appeal']
    },
    {
      name: 'EV Charging Stations',
      category: 'Technology',
      description: 'Electric vehicle charging stations in parking area',
      estimatedCostLow: 5000,
      estimatedCostHigh: 15000,
      implementationTime: '2-4 weeks per station',
      impactScore: 75,
      popularityScore: 70,
      requirements: ['Electrical capacity', 'Parking space', 'Permits'],
      benefits: ['Future-proofing', 'Eco-conscious appeal', 'Premium parking fees']
    },
    {
      name: 'Package Lockers',
      category: 'Technology',
      description: 'Secure automated package receiving system',
      estimatedCostLow: 15000,
      estimatedCostHigh: 40000,
      implementationTime: '2-3 weeks',
      impactScore: 85,
      popularityScore: 90,
      requirements: ['Indoor/covered space', 'Power/internet connection'],
      benefits: ['Reduces package theft', 'Staff efficiency', 'Tenant convenience']
    },
    
    // Community
    {
      name: 'Clubhouse/Community Room',
      category: 'Community',
      description: 'Multi-purpose space for events and gatherings',
      estimatedCostLow: 30000,
      estimatedCostHigh: 100000,
      implementationTime: '2-3 months',
      impactScore: 75,
      popularityScore: 80,
      requirements: ['Available space', 'Furniture', 'Kitchen facilities'],
      benefits: ['Community building', 'Event hosting', 'Work-from-home space']
    },
    {
      name: 'Co-working Space',
      category: 'Community',
      description: 'Dedicated workspace with desks, WiFi, and meeting rooms',
      estimatedCostLow: 25000,
      estimatedCostHigh: 75000,
      implementationTime: '1-2 months',
      impactScore: 85,
      popularityScore: 88,
      requirements: ['Quiet area', 'High-speed internet', 'Comfortable seating'],
      benefits: ['Remote work support', 'Professional atmosphere', 'Reduces in-unit noise']
    },
    {
      name: 'BBQ/Picnic Area',
      category: 'Community',
      description: 'Outdoor grilling stations with seating areas',
      estimatedCostLow: 10000,
      estimatedCostHigh: 30000,
      implementationTime: '2-4 weeks',
      impactScore: 70,
      popularityScore: 75,
      requirements: ['Outdoor space', 'Safety clearances', 'Weather-resistant furniture'],
      benefits: ['Social gatherings', 'Family-friendly', 'Low maintenance']
    },
    {
      name: 'Pet Park/Pet Wash Station',
      category: 'Community',
      description: 'Fenced area for pets with washing facilities',
      estimatedCostLow: 15000,
      estimatedCostHigh: 50000,
      implementationTime: '1-2 months',
      impactScore: 80,
      popularityScore: 82,
      requirements: ['Outdoor space', 'Drainage', 'Fencing'],
      benefits: ['Pet-owner attraction', 'Cleanliness', 'Community feature']
    },
    
    // Convenience
    {
      name: 'On-site Maintenance Team',
      category: 'Convenience',
      description: 'Dedicated maintenance staff available during business hours',
      estimatedCostLow: 40000,
      estimatedCostHigh: 80000,
      implementationTime: 'Immediate',
      impactScore: 90,
      popularityScore: 95,
      requirements: ['Staff hiring', 'Tool storage', 'Schedule system'],
      benefits: ['Quick response times', 'Tenant satisfaction', 'Property upkeep']
    },
    {
      name: 'Concierge Services',
      category: 'Convenience',
      description: 'Front desk staff for packages, information, and assistance',
      estimatedCostLow: 35000,
      estimatedCostHigh: 70000,
      implementationTime: 'Immediate',
      impactScore: 75,
      popularityScore: 70,
      requirements: ['Front desk area', 'Staff training', 'Service protocols'],
      benefits: ['Luxury feel', 'Security', 'Personal touch']
    },
    {
      name: 'Covered Parking',
      category: 'Convenience',
      description: 'Covered or garage parking spaces',
      estimatedCostLow: 5000,
      estimatedCostHigh: 15000,
      implementationTime: '2-3 months per structure',
      impactScore: 80,
      popularityScore: 85,
      requirements: ['Available space', 'Permits', 'Construction'],
      benefits: ['Weather protection', 'Premium pricing', 'Security']
    },
    {
      name: 'Storage Units',
      category: 'Convenience',
      description: 'Additional storage space for tenants',
      estimatedCostLow: 1000,
      estimatedCostHigh: 5000,
      implementationTime: '1-2 weeks per unit',
      impactScore: 75,
      popularityScore: 80,
      requirements: ['Available space', 'Security', 'Access control'],
      benefits: ['Additional revenue', 'Tenant convenience', 'Decluttered units']
    }
  ];

  for (const amenity of amenities) {
    await Amenity.findOrCreate({
      where: { name: amenity.name },
      defaults: amenity
    });
  }

  console.log('Amenities seeded successfully');
};