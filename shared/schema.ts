import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users & Authentication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('agent'), // agent, admin, assistant, client
  parentId: integer('parent_id').references(() => users.id), // For hierarchy (team members)
  planType: text('plan_type').default('basic'), // basic, professional, enterprise
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').default('trial'), // trial, active, canceled, past_due
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  properties: many(properties),
  team: many(users, { relationName: 'team' }),
  parent: one(users, { 
    fields: [users.parentId], 
    references: [users.id],
    relationName: 'team'
  }),
  websites: one(websites),
  leads: many(leads),
}));

// Empreendimentos (Developments)
export const developments = pgTable('developments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  developmentType: text('development_type').notNull(), // condominio_vertical, condominio_horizontal, loteamento, etc
  totalUnits: integer('total_units').notNull(),
  priceRange: jsonb('price_range').default({}), // { min: 0, max: 0 }
  deliveryDate: timestamp('delivery_date'),
  constructionStatus: text('construction_status'), // planta, em_construcao, pronto
  mainImage: text('main_image'),
  images: jsonb('images').default([]),
  videoUrl: text('video_url'),
  tourUrl: text('tour_url'),
  isSingleProperty: boolean('is_single_property').default(false), // Indica se é um imóvel avulso tratado como empreendimento
  amenities: jsonb('amenities').default([]),
  featured: boolean('featured').default(false),
  published: boolean('published').default(true),
  publishedPortals: jsonb('published_portals').default([]),
  salesStatus: jsonb('sales_status').default({}), // { available: 0, reserved: 0, sold: 0 }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Properties
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  developmentId: integer('development_id'),  // A referência será adicionada após a definição da tabela developments
  title: text('title').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  propertyType: text('property_type').notNull(), // apartment, house, land, commercial
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  area: decimal('area', { precision: 10, scale: 2 }),
  garageSpots: integer('garage_spots'),
  status: text('status').notNull().default('active'), // active, reserved, sold, inactive
  featured: boolean('featured').default(false),
  images: jsonb('images').default([]),
  // Novos campos para vídeo e tour virtual
  videoUrl: text('video_url'),
  tourUrl: text('tour_url'),
  // Campos para propriedades rurais
  totalArea: decimal('total_area', { precision: 10, scale: 2 }),
  productiveArea: decimal('productive_area', { precision: 10, scale: 2 }),
  carRegistration: text('car_registration'),
  waterSources: jsonb('water_sources').default([]),
  soilType: text('soil_type'),
  agriculturalPotential: text('agricultural_potential'),
  ruralInfrastructure: jsonb('rural_infrastructure').default([]),
  published: boolean('published').default(true),
  publishedPortals: jsonb('published_portals').default([]),
  availableForAffiliation: boolean('available_for_affiliation').default(false),
  affiliationCommissionRate: decimal('affiliation_commission_rate', { precision: 5, scale: 2 }),
  webhookActive: boolean('webhook_active').default(false),
  webhookUrl: text('webhook_url'),
  pixelTracking: boolean('pixel_tracking').default(false),
  pixelId: text('pixel_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Units (Unidades de empreendimentos)
export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  developmentId: integer('development_id').references(() => developments.id).notNull(),
  unitNumber: text('unit_number').notNull(), // Número/identificador da unidade (Apto 101, Casa 25, etc)
  block: text('block'), // Bloco ou setor (A, B, Torre 1, etc)
  floor: integer('floor'), // Andar (para condomínios verticais)
  unitType: text('unit_type'), // Tipo da unidade (Tipo 1, Garden, Cobertura, etc)
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  area: decimal('area', { precision: 10, scale: 2 }),
  privateArea: decimal('private_area', { precision: 10, scale: 2 }),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  status: text('status').notNull().default('available'), // available, reserved, sold
  images: jsonb('images').default([]),
  floorPlanImage: text('floor_plan_image'),
  features: jsonb('features').default([]),
  position: jsonb('position').default({}), // Coordenadas no mapa do empreendimento, posição no andar
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relacionamentos para unidades
export const unitsRelations = relations(units, ({ one }) => ({
  development: one(developments, {
    fields: [units.developmentId],
    references: [developments.id],
  }),
}));

// Relacionamentos para empreendimentos
export const developmentsRelations = relations(developments, ({ one, many }) => ({
  owner: one(users, {
    fields: [developments.userId],
    references: [users.id],
  }),
  units: many(units),
  properties: many(properties),
}));

// Adicionando a referência correta na tabela properties
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  leads: many(leads),
  affiliations: many(propertyAffiliations),
  development: one(developments, {
    fields: [properties.developmentId],
    references: [developments.id],
  }),
}));

// Websites
export const websites = pgTable('websites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  domain: text('domain'),
  title: text('title').notNull(),
  logo: text('logo'),
  theme: jsonb('theme').default({}), // Colors, fonts, etc.
  layout: jsonb('layout').default({}), // Sections, components, etc.
  customCss: text('custom_css'),
  customJs: text('custom_js'),
  metaTags: jsonb('meta_tags').default({}),
  analytics: jsonb('analytics').default({}), // Google Analytics, Facebook Pixel, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const websitesRelations = relations(websites, ({ one }) => ({
  owner: one(users, {
    fields: [websites.userId],
    references: [users.id],
  }),
}));

// CRM - Leads
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  propertyId: integer('property_id').references(() => properties.id),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message'),
  stage: text('stage').notNull().default('initial_contact'), // initial_contact, qualification, scheduled_visit, proposal, documentation, closed
  source: text('source'), // website, whatsapp, portal, etc.
  status: text('status').notNull().default('active'), // active, archived
  assignedTo: integer('assigned_to').references(() => users.id),
  customFields: jsonb('custom_fields').default({}),
  notes: jsonb('notes').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leadsRelations = relations(leads, ({ one }) => ({
  owner: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  assignee: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
}));

// Affiliate System
export const propertyAffiliations = pgTable('property_affiliations', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id).notNull(),
  affiliateId: integer('affiliate_id').references(() => users.id).notNull(),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const propertyAffiliationsRelations = relations(propertyAffiliations, ({ one }) => ({
  property: one(properties, {
    fields: [propertyAffiliations.propertyId],
    references: [properties.id],
  }),
  affiliate: one(users, {
    fields: [propertyAffiliations.affiliateId],
    references: [users.id],
  }),
  owner: one(users, {
    fields: [propertyAffiliations.ownerId],
    references: [users.id],
  }),
}));

// Documents
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  leadId: integer('lead_id').references(() => leads.id),
  title: text('title').notNull(),
  type: text('type').notNull(), // id, contract, proof_of_residence, etc.
  fileUrl: text('file_url'),
  googleDriveId: text('google_drive_id'),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  owner: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [documents.leadId],
    references: [leads.id],
  }),
}));

// Activity Logs
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  entityType: text('entity_type').notNull(), // lead, property, user, website, document
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(), // created, updated, deleted, status_changed, etc.
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Favorites
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  propertyId: integer('property_id').references(() => properties.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

// Create Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Name must be at least 2 characters"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const insertPropertySchema = createInsertSchema(properties, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  price: (schema) => schema.refine((val) => Number(val) > 0, "Price must be positive"),
  videoUrl: (schema) => schema.optional(),
  tourUrl: (schema) => schema.optional(),
  // Campos para propriedades rurais
  totalArea: (schema) => schema.optional(),
  productiveArea: (schema) => schema.optional(),
  carRegistration: (schema) => schema.optional(),
  waterSources: (schema) => schema.optional(),
  soilType: (schema) => schema.optional(),
  agriculturalPotential: (schema) => schema.optional(),
  ruralInfrastructure: (schema) => schema.optional(),
});

export const insertLeadSchema = createInsertSchema(leads, {
  fullName: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
});

export const insertWebsiteSchema = createInsertSchema(websites, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
});

export const insertDocumentSchema = createInsertSchema(documents, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// CRM Stage Configurations
export const crmStageConfigs = pgTable('crm_stage_configs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  stageId: text('stage_id').notNull(),
  name: text('name').notNull(),
  color: text('color'),
  position: integer('position').notNull(),
  isDefault: boolean('is_default').default(false),
  isArchive: boolean('is_archive').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const crmStageConfigsRelations = relations(crmStageConfigs, ({ one }) => ({
  user: one(users, {
    fields: [crmStageConfigs.userId],
    references: [users.id],
  }),
}));

export const insertCrmStageConfigSchema = createInsertSchema(crmStageConfigs, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  stageId: (schema) => schema.min(1, "Stage ID is required"),
  position: (schema) => schema.refine((val) => Number(val) >= 0, "Position must be non-negative"),
});

// Esquemas de validação para empreendimentos e unidades
export const insertDevelopmentSchema = createInsertSchema(developments, {
  name: (schema) => schema.min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: (schema) => schema.min(10, "Descrição deve ter pelo menos 10 caracteres"),
  address: (schema) => schema.min(5, "Endereço deve ter pelo menos 5 caracteres"),
  developmentType: (schema) => schema.refine(
    (val) => ["condominio_vertical", "condominio_horizontal", "loteamento", "apartamentos", "casas", "imovel_avulso"].includes(val),
    { message: "Tipo de empreendimento inválido" }
  ),
  isSingleProperty: (schema) => schema.optional(),
});

export const insertUnitSchema = createInsertSchema(units, {
  unitNumber: (schema) => schema.min(1, "Número da unidade é obrigatório"),
  price: (schema) => schema.refine((val) => parseFloat(val) > 0, { message: "Preço deve ser maior que zero" }),
  status: (schema) => schema.refine(
    (val) => ["available", "reserved", "sold"].includes(val),
    { message: "Status inválido" }
  ),
});

export type Development = typeof developments.$inferSelect;
export type InsertDevelopment = z.infer<typeof insertDevelopmentSchema>;

export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type PropertyAffiliation = typeof propertyAffiliations.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type CrmStageConfig = typeof crmStageConfigs.$inferSelect;
export type InsertCrmStageConfig = z.infer<typeof insertCrmStageConfigSchema>;
