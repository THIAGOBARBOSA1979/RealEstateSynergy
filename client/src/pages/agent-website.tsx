import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const AgentWebsite = () => {
  const { agentId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  
  // Query for agent data
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: [`/api/agents/${agentId}`],
    enabled: !!agentId,
  });
  
  // Query for agent properties
  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: [`/api/agents/${agentId}/properties`, { propertyType, minPrice: priceRange[0], maxPrice: priceRange[1] }],
    enabled: !!agentId,
  });
  
  // Query for agent website config
  const { data: websiteConfig, isLoading: isLoadingWebsite } = useQuery({
    queryKey: [`/api/agents/${agentId}/website`],
    enabled: !!agentId,
  });
  
  // Filtered properties based on search term
  const filteredProperties = properties?.filter((property: Property) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower) ||
      property.address.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower)
    );
  });
  
  // Extract primary, secondary and accent colors from website config
  const primaryColor = websiteConfig?.theme?.primaryColor || "#3b82f6";
  const secondaryColor = websiteConfig?.theme?.secondaryColor || "#f43f5e";
  const accentColor = websiteConfig?.theme?.accentColor || "#10b981";
  
  // Apply website theme dynamically
  useEffect(() => {
    if (websiteConfig?.theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--secondary', secondaryColor);
      root.style.setProperty('--accent', accentColor);
      
      // Update title
      document.title = websiteConfig.title || `${agent?.fullName} - Imóveis`;
    }
    
    return () => {
      // Reset theme when unmounting
      const root = document.documentElement;
      root.style.setProperty('--primary', '');
      root.style.setProperty('--secondary', '');
      root.style.setProperty('--accent', '');
    };
  }, [websiteConfig, agent]);
  
  if (isLoadingAgent || isLoadingWebsite) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-12">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-64 mt-4" />
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="agent-website">
      {/* Header */}
      <header 
        className="py-4 px-6" 
        style={{ backgroundColor: primaryColor, color: "white" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            {websiteConfig?.logo ? (
              <img src={websiteConfig.logo} alt="Logo" className="h-10" />
            ) : (
              <span className="material-icons text-white text-2xl">home</span>
            )}
            <h1 className="text-white text-xl font-bold">{websiteConfig?.title || `${agent?.fullName} Imóveis`}</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#imoveis" className="text-white hover:text-white/80">Imóveis</a>
            <a href="#sobre" className="text-white hover:text-white/80">Sobre</a>
            <a href="#contato" className="text-white hover:text-white/80">Contato</a>
          </nav>
          <Button variant="secondary" style={{ backgroundColor: secondaryColor, color: "white" }}>
            Fale Comigo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="py-20 px-6 bg-cover bg-center relative"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Encontre o Imóvel dos Seus Sonhos
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {agent?.fullName} - Especialista em imóveis em {
              properties?.length > 0 ? properties[0].city : "sua região"
            }
          </p>
          
          <div className="bg-white rounded-lg p-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                placeholder="Buscar por localização, tipo..." 
                className="text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <select 
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="land">Terreno</option>
                <option value="commercial">Comercial</option>
              </select>
              
              <Button 
                style={{ backgroundColor: primaryColor }}
                className="w-full"
              >
                <span className="material-icons mr-2">search</span>
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="imoveis" className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: primaryColor }}>
            Nossos Imóveis
          </h2>
          
          <Tabs defaultValue="todos" className="w-full mb-8">
            <TabsList className="w-full max-w-lg mx-auto grid grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="venda">Venda</TabsTrigger>
              <TabsTrigger value="locacao">Locação</TabsTrigger>
              <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-8 w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties?.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300">search_off</span>
              <h3 className="text-xl mt-4 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500">Tente modificar os filtros de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties?.map((property: Property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={property.images?.[0] || "https://via.placeholder.com/800x500?text=Imagem+não+disponível"} 
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <Badge 
                      className="absolute top-3 left-3"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      {property.propertyType === 'house' ? 'Casa' : 
                       property.propertyType === 'apartment' ? 'Apartamento' : 
                       property.propertyType === 'land' ? 'Terreno' : 'Comercial'}
                    </Badge>
                    {property.featured && (
                      <Badge 
                        className="absolute top-3 right-3"
                        style={{ backgroundColor: accentColor }}
                      >
                        Destaque
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{property.title}</CardTitle>
                      <p className="text-lg font-bold" style={{ color: primaryColor }}>
                        {formatCurrency(property.price)}
                      </p>
                    </div>
                    <p className="text-gray-500">{property.address}, {property.city}</p>
                  </CardHeader>
                  
                  <CardContent className="pb-0">
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-400 mr-1">bed</span>
                          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-400 mr-1">bathroom</span>
                          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</span>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-400 mr-1">straighten</span>
                          <span>{property.area}m²</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2">
                      {property.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <div className="rounded-full overflow-hidden w-64 h-64 mx-auto border-4 shadow-lg" style={{ borderColor: primaryColor }}>
                <img 
                  src={agent?.profilePicture || "https://via.placeholder.com/400x400?text=Foto+Perfil"} 
                  alt={agent?.fullName} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>
                Sobre {agent?.fullName}
              </h2>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="outline" className="px-3 py-1">CRECI {agent?.creci || "000000"}</Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {agent?.propertiesSold || 0} Imóveis Vendidos
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {agent?.yearsExperience || 0} Anos de Experiência
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-6">
                {agent?.bio || `Olá, sou ${agent?.fullName}, um corretor de imóveis apaixonado por ajudar pessoas a encontrarem a casa dos seus sonhos. Com anos de experiência no mercado imobiliário, ofereço atendimento personalizado e dedicação total aos meus clientes. Meu objetivo é tornar o processo de compra, venda ou locação de imóveis o mais simples e tranquilo possível para você.`}
              </p>
              
              <div className="flex gap-4">
                <Button style={{ backgroundColor: primaryColor }}>
                  <span className="material-icons mr-2">phone</span>
                  Entrar em Contato
                </Button>
                
                <Button variant="outline">
                  <span className="material-icons mr-2">whatsapp</span>
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: primaryColor }}>
            O que Dizem Meus Clientes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center justify-center p-1 rounded-full" style={{ backgroundColor: `${primaryColor}30` }}>
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img 
                        src="https://via.placeholder.com/150?text=Cliente+1" 
                        alt="Depoimento 1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h4 className="font-semibold">Renata Oliveira</h4>
                  <p className="text-sm text-gray-500">Comprou um apartamento</p>
                </div>
                
                <p className="text-center text-gray-600 italic">
                  "Excelente profissional! Me ajudou a encontrar o apartamento perfeito para minha família. 
                  Atencioso, dedicado e transparente em todo o processo."
                </p>
                
                <div className="flex justify-center mt-4">
                  <div className="flex text-yellow-400">
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center justify-center p-1 rounded-full" style={{ backgroundColor: `${primaryColor}30` }}>
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img 
                        src="https://via.placeholder.com/150?text=Cliente+2" 
                        alt="Depoimento 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h4 className="font-semibold">Carlos Mendes</h4>
                  <p className="text-sm text-gray-500">Vendeu uma casa</p>
                </div>
                
                <p className="text-center text-gray-600 italic">
                  "Consegui vender minha casa por um valor acima do mercado e em tempo recorde! 
                  Recomendo a todos que buscam um corretor comprometido e eficiente."
                </p>
                
                <div className="flex justify-center mt-4">
                  <div className="flex text-yellow-400">
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star_half</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center justify-center p-1 rounded-full" style={{ backgroundColor: `${primaryColor}30` }}>
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img 
                        src="https://via.placeholder.com/150?text=Cliente+3" 
                        alt="Depoimento 3"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h4 className="font-semibold">Juliana Costa</h4>
                  <p className="text-sm text-gray-500">Alugou um imóvel comercial</p>
                </div>
                
                <p className="text-center text-gray-600 italic">
                  "Encontrou o ponto comercial perfeito para o meu negócio. Entendeu exatamente o que 
                  eu precisava e fez um ótimo trabalho na negociação do contrato."
                </p>
                
                <div className="flex justify-center mt-4">
                  <div className="flex text-yellow-400">
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                    <span className="material-icons">star</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: primaryColor }}>
            Entre em Contato
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Informações de Contato</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-icons text-gray-500">phone</span>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-gray-600">{agent?.phone || "(00) 0000-0000"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="material-icons text-gray-500">email</span>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">{agent?.email || "contato@exemplo.com"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="material-icons text-gray-500">place</span>
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-gray-600">{agent?.address || "Av. Exemplo, 123 - Centro"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Horário de Atendimento</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Segunda a Sexta: 9h às 18h</p>
                  <p>Sábados: 9h às 13h</p>
                  <p>Domingos e Feriados: Mediante agendamento</p>
                </div>
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Envie sua mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input placeholder="Seu nome completo" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone</label>
                        <Input placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input placeholder="seu@email.com" type="email" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assunto</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="">Selecione um assunto</option>
                        <option value="compra">Compra de imóvel</option>
                        <option value="venda">Venda de imóvel</option>
                        <option value="aluguel">Aluguel de imóvel</option>
                        <option value="avaliacao">Avaliação de imóvel</option>
                        <option value="outro">Outro assunto</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mensagem</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[120px]"
                        placeholder="Digite sua mensagem aqui..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <Button 
                        className="w-full"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Enviar Mensagem
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              {websiteConfig?.logo ? (
                <img src={websiteConfig.logo} alt="Logo" className="h-8" />
              ) : (
                <span className="material-icons text-white text-2xl">home</span>
              )}
              <h3 className="text-white text-lg font-bold">{websiteConfig?.title || `${agent?.fullName} Imóveis`}</h3>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#imoveis" className="text-gray-400 hover:text-white">Imóveis</a>
              <a href="#sobre" className="text-gray-400 hover:text-white">Sobre</a>
              <a href="#contato" className="text-gray-400 hover:text-white">Contato</a>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-white hover:text-gray-300">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <span className="material-icons">instagram</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <span className="material-icons">whatsapp</span>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <span className="material-icons">youtube_searched_for</span>
              </a>
            </div>
          </div>
          
          <Separator className="my-6 bg-gray-700" />
          
          <div className="text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} {agent?.fullName} - Todos os direitos reservados.</p>
            <p className="mt-1">CRECI {agent?.creci || "000000"}</p>
            <p className="mt-2">
              Este site foi desenvolvido com <span className="text-red-500">♥</span> por ImobCloud
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgentWebsite;