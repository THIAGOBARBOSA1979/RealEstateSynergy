import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Save, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  const [webhookActive, setWebhookActive] = useState<boolean>(
    property.webhookActive || false
  );
  
  const [webhookUrl, setWebhookUrl] = useState<string>(
    property.webhookUrl || ""
  );
  
  const [pixelTracking, setPixelTracking] = useState<boolean>(
    property.pixelTracking || false
  );
  
  const [pixelId, setPixelId] = useState<string>(
    property.pixelId || ""
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
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar portais",
        description: error.message || "Ocorreu um erro ao atualizar as integrações com portais.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update property webhook settings
  const updatePropertyWebhook = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/properties/${property.id}/webhooks`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          webhookActive, 
          webhookUrl 
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Webhook atualizado",
        description: "As configurações de webhook foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar webhook",
        description: error.message || "Ocorreu um erro ao atualizar as configurações de webhook.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update property pixel tracking settings
  const updatePropertyPixel = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/properties/${property.id}/pixel`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          pixelTracking, 
          pixelId 
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Pixel atualizado",
        description: "As configurações de rastreamento por pixel foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar pixel",
        description: error.message || "Ocorreu um erro ao atualizar as configurações de rastreamento por pixel.",
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
  
  const handleSavePortals = () => {
    updatePropertyPortals.mutate();
  };
  
  const handleSaveWebhook = () => {
    if (webhookActive && !webhookUrl) {
      toast({
        title: "URL necessária",
        description: "Por favor, forneça uma URL para o webhook.",
        variant: "destructive",
      });
      return;
    }
    
    updatePropertyWebhook.mutate();
  };
  
  const handleSavePixel = () => {
    if (pixelTracking && !pixelId) {
      toast({
        title: "ID de pixel necessário",
        description: "Por favor, forneça um ID para o rastreamento por pixel.",
        variant: "destructive",
      });
      return;
    }
    
    updatePropertyPixel.mutate();
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
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Integrações com Portais</DialogTitle>
          <DialogDescription>
            Gerencie a distribuição de anúncios, rastreamento e notificações para esta propriedade
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingIntegrations || isLoadingPortals ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="portals" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="portals">Portais</TabsTrigger>
              <TabsTrigger value="webhook">Webhook</TabsTrigger>
              <TabsTrigger value="pixel">Pixel</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portals" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Portais Imobiliários</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings className="h-4 w-4 mr-1" />
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
              
              <DialogFooter>
                <Button 
                  onClick={handleSavePortals}
                  disabled={updatePropertyPortals.isPending}
                >
                  {updatePropertyPortals.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="webhook" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Webhook para Leads</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure um webhook para receber notificações em tempo real quando um novo lead for gerado para esta propriedade.
                </p>
                
                <Alert className="mb-4">
                  <AlertDescription>
                    Os webhooks permitem que sistemas externos recebam notificações automaticamente quando um lead é criado. 
                    Você precisará de uma URL que possa processar requisições POST.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch 
                      id="webhook-active" 
                      checked={webhookActive} 
                      onCheckedChange={setWebhookActive}
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="webhook-active">Ativar Webhook</Label>
                      <p className="text-xs text-muted-foreground">
                        Envia notificações de novos leads para URLs externas
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://api.seudominio.com.br/webhooks/leads" 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      disabled={!webhookActive}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL que receberá as notificações de leads via POST
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleSaveWebhook}
                  disabled={updatePropertyWebhook.isPending}
                >
                  {updatePropertyWebhook.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="pixel" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Rastreamento por Pixel</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure o rastreamento por pixel para acompanhar conversões e retargeting de visitantes interessados nesta propriedade.
                </p>
                
                <Alert className="mb-4">
                  <AlertDescription>
                    Os pixels permitem rastrear visitantes em seu site e fazer remarketing para eles em plataformas como Facebook ou Google.
                    Você precisará de um ID de pixel da plataforma escolhida.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch 
                      id="pixel-tracking" 
                      checked={pixelTracking} 
                      onCheckedChange={setPixelTracking}
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="pixel-tracking">Ativar Rastreamento</Label>
                      <p className="text-xs text-muted-foreground">
                        Permite rastreamento avançado de visitantes e remarketing
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pixel-id">ID do Pixel</Label>
                    <Input 
                      id="pixel-id" 
                      placeholder="123456789012345" 
                      value={pixelId}
                      onChange={(e) => setPixelId(e.target.value)}
                      disabled={!pixelTracking}
                    />
                    <p className="text-xs text-muted-foreground">
                      ID do pixel do Facebook ou tag do Google Analytics
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleSavePixel}
                  disabled={updatePropertyPixel.isPending}
                >
                  {updatePropertyPixel.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PortalIntegrationsDialog;