import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PropertyTable from "@/components/dashboard/property-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Heart, 
  LayoutGrid, 
  LayoutList,
  ArrowUpDown,
  X,
  Star,
  MapPin,
  Tag,
  Home as HomeIcon,
  MoreVertical,
  Trash2,
  ExternalLink
} from "lucide-react";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [status, setStatus] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [bedrooms, setBedrooms] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFeatured, setShowFeatured] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Atualizar filtros ativos quando os valores mudarem
  useEffect(() => {
    const newActiveFilters = [];
    
    if (propertyType !== "all") {
      newActiveFilters.push(`Tipo: ${getPropertyTypeLabel(propertyType)}`);
    }
    
    if (status !== "all") {
      newActiveFilters.push(`Status: ${status}`);
    }
    
    if (bedrooms !== "all") {
      newActiveFilters.push(`Quartos: ${bedrooms}`);
    }
    
    if (priceRange.min || priceRange.max) {
      const priceFilter = `Preço: ${priceRange.min ? `R$${priceRange.min}` : "0"} - ${priceRange.max ? `R$${priceRange.max}` : "∞"}`;
      newActiveFilters.push(priceFilter);
    }
    
    if (showFeatured) {
      newActiveFilters.push("Somente Destacados");
    }
    
    setActiveFilters(newActiveFilters);
  }, [propertyType, status, bedrooms, priceRange, showFeatured]);

  // Função auxiliar para formatar rótulos
  function getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      apartment: "Apartamento",
      house: "Casa",
      commercial: "Comercial", 
      land: "Terreno",
      all: "Todos"
    };
    return labels[type] || type;
  }

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setPropertyType("all");
    setStatus("all");
    setBedrooms("all");
    setPriceRange({ min: "", max: "" });
    setShowFeatured(false);
    setSortOrder("newest");
  };

  // Remover um filtro específico
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Tipo:")) {
      setPropertyType("all");
    } else if (filter.startsWith("Status:")) {
      setStatus("all");
    } else if (filter.startsWith("Quartos:")) {
      setBedrooms("all");
    } else if (filter.startsWith("Preço:")) {
      setPriceRange({ min: "", max: "" });
    } else if (filter === "Somente Destacados") {
      setShowFeatured(false);
    }
  };
  
  // Handle property deletion
  const handleDeleteClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setIsDeleteDialogOpen(true);
  };
  
  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return apiRequest("DELETE", `/api/properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir imóvel",
        description: "Não foi possível excluir o imóvel. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Fetch properties data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/properties', {
      search: searchTerm,
      propertyType,
      status,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      bedrooms: bedrooms !== 'all' ? bedrooms : undefined,
      featured: showFeatured ? 'true' : undefined
    }]
  });

  // Process and filter properties
  const filteredProperties: any[] = data && typeof data === 'object' && data !== null && 'properties' in data 
    ? (data.properties as any[]) 
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <HomeIcon className="h-6 w-6 mr-2" /> Meus Imóveis
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas propriedades, veja estatísticas e atualize informações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros {showAdvancedFilters ? 'Simples' : 'Avançados'}
          </Button>
          <Button onClick={() => navigate("/add-property")} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Imóvel
          </Button>
        </div>
      </div>

      {/* Barra de filtros e visualização */}
      <div className="flex items-center justify-between gap-4 flex-wrap mt-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar imóveis..."
              className="pl-9 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="mr-2"
          >
            {viewMode === "list" ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <LayoutList className="h-4 w-4" />
            )}
          </Button>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Ordenar
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="price_asc">Menor preço</SelectItem>
              <SelectItem value="price_desc">Maior preço</SelectItem>
              <SelectItem value="title_asc">Título (A-Z)</SelectItem>
              <SelectItem value="title_desc">Título (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Tipos" />
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
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabs para segmentar propriedades */}
      <Tabs defaultValue="all" className="mt-4">
        <TabsList className="w-full max-w-md grid grid-cols-4">
          <TabsTrigger value="all" onClick={() => setStatus("all")}>
            Todos os Imóveis
          </TabsTrigger>
          <TabsTrigger value="active" onClick={() => setStatus("active")}>
            Ativos
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-1" onClick={() => setShowFeatured(!showFeatured)}>
            <Star className="h-4 w-4" />
            Destacados
          </TabsTrigger>
          <TabsTrigger value="inactive" onClick={() => setStatus("inactive")}>
            Inativos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {/* Filtros básicos */}
          {!showAdvancedFilters ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar imóveis por título, endereço ou ID" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            // Filtros avançados
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Coluna 1: Filtros básicos */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Buscar imóveis" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="property-type" className="text-sm font-medium mb-1 block">Tipo de Imóvel</Label>
                      <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger id="property-type">
                          <SelectValue placeholder="Tipo de Imóvel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Tipos</SelectItem>
                          <SelectItem value="apartment">Apartamento</SelectItem>
                          <SelectItem value="house">Casa</SelectItem>
                          <SelectItem value="commercial">Comercial</SelectItem>
                          <SelectItem value="land">Terreno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium mb-1 block">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Status</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="reserved">Reservado</SelectItem>
                          <SelectItem value="sold">Vendido</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Coluna 2: Filtros de características */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bedrooms" className="text-sm font-medium mb-1 block">Quartos</Label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger id="bedrooms">
                          <SelectValue placeholder="Número de Quartos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="1">1 quarto</SelectItem>
                          <SelectItem value="2">2 quartos</SelectItem>
                          <SelectItem value="3">3 quartos</SelectItem>
                          <SelectItem value="4">4 quartos</SelectItem>
                          <SelectItem value="5+">5+ quartos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="min-price" className="text-sm font-medium mb-1 block">Preço Mínimo</Label>
                        <Input
                          id="min-price"
                          type="number"
                          placeholder="R$ Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-price" className="text-sm font-medium mb-1 block">Preço Máximo</Label>
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="R$ Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="featured" 
                        checked={showFeatured}
                        onCheckedChange={(checked) => setShowFeatured(checked === true)}
                      />
                      <Label htmlFor="featured" className="text-sm cursor-pointer">
                        Mostrar apenas imóveis destacados
                      </Label>
                    </div>
                  </div>
                  
                  {/* Coluna 3: Ordenação e exibição */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sort-order" className="text-sm font-medium mb-1 block">Ordenar por</Label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger id="sort-order">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Mais recentes</SelectItem>
                          <SelectItem value="oldest">Mais antigos</SelectItem>
                          <SelectItem value="price_asc">Menor preço</SelectItem>
                          <SelectItem value="price_desc">Maior preço</SelectItem>
                          <SelectItem value="title_asc">Título (A-Z)</SelectItem>
                          <SelectItem value="title_desc">Título (Z-A)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Visualização</Label>
                      <div className="flex border rounded-md overflow-hidden">
                        <Button
                          type="button"
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          className={`flex-1 rounded-none ${viewMode === 'list' ? '' : 'border-r'}`}
                          onClick={() => setViewMode('list')}
                        >
                          <LayoutList className="h-4 w-4 mr-2" />
                          Lista
                        </Button>
                        <Button
                          type="button"
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          className="flex-1 rounded-none"
                          onClick={() => setViewMode('grid')}
                        >
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          Grade
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={clearAllFilters}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Filtros ativos */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((filter, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {filter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => removeFilter(filter)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {activeFilters.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 text-muted-foreground"
                  onClick={clearAllFilters}
                >
                  Limpar todos
                </Button>
              )}
            </div>
          )}
          
          {viewMode === 'list' ? (
            /* Visualização em lista */
            <PropertyTable 
              searchTerm={searchTerm}
              propertyType={propertyType}
              status={status}
              priceRange={priceRange}
              bedrooms={bedrooms === "all" ? undefined : bedrooms}
              sortOrder={sortOrder}
              viewMode={viewMode}
              showFeatured={showFeatured}
            />
          ) : (
            /* Visualização em grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.isArray(filteredProperties) && filteredProperties.length > 0 ? (
                filteredProperties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-3 py-8 text-center">
                  <p className="text-muted-foreground">Nenhum imóvel encontrado com os filtros selecionados.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <PropertyTable 
            status="active"
            viewMode={viewMode}
          />
        </TabsContent>
        
        <TabsContent value="featured" className="mt-0">
          <PropertyTable 
            showFeatured={true}
            viewMode={viewMode}
          />
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-0">
          <PropertyTable 
            status="inactive"
            viewMode={viewMode}
            searchTerm=""
            propertyType="all"
            bedrooms={undefined}
            priceRange={{ min: "", max: "" }}
            sortOrder="newest"
            showFeatured={false}
          />
        </TabsContent>
      </Tabs>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Este imóvel será permanentemente excluído
              do sistema e todos os dados associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedPropertyId) {
                  deletePropertyMutation.mutate(selectedPropertyId);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletePropertyMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Componente de Propriedade para visualização em Grid
function PropertyCard({ property }: { property: any }) {
  const [, navigate] = useLocation();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-40 bg-cover bg-center relative"
        style={{ 
          backgroundImage: property.images && property.images.length > 0
            ? `url(${property.images[0]})`
            : 'none',
          backgroundColor: !property.images || property.images.length === 0 ? 'rgb(243, 244, 246)' : 'transparent'
        }}
      >
        {(!property.images || property.images.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <HomeIcon className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <Badge className="bg-orange-500 hover:bg-orange-600">
            {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
          </Badge>
          <Badge variant="outline" className="bg-white">
            {property.type === "apartment" ? "Apartamento" : 
             property.type === "house" ? "Casa" : 
             property.type === "commercial" ? "Comercial" : 
             property.type === "land" ? "Terreno" : property.type}
          </Badge>
        </div>
        {property.featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
            <Star className="h-3 w-3 mr-1" /> Destacado
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1" title={property.title}>
            {property.title}
          </h3>
          <Badge variant={property.status === 'active' ? 'default' : property.status === 'sold' ? 'destructive' : 'outline'}>
            {property.status === 'active' ? 'Ativo' : 
             property.status === 'sold' ? 'Vendido' : 
             property.status === 'reserved' ? 'Reservado' : 'Inativo'}
          </Badge>
        </div>
        
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="truncate">{property.address}</span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium text-lg">
            {formatCurrency(property.price)}
          </div>
          <div className="text-sm text-muted-foreground">
            {property.bedrooms} quarto{property.bedrooms !== 1 && 's'} • {property.bathrooms} banh{property.bathrooms !== 1 && 's'} • {property.area}m²
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/property/${property.id}`)}
          >
            Ver detalhes
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/edit-property/${property.id}`)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/convert-property/${property.id}`)}>
                Converter para Empreendimento
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => navigate(`/properties?delete=${property.id}`)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default Properties;
