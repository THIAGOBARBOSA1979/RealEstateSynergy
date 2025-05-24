import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
import PropertyTable from "@/components/dashboard/property-table";
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
  Star 
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
  const [, navigate] = useLocation();

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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Meus Imóveis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas propriedades, veja estatísticas e atualize informações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros {showAdvancedFilters ? 'Simples' : 'Avançados'}
          </Button>
          <Button onClick={() => navigate("/add-property")} className="gap-1">
            <Plus className="h-4 w-4" />
            Adicionar Imóvel
          </Button>
        </div>
      </div>

      {/* Tabs para segmentar propriedades */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos os Imóveis</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Destacados
          </TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
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
          
          {/* Property Table com filtros aplicados */}
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
    </div>
  );
};

export default Properties;
