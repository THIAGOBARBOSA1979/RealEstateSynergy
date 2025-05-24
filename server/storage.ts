import { db } from "@db";
import { 
  users, 
  properties, 
  leads, 
  websites, 
  propertyAffiliations, 
  documents, 
  activityLogs,
  favorites,
  crmStageConfigs
} from "@shared/schema";
import { 
  type User, 
  type Property, 
  type Lead, 
  type Website, 
  type Document, 
  type PropertyAffiliation, 
  type ActivityLog,
  type Favorite,
  type CrmStageConfig
} from "@shared/schema";
import { eq, like, and, or, desc, asc, inArray, ne, isNull, sql } from "drizzle-orm";
import { hash } from "bcrypt";

// Storage service for all database operations
export const storage = {
  // User operations
  async getUserById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  },

  async getUserByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  },

  async insertUser(userData: any) {
    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData.password = hashedPassword;
    }
    
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  async updateUser(id: number, userData: any) {
    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData.password = hashedPassword;
    }
    
    const result = await db.update(users)
      .set({...userData, updatedAt: new Date().toISOString()})
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  },

  // Team operations
  async getTeamMembers(userId: number) {
    const result = await db.select().from(users).where(eq(users.parentId, userId));
    return result.map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        active: true // Setting default active state
      };
    });
  },

  // Property operations
  async getProperties({ userId, page, limit, searchTerm, propertyType, status }: any) {
    let query = db.select().from(properties).where(eq(properties.userId, userId));
    
    if (searchTerm) {
      query = query.where(
        or(
          like(properties.title, `%${searchTerm}%`),
          like(properties.description, `%${searchTerm}%`),
          like(properties.address, `%${searchTerm}%`)
        )
      );
    }
    
    if (propertyType && propertyType !== 'all') {
      query = query.where(eq(properties.propertyType, propertyType));
    }
    
    if (status && status !== 'all') {
      query = query.where(eq(properties.status, status));
    }
    
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.userId, userId));
    
    const total = totalResult[0]?.count || 0;
    
    const offset = (page - 1) * limit;
    const result = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(properties.createdAt));
    
    return {
      properties: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getPropertyById(id: number) {
    const result = await db.select().from(properties).where(eq(properties.id, id));
    return result[0];
  },

  async insertProperty(propertyData: any) {
    const result = await db.insert(properties).values(propertyData).returning();
    
    // Log activity
    await this.logActivity({
      userId: propertyData.userId,
      entityType: 'property',
      entityId: result[0].id,
      action: 'created',
      metadata: {}
    });
    
    return result[0];
  },

  async updateProperty(id: number, propertyData: any) {
    const result = await db.update(properties)
      .set({...propertyData, updatedAt: new Date()})
      .where(eq(properties.id, id))
      .returning();
    
    // Log activity
    await this.logActivity({
      userId: propertyData.userId,
      entityType: 'property',
      entityId: id,
      action: 'updated',
      metadata: {}
    });
    
    return result[0];
  },

  async deleteProperty(id: number) {
    const property = await this.getPropertyById(id);
    
    if (!property) {
      throw new Error("Property not found");
    }
    
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    
    // Log activity
    await this.logActivity({
      userId: property.userId,
      entityType: 'property',
      entityId: id,
      action: 'deleted',
      metadata: {}
    });
    
    return result[0];
  },

  // Website operations
  async getWebsiteByUserId(userId: number) {
    try {
      // Consulta direta para verificar se o website existe
      const existingRecords = await db.select().from(websites).where(eq(websites.userId, userId));
      
      if (existingRecords.length === 0) {
        console.log(`Website não encontrado para o usuário ${userId}. Criando novo...`);
        
        // Criar novo registro para o website de acordo com o schema
        const newWebsiteData = {
          userId,
          title: "Meu Site Imobiliário",
          theme: {
            primaryColor: "#FF5A00",
            secondaryColor: "#222222",
            fontFamily: "inter",
            tagline: "Os melhores imóveis da região",
            description: "Profissional especializado no mercado imobiliário local",
            heroImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80",
          },
          layout: {
            showTestimonials: true,
            showFeaturedProperties: true,
            showAboutSection: true,
            contactInfo: {
              email: "",
              phone: "",
              address: "",
              whatsapp: "",
              creci: ""
            }
          }
        };
        
        // Inserir o novo website no banco de dados
        const insertResult = await db.insert(websites).values(newWebsiteData).returning();
        
        if (insertResult.length === 0) {
          throw new Error('Falha ao criar website');
        }
        
        console.log(`Website criado com sucesso para o usuário ${userId}`);
        
        // Retornar o novo website com informações adicionais
        return {
          ...insertResult[0],
          // Extrai dados do tema e layout para compatibilidade com frontend
          siteName: insertResult[0].title,
          tagline: insertResult[0].theme?.tagline || "",
          description: insertResult[0].theme?.description || "",
          themeColor: insertResult[0].theme?.primaryColor || "#FF5A00",
          secondaryColor: insertResult[0].theme?.secondaryColor || "#222222",
          fontFamily: insertResult[0].theme?.fontFamily || "inter",
          heroImageUrl: insertResult[0].theme?.heroImageUrl || "",
          logoUrl: insertResult[0].logo || "",
          // Informações de contato
          contactEmail: insertResult[0].layout?.contactInfo?.email || "",
          contactPhone: insertResult[0].layout?.contactInfo?.phone || "",
          address: insertResult[0].layout?.contactInfo?.address || "",
          whatsapp: insertResult[0].layout?.contactInfo?.whatsapp || "",
          creci: insertResult[0].layout?.contactInfo?.creci || "",
          // Configurações de layout
          showTestimonials: insertResult[0].layout?.showTestimonials || true,
          showFeaturedProperties: insertResult[0].layout?.showFeaturedProperties || true,
          showAboutSection: insertResult[0].layout?.showAboutSection || true,
          // Dados adicionais para o frontend
          socialMedia: {
            instagram: "",
            facebook: "",
            youtube: ""
          },
          stats: {
            visitsToday: 0,
            leadsGenerated: 0
          }
        };
      }
      
      console.log(`Website encontrado para o usuário ${userId}`);
      
      // Retornar website existente com informações adicionais para compatibilidade
      return {
        ...existingRecords[0],
        // Extrai dados do tema e layout para compatibilidade com frontend
        siteName: existingRecords[0].title,
        tagline: existingRecords[0].theme?.tagline || "",
        description: existingRecords[0].theme?.description || "",
        themeColor: existingRecords[0].theme?.primaryColor || "#FF5A00",
        secondaryColor: existingRecords[0].theme?.secondaryColor || "#222222",
        fontFamily: existingRecords[0].theme?.fontFamily || "inter",
        heroImageUrl: existingRecords[0].theme?.heroImageUrl || "",
        logoUrl: existingRecords[0].logo || "",
        // Informações de contato
        contactEmail: existingRecords[0].layout?.contactInfo?.email || "",
        contactPhone: existingRecords[0].layout?.contactInfo?.phone || "",
        address: existingRecords[0].layout?.contactInfo?.address || "",
        whatsapp: existingRecords[0].layout?.contactInfo?.whatsapp || "",
        creci: existingRecords[0].layout?.contactInfo?.creci || "",
        // Configurações de layout
        showTestimonials: existingRecords[0].layout?.showTestimonials || true,
        showFeaturedProperties: existingRecords[0].layout?.showFeaturedProperties || true,
        showAboutSection: existingRecords[0].layout?.showAboutSection || true,
        // Dados adicionais para o frontend
        socialMedia: {
          instagram: "",
          facebook: "",
          youtube: ""
        },
        stats: {
          visitsToday: 27,
          leadsGenerated: 5
        }
      };
    } catch (error) {
      console.error('Erro ao buscar ou criar website:', error);
      throw new Error('Erro ao processar dados do website');
    }
  },

  async updateWebsite(userId: number, websiteData: any) {
    try {
      console.log(`Tentando atualizar website para o usuário ${userId}`);
      // Verificar se o website já existe diretamente pelo banco de dados
      const existingRecords = await db.select().from(websites).where(eq(websites.userId, userId));
      
      // Converter dados do formato de frontend para o formato do banco de dados
      const dbWebsiteData = {
        title: websiteData.siteName || "Meu Site Imobiliário",
        theme: {
          primaryColor: websiteData.themeColor || "#FF5A00",
          secondaryColor: websiteData.secondaryColor || "#222222",
          fontFamily: websiteData.fontFamily || "inter",
          tagline: websiteData.tagline || "Os melhores imóveis da região",
          description: websiteData.description || "Profissional especializado no mercado imobiliário local",
          heroImageUrl: websiteData.heroImageUrl || ""
        },
        layout: {
          showTestimonials: websiteData.showTestimonials ?? true,
          showFeaturedProperties: websiteData.showFeaturedProperties ?? true,
          showAboutSection: websiteData.showAboutSection ?? true,
          contactInfo: {
            email: websiteData.contactEmail || "",
            phone: websiteData.contactPhone || "",
            address: websiteData.address || "",
            whatsapp: websiteData.whatsapp || "",
            creci: websiteData.creci || ""
          }
        },
        logo: websiteData.logoUrl || null
      };
      
      if (existingRecords.length === 0) {
        console.log(`Criando novo website para o usuário ${userId}`);
        // Create new website
        const result = await db.insert(websites)
          .values({
            ...dbWebsiteData, 
            userId
          })
          .returning();
        
        // Converter de volta para o formato do frontend
        return {
          ...result[0],
          // Dados para compatibilidade com frontend
          siteName: result[0].title,
          tagline: result[0].theme?.tagline || "",
          description: result[0].theme?.description || "",
          themeColor: result[0].theme?.primaryColor || "#FF5A00",
          secondaryColor: result[0].theme?.secondaryColor || "#222222",
          fontFamily: result[0].theme?.fontFamily || "inter",
          heroImageUrl: result[0].theme?.heroImageUrl || "",
          logoUrl: result[0].logo || "",
          // Informações de contato
          contactEmail: result[0].layout?.contactInfo?.email || "",
          contactPhone: result[0].layout?.contactInfo?.phone || "",
          address: result[0].layout?.contactInfo?.address || "",
          whatsapp: result[0].layout?.contactInfo?.whatsapp || "",
          creci: result[0].layout?.contactInfo?.creci || "",
          // Configurações de layout
          showTestimonials: result[0].layout?.showTestimonials || true,
          showFeaturedProperties: result[0].layout?.showFeaturedProperties || true,
          showAboutSection: result[0].layout?.showAboutSection || true,
          // Estatísticas
          stats: {
            visitsToday: 0,
            leadsGenerated: 0
          }
        };
      }
      
      console.log(`Atualizando website existente para o usuário ${userId}`);
      // Update existing website
      const result = await db.update(websites)
        .set({
          ...dbWebsiteData, 
          updatedAt: new Date()
        })
        .where(eq(websites.userId, userId))
        .returning();
      
      // Converter de volta para o formato do frontend
      return {
        ...result[0],
        // Dados para compatibilidade com frontend
        siteName: result[0].title,
        tagline: result[0].theme?.tagline || "",
        description: result[0].theme?.description || "",
        themeColor: result[0].theme?.primaryColor || "#FF5A00",
        secondaryColor: result[0].theme?.secondaryColor || "#222222",
        fontFamily: result[0].theme?.fontFamily || "inter",
        heroImageUrl: result[0].theme?.heroImageUrl || "",
        logoUrl: result[0].logo || "",
        // Informações de contato
        contactEmail: result[0].layout?.contactInfo?.email || "",
        contactPhone: result[0].layout?.contactInfo?.phone || "",
        address: result[0].layout?.contactInfo?.address || "",
        whatsapp: result[0].layout?.contactInfo?.whatsapp || "",
        creci: result[0].layout?.contactInfo?.creci || "",
        // Configurações de layout
        showTestimonials: result[0].layout?.showTestimonials || true,
        showFeaturedProperties: result[0].layout?.showFeaturedProperties || true,
        showAboutSection: result[0].layout?.showAboutSection || true,
        // Estatísticas
        stats: {
          visitsToday: 27,
          leadsGenerated: 5
        }
      };
    } catch (error) {
      console.error('Erro ao atualizar website:', error);
      throw error;
    }
  },

  // Lead operations
  async getLeads({ userId, page, limit, searchTerm, stage }: any) {
    let query = db.select().from(leads).where(eq(leads.userId, userId));
    
    if (searchTerm) {
      query = query.where(
        or(
          like(leads.fullName, `%${searchTerm}%`),
          like(leads.email, `%${searchTerm}%`),
          like(leads.message, `%${searchTerm}%`)
        )
      );
    }
    
    if (stage) {
      query = query.where(eq(leads.stage, stage));
    }
    
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.userId, userId));
    
    const total = totalResult[0]?.count || 0;
    
    const offset = (page - 1) * limit;
    const result = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(leads.createdAt));
    
    return {
      leads: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async insertLead(leadData: any) {
    const result = await db.insert(leads).values(leadData).returning();
    
    // Log activity
    await this.logActivity({
      userId: leadData.userId,
      entityType: 'lead',
      entityId: result[0].id,
      action: 'created',
      metadata: { source: leadData.source || 'direct' }
    });
    
    return result[0];
  },

  async updateLeadStage(leadId: number, userId: number, stageId: string) {
    // Map stageId to stage in our schema
    const stageMap: {[key: string]: string} = {
      'initial_contact': 'initial_contact',
      'qualification': 'qualification',
      'scheduled_visit': 'scheduled_visit',
      'proposal': 'proposal',
      'documentation': 'documentation',
      'closed': 'closed'
    };
    
    console.log('updateLeadStage called with:', { leadId, userId, stageId });
    
    const stage = stageMap[stageId] || stageId;
    
    const lead = await db.select().from(leads).where(eq(leads.id, leadId));
    
    if (lead.length === 0) {
      throw new Error("Lead not found");
    }
    
    if (lead[0].userId !== userId) {
      throw new Error("Unauthorized to update this lead");
    }
    
    console.log('Updating lead stage:', {
      leadId,
      oldStage: lead[0].stage,
      newStage: stage,
      updateData: {
        stage,
        updatedAt: new Date()
      }
    });
    
    try {
      const result = await db.update(leads)
        .set({
          stage,
          updatedAt: new Date()
        })
        .where(eq(leads.id, leadId))
        .returning();
      
      console.log('Update result:', result);
    
      // Log activity
      await this.logActivity({
        userId,
        entityType: 'lead',
        entityId: leadId,
        action: 'stage_changed',
        metadata: { 
          previousStage: lead[0].stage,
          newStage: stage
        }
      });
      
      return result[0];
    } catch (error) {
      console.error('Error updating lead stage:', error);
      throw error;
    }
  },

  // CRM operations
  async getCrmStages(userId: number) {
    // Get user's custom stage configurations
    const customStageConfigs = await db
      .select()
      .from(crmStageConfigs)
      .where(eq(crmStageConfigs.userId, userId))
      .orderBy(crmStageConfigs.position);
    
    // Default stages if no custom configurations
    const defaultStages = [
      { id: 'initial_contact', name: 'Contato Inicial', count: 0, leads: [] },
      { id: 'qualification', name: 'Qualificação', count: 0, leads: [] },
      { id: 'scheduled_visit', name: 'Visita Agendada', count: 0, leads: [] },
      { id: 'proposal', name: 'Proposta', count: 0, leads: [] },
      { id: 'documentation', name: 'Documentação', count: 0, leads: [] },
      { id: 'closed', name: 'Fechado', count: 0, leads: [] }
    ];
    
    // Use custom stages if available, otherwise use defaults
    const stageConfigs = customStageConfigs.length > 0 
      ? customStageConfigs.map(config => ({ 
          id: config.stageId, 
          name: config.name, 
          count: 0, 
          leads: [],
          color: config.color
        }))
      : defaultStages;
    
    // Get all leads for the user
    const userLeads = await db.select().from(leads).where(eq(leads.userId, userId));
    
    // Map leads to their stages
    for (const lead of userLeads) {
      const stage = stageConfigs.find(s => s.id === lead.stage);
      
      if (stage) {
        stage.count++;
        
        // Add all leads to the response for the full CRM view
        stage.leads.push({
          id: lead.id,
          name: lead.fullName,
          source: lead.source || 'Site',
          description: lead.message || `Interessado em ${lead.propertyId ? 'imóvel específico' : 'imóveis na região'}`,
          timeAgo: this.getTimeAgo(lead.createdAt),
          stageId: lead.stage
        });
      } else {
        // If lead has a stage that's not in the configurations, add it to the first stage
        if (stageConfigs.length > 0) {
          stageConfigs[0].count++;
          stageConfigs[0].leads.push({
            id: lead.id,
            name: lead.fullName,
            source: lead.source || 'Site',
            description: lead.message || `Interessado em ${lead.propertyId ? 'imóvel específico' : 'imóveis na região'}`,
            timeAgo: this.getTimeAgo(lead.createdAt),
            stageId: stageConfigs[0].id
          });
        }
      }
    }
    
    return stageConfigs;
  },
  
  // Get CRM stage configurations
  async getCrmStageConfigs(userId: number) {
    const configs = await db
      .select()
      .from(crmStageConfigs)
      .where(eq(crmStageConfigs.userId, userId))
      .orderBy(crmStageConfigs.position);
    
    if (configs.length === 0) {
      // Return default configurations if none exist
      return [
        { id: 1, userId, stageId: 'initial_contact', name: 'Contato Inicial', position: 0, isDefault: true, color: '#4F46E5' },
        { id: 2, userId, stageId: 'qualification', name: 'Qualificação', position: 1, isDefault: true, color: '#8B5CF6' },
        { id: 3, userId, stageId: 'scheduled_visit', name: 'Visita Agendada', position: 2, isDefault: true, color: '#10B981' },
        { id: 4, userId, stageId: 'proposal', name: 'Proposta', position: 3, isDefault: true, color: '#F59E0B' },
        { id: 5, userId, stageId: 'documentation', name: 'Documentação', position: 4, isDefault: true, color: '#EF4444' },
        { id: 6, userId, stageId: 'closed', name: 'Fechado', position: 5, isArchive: true, color: '#6B7280' }
      ];
    }
    
    return configs;
  },
  
  // Update CRM stage configurations
  async updateCrmStageConfigs(userId: number, configsData: any[]) {
    // First, delete existing configurations
    await db.delete(crmStageConfigs).where(eq(crmStageConfigs.userId, userId));
    
    // Then, insert the new configurations
    const newConfigs = [];
    for (const config of configsData) {
      try {
        // Create config entry
        const [insertedConfig] = await db.insert(crmStageConfigs).values({
          userId,
          stageId: config.id,
          name: config.name,
          color: config.color || null,
          position: config.position,
          isDefault: config.isDefault || false,
          isArchive: config.isArchive || false
        }).returning();
        
        newConfigs.push(insertedConfig);
      } catch (error) {
        console.error("Error inserting stage config:", error);
        throw new Error(`Failed to save stage configuration for ${config.name}`);
      }
    }
    
    return newConfigs;
  },

  // Activity log operations
  async logActivity(activityData: any) {
    await db.insert(activityLogs).values({
      ...activityData,
      createdAt: new Date()
    });
  },

  async getRecentActivities(userId: number) {
    // Get recent activity logs
    const recentLogs = await db.select()
      .from(activityLogs)
      .where(
        or(
          eq(activityLogs.userId, userId),
          eq(activityLogs.entityType, 'property')
        )
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);
      
    // Map activity logs to a format suitable for the frontend
    const activities = [];
    
    for (const log of recentLogs) {
      let activityItem = null;
      
      if (log.entityType === 'lead' && log.action === 'created') {
        const lead = await db.select().from(leads).where(eq(leads.id, log.entityId));
        
        if (lead.length > 0) {
          activityItem = {
            id: log.id,
            type: 'lead',
            name: lead[0].fullName,
            description: lead[0].message || 'Novo lead interessado em seus imóveis',
            timeAgo: this.getTimeAgo(log.createdAt),
            icon: 'person'
          };
        }
      } else if (log.entityType === 'lead' && log.action === 'stage_changed' && log.metadata.newStage === 'scheduled_visit') {
        const lead = await db.select().from(leads).where(eq(leads.id, log.entityId));
        
        if (lead.length > 0) {
          let property = null;
          
          if (lead[0].propertyId) {
            const propertyResult = await db.select().from(properties).where(eq(properties.id, lead[0].propertyId));
            property = propertyResult[0];
          }
          
          activityItem = {
            id: log.id,
            type: 'appointment',
            name: lead[0].fullName,
            description: `Visita agendada para ${property ? property.title : 'um imóvel'}`,
            timeAgo: this.getTimeAgo(log.createdAt),
            icon: 'calendar_today'
          };
        }
      } else if (log.entityType === 'document' && log.action === 'created') {
        const document = await db.select().from(documents).where(eq(documents.id, log.entityId));
        
        if (document.length > 0) {
          let lead = null;
          
          if (document[0].leadId) {
            const leadResult = await db.select().from(leads).where(eq(leads.id, document[0].leadId));
            lead = leadResult[0];
          }
          
          activityItem = {
            id: log.id,
            type: 'document',
            name: lead ? lead.fullName : 'Cliente',
            description: `Enviou ${document[0].title || 'documentação'} para análise`,
            timeAgo: this.getTimeAgo(log.createdAt),
            icon: 'article'
          };
        }
      }
      
      if (activityItem) {
        activities.push(activityItem);
      }
    }
    
    return activities.slice(0, 3); // Return only the 3 most recent activities
  },

  // Dashboard operations
  async getDashboardStats(userId: number) {
    // Count leads created in current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JS
    const currentYear = currentDate.getFullYear();
    
    // Returns mock stats for demonstration
    return {
      leads: 48,
      leadsChange: 12,
      visits: 16,
      visitsChange: 8,
      activeProperties: 32,
      propertiesChange: -3,
      websiteVisits: 920,
      websiteVisitsChange: 18
    };
  },

  // Affiliate operations
  async getAffiliateMarketplace({ userId, page, limit, searchTerm }: any) {
    // Get properties available for affiliation (excluding user's own properties)
    let query = db.select()
      .from(properties)
      .where(
        and(
          ne(properties.userId, userId),
          eq(properties.availableForAffiliation, true)
        )
      );
    
    if (searchTerm) {
      query = query.where(
        or(
          like(properties.title, `%${searchTerm}%`),
          like(properties.description, `%${searchTerm}%`),
          like(properties.address, `%${searchTerm}%`)
        )
      );
    }
    
    const offset = (page - 1) * limit;
    const properties = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(properties.createdAt));
    
    // Enhance properties with owner information
    const result = [];
    
    for (const property of properties) {
      const ownerResult = await db.select()
        .from(users)
        .where(eq(users.id, property.userId));
      
      const owner = ownerResult[0];
      
      if (owner) {
        const { password, ...ownerWithoutPassword } = owner;
        
        result.push({
          ...property,
          owner: {
            id: owner.id,
            name: owner.fullName
          },
          commissionRate: property.affiliationCommissionRate || 5
        });
      }
    }
    
    return result;
  },

  async getUserAffiliations(userId: number) {
    // Get all property affiliations where user is the affiliate
    const affiliations = await db.select()
      .from(propertyAffiliations)
      .where(eq(propertyAffiliations.affiliateId, userId))
      .orderBy(desc(propertyAffiliations.createdAt));
    
    // Enhance with property and owner information
    const result = [];
    
    for (const affiliation of affiliations) {
      const propertyResult = await db.select()
        .from(properties)
        .where(eq(properties.id, affiliation.propertyId));
      
      const property = propertyResult[0];
      
      if (property) {
        const ownerResult = await db.select()
          .from(users)
          .where(eq(users.id, affiliation.ownerId));
        
        const owner = ownerResult[0];
        
        if (owner) {
          const { password, ...ownerWithoutPassword } = owner;
          
          result.push({
            ...affiliation,
            property: {
              id: property.id,
              title: property.title,
              address: property.address,
              price: property.price
            },
            owner: {
              id: owner.id,
              name: owner.fullName
            }
          });
        }
      }
    }
    
    return result;
  },

  async getUserAffiliableProperties(userId: number) {
    // Get user's properties that are available for affiliation
    const userProperties = await db.select()
      .from(properties)
      .where(
        and(
          eq(properties.userId, userId),
          eq(properties.availableForAffiliation, true)
        )
      )
      .orderBy(desc(properties.createdAt));
    
    // Enhance with affiliation count
    const result = [];
    
    for (const property of userProperties) {
      const affiliationsResult = await db.select({ count: sql<number>`count(*)` })
        .from(propertyAffiliations)
        .where(eq(propertyAffiliations.propertyId, property.id));
      
      const affiliationsCount = affiliationsResult[0]?.count || 0;
      
      result.push({
        ...property,
        commissionRate: property.affiliationCommissionRate || 5,
        affiliationsCount
      });
    }
    
    return result;
  },

  async isPropertyAffiliate(propertyId: number, userId: number) {
    const affiliation = await db.select()
      .from(propertyAffiliations)
      .where(
        and(
          eq(propertyAffiliations.propertyId, propertyId),
          eq(propertyAffiliations.affiliateId, userId),
          eq(propertyAffiliations.status, 'approved')
        )
      );
    
    return affiliation.length > 0;
  },

  async requestAffiliation(userId: number, propertyId: number) {
    // Check if property exists and is available for affiliation
    const propertyResult = await db.select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.availableForAffiliation, true)
        )
      );
    
    if (propertyResult.length === 0) {
      throw new Error("Property not found or not available for affiliation");
    }
    
    const property = propertyResult[0];
    
    // Check if user is not the property owner
    if (property.userId === userId) {
      throw new Error("Cannot affiliate with your own property");
    }
    
    // Check if affiliation already exists
    const existingAffiliation = await db.select()
      .from(propertyAffiliations)
      .where(
        and(
          eq(propertyAffiliations.propertyId, propertyId),
          eq(propertyAffiliations.affiliateId, userId)
        )
      );
    
    if (existingAffiliation.length > 0) {
      throw new Error("Affiliation request already exists");
    }
    
    // Create affiliation request
    const result = await db.insert(propertyAffiliations)
      .values({
        propertyId,
        affiliateId: userId,
        ownerId: property.userId,
        status: 'pending',
        commissionRate: property.affiliationCommissionRate || 5,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return result[0];
  },

  async updateAffiliationStatus(affiliationId: number, userId: number, status: string) {
    // Check if affiliation exists
    const affiliationResult = await db.select()
      .from(propertyAffiliations)
      .where(eq(propertyAffiliations.id, affiliationId));
    
    if (affiliationResult.length === 0) {
      throw new Error("Affiliation not found");
    }
    
    const affiliation = affiliationResult[0];
    
    // Check if user is the property owner (only owner can approve/reject)
    if (affiliation.ownerId !== userId) {
      throw new Error("Unauthorized to update this affiliation");
    }
    
    // Update status
    const result = await db.update(propertyAffiliations)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(propertyAffiliations.id, affiliationId))
      .returning();
    
    return result[0];
  },

  // Document operations
  async getUserDocuments(userId: number) {
    // Get all documents for the user
    const documents = await db.select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
    
    // Enhance with lead information
    const result = [];
    
    for (const document of documents) {
      let lead = null;
      
      if (document.leadId) {
        const leadResult = await db.select()
          .from(leads)
          .where(eq(leads.id, document.leadId));
        
        lead = leadResult[0];
      }
      
      result.push({
        ...document,
        client: lead ? lead.fullName : 'Cliente'
      });
    }
    
    return result;
  },

  async insertDocument(documentData: any) {
    const result = await db.insert(documents).values(documentData).returning();
    
    // Log activity
    await this.logActivity({
      userId: documentData.userId,
      entityType: 'document',
      entityId: result[0].id,
      action: 'created',
      metadata: {}
    });
    
    return result[0];
  },

  // Client operations
  async getClients(userId: number) {
    // For this example, we'll consider leads as clients
    const clientLeads = await db.select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt));
    
    // Transform leads into clients format
    return clientLeads.map(lead => ({
      id: lead.id,
      name: lead.fullName,
      email: lead.email,
      phone: lead.phone || 'N/A',
      interest: lead.message ? (lead.message.length > 30 ? `${lead.message.substring(0, 30)}...` : lead.message) : 'N/A',
      status: this.mapLeadStageToClientStatus(lead.stage)
    }));
  },

  // Subscription operations
  async getUserSubscription(userId: number) {
    // Mock subscription data
    return {
      id: 1,
      userId,
      plan: {
        id: 'professional',
        name: 'Professional',
        price: 199
      },
      status: 'active',
      nextBillingDate: '2023-12-15',
      startDate: '2023-11-15',
      features: {
        propertyLimit: 50,
        teamMembers: 5,
        customDomain: true,
        analytics: true
      }
    };
  },

  // Integration operations
  async getUserIntegrations(userId: number) {
    // Mock integration settings
    return {
      googleDrive: {
        enabled: true,
        token: 'YOUR_GOOGLE_DRIVE_TOKEN',
        folder: 'ImobConnect'
      },
      whatsapp: {
        enabled: true,
        apiKey: 'YOUR_WHATSAPP_API_KEY',
        phone: '+5511912345678'
      },
      portals: {
        enabled: true,
        zapImoveis: true,
        vivaReal: true,
        olx: false
      }
    };
  },

  async updateUserIntegrations(userId: number, integrationData: any) {
    // In a real application, this would update the integrations in the database
    // For this example, we'll just return the updated data
    return integrationData;
  },

  // Analytics operations
  async getAnalyticsData(userId: number, timeframe: string) {
    // Mock analytics data
    return {
      overview: {
        visitors: 8734,
        visitorsChange: 12,
        leads: 156,
        leadsChange: 8,
        conversionRate: 1.78,
        conversionRateChange: -0.3,
        sales: 14,
        salesChange: 27
      },
      timeSeriesData: [],
      trafficSources: [],
      propertyPerformance: []
    };
  },

  // Helper methods
  getTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMins < 60) {
      return `Há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
      return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    } else if (diffWeeks < 4) {
      return `Há ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      return `Há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
    }
  },

  mapLeadStageToClientStatus(stage: string) {
    switch (stage) {
      case 'initial_contact':
        return 'Novo';
      case 'qualification':
        return 'Em Análise';
      case 'scheduled_visit':
        return 'Agendado';
      case 'proposal':
        return 'Proposta';
      case 'documentation':
        return 'Documentação';
      case 'closed':
        return 'Fechado';
      default:
        return 'Ativo';
    }
  },

  // Favorites operations  
  async getUserFavorites(userId: number) {
    // Join favorites with properties to get property details
    const favoriteProps = await db.query.favorites.findMany({
      where: eq(favorites.userId, userId),
      with: {
        property: true
      }
    });
    
    if (!favoriteProps || favoriteProps.length === 0) {
      return [];
    }
    
    // Map the result to return the properties with additional information
    return favoriteProps.map((favorite) => ({
      ...favorite.property,
      timeAgo: this.getTimeAgo(favorite.property.createdAt),
      formattedPrice: new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(favorite.property.price)
    }));
  },
  
  async toggleFavorite(userId: number, propertyId: number) {
    // Check if the property exists
    const property = await this.getPropertyById(propertyId);
    
    if (!property) {
      throw new Error('Property not found');
    }
    
    // Check if the favorite already exists
    const existingFavorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, userId),
        eq(favorites.propertyId, propertyId)
      )
    });
    
    if (existingFavorite) {
      // If it exists, remove it
      await db.delete(favorites)
        .where(and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        ));
    } else {
      // If it doesn't exist, add it
      await db.insert(favorites).values({
        userId,
        propertyId
      });
    }
      
    return { success: true };
  },
  
  async removeFavorite(userId: number, propertyId: number) {
    // Remove from favorites table
    await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.propertyId, propertyId)
      ));
      
    return { success: true };
  }
};
