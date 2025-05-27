import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, MapPin, BedDouble, Bath, Square, Calendar, Eye, Edit, Trash2, Building2, Home } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Property, Development } from "@shared/schema";

export default function UnifiedCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [typeFilter, setTypeFilter] = useState("all_types");
  const [activeTab, setActiveTab] = useState("overview");

  // Buscar propriedades
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Buscar empreendimentos
  const { data: developments, isLoading: developmentsLoading } = useQuery({
    queryKey: ["/api/developments"],
  });

  const isLoading = propertiesLoading || developmentsLoading;

  // Filtrar propriedades
  const filteredProperties = properties?.properties?.filter((property: Property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all_statuses" || property.status === statusFilter;
    const matchesType = typeFilter === "all_types" || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Filtrar empreendimentos
  const filteredDevelopments = developments?.filter((development: Development) => {
    const matchesSearch = development.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         development.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all_statuses" || development.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Estatísticas consolidadas
  const totalProperties = filteredProperties.length;
  const totalDevelopments = filteredDevelopments.length;
  const totalItems = totalProperties + totalDevelopments;
  
  const activeProperties = filteredProperties.filter((p: Property) => p.status === "disponivel").length;
  const soldProperties = filteredProperties.filter((p: Property) => p.status === "vendido").length;
  const activeDevelopments = filteredDevelopments.filter((d: Development) => d.status === "ativo").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Catálogo Imobiliário</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo Imobiliário</h1>
          <p className="text-gray-600 mt-1">Gestão unificada de imóveis e empreendimentos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/add-property">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Imóvel
            </Button>
          </Link>
          <Link href="/add-development">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Empreendimento
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {totalProperties} imóveis + {totalDevelopments} empreendimentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Disponíveis</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProperties}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para venda/locação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Vendidos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{soldProperties}</div>
            <p className="text-xs text-muted-foreground">
              Vendidos este período
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empreendimentos Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{activeDevelopments}</div>
            <p className="text-xs text-muted-foreground">
              Em desenvolvimento/vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por título, descrição ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">Todos os Status</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="alugado">Alugado</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">Todos os Tipos</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="misto">Misto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo com Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="properties">Imóveis ({filteredProperties.length})</TabsTrigger>
          <TabsTrigger value="developments">Empreendimentos ({filteredDevelopments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imóveis Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Imóveis Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredProperties.slice(0, 3).map((property: Property) => (
                  <div key={property.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{property.title}</h4>
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(property.price)}</p>
                      <Badge variant={property.status === "disponivel" ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/catalog?tab=properties">
                  <Button variant="outline" className="w-full">Ver Todos os Imóveis</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Empreendimentos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Empreendimentos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredDevelopments.slice(0, 3).map((development: Development) => (
                  <div key={development.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{development.name}</h4>
                      <p className="text-sm text-gray-600">{development.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{development.totalUnits} unidades</p>
                      <Badge variant={development.status === "ativo" ? "default" : "secondary"}>
                        {development.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/catalog?tab=developments">
                  <Button variant="outline" className="w-full">Ver Todos os Empreendimentos</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou adicione novos imóveis.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="developments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevelopments.map((development: Development) => (
              <DevelopmentCard key={development.id} development={development} />
            ))}
          </div>
          {filteredDevelopments.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum empreendimento encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou adicione novos empreendimentos.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <Home className="w-12 h-12 text-blue-600" />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <Badge variant={property.status === "disponivel" ? "default" : "secondary"}>
            {property.status}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm flex items-center mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {property.location}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center">
            <BedDouble className="w-4 h-4 mr-1" />
            {property.bedrooms}
          </span>
          <span className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {property.bathrooms}
          </span>
          <span className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            {property.area}m²
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(property.price)}
          </span>
          
          <div className="flex gap-1">
            <Link href={`/properties/${property.id}`}>
              <Button size="sm" variant="ghost">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/edit-property/${property.id}`}>
              <Button size="sm" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DevelopmentCard({ development }: { development: Development }) {
  const calculateProgress = (development: Development): number => {
    if (!development.totalUnits || development.totalUnits === 0) return 0;
    const soldUnits = development.soldUnits || 0;
    return Math.round((soldUnits / development.totalUnits) * 100);
  };

  const progress = calculateProgress(development);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
        <Building2 className="w-12 h-12 text-purple-600" />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{development.name}</h3>
          <Badge variant={development.status === "ativo" ? "default" : "secondary"}>
            {development.status}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm flex items-center mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {development.location}
        </p>
        
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span>Progresso de Vendas</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {development.soldUnits || 0} de {development.totalUnits} unidades vendidas
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">A partir de</p>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(development.minPrice || 0)}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Link href={`/developments/${development.id}`}>
              <Button size="sm" variant="ghost">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/edit-development/${development.id}`}>
              <Button size="sm" variant="ghost">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}