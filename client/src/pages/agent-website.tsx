import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  AreaChart,
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
  Menu,
  Award,
  Users,
  Clock,
  Shield,
  MessageCircle,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2
} from "lucide-react";

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  images?: string[];
  featured?: boolean;
}

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  photo?: string;
  specialties: string[];
  experience: number;
  salesCount: number;
  rating: number;
  license: string;
}

const AgentWebsite = () => {
  const { agentId } = useParams();
  const isMobile = useMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedTab, setSelectedTab] = useState("properties");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock data para demonstração - em produção seria carregado da API
  const agent: Agent = {
    id: parseInt(agentId || "1"),
    name: "Marina Silva",
    email: "marina@corretora.com",
    phone: "(11) 99999-9999",
    bio: "Especialista em imóveis de alto padrão com mais de 10 anos de experiência no mercado imobiliário. Comprometida em encontrar o imóvel perfeito para cada cliente.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    specialties: ["Imóveis de Luxo", "Apartamentos", "Casas", "Investimento"],
    experience: 10,
    salesCount: 150,
    rating: 4.9,
    license: "CRECI 12345-SP"
  };

  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
    select: (data: any) => data?.properties || []
  });

  const { data: website } = useQuery({
    queryKey: ['/api/users/me/website']
  });

  const themeColor = website?.theme?.primaryColor || "#1a237e";

  const filteredProperties = properties?.filter((property: Property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = propertyType === "all" || property.propertyType === propertyType;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = property.price;
      switch (priceRange) {
        case "0-300000":
          matchesPrice = price <= 300000;
          break;
        case "300000-500000":
          matchesPrice = price > 300000 && price <= 500000;
          break;
        case "500000-1000000":
          matchesPrice = price > 500000 && price <= 1000000;
          break;
        case "1000000+":
          matchesPrice = price > 1000000;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesPrice;
  }) || [];

  const featuredProperties = filteredProperties.filter((p: Property) => p.featured);
  const regularProperties = filteredProperties.filter((p: Property) => !p.featured);

  const NavigationMenu = () => (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-sm text-gray-600">Corretora de Imóveis</p>
            </div>
          </div>

          {!isMobile && (
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setSelectedTab("properties")}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  selectedTab === "properties" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Imóveis
              </button>
              <button 
                onClick={() => setSelectedTab("about")}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  selectedTab === "about" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Sobre Mim
              </button>
              <button 
                onClick={() => setSelectedTab("contact")}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  selectedTab === "contact" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Contato
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              {isMobile ? "Ligar" : "Entrar em Contato"}
            </Button>
            
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {isMobile && isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => { setSelectedTab("properties"); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-blue-600 py-2"
              >
                Imóveis
              </button>
              <button 
                onClick={() => { setSelectedTab("about"); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-blue-600 py-2"
              >
                Sobre Mim
              </button>
              <button 
                onClick={() => { setSelectedTab("contact"); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-blue-600 py-2"
              >
                Contato
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const HeroSection = () => (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6">
            <Avatar className="h-24 w-24 mx-auto border-4 border-white/20">
              <AvatarImage src={agent.photo} alt={agent.name} />
              <AvatarFallback className="text-2xl bg-white/10 text-white">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {agent.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto">
            {agent.bio}
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">{agent.experience} anos de experiência</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <Users className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">{agent.salesCount}+ vendas realizadas</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{agent.rating}/5.0 avaliação</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-900 hover:bg-gray-50 px-8 py-3"
              onClick={() => setSelectedTab("contact")}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Falar Comigo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3"
              onClick={() => setSelectedTab("properties")}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Ver Imóveis
            </Button>
          </div>
        </div>
      </div>
    </section>
  );

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <Home className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {property.featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destaque
            </Badge>
          )}
          
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="rounded-full p-2">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-3">
          <Badge variant="outline" className="mb-2">
            {getPropertyTypeLabel(property.propertyType)}
          </Badge>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.address}, {property.city}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(property.price)}
          </div>
          <Badge 
            variant={property.status === 'available' ? 'default' : 'secondary'}
            className={property.status === 'available' ? 'bg-green-100 text-green-800' : ''}
          >
            {getPropertyStatusLabel(property.status)}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center">
                <AreaChart className="h-4 w-4 mr-1" />
                <span>{property.area}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );

  const PropertiesSection = () => (
    <div className="space-y-8">
      {/* Filtros */}
      <Card className="p-6 border-0 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por localização ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500"
            />
          </div>
          
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="border-gray-200 focus:border-blue-500">
              <SelectValue placeholder="Tipo de Imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="land">Terreno</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="border-gray-200 focus:border-blue-500">
              <SelectValue placeholder="Faixa de Preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Faixas</SelectItem>
              <SelectItem value="0-300000">Até R$ 300.000</SelectItem>
              <SelectItem value="300000-500000">R$ 300.000 - R$ 500.000</SelectItem>
              <SelectItem value="500000-1000000">R$ 500.000 - R$ 1.000.000</SelectItem>
              <SelectItem value="1000000+">Acima de R$ 1.000.000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Imóveis em Destaque */}
      {featuredProperties.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-yellow-500 mr-2 fill-current" />
            <h2 className="text-2xl font-bold text-gray-900">Imóveis em Destaque</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* Todos os Imóveis */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Todos os Imóveis ({filteredProperties.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  );

  const AboutSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-0 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre Mim</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {agent.bio} Minha missão é proporcionar uma experiência excepcional na compra, venda ou locação de imóveis, sempre priorizando a transparência e a confiança.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">Licença: {agent.license}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">{agent.experience} anos de experiência</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">{agent.salesCount}+ transações realizadas</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-0 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Especialidades</h3>
          <div className="grid grid-cols-2 gap-3">
            {agent.specialties.map((specialty, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 text-sm">{specialty}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const ContactSection = () => (
    <div className="space-y-8">
      <Card className="p-8 border-0 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Entre em Contato</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Telefone</p>
                <p className="text-gray-600">{agent.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">{agent.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Siga-me nas redes sociais</h3>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="p-2">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <HeroSection />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedTab === "properties" && <PropertiesSection />}
        {selectedTab === "about" && <AboutSection />}
        {selectedTab === "contact" && <ContactSection />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Avatar className="h-16 w-16 mx-auto mb-4">
              <AvatarImage src={agent.photo} alt={agent.name} />
              <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{agent.name}</h3>
            <p className="text-gray-400">{agent.license}</p>
          </div>
          
          <p className="text-gray-400 text-sm">
            © 2024 {agent.name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AgentWebsite;