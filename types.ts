
export enum PropertyType {
  SALE = 'SALE',
  RENT = 'RENT'
}

export enum PropertyCategory {
  PLOT = 'PLOT',
  DEVELOPED = 'DEVELOPED'
}

export enum DevelopedType {
  HOUSE = 'House',
  VILLA = 'Villa',
  FLAT = 'Flat',
  APARTMENT = 'Apartment',
  PENTHOUSE = 'Penthouse',
  STUDIO = 'Studio'
}

export enum BHKType {
  BHK1 = '1 BHK',
  BHK2 = '2 BHK',
  BHK3 = '3 BHK',
  BHK4 = '4+ BHK',
  STUDIO = 'Studio'
}

export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export enum MembershipTier {
  FREE_AGENT = 'Free Agent',
  PRO_AGENT = 'Pro Agent',
  ELITE_PARTNER = 'Elite Partner',
  GOLD_AGENCY = 'Gold Agency',
  PLATINUM_HUB = 'Platinum Hub'
}

export interface NeighborhoodScores {
  schools: number;
  safety: number;
  connectivity: number;
  lifestyle: number;
}

export interface PropertyFeatures {
  smartHome: boolean;
  pool: boolean;
  gym: boolean;
  security247: boolean;
  centralAir: boolean;
  evCharging: boolean;
  equippedKitchen: boolean;
  mediaRoom: boolean;
}

export interface PropertyAddress {
  addressLine: string;
  city: string;
  area: string;
  state: string;
  zip: string;
  country: string;
  floorNo?: string;
  roomNo?: string;
}

export interface PropertyTechnicalDetails {
  lotSize?: number;
  rooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  garages?: number;
  garageSize?: string;
  availableFrom?: string;
  basement?: string;
  externalConstruction?: string;
  roofing?: string;
}

export interface Property {
  id?: string;
  propertyCode?: string;
  category?: PropertyCategory;
  propertyType?: 'Plot' | 'Flat' | 'Apartment' | 'Villa';
  ownerId?: string;
  agencyId?: string;
  listedBy?: 'OWNER' | 'AGENT';
  tier?: MembershipTier;
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  city?: string;
  googleMapUrl?: string;
  address?: PropertyAddress;
  technicalDetails?: PropertyTechnicalDetails;
  type?: PropertyType | string;
  bhk?: BHKType | number | string;
  area?: number;
  images?: string[];
  verificationDocUrl?: string;
  floorPlanUrl?: string;
  energyRating?: EnergyRating;
  energyIndex?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerPhoto?: string;
  amenities?: string[];
  sqft?: number;
  plotArea?: number;
  builtUpArea?: number;
  pricePerSqft?: number;
  facing?: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  isCorner?: boolean;
  openSides?: number;
  boundaryWall?: boolean;
  roadWidth?: number;
  plotType?: 'Residential' | 'Commercial';
  approvedLayout?: boolean;
  floorNo?: number;
  totalFloors?: number;
  bathrooms?: number;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully-Furnished';
  balcony?: boolean;
  parking?: boolean;
  ageOfProperty?: number;
  garden?: boolean;
  postedAt?: string;
  lastConfirmedAt?: string; 
  isVerified?: boolean;
  blockchainHash?: string;
  neighborhoodScores?: NeighborhoodScores;
  features?: PropertyFeatures;
  stats?: {
    views: number;
    leads: number;
    interests: number;
  };
  createdAt?: any;
}

export enum UserRole {
  BUYER = 'buyer',
  AGENT = 'agent',
  AGENCY_ADMIN = 'agency_admin'
}

export interface AppUser {
  uid: string;
  displayName: string;
  phone: string;
  email: string;
  photo: string;
  role: UserRole;
  agencyId: string | null;
  agencyCode: string | null;
  createdAt: any;
}

export interface Agent {
  id: string;
  name: string;
  photo: string;
  agency: string;
  agencyId: string;
  role: UserRole;
  experience: number;
  rating: number;
  soldCount: number;
  email: string;
  phone?: string;
  specialization: string[];
  tier: MembershipTier;
}

export interface Agency {
  id: string;
  name: string;
  adminUid: string;
  code: string;
  slotLimit: number;
  slotUsed: number;
  createdAt: any;
  active: boolean;
}

export interface AgencyMember {
  uid: string;
  role: 'admin' | 'agent';
  joinedAt: any;
}

export type LeadStatus = 'New' | 'Contacted' | 'Site Visit' | 'Negotiation' | 'Closed' | 'Lost';
export type LeadPriority = 'Hot' | 'Warm' | 'Cold';
export type LeadSource = 'Website' | 'Call' | 'WhatsApp' | 'Referral';

export interface LeadNote {
  text: string;
  createdAt: any;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId?: string;
  propertyTitle?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo: string; // agentId
  agencyId: string;
  createdBy?: string;
  followUpDate: any; // timestamp
  notes: LeadNote[];
  createdAt: any;
  updatedAt: any;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  leadId: string;
  leadName: string;
  timestamp: any;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export interface SearchFilters {
  query: string;
  category: PropertyCategory | 'ALL';
  type: PropertyType | 'ALL';
  bhk: BHKType | 'ALL';
  minPrice: number;
  maxPrice: number;
  propertyType?: string | 'ALL';
}
