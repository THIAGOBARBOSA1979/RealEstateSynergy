import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Home, 
  Plus, 
  Search,
  Check,
  Clock,
  Calendar,
  Users,
  Tag
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Property, Development } from "@shared/schema";

export default function CatalogPage() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch properties data
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Fetch developments data
  const { data: developmentsData, isLoading: developmentsLoading } = useQuery({
    queryKey: ['/api/developments'],
  });

  const properties = propertiesData?.properties || [];
  const developments = developmentsData || [];

  // Filter properties based on search and filters
  const filteredProperties = properties?.filter((property: Property) => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || property.propertyType === typeFilter;
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter developments based on search
  const filteredDevelopments = developments?.filter((development: Development) => {
    const matchesSearch = 
      development.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      development.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      development.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "apartment" && ["condominio_vertical", "apartamentos"].includes(development.developmentType)) ||
      (typeFilter === "house" && ["condominio_horizontal", "casas"].includes(development.developmentType)) ||
      (typeFilter === "land" && development.developmentType === "loteamento");
    
    return matchesSearch && matchesType;
  });

  const isLoading = propertiesLoading || developmentsLoading;

  // Get counts for card badges
  const developmentsCount = developments?.length || 0;
  const propertiesCount = properties?.length || 0;

  // Get stats for sales and rentals
  const salesCount = properties?.filter((p: Property) => !p.title.toLowerCase().includes("aluguel")).length || 0;
  const rentalsCount = properties?.filter((p: Property) => p.title.toLowerCase().includes("aluguel")).length || 0;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center">
            <Home className="mr-2 h-6 w-6 text-primary" />
            Catálogo Imobiliário
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos seus imóveis e empreendimentos em um só lugar
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => setLocation("/add-property")}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Imóvel</span>
          </Button>
          <Button 
            className="flex items-center gap-1"
            onClick={() => setLocation("/add-development")}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Empreendimento</span>
          </Button>
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total de Empreendimentos</p>
                <p className="text-2xl font-bold">{developmentsCount}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total de Imóveis</p>
                <p className="text-2xl font-bold">{propertiesCount}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Home className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">À Venda</p>
                <p className="text-2xl font-bold">{salesCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Tag className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Para Aluguel</p>
                <p className="text-2xl font-bold">{rentalsCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, endereço, cidade..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo de Imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
              <SelectItem value="land">Terreno</SelectItem>
              <SelectItem value="rural">Rural</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabs for switching between views */}
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="developments">Empreendimentos</TabsTrigger>
          <TabsTrigger value="properties">Imóveis Avulsos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {/* Developments Section */}
          {(activeTab === "all" && filteredDevelopments?.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-primary" />
                Empreendimentos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDevelopments.map((development: Development) => (
                  <DevelopmentCard key={development.id} development={development} />
                ))}
              </div>
            </div>
          )}
          
          {/* Properties Section */}
          {(activeTab === "all" && filteredProperties?.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center">
                <Home className="mr-2 h-5 w-5 text-primary" />
                Imóveis Avulsos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property: Property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {(activeTab === "all" && filteredDevelopments?.length === 0 && filteredProperties?.length === 0) && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum imóvel ou empreendimento encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Tente ajustar seus filtros ou adicione novos imóveis ao catálogo
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => setLocation("/add-property")}
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Imóvel</span>
                </Button>
                <Button 
                  className="flex items-center gap-1"
                  onClick={() => setLocation("/add-development")}
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Empreendimento</span>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="developments" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Carregando empreendimentos...</p>
            </div>
          ) : filteredDevelopments?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevelopments.map((development: Development) => (
                <DevelopmentCard key={development.id} development={development} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum empreendimento encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Tente ajustar seus filtros ou adicione um novo empreendimento
              </p>
              <Button 
                className="flex items-center gap-1"
                onClick={() => setLocation("/add-development")}
              >
                <Plus className="h-4 w-4" />
                <span>Novo Empreendimento</span>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="properties" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Carregando imóveis...</p>
            </div>
          ) : filteredProperties?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((property: Property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Home className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Tente ajustar seus filtros ou adicione um novo imóvel
              </p>
              <Button 
                className="flex items-center gap-1"
                onClick={() => setLocation("/add-property")}
              >
                <Plus className="h-4 w-4" />
                <span>Novo Imóvel</span>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Development Card Component
function DevelopmentCard({ development }: { development: Development }) {
  const [location, setLocation] = useLocation();
  
  // Parse the JSON strings
  const salesStatus = typeof development.salesStatus === 'string' 
    ? JSON.parse(development.salesStatus) 
    : development.salesStatus || { available: 0, reserved: 0, sold: 0 };
  
  const priceRange = typeof development.priceRange === 'string'
    ? JSON.parse(development.priceRange)
    : development.priceRange || { min: 0, max: 0 };
  
  // Calculate progress percentage
  const totalUnits = development.totalUnits || 0;
  const soldUnits = salesStatus.sold || 0;
  const progressPercentage = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;
  
  // Format construction status label
  const getConstructionStatusLabel = (status: string): string => {
    switch (status) {
      case 'planta': return 'Na Planta';
      case 'em_construcao': return 'Em Construção';
      case 'pronto': return 'Pronto para Morar';
      default: return status;
    }
  };
  
  // Format development type label
  const getDevelopmentTypeLabel = (type: string): string => {
    switch (type) {
      case 'condominio_vertical': return 'Condomínio Vertical';
      case 'condominio_horizontal': return 'Condomínio Horizontal';
      case 'loteamento': return 'Loteamento';
      case 'apartamentos': return 'Edifício';
      case 'casas': return 'Casas';
      default: return type;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 bg-gray-100">
        {development.mainImage ? (
          <img 
            src={development.mainImage} 
            alt={development.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
            {getDevelopmentTypeLabel(development.developmentType)}
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <div className="bg-white text-primary text-xs px-2 py-1 rounded-full">
            {getConstructionStatusLabel(development.constructionStatus)}
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{development.name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {development.address}, {development.city}/{development.state}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Preço:</span>{' '}
            <span className="font-medium">
              {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Unidades:</span>{' '}
            <span className="font-medium">{development.totalUnits}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Vendas ({Math.round(progressPercentage)}%)</span>
            <span>{soldUnits}/{totalUnits} unidades</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation(`/developments/${development.id}`)}
        >
          Ver Detalhes
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation(`/development-detail/${development.id}`)}
        >
          Gerenciar
        </Button>
      </CardFooter>
    </Card>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: Property }) {
  const [location, setLocation] = useLocation();
  
  // Get status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'reserved': return 'bg-amber-100 text-amber-600';
      case 'sold': return 'bg-red-100 text-red-600';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  // Format property type label
  const getPropertyTypeLabel = (type: string): string => {
    switch (type) {
      case 'apartment': return 'Apartamento';
      case 'house': return 'Casa';
      case 'commercial': return 'Comercial';
      case 'land': return 'Terreno';
      case 'rural': return 'Rural';
      default: return type;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 bg-gray-100">
        {property.images && property.images.length > 0 ? (
          <img 
            src={Array.isArray(property.images) ? property.images[0] : property.images}
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
            {getPropertyTypeLabel(property.propertyType)}
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <div className={`${getStatusBadgeClass(property.status)} text-xs px-2 py-1 rounded-full`}>
            {property.status === 'active' ? 'Ativo' : 
             property.status === 'reserved' ? 'Reservado' : 
             property.status === 'sold' ? 'Vendido' : 'Inativo'}
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{property.title}</CardTitle>
        <CardDescription className="line-clamp-1">
          {property.address}, {property.city}/{property.state}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium">
            {formatCurrency(Number(property.price))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <span className="text-xs">🛁</span>
                {property.bathrooms}
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1">
                <span className="text-xs">📏</span>
                {property.area}m²
              </span>
            )}
          </div>
        </div>
        
        {property.published ? (
          <div className="flex items-center text-xs text-green-600">
            <Check className="h-3 w-3 mr-1" />
            <span>Publicado</span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            <span>Não publicado</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation(`/property-detail/${property.id}`)}
        >
          Ver Detalhes
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation(`/edit-property/${property.id}`)}
        >
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}