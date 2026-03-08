
import { Property, PropertyType, PropertyCategory, BHKType, MembershipTier, Agent, BlogArticle, UserRole } from './types';

export const INDIAN_CITIES = [
  "Mumbai - Worli", "Mumbai - Juhu", "Delhi - GK II", "Delhi - Vasant Vihar", 
  "Bangalore - Indiranagar", "Bangalore - Whitefield", "Hyderabad - Jubilee Hills", 
  "Hyderabad - Gachibowli", "Pune - Koregaon Park", "Gurgaon - DLF Phase 5", "Chennai - Adyar"
].sort();

export const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', AED: 'د.إ', EUR: '€' };

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'a1',
    name: 'Aryan Malhotra',
    photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    agency: 'Luxe India Realty',
    agencyId: 'agency-luxe-1',
    role: UserRole.AGENCY_ADMIN,
    experience: 10,
    rating: 4.9,
    soldCount: 85,
    email: 'aryan@mhomes.in',
    specialization: ['Sea-view Apartments', 'Worli Penthouses'],
    tier: MembershipTier.PLATINUM_HUB
  },
  {
    id: 'a2',
    name: 'Priya Sharma',
    photo: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80',
    agency: 'Heritage Homes Delhi',
    agencyId: 'agency-heritage-1',
    role: UserRole.AGENCY_ADMIN,
    experience: 7,
    rating: 4.8,
    soldCount: 52,
    email: 'priya@mhomes.in',
    specialization: ['Lutyens Bungalows', 'GK Farmhouses'],
    tier: MembershipTier.GOLD_AGENCY
  }
];

export const MOCK_BLOGS: BlogArticle[] = [
  {
    id: 'b1',
    title: 'Why Mumbai Real Estate Remains the Top Choice for Investors',
    excerpt: 'Deep dive into the rising yields in South Mumbai and the impact of the new coastal road.',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80',
    date: 'Oct 28, 2024',
    author: 'Editor',
    category: 'Market Trends'
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-in-1',
    propertyCode: 'MH-BOM-001',
    category: PropertyCategory.DEVELOPED,
    ownerId: 'user-1',
    listedBy: 'AGENT',
    tier: MembershipTier.GOLD_AGENCY,
    title: 'Ultra Luxury Sea-Facing Penthouse',
    description: 'Breathtaking views of the Arabian Sea from this massive 4500 sqft penthouse in Worli. Fully automated smart home features, private deck, and access to elite lifestyle amenities including an infinity pool and concierge services.',
    price: 450000000,
    location: 'Mumbai - Worli',
    googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Worli+Sea+Face+Mumbai',
    address: {
      addressLine: '42nd Floor, Imperial Towers',
      city: 'Mumbai',
      area: 'Worli',
      state: 'Maharashtra',
      zip: '400018',
      country: 'India'
    },
    technicalDetails: {
      lotSize: 6000,
      rooms: 6,
      bathrooms: 5,
      yearBuilt: 2022,
      garages: 3,
      garageSize: '3 cars',
      availableFrom: '2024-06-01',
      basement: 'Reinforced Concrete',
      externalConstruction: 'Glass and Steel',
      roofing: 'Modern Terraced'
    },
    type: PropertyType.SALE,
    bhk: BHKType.BHK4,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6199f7a096?auto=format&fit=crop&w=1200&q=80'
    ],
    verificationDocUrl: 'https://example.com/docs/worli-deed.pdf',
    energyRating: 'A',
    energyIndex: 110,
    ownerName: 'Aryan Malhotra',
    ownerEmail: 'aryan@mhomes.in',
    amenities: ['Sea View', 'Smart Home', 'Private Lift', 'Infinity Pool', 'Gym'],
    sqft: 4500,
    postedAt: '2023-11-01T10:00:00Z',
    lastConfirmedAt: new Date().toISOString(),
    isVerified: true,
    blockchainHash: '0xabc123...def',
    neighborhoodScores: { schools: 4.5, safety: 4.8, connectivity: 4.9, lifestyle: 5.0 },
    features: {
      smartHome: true, pool: true, gym: true, security247: true, centralAir: true, evCharging: true, equippedKitchen: true, mediaRoom: true
    },
    stats: { views: 1240, leads: 42, interests: 15 }
  },
  {
    id: 'prop-rent-1',
    propertyCode: 'MH-BLR-003',
    category: PropertyCategory.DEVELOPED,
    ownerId: 'user-3',
    listedBy: 'OWNER',
    tier: MembershipTier.FREE_AGENT,
    title: 'Sky-Villa in Whitefield',
    description: 'A premium rental experience in the heart of Bangalore\'s IT corridor. This 3 BHK features floor-to-ceiling windows, imported marble flooring, and is located just minutes away from major IT parks and international schools.',
    price: 125000,
    location: 'Bangalore - Whitefield',
    googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Prestige+Shantiniketan+Whitefield+Bangalore',
    address: {
      addressLine: 'Block C, Prestige Shantiniketan',
      city: 'Bangalore',
      area: 'Whitefield',
      state: 'Karnataka',
      zip: '560066',
      country: 'India',
      floorNo: '12th',
      roomNo: 'C-1204'
    },
    technicalDetails: {
      lotSize: 2200,
      rooms: 4,
      bathrooms: 3,
      yearBuilt: 2018,
      garages: 2,
      garageSize: '2 cars',
      availableFrom: '2024-05-15',
      basement: 'N/A',
      externalConstruction: 'Brick and Mortar',
      roofing: 'Standard Flat'
    },
    type: PropertyType.RENT,
    bhk: BHKType.BHK3,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    verificationDocUrl: 'https://example.com/docs/whitefield-rent-agreement.pdf',
    energyRating: 'A',
    energyIndex: 95,
    ownerName: 'Rahul Verma',
    ownerEmail: 'rahul@verma.com',
    amenities: ['Gym Access', 'Clubhouse', 'Concierge', 'Power Backup'],
    sqft: 2200,
    postedAt: '2024-02-10T10:00:00Z',
    lastConfirmedAt: new Date().toISOString(),
    isVerified: true,
    neighborhoodScores: { schools: 4.8, safety: 4.5, connectivity: 4.7, lifestyle: 4.6 },
    features: {
      smartHome: true, pool: false, gym: true, security247: true, centralAir: true, evCharging: true, equippedKitchen: true, mediaRoom: false
    },
    stats: { views: 560, leads: 15, interests: 4 }
  },
  {
    id: 'prop-hyd-1',
    propertyCode: 'MH-HYD-005',
    category: PropertyCategory.DEVELOPED,
    ownerId: 'user-hyd-1',
    listedBy: 'AGENT',
    tier: MembershipTier.PLATINUM_HUB,
    title: 'Gated Community Villa in Jubilee Hills',
    description: 'An architectural masterpiece in Hyderabad\'s most elite neighborhood. This sprawling 6500 sqft villa offers unmatched privacy, a private swimming pool, and landscaped gardens.',
    price: 280000000,
    location: 'Hyderabad - Jubilee Hills',
    googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Jubilee+Hills+Hyderabad',
    address: {
      addressLine: 'Road No. 36, Jubilee Hills',
      city: 'Hyderabad',
      area: 'Jubilee Hills',
      state: 'Telangana',
      zip: '500033',
      country: 'India'
    },
    technicalDetails: {
      lotSize: 8000,
      rooms: 7,
      bathrooms: 6,
      yearBuilt: 2021,
      garages: 4,
      garageSize: '4 cars',
      availableFrom: 'Ready to Move',
      basement: 'Home Theatre & Lounge',
      externalConstruction: 'Natural Stone & Wood',
      roofing: 'Sloping Tiled'
    },
    type: PropertyType.SALE,
    bhk: BHKType.BHK4,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687940-4e7a6251d42a?auto=format&fit=crop&w=1200&q=80'
    ],
    verificationDocUrl: 'https://example.com/docs/hyd-jubilee-deed.pdf',
    energyRating: 'A',
    energyIndex: 105,
    ownerName: 'Vikram Reddy',
    ownerEmail: 'vikram.reddy@hydhomes.com',
    amenities: ['Private Pool', 'Home Cinema', 'Landscaped Garden', 'Solar Power'],
    sqft: 6500,
    postedAt: '2024-01-05T09:00:00Z',
    lastConfirmedAt: new Date().toISOString(),
    isVerified: true,
    neighborhoodScores: { schools: 4.9, safety: 4.9, connectivity: 4.6, lifestyle: 5.0 },
    features: {
      smartHome: true, pool: true, gym: true, security247: true, centralAir: true, evCharging: true, equippedKitchen: true, mediaRoom: true
    },
    stats: { views: 2100, leads: 85, interests: 22 }
  }
];
