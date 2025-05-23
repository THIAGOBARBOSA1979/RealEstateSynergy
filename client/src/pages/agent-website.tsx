import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@/types";
import { formatCurrency, getPropertyTypeLabel, getPropertyStatusLabel } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import { 
  Search, 
  MapPin, 
  Home, 
  Star, 
  BedDouble, 
  Bath, 
  AreaChart, // Substituindo SquareMeters por AreaChart
  Bookmark, 
  ChevronRight, 
  Phone, 
  Mail, 
  Instagram,
  Facebook,
  Linkedin,
  Twitter, 
  Check,
  Filter,
  Bed,
  Heart,
  Eye,
  AlertTriangle,
  Menu
} from "lucide-react";

const AgentWebsite = () => {
  const { agentId } = useParams();
  const isMobile = useMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  
  // Fetch agent data
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: [`/api/agents/${agentId}`],
  });
  
  // Fetch agent's properties
  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: [`/api/agents/${agentId}/properties`],
  });
  
  // Fetch agent's website configuration
  const { data: website, isLoading: isLoadingWebsite } = useQuery({
    queryKey: [`/api/agents/${agentId}/website`],
  });
  
  // Track page view for analytics
  useEffect(() => {
    // Get UTM parameters if present
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    // Record page view in analytics
    if (typeof window !== 'undefined') {
      // Facebook Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'PageView', {
          agent_id: agentId,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign
        });
      }
      
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_title: agent?.fullName ? `Imóveis de ${agent.fullName}` : 'Página do Corretor',
          agent_id: agentId,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign
        });
      }
    }
  }, [agentId, agent]);
  
  // Filter properties based on user criteria
  const filteredProperties = properties?.filter((property: Property) => {
    // Search term filter
    if (searchTerm && !property.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !property.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !property.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !property.city.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Property type filter
    if (propertyType !== "all" && property.propertyType !== propertyType) {
      return false;
    }
    
    // Price range filter
    if (priceRange !== "all") {
      const price = property.price;
      if (priceRange === "0-500000" && (price < 0 || price > 500000)) {
        return false;
      } else if (priceRange === "500000-1000000" && (price < 500000 || price > 1000000)) {
        return false;
      } else if (priceRange === "1000000-2000000" && (price < 1000000 || price > 2000000)) {
        return false;
      } else if (priceRange === "2000000+" && price < 2000000) {
        return false;
      }
    }
    
    // Bedrooms filter
    if (bedrooms !== "all") {
      const beds = property.bedrooms || 0;
      if (bedrooms === "1" && beds !== 1) {
        return false;
      } else if (bedrooms === "2" && beds !== 2) {
        return false;
      } else if (bedrooms === "3" && beds !== 3) {
      return false;
      } else if (bedrooms === "4+" && beds < 4) {
        return false;
      }
    }
    
    return true;
  });
  
  // Group properties by city for featured sections
  const propertiesByCity = Array.isArray(filteredProperties) 
    ? filteredProperties.reduce((acc: { [key: string]: Property[] }, property: Property) => {
        const city = property.city;
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(property);
        return acc;
      }, {})
    : {};
  
  // Get list of cities with properties
  const citiesWithProperties = Object.keys(propertiesByCity).sort();
  
  // Featured neighborhoods for the UI
  const featuredNeighborhoods = [
    { name: "Jardins", image: "https://via.placeholder.com/300x200?text=Jardins", count: 12 },
    { name: "Vila Nova Conceição", image: "https://via.placeholder.com/300x200?text=Vila+Nova", count: 8 },
    { name: "Itaim Bibi", image: "https://via.placeholder.com/300x200?text=Itaim+Bibi", count: 15 },
    { name: "Pinheiros", image: "https://via.placeholder.com/300x200?text=Pinheiros", count: 10 }
  ];
  
  // Helper to get agent initials for avatar
  const getAgentInitials = (fullName: string = "Corretor") => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Loading state
  if (isLoadingAgent || isLoadingProperties) {
    return (
      <div className="w-full min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-10">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-80 mx-auto" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-80 w-full rounded-lg" />
                <Skeleton className="h-80 w-full rounded-lg" />
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Error state
  if (!agent) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center space-y-6 max-w-md">
          <div className="rounded-full bg-red-100 p-4 mx-auto w-fit">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Corretor não encontrado</h1>
          <p className="text-gray-600">
            Não foi possível encontrar o corretor solicitado. Por favor, verifique o URL ou entre em contato com o suporte.
          </p>
          
          <Button asChild>
            <Link href="/">Voltar à página inicial</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Custom theme colors from website settings, if available
  const themeColor = website?.theme?.primaryColor || "#2563eb";
  const accentColor = website?.theme?.accentColor || "#f97316";
  
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {website?.logo ? (
                <img 
                  src={website.logo} 
                  alt={`${agent.fullName} Logo`} 
                  className="h-10"
                />
              ) : (
                <h1 className="text-xl font-bold" style={{ color: themeColor }}>
                  {website?.title || "SPERINDE"}
                </h1>
              )}
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#imoveis">
                <a className="text-gray-600 hover:text-gray-900 font-medium">Imóveis</a>
              </Link>
              <Link href="#destaques">
                <a className="text-gray-600 hover:text-gray-900 font-medium">Destaques</a>
              </Link>
              <Link href="#bairros">
                <a className="text-gray-600 hover:text-gray-900 font-medium">Bairros</a>
              </Link>
              <Link href="#contato">
                <a className="text-gray-600 hover:text-gray-900 font-medium">Contato</a>
              </Link>
              <Button
                style={{ 
                  backgroundColor: themeColor,
                  borderColor: themeColor
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Ligar agora
              </Button>
            </nav>
            
            <Button 
              variant="outline"
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: themeColor }}>
                A gente cuida do seu lugar.
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Encontre o imóvel perfeito para você. Casas, apartamentos e muito mais.
              </p>
              
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    value={propertyType}
                    onValueChange={setPropertyType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={bedrooms}
                    onValueChange={setBedrooms}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Quartos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Quartos</SelectItem>
                      <SelectItem value="1">1 Quarto</SelectItem>
                      <SelectItem value="2">2 Quartos</SelectItem>
                      <SelectItem value="3">3 Quartos</SelectItem>
                      <SelectItem value="4+">4+ Quartos</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={priceRange}
                    onValueChange={setPriceRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Preço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer preço</SelectItem>
                      <SelectItem value="0-500000">Até R$ 500.000</SelectItem>
                      <SelectItem value="500000-1000000">R$ 500.000 - R$ 1.000.000</SelectItem>
                      <SelectItem value="1000000-2000000">R$ 1.000.000 - R$ 2.000.000</SelectItem>
                      <SelectItem value="2000000+">Acima de R$ 2.000.000</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    style={{ 
                      backgroundColor: themeColor,
                      borderColor: themeColor,
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Properties by City */}
        {citiesWithProperties.map((city, cityIndex) => (
          <section key={city} id="destaques" className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Destaques em {city}</h2>
                <div className="flex items-center">
                  <div className="hidden md:flex">
                    <Button variant="outline" size="sm" className="mr-2">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                  <Link href={`/properties?city=${encodeURIComponent(city)}`}>
                    <Button variant="link" size="sm">
                      Ver todos
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Tabs defaultValue="residencial" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="residencial">Residencial</TabsTrigger>
                  <TabsTrigger value="comercial">Comercial</TabsTrigger>
                </TabsList>
                
                <TabsContent value="residencial">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {propertiesByCity[city]
                      ?.filter(property => property.propertyType !== 'commercial')
                      .slice(0, 4)
                      .map((property: Property) => (
                        <PropertyCard key={property.id} property={property} themeColor={themeColor} />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="comercial">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {propertiesByCity[city]
                      ?.filter(property => property.propertyType === 'commercial')
                      .slice(0, 4)
                      .map((property: Property) => (
                        <PropertyCard key={property.id} property={property} themeColor={themeColor} />
                      ))}
                      
                    {propertiesByCity[city]?.filter(property => property.propertyType === 'commercial').length === 0 && (
                      <div className="col-span-4 text-center py-12">
                        <p className="text-gray-500">Nenhum imóvel comercial disponível em {city}.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        ))}
        
        {/* Featured Neighborhoods */}
        <section id="bairros" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Bairros em Destaque</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredNeighborhoods.map((neighborhood, index) => (
                <div 
                  key={index} 
                  className="relative rounded-lg overflow-hidden h-48 group"
                >
                  <img 
                    src={neighborhood.image} 
                    alt={neighborhood.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="text-white font-semibold text-lg">{neighborhood.name}</h3>
                    <p className="text-white/80 text-sm">{neighborhood.count} imóveis</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Other neighborhoods list */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4">Outros bairros em Destaque</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 15 }, (_, i) => (
                  <Link key={i} href={`/properties?neighborhood=${encodeURIComponent(`Bairro ${i + 1}`)}`}>
                    <a className="text-sm text-gray-600 hover:text-primary hover:underline">
                      Bairro {i + 1} em Campo Largo (12)
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Banner */}
        <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700" style={{ 
          background: `linear-gradient(to right, ${themeColor}, ${accentColor || themeColor})`
        }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:w-2/3">
                <h2 className="text-white text-3xl font-bold mb-2">
                  Anuncie seu imóvel com quem cuida do seu lugar.
                </h2>
                <p className="text-white/80">
                  Fale conosco e conheça nossas soluções para venda e locação de imóveis.
                </p>
              </div>
              
              <Button 
                variant="secondary" 
                size="lg"
                className="w-full md:w-auto"
              >
                CADASTRAR MEU IMÓVEL
              </Button>
            </div>
          </div>
        </section>
        
        {/* Agent Profile */}
        <section id="contato" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0">
                  <Avatar className="w-40 h-40">
                    <AvatarImage src={agent.profilePicture} alt={agent.fullName} />
                    <AvatarFallback className="text-4xl">{getAgentInitials(agent.fullName)}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">{agent.fullName}</h2>
                  
                  <p className="text-gray-600 mb-4">
                    {agent.creci && <span className="block md:inline mr-2">CRECI: {agent.creci}</span>}
                    {agent.phone && <span className="block md:inline">{agent.phone}</span>}
                  </p>
                  
                  <div className="mb-6">
                    <p className="text-gray-700">
                      {agent.bio || `Especialista em imóveis residenciais e comerciais com mais de ${agent.yearsExperience || 5} anos de experiência no mercado imobiliário.`}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                    <div className="flex items-center">
                      <Check className="text-green-500 h-5 w-5 mr-2" />
                      <span className="text-sm">{agent.propertiesSold || 120}+ imóveis vendidos</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="text-green-500 h-5 w-5 mr-2" />
                      <span className="text-sm">{filteredProperties?.length || 0} imóveis ativos</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="text-green-500 h-5 w-5 mr-2" />
                      <span className="text-sm">Avaliação gratuita</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <Button style={{ backgroundColor: themeColor }}>
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                        <Instagram className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SPERINDE</h3>
              <p className="text-gray-400 text-sm mb-4">
                A gente cuida do seu lugar. Especialistas em imóveis de alto padrão.
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Imóveis</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {agent.phone || "(41) 99999-9999"}
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {agent.email || "contato@sperinde.com.br"}
                </li>
                <li className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <span>Av. República Argentina, 50<br />
                  Água Verde, Curitiba - PR</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Receba novidades e lançamentos em primeira mão.
              </p>
              <div className="flex">
                <Input 
                  placeholder="Seu e-mail" 
                  className="rounded-r-none bg-gray-800 border-gray-700 text-white" 
                />
                <Button className="rounded-l-none" style={{ backgroundColor: themeColor }}>
                  Enviar
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="bg-gray-800 mb-6" />
          
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 Sperinde Imobiliária. Todos os direitos reservados. CRECI J-123456</p>
          </div>
        </div>
      </footer>
      
      {/* Tracking Pixels (Non-visible) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {/* Facebook Pixel Code */}
        <img 
          height="1" 
          width="1" 
          src={`https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1&cd[agent_id]=${agentId}`} 
          alt="" 
        />
        
        {/* Google Analytics Pixel */}
        <img 
          height="1" 
          width="1" 
          src="https://www.google-analytics.com/collect?v=1&tid=UA-XXXXXXXX-X" 
          alt="" 
        />
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard = ({ property, themeColor }: { property: Property, themeColor: string }) => {
  return (
    <Card className="overflow-hidden group">
      <div className="relative h-48">
        <Link href={`/imovel/${property.id}`}>
          <div className="cursor-pointer h-full">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Home className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
        </Link>
        
        <div className="absolute top-2 left-2">
          <Badge className="bg-white text-gray-800 shadow">{property.propertyType === 'commercial' ? 'Comercial' : 'Residencial'}</Badge>
        </div>
        
        {property.status === 'sold' && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-orange-500 text-white">Vendido</Badge>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full h-8 w-8 shadow"
        >
          <Heart className="h-4 w-4" />
        </Button>
        
        {property.featured && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-yellow-500 text-white">Destaque</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge 
            className="text-xs font-normal" 
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            {getPropertyTypeLabel(property.propertyType)}
          </Badge>
        </div>
        
        <Link href={`/imovel/${property.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-primary cursor-pointer">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{property.address}, {property.city}</span>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
          {property.area > 0 && (
            <div className="flex items-center">
              <AreaChart className="h-3 w-3 mr-1" />
              <span>{property.area} m²</span>
            </div>
          )}
          
          {property.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
            </div>
          )}
          
          {property.bathrooms > 0 && (
            <div className="flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'banho' : 'banhos'}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: themeColor }}>
            {formatCurrency(property.price)}
          </span>
          
          <div className="flex items-center text-gray-500 text-xs">
            <Eye className="h-3 w-3 mr-1" />
            <span>{Math.floor(Math.random() * 1000) + 50}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="w-full"
        >
          <Link href={`/imovel/${property.id}`}>
            Ver Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentWebsite;