import { db } from "./index";
import * as schema from "@shared/schema";

async function seedDevelopments() {
  try {
    console.log("Seeding developments...");
    
    // Verificar se já existem empreendimentos
    const existingDevelopments = await db.select().from(schema.developments);
    if (existingDevelopments.length > 0) {
      console.log("Database already has developments. Skipping development seed.");
      return;
    }

    // Obter usuário admin (assumindo que já existe um usuário)
    const users = await db.select().from(schema.users);
    if (users.length === 0) {
      console.log("No users found. Please run the main seed first.");
      return;
    }
    
    const adminUser = users.find(user => user.role === 'admin') || users[0];
    console.log(`Using user ${adminUser.fullName} (ID: ${adminUser.id}) for developments`);

    // Criar empreendimentos
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
    
    // Criar unidades para o primeiro empreendimento (Green Hills)
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
      price: `${i % 4 === 0 ? 650000 : i % 4 === 1 ? 750000 : i % 4 === 2 ? 950000 : 1200000}`,
      status: i < 5 ? "sold" : i < 8 ? "reserved" : "available",
      floorPlanImage: "https://via.placeholder.com/400x300?text=Planta+Baixa",
      features: JSON.stringify(["sacada", "suite", "armarios"]),
      createdAt: new Date(Date.now() - 60 * 86400000), // 60 days ago
      updatedAt: new Date(Date.now() - 5 * 86400000) // 5 days ago
    }));
    
    const insertedUnits1 = await db.insert(schema.units).values(units1).returning();
    console.log("Created units for Green Hills:", insertedUnits1.length);
    
    // Criar unidades para o segundo empreendimento (Jardins do Vale)
    const units2 = Array.from({ length: 10 }, (_, i) => ({
      developmentId: insertedDevelopments[1].id,
      unitNumber: `Casa ${i + 1}`,
      block: i < 5 ? "Setor A" : "Setor B",
      unitType: i % 3 === 0 ? "Tipo 1" : i % 3 === 1 ? "Tipo 2" : "Tipo 3",
      bedrooms: i % 3 === 0 ? 3 : i % 3 === 1 ? 4 : 5,
      bathrooms: i % 3 === 0 ? 2 : i % 3 === 1 ? 3 : 4,
      area: i % 3 === 0 ? 150 : i % 3 === 1 ? 180 : 220,
      privateArea: i % 3 === 0 ? 150 : i % 3 === 1 ? 180 : 220,
      price: `${i % 3 === 0 ? 850000 : i % 3 === 1 ? 1100000 : 1500000}`,
      status: i < 6 ? "sold" : i < 8 ? "reserved" : "available",
      floorPlanImage: "https://via.placeholder.com/400x300?text=Planta+Casa",
      features: JSON.stringify(["quintal", "piscina_privativa", "churrasqueira"]),
      createdAt: new Date(Date.now() - 120 * 86400000), // 120 days ago
      updatedAt: new Date(Date.now() - 15 * 86400000) // 15 days ago
    }));
    
    const insertedUnits2 = await db.insert(schema.units).values(units2).returning();
    console.log("Created units for Jardins do Vale:", insertedUnits2.length);
    
    // Criar unidades para o terceiro empreendimento (Vista Mar)
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
      price: `${i % 4 === 0 ? 550000 : i % 4 === 1 ? 650000 : i % 4 === 2 ? 850000 : 980000}`,
      status: i < 7 ? "available" : "reserved",
      floorPlanImage: "https://via.placeholder.com/400x300?text=Planta+Baixa",
      features: JSON.stringify(["vista_mar", "varanda", "academia"]),
      createdAt: new Date(Date.now() - 30 * 86400000), // 30 days ago
      updatedAt: new Date(Date.now() - 3 * 86400000) // 3 days ago
    }));
    
    const insertedUnits3 = await db.insert(schema.units).values(units3).returning();
    console.log("Created units for Vista Mar:", insertedUnits3.length);

    console.log("Development seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding developments:", error);
  }
}

seedDevelopments();