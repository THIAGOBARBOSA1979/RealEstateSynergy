import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Button, 
  Input, 
  Label, 
  Switch, 
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Building, Home, CheckCircle, AlertCircle } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

const portalsList = [
  { 
    id: "zapImoveis", 
    name: "ZAP Imóveis", 
    description: "Um dos maiores portais imobiliários do Brasil",
    icon: Building 
  },
  { 
    id: "vivareal", 
    name: "Viva Real", 
    description: "Plataforma completa para anúncios imobiliários",
    icon: Home 
  },
  { 
    id: "imovelweb", 
    name: "Imóvel Web", 
    description: "Portal com grande alcance nacional",
    icon: Building 
  },
  { 
    id: "quintoandar", 
    name: "Quinto Andar", 
    description: "Plataforma moderna para locação e venda",
    icon: Home 
  },
  { 
    id: "olx", 
    name: "OLX Imóveis", 
    description: "Marketplace com grande volume de tráfego",
    icon: Building 
  },
  { 
    id: "superimoveisbrasil", 
    name: "Super Imóveis Brasil", 
    description: "Portal especializado em imóveis de alto padrão",
    icon: Home 
  }
];

interface PortalIntegrationsProps {
  isLoadingIntegrations: boolean;
  integrationSettings: any;
  updateIntegrationsMutation: UseMutationResult<any, Error, any, unknown>;
  handleIntegrationUpdate: (updatedSettings: any) => void;
}

export default function PortalIntegrations({
  isLoadingIntegrations,
  integrationSettings,
  updateIntegrationsMutation,
  handleIntegrationUpdate
}: PortalIntegrationsProps) {
  const [isPortalDialogOpen, setIsPortalDialogOpen] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("portals");

  const togglePortalEnabled = (portalId: string, enabled: boolean) => {
    const currentSettings = integrationSettings || {};
    const currentPortals = currentSettings.portals || {};
    
    handleIntegrationUpdate({
      ...currentSettings,
      portals: {
        ...currentPortals,
        [portalId]: {
          ...currentPortals[portalId],
          enabled: enabled
        }
      }
    });
  };

  const updatePortalCredentials = (portalId: string, field: string, value: string) => {
    const currentSettings = integrationSettings || {};
    const currentPortals = currentSettings.portals || {};
    const portalSettings = currentPortals[portalId] || { enabled: true, credentials: {} };
    
    handleIntegrationUpdate({
      ...currentSettings,
      portals: {
        ...currentPortals,
        [portalId]: {
          ...portalSettings,
          credentials: {
            ...portalSettings.credentials,
            [field]: value
          }
        }
      }
    });
  };

  const handleOtherIntegrationToggle = (integrationId: string, enabled: boolean) => {
    handleIntegrationUpdate({
      ...integrationSettings,
      [integrationId]: {
        ...integrationSettings?.[integrationId],
        enabled: enabled
      }
    });
  };

  const openPortalDialog = (portalId: string) => {
    setSelectedPortal(portalId);
    setIsPortalDialogOpen(true);
  };

  return (
    <>
      <Tabs defaultValue="portals" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="portals">Portais Imobiliários</TabsTrigger>
          <TabsTrigger value="other">Outras Integrações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks e APIs</TabsTrigger>
        </TabsList>

        <TabsContent value="portals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portais Imobiliários</CardTitle>
              <CardDescription>
                Integre com portais para publicar seus imóveis automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingIntegrations ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portalsList.map((portal) => {
                    const PortalIcon = portal.icon;
                    const isEnabled = integrationSettings?.portals?.[portal.id]?.enabled || false;
                    const hasCredentials = 
                      integrationSettings?.portals?.[portal.id]?.credentials?.apiKey &&
                      integrationSettings?.portals?.[portal.id]?.credentials?.portalId;
                    
                    return (
                      <div key={portal.id} className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <PortalIcon className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor={portal.id}>{portal.name}</Label>
                              <p className="text-xs text-muted-foreground">{portal.description}</p>
                            </div>
                          </div>
                          <Switch 
                            id={portal.id}
                            checked={isEnabled}
                            onCheckedChange={(checked) => togglePortalEnabled(portal.id, checked)}
                          />
                        </div>
                        
                        {isEnabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-2">
                              {hasCredentials ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>Configurado</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 text-amber-500" />
                                  <span>Configuração pendente</span>
                                </>
                              )}
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openPortalDialog(portal.id)}
                              className="w-full"
                            >
                              Configurar Credenciais
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleIntegrationUpdate(integrationSettings)}
                disabled={updateIntegrationsMutation.isPending}
                className="ml-auto"
              >
                {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outras Integrações</CardTitle>
              <CardDescription>
                Configure outras integrações para aprimorar sua plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingIntegrations ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="googleDrive">Google Drive</Label>
                      <p className="text-xs text-muted-foreground">Salve documentos automaticamente no Google Drive</p>
                    </div>
                    <Switch 
                      id="googleDrive"
                      checked={integrationSettings?.googleDrive?.enabled || false}
                      onCheckedChange={(checked) => handleOtherIntegrationToggle('googleDrive', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <p className="text-xs text-muted-foreground">Envie mensagens automaticamente via WhatsApp</p>
                    </div>
                    <Switch 
                      id="whatsapp"
                      checked={integrationSettings?.whatsapp?.enabled || false}
                      onCheckedChange={(checked) => handleOtherIntegrationToggle('whatsapp', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="googleSheets">Google Sheets</Label>
                      <p className="text-xs text-muted-foreground">Sincronize dados com planilhas do Google</p>
                    </div>
                    <Switch 
                      id="googleSheets"
                      checked={integrationSettings?.googleSheets?.enabled || false}
                      onCheckedChange={(checked) => handleOtherIntegrationToggle('googleSheets', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="facebook">Facebook Pixel</Label>
                      <p className="text-xs text-muted-foreground">Rastreie conversões e eventos no Facebook</p>
                    </div>
                    <Switch 
                      id="facebook"
                      checked={integrationSettings?.facebook?.enabled || false}
                      onCheckedChange={(checked) => handleOtherIntegrationToggle('facebook', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="googleAnalytics">Google Analytics</Label>
                      <p className="text-xs text-muted-foreground">Monitore o tráfego e conversões em seu site</p>
                    </div>
                    <Switch 
                      id="googleAnalytics"
                      checked={integrationSettings?.googleAnalytics?.enabled || false}
                      onCheckedChange={(checked) => handleOtherIntegrationToggle('googleAnalytics', checked)}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleIntegrationUpdate(integrationSettings)}
                disabled={updateIntegrationsMutation.isPending}
                className="ml-auto"
              >
                {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks e Integrações API</CardTitle>
              <CardDescription>
                Configure webhooks para receber notificações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingIntegrations ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="leadWebhook">URL para Notificação de Leads</Label>
                    <Input 
                      id="leadWebhook" 
                      placeholder="https://sua-api.com/webhook/leads" 
                      value={integrationSettings?.webhooks?.leadNotification || ''}
                      onChange={(e) => {
                        const currentSettings = integrationSettings || {};
                        const currentWebhooks = currentSettings.webhooks || {};
                        
                        handleIntegrationUpdate({
                          ...currentSettings,
                          webhooks: {
                            ...currentWebhooks,
                            leadNotification: e.target.value
                          }
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Receba notificações em tempo real quando novos leads forem cadastrados
                    </p>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="propertyWebhook">URL para Notificação de Imóveis</Label>
                    <Input 
                      id="propertyWebhook" 
                      placeholder="https://sua-api.com/webhook/properties" 
                      value={integrationSettings?.webhooks?.propertyUpdate || ''}
                      onChange={(e) => {
                        const currentSettings = integrationSettings || {};
                        const currentWebhooks = currentSettings.webhooks || {};
                        
                        handleIntegrationUpdate({
                          ...currentSettings,
                          webhooks: {
                            ...currentWebhooks,
                            propertyUpdate: e.target.value
                          }
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Receba notificações quando imóveis forem atualizados ou modificados
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleIntegrationUpdate(integrationSettings)}
                disabled={updateIntegrationsMutation.isPending}
                className="ml-auto"
              >
                {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPortalDialogOpen} onOpenChange={setIsPortalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPortal && portalsList.find(p => p.id === selectedPortal)?.name}
            </DialogTitle>
            <DialogDescription>
              Configure as credenciais para integração com este portal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="portalApiKey">Chave de API</Label>
              <Input 
                id="portalApiKey"
                type="password"
                placeholder="Digite sua chave de API" 
                value={integrationSettings?.portals?.[selectedPortal || '']?.credentials?.apiKey || ''}
                onChange={(e) => {
                  if (selectedPortal) {
                    updatePortalCredentials(selectedPortal, 'apiKey', e.target.value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalId">ID do Portal</Label>
              <Input 
                id="portalId"
                placeholder="Digite o ID do portal" 
                value={integrationSettings?.portals?.[selectedPortal || '']?.credentials?.portalId || ''}
                onChange={(e) => {
                  if (selectedPortal) {
                    updatePortalCredentials(selectedPortal, 'portalId', e.target.value);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portalUsername">Usuário (opcional)</Label>
              <Input 
                id="portalUsername"
                placeholder="Digite seu nome de usuário" 
                value={integrationSettings?.portals?.[selectedPortal || '']?.credentials?.username || ''}
                onChange={(e) => {
                  if (selectedPortal) {
                    updatePortalCredentials(selectedPortal, 'username', e.target.value);
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              handleIntegrationUpdate(integrationSettings);
              setIsPortalDialogOpen(false);
            }}>
              Salvar Credenciais
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}