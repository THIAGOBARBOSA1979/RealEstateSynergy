import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Heart, Search, MapPin, Bed, Bath, Square, Eye, Share } from "lucide-react";

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['/api/properties/favorites'],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (propertyId: number) => 
      apiRequest(`/api/properties/${propertyId}/favorite`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties/favorites'] });
      toast({
        title: "Removido dos favoritos",
        description: "Imóvel removido da sua lista de favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o imóvel dos favoritos.",
        variant: "destructive",
      });
    },
  });

  const filteredFavorites = favorites?.filter((property: any) =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-heading font-bold">Meus Favoritos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Meus Favoritos</h1>
          <p className="text-muted-foreground">
            {filteredFavorites.length} {filteredFavorites.length === 1 ? 'imóvel favorito' : 'imóveis favoritos'}
          </p>
        </div>
        
        {/* Barra de busca */}
        <div className="flex items-center gap-2 max-w-md w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar nos favoritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Lista de favoritos */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum favorito encontrado' : 'Nenhum imóvel favorito'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Tente ajustar sua busca para encontrar imóveis favoritos.'
              : 'Comece a favoritar imóveis para vê-los aqui.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((property: any) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onRemoveFavorite={() => removeFavoriteMutation.mutate(property.id)}
              isRemoving={removeFavoriteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ 
  property, 
  onRemoveFavorite, 
  isRemoving 
}: { 
  property: any; 
  onRemoveFavorite: () => void;
  isRemoving: boolean;
}) {
  const images = Array.isArray(property.images) ? property.images : [];
  const mainImage = images[0] || "/api/placeholder/400/300";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Imagem */}
      <div className="relative">
        <img 
          src={mainImage} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Badge de status */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={property.status === 'disponivel' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {property.status === 'disponivel' ? 'Disponível' : 
             property.status === 'vendido' ? 'Vendido' : 
             property.status === 'alugado' ? 'Alugado' : property.status}
          </Badge>
        </div>

        {/* Botão de remover favorito */}
        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={onRemoveFavorite}
            disabled={isRemoving}
          >
            <Heart className="h-4 w-4 fill-current text-red-500" />
          </Button>
        </div>

        {/* Botões de ação (aparecem no hover) */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Preço */}
          <div className="text-xl font-bold text-primary">
            {formatCurrency(Number(property.price) || 0)}
          </div>

          {/* Título */}
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
            {property.title}
          </h3>

          {/* Localização */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.address}, {property.city} - {property.state}
            </span>
          </div>

          {/* Características */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  <span>{property.area}m²</span>
                </div>
              )}
            </div>
          </div>

          {/* Tipo do imóvel */}
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {property.propertyType || 'Imóvel'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}