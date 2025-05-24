import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq, like, and, or, desc, asc } from "drizzle-orm";
import { 
  users, 
  properties, 
  leads, 
  websites, 
  propertyAffiliations, 
  documents, 
  activityLogs 
} from "../shared/schema";
import { insertUserSchema, insertPropertySchema, insertLeadSchema, insertWebsiteSchema, insertDocumentSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Auth middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    // In production, this would check for a valid session token
    // For demo purposes, we'll assume the user is authenticated
    req.user = { id: 1, role: "agent" };
    next();
  };

  // Helper to handle async route handlers
  const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // User routes
  app.get(`${apiPrefix}/users/me`, requireAuth, asyncHandler(async (req, res) => {
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password back to client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  // Dashboard routes
  app.get(`${apiPrefix}/dashboard/stats`, requireAuth, asyncHandler(async (req, res) => {
    const stats = await storage.getDashboardStats(req.user.id);
    res.json(stats);
  }));

  // Activities routes
  app.get(`${apiPrefix}/activities/recent`, requireAuth, asyncHandler(async (req, res) => {
    const activities = await storage.getRecentActivities(req.user.id);
    res.json(activities);
  }));

  // Website routes
  app.get(`${apiPrefix}/users/:userId/website`, requireAuth, asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Security check - users should only be able to access their own website or their team's websites
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const website = await storage.getWebsiteByUserId(userId);
    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }
    
    res.json(website);
  }));

  app.put(`${apiPrefix}/users/me/website`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertWebsiteSchema.parse(req.body);
      const updatedWebsite = await storage.updateWebsite(req.user.id, validatedData);
      res.json(updatedWebsite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  // CRM routes
  app.get(`${apiPrefix}/crm/stages`, requireAuth, asyncHandler(async (req, res) => {
    const crmStages = await storage.getCrmStages(req.user.id);
    res.json(crmStages);
  }));

  app.get(`${apiPrefix}/crm/stages/config`, requireAuth, asyncHandler(async (req, res) => {
    const stageConfigs = await storage.getCrmStageConfigs(req.user.id);
    res.json(stageConfigs);
  }));

  app.put(`${apiPrefix}/crm/stages/config`, requireAuth, asyncHandler(async (req, res) => {
    const { stages } = req.body;
    
    if (!Array.isArray(stages)) {
      return res.status(400).json({ message: "O campo 'stages' deve ser um array" });
    }
    
    try {
      const updatedConfigs = await storage.updateCrmStageConfigs(req.user.id, stages);
      res.json(updatedConfigs);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  }));

  app.patch(`${apiPrefix}/crm/leads/:leadId`, requireAuth, asyncHandler(async (req, res) => {
    const leadId = parseInt(req.params.leadId);
    const { stageId } = req.body;
    
    try {
      const updatedLead = await storage.updateLeadStage(leadId, req.user.id, stageId);
      res.json(updatedLead);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  }));

  // Properties routes
  
  // Favorites routes - IMPORTANT: must be placed before /:id routes to avoid path conflicts
  app.get(`${apiPrefix}/properties/favorites`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Error fetching favorite properties" });
    }
  }));
  
  app.get(`${apiPrefix}/properties`, requireAuth, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.search as string || "";
    const propertyType = req.query.type as string || "";
    const status = req.query.status as string || "";

    const result = await storage.getProperties({
      userId: req.user.id,
      page,
      limit,
      searchTerm,
      propertyType,
      status
    });

    res.json(result);
  }));

  app.post(`${apiPrefix}/properties`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newProperty = await storage.insertProperty(validatedData);
      res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  app.get(`${apiPrefix}/properties/:id`, requireAuth, asyncHandler(async (req, res) => {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Security check - users should only be able to access their own properties
    // or properties that they are affiliated with
    if (property.userId !== req.user.id) {
      const isAffiliate = await storage.isPropertyAffiliate(propertyId, req.user.id);
      if (!isAffiliate) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }
    
    res.json(property);
  }));

  app.put(`${apiPrefix}/properties/:id`, requireAuth, asyncHandler(async (req, res) => {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Security check - users should only be able to update their own properties
    if (property.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const updatedProperty = await storage.updateProperty(propertyId, validatedData);
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  app.delete(`${apiPrefix}/properties/:id`, requireAuth, asyncHandler(async (req, res) => {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getPropertyById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Security check - users should only be able to delete their own properties
    if (property.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    await storage.deleteProperty(propertyId);
    res.status(204).end();
  }));

  // Leads routes
  app.get(`${apiPrefix}/leads`, requireAuth, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.search as string || "";
    const stage = req.query.stage as string || "";

    const result = await storage.getLeads({
      userId: req.user.id,
      page,
      limit,
      searchTerm,
      stage
    });

    res.json(result);
  }));

  app.post(`${apiPrefix}/leads`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newLead = await storage.insertLead(validatedData);
      res.status(201).json(newLead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  // Public leads endpoint for website form submissions
  app.post(`${apiPrefix}/public/leads`, asyncHandler(async (req, res) => {
    const userId = parseInt(req.body.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      const validatedData = insertLeadSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const newLead = await storage.insertLead(validatedData);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  // Team routes
  app.get(`${apiPrefix}/team`, requireAuth, asyncHandler(async (req, res) => {
    const teamMembers = await storage.getTeamMembers(req.user.id);
    res.json(teamMembers);
  }));

  app.post(`${apiPrefix}/team`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        ...req.body,
        parentId: req.user.id
      });
      
      const newTeamMember = await storage.insertUser(validatedData);
      res.status(201).json(newTeamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  app.patch(`${apiPrefix}/team/:id`, requireAuth, asyncHandler(async (req, res) => {
    const memberId = parseInt(req.params.id);
    const teamMember = await storage.getUserById(memberId);
    
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    
    // Security check - users should only be able to update their own team members
    if (teamMember.parentId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const updatedTeamMember = await storage.updateUser(memberId, req.body);
    res.json(updatedTeamMember);
  }));

  // Affiliate routes
  app.get(`${apiPrefix}/affiliate/marketplace`, requireAuth, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.search as string || "";
    
    const result = await storage.getAffiliateMarketplace({
      userId: req.user.id,
      page,
      limit,
      searchTerm
    });
    
    res.json(result);
  }));

  app.get(`${apiPrefix}/affiliate/my-affiliations`, requireAuth, asyncHandler(async (req, res) => {
    const affiliations = await storage.getUserAffiliations(req.user.id);
    res.json(affiliations);
  }));

  app.get(`${apiPrefix}/affiliate/my-properties`, requireAuth, asyncHandler(async (req, res) => {
    const affiliableProperties = await storage.getUserAffiliableProperties(req.user.id);
    res.json(affiliableProperties);
  }));

  app.post(`${apiPrefix}/affiliate/request`, requireAuth, asyncHandler(async (req, res) => {
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    
    try {
      const affiliation = await storage.requestAffiliation(req.user.id, parseInt(propertyId));
      res.status(201).json(affiliation);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  }));

  app.patch(`${apiPrefix}/affiliate/:id`, requireAuth, asyncHandler(async (req, res) => {
    const affiliationId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    try {
      const affiliation = await storage.updateAffiliationStatus(affiliationId, req.user.id, status);
      res.json(affiliation);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  }));

  // Documents routes
  app.get(`${apiPrefix}/documents`, requireAuth, asyncHandler(async (req, res) => {
    const documents = await storage.getUserDocuments(req.user.id);
    res.json(documents);
  }));

  app.post(`${apiPrefix}/documents`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newDocument = await storage.insertDocument(validatedData);
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      throw error;
    }
  }));

  // Clients routes
  app.get(`${apiPrefix}/clients`, requireAuth, asyncHandler(async (req, res) => {
    const clients = await storage.getClients(req.user.id);
    res.json(clients);
  }));

  // Subscription and Plan routes
  app.get(`${apiPrefix}/users/me/subscription`, requireAuth, asyncHandler(async (req, res) => {
    const subscription = await storage.getUserSubscription(req.user.id);
    res.json(subscription);
  }));

  // Website settings routes
  app.get(`${apiPrefix}/users/me/website`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const website = await storage.getWebsiteByUserId(req.user.id);
      
      // Se o website não existir, retornar um objeto vazio em vez de null
      if (!website) {
        return res.json({});
      }
      
      return res.json(website);
    } catch (error) {
      console.error("Erro ao buscar website:", error);
      res.status(500).json({ message: "Erro ao buscar informações do website" });
    }
  }));

  app.put(`${apiPrefix}/users/me/website`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const updatedWebsite = await storage.updateWebsite(req.user.id, req.body);
      res.json(updatedWebsite);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  }));

  // Integration settings routes
  app.get(`${apiPrefix}/users/me/integrations`, requireAuth, asyncHandler(async (req, res) => {
    const integrations = await storage.getUserIntegrations(req.user.id);
    res.json(integrations);
  }));

  app.patch(`${apiPrefix}/users/me/integrations`, requireAuth, asyncHandler(async (req, res) => {
    const updatedIntegrations = await storage.updateUserIntegrations(req.user.id, req.body);
    res.json(updatedIntegrations);
  }));

  // Favorite toggle route
  app.post(`${apiPrefix}/properties/:id/favorite`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      await storage.toggleFavorite(req.user.id, propertyId);
      res.status(200).json({ message: "Favorite status updated" });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      res.status(500).json({ message: "Error updating favorite status" });
    }
  }));

  app.delete(`${apiPrefix}/properties/:id/favorite`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      await storage.removeFavorite(req.user.id, propertyId);
      res.status(200).json({ message: "Property removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Error removing from favorites" });
    }
  }));

  // Analytics routes
  app.get(`${apiPrefix}/analytics`, requireAuth, asyncHandler(async (req, res) => {
    const timeframe = req.query.timeframe as string || "month";
    const analyticsData = await storage.getAnalyticsData(req.user.id, timeframe);
    res.json(analyticsData);
  }));

  // Portal routes
  app.get(`${apiPrefix}/portals/available`, requireAuth, asyncHandler(async (req, res) => {
    // Lista de portais imobiliários e redes sociais disponíveis
    res.json({
      imobiliarios: ['zapImoveis', 'vivaReal', 'olx'],
      sociais: ['facebook', 'linkedin']
    });
  }));

  app.get(`${apiPrefix}/integrations`, requireAuth, asyncHandler(async (req, res) => {
    const integrations = await storage.getUserIntegrations(req.user.id);
    res.json(integrations);
  }));

  app.patch(`${apiPrefix}/properties/:id/portals`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "ID de propriedade inválido" });
      }

      const { portals } = req.body;
      
      if (!Array.isArray(portals)) {
        return res.status(400).json({ message: "A lista de portais deve ser um array" });
      }
      
      // Atualizamos a propriedade com os novos portais
      const property = await storage.updateProperty(propertyId, {
        publishedPortals: portals
      });
      
      // Log da atividade
      await storage.logActivity({
        userId: req.user.id,
        entityType: 'property',
        entityId: propertyId,
        action: 'update_portals',
        metadata: {
          portals
        }
      });
      
      res.json(property);
    } catch (error) {
      console.error("Erro ao atualizar portais:", error);
      res.status(500).json({ message: "Erro ao atualizar portais" });
    }
  }));

  // Webhooks routes
  app.patch(`${apiPrefix}/properties/:id/webhooks`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "ID de propriedade inválido" });
      }

      const { webhookActive, webhookUrl } = req.body;
      
      // Atualizamos a propriedade com a configuração de webhook
      const property = await storage.updateProperty(propertyId, {
        webhookActive,
        webhookUrl
      });
      
      res.json(property);
    } catch (error) {
      console.error("Erro ao atualizar configurações de webhook:", error);
      res.status(500).json({ message: "Erro ao atualizar configurações de webhook" });
    }
  }));

  // Pixel tracking route
  app.patch(`${apiPrefix}/properties/:id/pixel`, requireAuth, asyncHandler(async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "ID de propriedade inválido" });
      }

      const { pixelTracking, pixelId } = req.body;
      
      // Atualizamos a propriedade com a configuração de pixel
      const property = await storage.updateProperty(propertyId, {
        pixelTracking,
        pixelId
      });
      
      res.json(property);
    } catch (error) {
      console.error("Erro ao atualizar configurações de pixel:", error);
      res.status(500).json({ message: "Erro ao atualizar configurações de pixel" });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
