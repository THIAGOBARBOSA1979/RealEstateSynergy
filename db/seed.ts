import { db } from "./index";
import * as schema from "@shared/schema";
import { hash } from "bcrypt";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Check if users already exist
    const existingUsers = await db.select().from(schema.users);
    let adminUser;
    
    if (existingUsers.length > 0) {
      console.log("Database already has users. Using first admin user.");
      adminUser = existingUsers.find(user => user.role === 'admin') || existingUsers[0];
      
      // Check if developments already exist
      const existingDevelopments = await db.select().from(schema.developments);
      if (existingDevelopments.length > 0) {
        console.log("Database already has developments. Skipping development seed.");
        return;
      }
    } else {
      console.log("No users found. Creating admin user first.");
      // Create admin user
      const hashedPassword = await hash("password123", 10);
      const [newAdminUser] = await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@imobconnect.com",
        fullName: "Carlos Silva",
        role: "admin",
        planType: "professional",
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      adminUser = newAdminUser;
      console.log("Created admin user:", adminUser.id);
    }
    
    // Create developments
    const developments = [
      {
        userId: adminUser.id,
        name: "Edifício Green Hills",
        description: "Apartamentos de luxo com vista panorâmica da cidade, áreas de lazer completas e segurança 24h. Localizado em região privilegiada com fácil acesso a comércios, escolas e transporte público.",
        address: "Av. das Palmeiras, 1500",
        city: "São Paulo",
        state: "SP",
        zipCode: "04505-000",
        developmentType: "condominio_vertical",
        totalUnits: 48,
        constructionStatus: "em_construcao",
        deliveryDate: new Date("2025-07-15"),
        priceRange: JSON.stringify({ min: 650000, max: 1200000 }),
        mainImage: "https://images.unsplash.com/photo-1580041065738-e72023775cdc?q=80&w=1170&auto=format&fit=crop",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1035&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1035&auto=format&fit=crop"
        ]),
        amenities: JSON.stringify([
          "piscina", "academia", "salao_festas", "playground", "seguranca", "portaria"
        ]),
        salesStatus: JSON.stringify({ available: 35, reserved: 8, sold: 5 }),
        createdAt: new Date(Date.now() - 60 * 86400000), // 60 days ago
        updatedAt: new Date(Date.now() - 5 * 86400000) // 5 days ago
      },
        fullName: "Ana Pereira",
        role: "agent",
        parentId: adminUser.id,
        planType: "basic",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: "roberto",
        password: hashedPassword,
        email: "roberto@imobconnect.com",
        fullName: "Roberto Silva",
        role: "assistant",
        parentId: adminUser.id,
        planType: "basic",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const insertedTeamMembers = await db.insert(schema.users).values(teamMembers).returning();
    console.log("Created team members:", insertedTeamMembers.map(u => u.id).join(", "));
    
    // Create website for admin user
    const website = await db.insert(schema.websites).values({
      userId: adminUser.id,
      domain: "carlosimobiliaria.com.br",
      title: "Carlos Silva Imóveis",
      logo: "https://via.placeholder.com/150",
      theme: {
        primaryColor: "#1a237e",
        secondaryColor: "#00796b",
        accentColor: "#ff9800",
        fontHeading: "Poppins",
        fontBody: "Inter"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("Created website:", website[0].id);
    
    // Create properties
    const properties = [
      {
        userId: adminUser.id,
        title: "Apartamento Centro",
        description: "Lindo apartamento no centro da cidade, com 2 quartos, sala ampla e cozinha americana.",
        address: "Rua das Flores, 123, Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000",
        price: 450000,
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        garageSpots: 1,
        status: "active",
        featured: true,
        images: ["https://images.unsplash.com/photo-1581404788767-c1e2c02940fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"],
        published: true,
        publishedPortals: ["zap", "vivareal"],
        availableForAffiliation: true,
        affiliationCommissionRate: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: adminUser.id,
        title: "Casa Vila Verde",
        description: "Espaçosa casa em condomínio fechado, com 3 quartos sendo 1 suíte, quintal e churrasqueira.",
        address: "Rua dos Ipês, 789, Vila Verde",
        city: "São Paulo",
        state: "SP",
        zipCode: "04000-000",
        price: 720000,
        propertyType: "house",
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        garageSpots: 2,
        status: "active",
        featured: true,
        images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"],
        published: true,
        publishedPortals: ["zap", "vivareal", "olx"],
        availableForAffiliation: true,
        affiliationCommissionRate: 2.5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: adminUser.id,
        title: "Cobertura Duplex",
        description: "Cobertura duplex com vista para o mar, 4 quartos, 3 banheiros, terraço com piscina privativa.",
        address: "Av. Beira Mar, 1001, Praia Grande",
        city: "Santos",
        state: "SP",
        zipCode: "11000-000",
        price: 1250000,
        propertyType: "apartment",
        bedrooms: 4,
        bathrooms: 3,
        area: 180,
        garageSpots: 2,
        status: "reserved",
        featured: false,
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"],
        published: true,
        publishedPortals: ["zap", "vivareal"],
        availableForAffiliation: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const insertedProperties = await db.insert(schema.properties).values(properties).returning();
    console.log("Created properties:", insertedProperties.map(p => p.id).join(", "));
    
    // Create leads
    const leads = [
      {
        userId: adminUser.id,
        propertyId: insertedProperties[0].id,
        fullName: "Ana Pereira",
        email: "ana.cliente@example.com",
        phone: "+5511987654321",
        message: "Interessada em apartamento no centro, 2 quartos",
        stage: "initial_contact",
        source: "Site",
        status: "active",
        createdAt: new Date(Date.now() - 35 * 60000), // 35 minutes ago
        updatedAt: new Date(Date.now() - 35 * 60000)
      },
      {
        userId: adminUser.id,
        propertyId: insertedProperties[1].id,
        fullName: "Ricardo Almeida",
        email: "ricardo@example.com",
        phone: "+5511912345678",
        message: "Gostaria de visitar esta casa",
        stage: "scheduled_visit",
        source: "WhatsApp",
        status: "active",
        createdAt: new Date(Date.now() - 2 * 3600000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 3600000)
      },
      {
        userId: adminUser.id,
        propertyId: insertedProperties[2].id,
        fullName: "Julia Santos",
        email: "julia@example.com",
        phone: "+5511955554444",
        message: "Interessada na cobertura, gostaria de mais informações",
        stage: "documentation",
        source: "Indica",
        status: "active",
        createdAt: new Date(Date.now() - 5 * 3600000), // 5 hours ago
        updatedAt: new Date(Date.now() - 5 * 3600000)
      },
      {
        userId: adminUser.id,
        fullName: "Fernando Costa",
        email: "fernando@example.com",
        phone: "+5511922223333",
        message: "Apartamento 3 quartos, zona sul",
        stage: "initial_contact",
        source: "Site",
        status: "active",
        createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        userId: adminUser.id,
        fullName: "Carla Mendes",
        email: "carla@example.com",
        phone: "+5511966667777",
        message: "Casa em condomínio, 4 quartos",
        stage: "initial_contact",
        source: "WhatsApp",
        status: "active",
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        userId: adminUser.id,
        fullName: "Roberto Silva",
        email: "roberto.cliente@example.com",
        phone: "+5511977778888",
        message: "Apt Jardins, 2 quartos, próx metrô",
        stage: "qualification",
        source: "Indica",
        status: "active",
        createdAt: new Date(Date.now() - 7 * 86400000), // 1 week ago
        updatedAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        userId: adminUser.id,
        propertyId: insertedProperties[1].id,
        fullName: "Marina Costa",
        email: "marina@example.com",
        phone: "+5511988889999",
        message: "Interessada na Casa Vila Europa",
        stage: "scheduled_visit",
        source: "Portal",
        status: "active",
        createdAt: new Date(Date.now() - 1 * 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        userId: adminUser.id,
        fullName: "Rafael Oliveira",
        email: "rafael@example.com",
        phone: "+5511933334444",
        message: "Apt Centro, proposta R$ 450 mil",
        stage: "proposal",
        source: "Site",
        status: "active",
        createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        userId: adminUser.id,
        fullName: "Juliana Martins",
        email: "juliana@example.com",
        phone: "+5511944445555",
        message: "Casa Jd. América, contrato em revisão",
        stage: "documentation",
        source: "Indica",
        status: "active",
        createdAt: new Date(Date.now() - 7 * 86400000), // 1 week ago
        updatedAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        userId: adminUser.id,
        fullName: "Carlos Mendonça",
        email: "carlos.cliente@example.com",
        phone: "+5511955556666",
        message: "Apt Jardins, R$ 620 mil",
        stage: "closed",
        source: "Portal",
        status: "active",
        createdAt: new Date(Date.now() - 30 * 86400000), // 1 month ago
        updatedAt: new Date(Date.now() - 30 * 86400000)
      }
    ];
    
    const insertedLeads = await db.insert(schema.leads).values(leads).returning();
    console.log("Created leads:", insertedLeads.map(l => l.id).join(", "));
    
    // Create documents
    const documents = [
      {
        userId: adminUser.id,
        leadId: insertedLeads[2].id,
        title: "Comprovante de Renda",
        type: "income_proof",
        fileUrl: "https://example.com/documents/income_proof.pdf",
        googleDriveId: "abc123",
        status: "approved",
        createdAt: new Date(Date.now() - 4 * 3600000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 3600000)
      },
      {
        userId: adminUser.id,
        leadId: insertedLeads[2].id,
        title: "Comprovante de Residência",
        type: "proof_of_residence",
        fileUrl: "https://example.com/documents/proof_of_residence.pdf",
        googleDriveId: "def456",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 3600000), // 5 hours ago
        updatedAt: new Date(Date.now() - 5 * 3600000)
      },
      {
        userId: adminUser.id,
        leadId: insertedLeads[8].id,
        title: "Contrato de Compra e Venda",
        type: "contract",
        fileUrl: "https://example.com/documents/contract.pdf",
        googleDriveId: "ghi789",
        status: "approved",
        createdAt: new Date(Date.now() - 6 * 86400000), // 6 days ago
        updatedAt: new Date(Date.now() - 6 * 86400000)
      }
    ];
    
    const insertedDocuments = await db.insert(schema.documents).values(documents).returning();
    console.log("Created documents:", insertedDocuments.map(d => d.id).join(", "));
    
    // Create developments
    const developments = [
      {
        userId: adminUser.id,
        name: "Edifício Green Hills",
        description: "Apartamentos de luxo com vista panorâmica da cidade, áreas de lazer completas e segurança 24h. Localizado em região privilegiada com fácil acesso a comércios, escolas e transporte público.",
        address: "Av. das Palmeiras, 1500",
        city: "São Paulo",
        state: "SP",
        zipCode: "04505-000",
        developmentType: "condominio_vertical",
        totalUnits: 48,
        constructionStatus: "em_construcao",
        deliveryDate: new Date("2025-07-15"),
        priceRange: JSON.stringify({ min: 650000, max: 1200000 }),
        mainImage: "https://images.unsplash.com/photo-1580041065738-e72023775cdc?q=80&w=1170&auto=format&fit=crop",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1035&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1035&auto=format&fit=crop"
        ]),
        amenities: JSON.stringify([
          "piscina", "academia", "salao_festas", "playground", "seguranca", "portaria"
        ]),
        salesStatus: JSON.stringify({ available: 35, reserved: 8, sold: 5 }),
        createdAt: new Date(Date.now() - 60 * 86400000), // 60 days ago
        updatedAt: new Date(Date.now() - 5 * 86400000) // 5 days ago
      },
      {
        userId: adminUser.id,
        name: "Jardins do Vale",
        description: "Condomínio horizontal com casas amplas e modernas, perfeito para famílias que buscam qualidade de vida, segurança e contato com a natureza. Área verde preservada e infraestrutura completa.",
        address: "Estrada do Vale, Km 5",
        city: "Campinas",
        state: "SP",
        zipCode: "13100-000",
        developmentType: "condominio_horizontal",
        totalUnits: 24,
        constructionStatus: "pronto",
        priceRange: JSON.stringify({ min: 850000, max: 1500000 }),
        mainImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1074&auto=format&fit=crop",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1170&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1170&auto=format&fit=crop"
        ]),
        amenities: JSON.stringify([
          "piscina", "quadra", "churrasqueira", "seguranca", "pet_place"
        ]),
        salesStatus: JSON.stringify({ available: 6, reserved: 4, sold: 14 }),
        createdAt: new Date(Date.now() - 120 * 86400000), // 120 days ago
        updatedAt: new Date(Date.now() - 15 * 86400000) // 15 days ago
      },
      {
        userId: adminUser.id,
        name: "Residencial Vista Mar",
        description: "Empreendimento à beira-mar com unidades de 2 a 4 dormitórios. Áreas de lazer com piscina, salão de festas e playground. Um verdadeiro paraíso com acesso direto à praia.",
        address: "Av. Beira Mar, 700",
        city: "Guarujá",
        state: "SP",
        zipCode: "11400-000",
        developmentType: "apartamentos",
        totalUnits: 32,
        constructionStatus: "planta",
        deliveryDate: new Date("2026-12-20"),
        priceRange: JSON.stringify({ min: 550000, max: 980000 }),
        mainImage: "https://images.unsplash.com/photo-1622015663084-307d19eabca8?q=80&w=1032&auto=format&fit=crop",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1170&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1509600110300-21b9d5fedeb7?q=80&w=1170&auto=format&fit=crop"
        ]),
        amenities: JSON.stringify([
          "piscina", "academia", "salao_festas", "seguranca", "churrasqueira"
        ]),
        salesStatus: JSON.stringify({ available: 25, reserved: 7, sold: 0 }),
        createdAt: new Date(Date.now() - 30 * 86400000), // 30 days ago
        updatedAt: new Date(Date.now() - 3 * 86400000) // 3 days ago
      }
    ];
    
    const insertedDevelopments = await db.insert(schema.developments).values(developments).returning();
    console.log("Created developments:", insertedDevelopments.map(d => d.id).join(", "));
    
    // Create units for the first development (Green Hills)
    const units1 = Array.from({ length: 15 }, (_, i) => ({
      developmentId: insertedDevelopments[0].id,
      unitNumber: `${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`, // 1A, 1B, 1C, 1D, 2A, 2B, etc
      block: "Torre A",
      floor: Math.floor(i / 4) + 1,
      unitType: i % 8 === 0 ? "Garden" : i % 8 === 7 ? "Cobertura" : "Padrão",
      bedrooms: i % 4 === 0 ? 1 : i % 4 === 1 ? 2 : i % 4 === 2 ? 3 : 4,
      bathrooms: i % 4 === 0 ? 1 : i % 4 === 1 ? 2 : i % 4 === 2 ? 2 : 3,
      area: i % 4 === 0 ? 45 : i % 4 === 1 ? 65 : i % 4 === 2 ? 85 : 120,
      privateArea: i % 4 === 0 ? 42 : i % 4 === 1 ? 60 : i % 4 === 2 ? 78 : 110,
      price: i % 4 === 0 ? 650000 : i % 4 === 1 ? 750000 : i % 4 === 2 ? 950000 : 1200000,
      status: i < 5 ? "sold" : i < 8 ? "reserved" : "available",
      floorPlanImage: "https://via.placeholder.com/400x300?text=Planta+Baixa",
      createdAt: new Date(Date.now() - 60 * 86400000), // 60 days ago
      updatedAt: new Date(Date.now() - 5 * 86400000) // 5 days ago
    }));
    
    const insertedUnits1 = await db.insert(schema.units).values(units1).returning();
    console.log("Created units for Green Hills:", insertedUnits1.map(u => u.id).join(", "));
    
    // Create units for the second development (Jardins do Vale)
    const units2 = Array.from({ length: 10 }, (_, i) => ({
      developmentId: insertedDevelopments[1].id,
      unitNumber: `Casa ${i + 1}`,
      block: i < 5 ? "Setor A" : "Setor B",
      unitType: i % 3 === 0 ? "Tipo 1" : i % 3 === 1 ? "Tipo 2" : "Tipo 3",
      bedrooms: i % 3 === 0 ? 3 : i % 3 === 1 ? 4 : 5,
      bathrooms: i % 3 === 0 ? 2 : i % 3 === 1 ? 3 : 4,
      area: i % 3 === 0 ? 150 : i % 3 === 1 ? 180 : 220,
      privateArea: i % 3 === 0 ? 150 : i % 3 === 1 ? 180 : 220,
      price: i % 3 === 0 ? 850000 : i % 3 === 1 ? 1100000 : 1500000,
      status: i < 6 ? "sold" : i < 8 ? "reserved" : "available",
      floorPlanImage: "https://via.placeholder.com/400x300?text=Planta+Casa",
      createdAt: new Date(Date.now() - 120 * 86400000), // 120 days ago
      updatedAt: new Date(Date.now() - 15 * 86400000) // 15 days ago
    }));
    
    const insertedUnits2 = await db.insert(schema.units).values(units2).returning();
    console.log("Created units for Jardins do Vale:", insertedUnits2.map(u => u.id).join(", "));
    
    // Create units for the third development (Vista Mar)
    const units3 = Array.from({ length: 12 }, (_, i) => ({
      developmentId: insertedDevelopments[2].id,
      unitNumber: `${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`, // 1A, 1B, 1C, 1D, 2A, 2B, etc
      block: "Bloco Único",
      floor: Math.floor(i / 4) + 1,
      unitType: i % 4 === 0 ? "Studio" : i % 4 === 1 ? "2 Dormitórios" : i % 4 === 2 ? "3 Dormitórios" : "4 Dormitórios",
      bedrooms: i % 4 === 0 ? 0 : i % 4,
      bathrooms: i % 4 === 0 ? 1 : i % 4,
      area: i % 4 === 0 ? 35 : i % 4 === 1 ? 65 : i % 4 === 2 ? 85 : 120,
      privateArea: i % 4 === 0 ? 32 : i % 4 === 1 ? 60 : i % 4 === 2 ? 80 : 110,
      price: i % 4 === 0 ? 550000 : i % 4 === 1 ? 650000 : i % 4 === 2 ? 850000 : 980000,
      status: i < 7 ? "available" : "reserved",
      floorPlanImage: "https://via.placeholder.com/400x300?text=Planta+Baixa",
      createdAt: new Date(Date.now() - 30 * 86400000), // 30 days ago
      updatedAt: new Date(Date.now() - 3 * 86400000) // 3 days ago
    }));
    
    const insertedUnits3 = await db.insert(schema.units).values(units3).returning();
    console.log("Created units for Vista Mar:", insertedUnits3.map(u => u.id).join(", "));
    
    // Create activity logs for the initial_contact leads
    for (const lead of insertedLeads.filter(l => l.stage === "initial_contact")) {
      await db.insert(schema.activityLogs).values({
        userId: adminUser.id,
        entityType: "lead",
        entityId: lead.id,
        action: "created",
        metadata: { source: lead.source },
        createdAt: new Date(lead.createdAt)
      });
    }
    
    // Create activity logs for the scheduled_visit leads
    for (const lead of insertedLeads.filter(l => l.stage === "scheduled_visit")) {
      await db.insert(schema.activityLogs).values([
        {
          userId: adminUser.id,
          entityType: "lead",
          entityId: lead.id,
          action: "created",
          metadata: { source: lead.source },
          createdAt: new Date(new Date(lead.createdAt).getTime() - 86400000) // 1 day before
        },
        {
          userId: adminUser.id,
          entityType: "lead",
          entityId: lead.id,
          action: "stage_changed",
          metadata: { 
            previousStage: "initial_contact",
            newStage: "scheduled_visit"
          },
          createdAt: new Date(lead.createdAt)
        }
      ]);
    }
    
    // Create activity logs for the documentation leads
    for (const lead of insertedLeads.filter(l => l.stage === "documentation")) {
      await db.insert(schema.activityLogs).values([
        {
          userId: adminUser.id,
          entityType: "lead",
          entityId: lead.id,
          action: "created",
          metadata: { source: lead.source },
          createdAt: new Date(new Date(lead.createdAt).getTime() - 2 * 86400000) // 2 days before
        },
        {
          userId: adminUser.id,
          entityType: "lead",
          entityId: lead.id,
          action: "stage_changed",
          metadata: { 
            previousStage: "proposal",
            newStage: "documentation"
          },
          createdAt: new Date(lead.createdAt)
        }
      ]);
    }
    
    // Create activity logs for documents
    for (const document of insertedDocuments) {
      await db.insert(schema.activityLogs).values({
        userId: adminUser.id,
        entityType: "document",
        entityId: document.id,
        action: "created",
        metadata: {},
        createdAt: new Date(document.createdAt)
      });
    }
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
