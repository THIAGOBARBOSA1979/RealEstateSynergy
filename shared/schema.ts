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

// Properties
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
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
  published: boolean('published').default(true),
  publishedPortals: jsonb('published_portals').default([]),
  availableForAffiliation: boolean('available_for_affiliation').default(false),
  affiliationCommissionRate: decimal('affiliation_commission_rate', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  leads: many(leads),
  affiliations: many(propertyAffiliations),
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

export type PropertyAffiliation = typeof propertyAffiliations.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type CrmStageConfig = typeof crmStageConfigs.$inferSelect;
export type InsertCrmStageConfig = z.infer<typeof insertCrmStageConfigSchema>;
