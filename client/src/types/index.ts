// Database types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'agent' | 'assistant' | 'client';
  parentId?: number;
  planType: 'basic' | 'professional' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  active?: boolean;
  phone?: string;
}

export interface Property {
  id: number;
  userId: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  propertyType: 'apartment' | 'house' | 'land' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  garageSpots?: number;
  status: 'active' | 'reserved' | 'sold' | 'inactive';
  featured: boolean;
  images: string[];
  published: boolean;
  publishedPortals: string[];
  availableForAffiliation: boolean;
  affiliationCommissionRate?: number;
  affiliations?: any[]; // Lista de afiliações relacionadas a este imóvel
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  userId: number;
  propertyId?: number;
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  stage: 'initial_contact' | 'qualification' | 'scheduled_visit' | 'proposal' | 'documentation' | 'closed';
  source?: string;
  status: 'active' | 'archived';
  assignedTo?: number;
  customFields?: Record<string, any>;
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  content: string;
  createdAt: string;
  createdBy: number;
}

export interface Website {
  id: number;
  userId: number;
  domain?: string;
  title: string;
  logo?: string;
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontHeading?: string;
    fontBody?: string;
    [key: string]: any;
  };
  layout?: {
    sections?: WebsiteSection[];
    [key: string]: any;
  };
  customCss?: string;
  customJs?: string;
  metaTags?: Record<string, string>;
  analytics?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  stats?: {
    visitsToday: number;
    leadsGenerated: number;
  };
}

export interface WebsiteSection {
  id: string;
  type: string;
  title?: string;
  content?: string;
  items?: any[];
  settings?: Record<string, any>;
}

export interface Document {
  id: number;
  userId: number;
  leadId?: number;
  title: string;
  type: string;
  fileUrl?: string;
  googleDriveId?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyAffiliation {
  id: number;
  propertyId: number;
  affiliateId: number;
  ownerId: number;
  status: 'pending' | 'approved' | 'rejected';
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  affiliate?: User;
  owner?: User;
}

export interface ActivityLog {
  id: number;
  userId: number;
  entityType: 'lead' | 'property' | 'user' | 'website' | 'document';
  entityId: number;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Application specific types
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change: {
    percentage: number;
    label: string;
  };
  iconColor?: "primary" | "secondary" | "accent" | "info";
}

export interface CrmStage {
  id: string;
  name: string;
  count: number;
  leads: CrmLead[];
}

export interface CrmLead {
  id: number;
  name: string;
  source: string;
  description: string;
  timeAgo: string;
  stageId: string;
}

export interface DashboardStats {
  leads: number;
  visits: number;
  activeProperties: number;
  websiteVisits: number;
  leadsChange: number;
  visitsChange: number;
  propertiesChange: number;
  websiteVisitsChange: number;
}

export interface ActivityItem {
  id: number;
  type: 'lead' | 'appointment' | 'document';
  name: string;
  description: string;
  timeAgo: string;
  icon: string;
}

export interface IntegrationSettings {
  googleDrive?: {
    enabled: boolean;
    token?: string;
    folder?: string;
  };
  whatsapp?: {
    enabled: boolean;
    apiKey?: string;
    phone?: string;
  };
  portals?: {
    enabled: boolean;
    zapImoveis?: boolean;
    vivaReal?: boolean;
    olx?: boolean;
  };
}

export interface Subscription {
  id: number;
  userId: number;
  plan: {
    id: string;
    name: string;
    price: number;
  };
  status: 'active' | 'inactive' | 'pending' | 'cancelled';
  nextBillingDate: string;
  startDate: string;
  features: {
    propertyLimit: number;
    teamMembers: number;
    customDomain: boolean;
    analytics: boolean;
    [key: string]: any;
  };
}

export interface AnalyticsData {
  overview: {
    visitors: number;
    visitorsChange: number;
    leads: number;
    leadsChange: number;
    conversionRate: number;
    conversionRateChange: number;
    sales: number;
    salesChange: number;
  };
  timeSeriesData: any[];
  trafficSources: any[];
  propertyPerformance: any[];
}
