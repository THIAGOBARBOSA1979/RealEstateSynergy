import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import PropertyView from "@/components/properties/property-view";

const Favorites = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch favorite properties
  const { data: favorites, isLoading, isError } = useQuery({
    queryKey: ['/api/properties/favorites'],
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter properties based on search term
  const filteredProperties = favorites && Array.isArray(favorites)
    ? favorites.filter((property: any) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          property.title.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.propertyType.toLowerCase().includes(searchLower)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Imóveis Favoritos</h1>
        
        <div className="w-full max-w-sm">
          <Input
            placeholder="Buscar por título, endereço ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Erro ao carregar os favoritos. Tente novamente.</p>
          <Button variant="outline" className="mt-4">Tentar novamente</Button>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property: any) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <span className="material-icons text-4xl">image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-accent/80 text-accent-foreground">
                    {property.propertyType === 'apartment' ? 'Apartamento' :
                     property.propertyType === 'house' ? 'Casa' :
                     property.propertyType === 'land' ? 'Terreno' : 
                     property.propertyType === 'commercial' ? 'Comercial' : 
                     property.propertyType}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <Badge className="bg-transparent hover:bg-primary/20 border-primary/50 text-white cursor-pointer" onClick={() => {}}>
                    <span className="material-icons text-sm mr-1">favorite</span>
                    Favorito
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                <CardDescription className="line-clamp-1">{property.address}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold text-primary">{formatCurrency(property.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {property.bedrooms || 0} quartos • {property.bathrooms || 0} banheiros • {property.area || 0}m²
                </p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setSelectedPropertyId(property.id);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <span className="material-icons text-sm mr-1">visibility</span>
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="inline-block p-3 rounded-full bg-muted mb-4">
            <span className="material-icons text-4xl text-muted-foreground">favorite_border</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum imóvel favorito</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Você ainda não adicionou nenhum imóvel aos favoritos. Explore os imóveis disponíveis e marque seus favoritos para acompanhá-los mais facilmente.
          </p>
          <Button>Explorar imóveis</Button>
        </div>
      )}

      {/* Property View Dialog */}
      <PropertyView
        propertyId={selectedPropertyId}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />
    </div>
  );
};

export default Favorites;