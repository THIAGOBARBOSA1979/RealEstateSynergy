import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface PortalIntegrationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

const PortalIntegrationsDialog = ({
  isOpen,
  onClose,
  property
}: PortalIntegrationsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPortals, setSelectedPortals] = useState<string[]>(
    property.publishedPortals || []
  );
  
  // Fetch user integrations (portal credentials)
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['/api/integrations'],
    enabled: isOpen,
  });
  
  // Fetch available portals
  const { data: availablePortals, isLoading: isLoadingPortals } = useQuery({
    queryKey: ['/api/portals/available'],
    enabled: isOpen,
  });
  
  // Mutation to update property portal integrations
  const updatePropertyPortals = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/properties/${property.id}/portals`, {
        method: 'PATCH',
        body: JSON.stringify({ portals: selectedPortals }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Portais atualizados",
        description: "As integrações com portais foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar portais",
        description: error.message || "Ocorreu um erro ao atualizar as integrações com portais.",
        variant: "destructive",
      });
    },
  });
  
  const handlePortalToggle = (portalId: string) => {
    setSelectedPortals(prev => {
      if (prev.includes(portalId)) {
        return prev.filter(id => id !== portalId);
      } else {
        return [...prev, portalId];
      }
    });
  };
  
  const handleSave = () => {
    updatePropertyPortals.mutate();
  };
  
  const getPortalCredentialStatus = (portalId: string) => {
    if (!integrations || !integrations.portals) return false;
    
    switch (portalId) {
      case 'zapImoveis':
        return integrations.portals.zapImoveis;
      case 'vivaReal':
        return integrations.portals.vivaReal;
      case 'olx':
        return integrations.portals.olx;
      default:
        return false;
    }
  };
  
  const getPortalName = (portalId: string) => {
    switch (portalId) {
      case 'zapImoveis':
        return 'ZAP Imóveis';
      case 'vivaReal':
        return 'Viva Real';
      case 'olx':
        return 'OLX';
      case 'linkedin':
        return 'LinkedIn';
      case 'facebook':
        return 'Facebook';
      default:
        return portalId;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Integrações com Portais</DialogTitle>
        </DialogHeader>
        
        {isLoadingIntegrations || isLoadingPortals ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Portais Imobiliários</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => window.location.href = '/settings'}
                >
                  <span className="material-icons text-xs mr-1">settings</span>
                  Configurar Credenciais
                </Button>
              </div>
              
              <div className="grid gap-3">
                {availablePortals?.imobiliarios?.map((portal: string) => (
                  <div key={portal} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`portal-${portal}`}
                        checked={selectedPortals.includes(portal)}
                        disabled={!getPortalCredentialStatus(portal)}
                        onCheckedChange={() => handlePortalToggle(portal)}
                      />
                      <Label htmlFor={`portal-${portal}`} className="font-medium">
                        {getPortalName(portal)}
                      </Label>
                    </div>
                    
                    {getPortalCredentialStatus(portal) ? (
                      <Badge variant="outline" className="bg-success/10 text-success">
                        Configurado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">
                        Não Configurado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Redes Sociais</h3>
                
                <div className="grid gap-3">
                  {availablePortals?.sociais?.map((portal: string) => (
                    <div key={portal} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`social-${portal}`}
                          checked={selectedPortals.includes(portal)}
                          onCheckedChange={() => handlePortalToggle(portal)}
                        />
                        <Label htmlFor={`social-${portal}`} className="font-medium">
                          {getPortalName(portal)}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center space-x-3">
                <Switch 
                  id="webhook-active" 
                  checked={property.webhookActive} 
                  disabled={true}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="webhook-active">Webhook para Leads</Label>
                  <p className="text-xs text-muted-foreground">
                    Envia notificações de novos leads para URLs externas
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch 
                  id="pixel-tracking" 
                  checked={property.pixelTracking} 
                  disabled={true}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="pixel-tracking">Rastreamento por Pixel</Label>
                  <p className="text-xs text-muted-foreground">
                    Permite rastreamento avançado de visitantes
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={updatePropertyPortals.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updatePropertyPortals.isPending}
              >
                {updatePropertyPortals.isPending ? (
                  <>
                    <span className="material-icons animate-spin text-xs mr-1">sync</span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-xs mr-1">save</span>
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PortalIntegrationsDialog;