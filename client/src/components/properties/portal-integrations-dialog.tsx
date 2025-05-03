import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Property } from "@/types";

interface PortalIntegrationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function PortalIntegrationsDialog({
  isOpen,
  onClose,
  property,
}: PortalIntegrationsDialogProps) {
  // Local state to track changes before saving
  const [publishedPortals, setPublishedPortals] = useState<string[]>(
    property.publishedPortals || []
  );
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/properties/${property.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Integrações atualizadas",
        description: "As configurações de publicação do imóvel foram atualizadas com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as configurações de publicação do imóvel.",
        variant: "destructive",
      });
    },
  });

  // Toggle property published status
  const togglePropertyPublished = (status: boolean) => {
    updatePropertyMutation.mutate({
      published: status,
      publishedPortals: status ? publishedPortals : []
    });
  };

  // Toggle portal selection
  const togglePortal = (portal: string) => {
    setPublishedPortals((current) => {
      const exists = current.includes(portal);
      
      if (exists) {
        return current.filter(p => p !== portal);
      } else {
        return [...current, portal];
      }
    });
  };

  // Save changes
  const handleSave = () => {
    updatePropertyMutation.mutate({
      publishedPortals
    });
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não publicado';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Integração com Portais</DialogTitle>
          <DialogDescription>
            Gerencie em quais portais este imóvel será publicado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-base">{property.title}</h3>
              <p className="text-sm text-muted-foreground">ID: {property.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Publicado</span>
              <Switch 
                checked={property.published || false}
                onCheckedChange={togglePropertyPublished}
              />
            </div>
          </div>

          <Separator />

          {property.published ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ZAP Imóveis */}
                <Card className={publishedPortals.includes('zapimoveis') ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>ZAP Imóveis</span>
                      <Checkbox 
                        checked={publishedPortals.includes('zapimoveis')}
                        onCheckedChange={() => togglePortal('zapimoveis')}
                        className="h-5 w-5"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-sm">
                      <Badge variant="outline" className="mb-2">
                        {property.status === 'active' ? 'Ativo' : 
                         property.status === 'reserved' ? 'Reservado' :
                         property.status === 'sold' ? 'Vendido' : 'Inativo'}
                      </Badge>
                      <p className="text-muted-foreground text-xs mt-2">
                        Última atualização: <br />
                        {formatDate(property.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Viva Real */}
                <Card className={publishedPortals.includes('vivareal') ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Viva Real</span>
                      <Checkbox 
                        checked={publishedPortals.includes('vivareal')}
                        onCheckedChange={() => togglePortal('vivareal')}
                        className="h-5 w-5"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-sm">
                      <Badge variant="outline" className="mb-2">
                        {property.status === 'active' ? 'Ativo' : 
                         property.status === 'reserved' ? 'Reservado' :
                         property.status === 'sold' ? 'Vendido' : 'Inativo'}
                      </Badge>
                      <p className="text-muted-foreground text-xs mt-2">
                        Última atualização: <br />
                        {formatDate(property.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* OLX */}
                <Card className={publishedPortals.includes('olx') ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>OLX</span>
                      <Checkbox 
                        checked={publishedPortals.includes('olx')}
                        onCheckedChange={() => togglePortal('olx')}
                        className="h-5 w-5"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-sm">
                      <Badge variant="outline" className="mb-2">
                        {property.status === 'active' ? 'Ativo' : 
                         property.status === 'reserved' ? 'Reservado' :
                         property.status === 'sold' ? 'Vendido' : 'Inativo'}
                      </Badge>
                      <p className="text-muted-foreground text-xs mt-2">
                        Última atualização: <br />
                        {formatDate(property.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-md text-sm mt-4">
                <span className="material-icons text-info text-base mr-2 align-middle">info</span>
                <span>Os portais cobram por anúncio. Selecione apenas os portais em que deseja anunciar este imóvel.</span>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <span className="material-icons text-muted-foreground text-4xl mb-2">cloud_off</span>
              <h3 className="font-medium text-base mb-1">Imóvel não publicado</h3>
              <p className="text-sm text-muted-foreground">
                Ative a publicação para selecionar os portais em que deseja anunciar este imóvel.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            disabled={updatePropertyMutation.isPending || !property.published}
          >
            {updatePropertyMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}