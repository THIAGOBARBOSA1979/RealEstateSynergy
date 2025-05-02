import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyViewProps {
  propertyId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyView = ({ propertyId, isOpen, onClose }: PropertyViewProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: ['/api/properties', propertyId],
    enabled: isOpen && !!propertyId,
  });

  // Helper functions
  const getPropertyTypeLabel = (type: string): string => {
    switch (type) {
      case 'apartment': return 'Apartamento';
      case 'house': return 'Casa';
      case 'land': return 'Terreno';
      case 'commercial': return 'Comercial';
      default: return type;
    }
  };

  const getPropertyStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'reserved': return 'Reservado';
      case 'sold': return 'Vendido';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'reserved': return 'bg-warning/10 text-warning';
      case 'sold': return 'bg-primary/10 text-primary';
      case 'inactive': return 'bg-muted-foreground/10 text-muted-foreground';
      default: return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ) : property ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{property.title}</DialogTitle>
              <DialogDescription className="text-base">
                {property.address}, {property.city} - {property.state}
              </DialogDescription>
            </DialogHeader>

            <div className="relative h-64 bg-muted rounded-md mb-4 overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <span className="material-icons text-4xl mr-2">image</span>
                  <span>Sem imagens disponíveis</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant="outline" className={getStatusBadgeClass(property.status)}>
                  {getPropertyStatusLabel(property.status)}
                </Badge>
                {property.featured && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Destaque
                  </Badge>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="characteristics">Características</TabsTrigger>
                <TabsTrigger value="affiliation">Afiliação</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">{formatCurrency(property.price)}</span>
                  <Badge variant="secondary">
                    {getPropertyTypeLabel(property.propertyType)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Descrição</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Cidade:</span>
                    <p>{property.city}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <p>{property.state}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">CEP:</span>
                    <p>{property.zipCode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Publicado:</span>
                    <p>{property.published ? "Sim" : "Não"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="characteristics" className="py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-md flex flex-col items-center">
                    <span className="material-icons text-primary text-2xl">king_bed</span>
                    <span className="text-sm text-muted-foreground mt-1">Quartos</span>
                    <span className="text-lg font-medium">{property.bedrooms || 0}</span>
                  </div>
                  <div className="p-4 border rounded-md flex flex-col items-center">
                    <span className="material-icons text-primary text-2xl">bathroom</span>
                    <span className="text-sm text-muted-foreground mt-1">Banheiros</span>
                    <span className="text-lg font-medium">{property.bathrooms || 0}</span>
                  </div>
                  <div className="p-4 border rounded-md flex flex-col items-center">
                    <span className="material-icons text-primary text-2xl">crop_square</span>
                    <span className="text-sm text-muted-foreground mt-1">Área</span>
                    <span className="text-lg font-medium">{property.area || 0} m²</span>
                  </div>
                  <div className="p-4 border rounded-md flex flex-col items-center">
                    <span className="material-icons text-primary text-2xl">directions_car</span>
                    <span className="text-sm text-muted-foreground mt-1">Vagas</span>
                    <span className="text-lg font-medium">{property.garageSpots || 0}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="affiliation" className="py-4 space-y-4">
                <div className="bg-muted/30 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Status de Afiliação</h3>
                    <Badge variant="outline" className={property.availableForAffiliation ? "bg-success/10 text-success" : "bg-muted/10 text-muted-foreground"}>
                      {property.availableForAffiliation ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                  
                  {property.availableForAffiliation && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">Taxa de Comissão:</span>
                      <span className="font-medium ml-2">{property.affiliationCommissionRate}%</span>
                    </div>
                  )}
                </div>
                
                {property.affiliations && property.affiliations.length > 0 ? (
                  <div>
                    <h3 className="font-medium mb-2">Afiliados ({property.affiliations.length})</h3>
                    <div className="space-y-2">
                      {property.affiliations.map((affiliation: any) => (
                        <div key={affiliation.id} className="p-3 border rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium">{affiliation.affiliate.fullName}</p>
                            <p className="text-sm text-muted-foreground">{affiliation.affiliate.email}</p>
                          </div>
                          <Badge variant="outline" className={getStatusBadgeClass(affiliation.status)}>
                            {affiliation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Este imóvel não possui afiliações.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button>
                <span className="material-icons text-xs mr-1">edit</span>
                Editar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Imóvel não encontrado.</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PropertyView;