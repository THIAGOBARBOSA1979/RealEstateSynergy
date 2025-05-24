import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Plus, 
  Building, 
  Home, 
  CheckCircle, 
  AlertCircle, 
  BarChart, 
  Search, 
  RefreshCcw, 
  MessageSquare,
  Rocket,
  Megaphone,
  Mail,
  Smartphone,
  Facebook,
  Instagram
} from "lucide-react";
import { FaGoogle, FaFacebook, FaTiktok, FaPinterest, FaYoutube, FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiTiktok, SiGoogleads, SiGoogleanalytics, SiMailchimp, SiHubspot } from "react-icons/si";
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
  },
  { 
    id: "chaves", 
    name: "Chaves na Mão", 
    description: "Portal regional com foco em imóveis residenciais",
    icon: Building 
  },
  { 
    id: "trovit", 
    name: "Trovit Imóveis", 
    description: "Meta buscador internacional de imóveis",
    icon: Home 
  },
  { 
    id: "lugarcerto", 
    name: "Lugar Certo", 
    description: "Portal focado em regiões Sul e Sudeste",
    icon: Building 
  },
  { 
    id: "mercadolivre", 
    name: "Mercado Livre Imóveis", 
    description: "Categoria imobiliária do maior marketplace da América Latina",
    icon: Home 
  },
  { 
    id: "123i", 
    name: "123i", 
    description: "Portal com foco em facilitar a busca por imóveis",
    icon: Building 
  },
  { 
    id: "casamineira", 
    name: "Casa Mineira", 
    description: "Especializado no mercado imobiliário de Minas Gerais",
    icon: Home 
  },
  { 
    id: "portalimoveis", 
    name: "Portal Imóveis", 
    description: "Plataforma com ampla cobertura nacional",
    icon: Building 
  },
  { 
    id: "imovelguide", 
    name: "Imóvel Guide", 
    description: "Guia completo de imóveis em todo o Brasil",
    icon: Home 
  },
  { 
    id: "netimoveisbrasil", 
    name: "Net Imóveis Brasil", 
    description: "Rede de imobiliárias conectadas em todo país",
    icon: Building 
  },
  { 
    id: "wimoveis", 
    name: "WImóveis", 
    description: "Plataforma digital moderna com foco em experiência do usuário",
    icon: Home 
  },
  { 
    id: "zumper", 
    name: "Zumper Brasil", 
    description: "Tecnologia avançada para busca de imóveis",
    icon: Building 
  },
  { 
    id: "imowebrio", 
    name: "ImoWeb Rio", 
    description: "Especializado em imóveis na região do Rio de Janeiro",
    icon: Home 
  },
  { 
    id: "brasilbrokers", 
    name: "Brasil Brokers", 
    description: "Rede de corretores de alto padrão",
    icon: Building 
  },
  { 
    id: "habitissimo", 
    name: "Habitissimo", 
    description: "Plataforma para imóveis e reforma",
    icon: Home 
  },
  { 
    id: "lopes", 
    name: "Lopes Imóveis", 
    description: "Imobiliária premium com alcance nacional",
    icon: Building 
  },
  { 
    id: "nestoria", 
    name: "Nestoria Brasil", 
    description: "Buscador internacional de imóveis",
    icon: Home 
  },
  { 
    id: "crecisp", 
    name: "Portal CRECI-SP", 
    description: "Portal oficial do CRECI de São Paulo",
    icon: Building 
  },
  { 
    id: "imoveisluxo", 
    name: "Imóveis de Luxo", 
    description: "Especializado em propriedades de alto padrão",
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
          <Tabs defaultValue="marketing" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="marketing">Marketing e Tracking</TabsTrigger>
              <TabsTrigger value="productivity">Produtividade</TabsTrigger>
              <TabsTrigger value="social">Redes Sociais</TabsTrigger>
              <TabsTrigger value="crm">CRM e Comunicação</TabsTrigger>
            </TabsList>
            
            <TabsContent value="marketing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integrações de Marketing e Analytics</CardTitle>
                  <CardDescription>
                    Configure rastreamento de conversões e métricas para suas campanhas
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <SiGoogleanalytics className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="googleAnalytics">Google Analytics</Label>
                              <p className="text-xs text-muted-foreground">Monitore o tráfego e conversões</p>
                            </div>
                          </div>
                          <Switch 
                            id="googleAnalytics"
                            checked={integrationSettings?.googleAnalytics?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('googleAnalytics', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.googleAnalytics?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="gaMeasurementId" className="text-xs">Measurement ID</Label>
                              <Input 
                                id="gaMeasurementId" 
                                placeholder="G-XXXXXXXXXX" 
                                value={integrationSettings?.googleAnalytics?.measurementId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    googleAnalytics: {
                                      ...currentSettings.googleAnalytics,
                                      measurementId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaFacebook className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="facebook">Facebook Pixel</Label>
                              <p className="text-xs text-muted-foreground">Rastreie conversões e eventos</p>
                            </div>
                          </div>
                          <Switch 
                            id="facebook"
                            checked={integrationSettings?.facebook?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('facebook', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.facebook?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="fbPixelId" className="text-xs">Pixel ID</Label>
                              <Input 
                                id="fbPixelId" 
                                placeholder="XXXXXXXXXXXXXXXXXX" 
                                value={integrationSettings?.facebook?.pixelId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    facebook: {
                                      ...currentSettings.facebook,
                                      pixelId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <SiGoogleads className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="googleAds">Google Ads</Label>
                              <p className="text-xs text-muted-foreground">Rastreie conversões de anúncios</p>
                            </div>
                          </div>
                          <Switch 
                            id="googleAds"
                            checked={integrationSettings?.googleAds?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('googleAds', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.googleAds?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="googleAdsId" className="text-xs">Conversion ID</Label>
                              <Input 
                                id="googleAdsId" 
                                placeholder="AW-XXXXXXXXXX" 
                                value={integrationSettings?.googleAds?.conversionId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    googleAds: {
                                      ...currentSettings.googleAds,
                                      conversionId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <SiTiktok className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="tiktok">TikTok Pixel</Label>
                              <p className="text-xs text-muted-foreground">Rastreie eventos do TikTok Ads</p>
                            </div>
                          </div>
                          <Switch 
                            id="tiktok"
                            checked={integrationSettings?.tiktok?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('tiktok', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.tiktok?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="tiktokPixelId" className="text-xs">Pixel ID</Label>
                              <Input 
                                id="tiktokPixelId" 
                                placeholder="XXXXXXXXXXXXXXXXXX" 
                                value={integrationSettings?.tiktok?.pixelId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    tiktok: {
                                      ...currentSettings.tiktok,
                                      pixelId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="gtm">Google Tag Manager</Label>
                              <p className="text-xs text-muted-foreground">Gerencie todos os scripts</p>
                            </div>
                          </div>
                          <Switch 
                            id="gtm"
                            checked={integrationSettings?.gtm?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('gtm', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.gtm?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="gtmId" className="text-xs">Container ID</Label>
                              <Input 
                                id="gtmId" 
                                placeholder="GTM-XXXXXXX" 
                                value={integrationSettings?.gtm?.containerId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    gtm: {
                                      ...currentSettings.gtm,
                                      containerId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <SiHubspot className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="hubspot">HubSpot</Label>
                              <p className="text-xs text-muted-foreground">Marketing automation e tracking</p>
                            </div>
                          </div>
                          <Switch 
                            id="hubspot"
                            checked={integrationSettings?.hubspot?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('hubspot', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.hubspot?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="hubspotId" className="text-xs">Tracking Code ID</Label>
                              <Input 
                                id="hubspotId" 
                                placeholder="XXXXXXXX" 
                                value={integrationSettings?.hubspot?.trackingId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    hubspot: {
                                      ...currentSettings.hubspot,
                                      trackingId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
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
            
            <TabsContent value="productivity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integrações de Produtividade</CardTitle>
                  <CardDescription>
                    Conecte com ferramentas que aumentam sua produtividade
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaGoogle className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="googleDrive">Google Drive</Label>
                              <p className="text-xs text-muted-foreground">Armazenamento de documentos</p>
                            </div>
                          </div>
                          <Switch 
                            id="googleDrive"
                            checked={integrationSettings?.googleDrive?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('googleDrive', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.googleDrive?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="flex items-center space-x-1 text-xs text-green-600 mb-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>Conectado</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full text-xs"
                            >
                              Configurar Pastas
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <RefreshCcw className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="googleSheets">Google Sheets</Label>
                              <p className="text-xs text-muted-foreground">Sincronize seus dados</p>
                            </div>
                          </div>
                          <Switch 
                            id="googleSheets"
                            checked={integrationSettings?.googleSheets?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('googleSheets', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.googleSheets?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="spreadsheetId" className="text-xs">ID da Planilha</Label>
                              <Input 
                                id="spreadsheetId" 
                                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" 
                                value={integrationSettings?.googleSheets?.spreadsheetId || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    googleSheets: {
                                      ...currentSettings.googleSheets,
                                      spreadsheetId: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
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
            
            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                  <CardDescription>
                    Conecte com suas redes sociais para automatizar postagens
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaInstagram className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="instagram">Instagram</Label>
                              <p className="text-xs text-muted-foreground">Publique fotos de imóveis</p>
                            </div>
                          </div>
                          <Switch 
                            id="instagram"
                            checked={integrationSettings?.instagram?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('instagram', checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaFacebook className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="facebookPage">Facebook Page</Label>
                              <p className="text-xs text-muted-foreground">Publique imóveis automaticamente</p>
                            </div>
                          </div>
                          <Switch 
                            id="facebookPage"
                            checked={integrationSettings?.facebookPage?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('facebookPage', checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaLinkedin className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="linkedin">LinkedIn</Label>
                              <p className="text-xs text-muted-foreground">Compartilhe com sua rede</p>
                            </div>
                          </div>
                          <Switch 
                            id="linkedin"
                            checked={integrationSettings?.linkedin?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('linkedin', checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaYoutube className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="youtube">YouTube</Label>
                              <p className="text-xs text-muted-foreground">Upload de vídeos de imóveis</p>
                            </div>
                          </div>
                          <Switch 
                            id="youtube"
                            checked={integrationSettings?.youtube?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('youtube', checked)}
                          />
                        </div>
                      </div>
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
            
            <TabsContent value="crm" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CRM e Comunicação</CardTitle>
                  <CardDescription>
                    Integre ferramentas de comunicação com clientes
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="whatsapp">WhatsApp Business</Label>
                              <p className="text-xs text-muted-foreground">Envie mensagens automaticamente</p>
                            </div>
                          </div>
                          <Switch 
                            id="whatsapp"
                            checked={integrationSettings?.whatsapp?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('whatsapp', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.whatsapp?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="whatsappNumber" className="text-xs">Número de Telefone</Label>
                              <Input 
                                id="whatsappNumber" 
                                placeholder="5511999999999" 
                                value={integrationSettings?.whatsapp?.phoneNumber || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    whatsapp: {
                                      ...currentSettings.whatsapp,
                                      phoneNumber: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="mailchimp">Mailchimp</Label>
                              <p className="text-xs text-muted-foreground">Email marketing automatizado</p>
                            </div>
                          </div>
                          <Switch 
                            id="mailchimp"
                            checked={integrationSettings?.mailchimp?.enabled || false}
                            onCheckedChange={(checked) => handleOtherIntegrationToggle('mailchimp', checked)}
                          />
                        </div>
                        
                        {integrationSettings?.mailchimp?.enabled && (
                          <div className="pl-2 border-l-2 border-primary/20 mt-4 space-y-2">
                            <div className="space-y-2">
                              <Label htmlFor="mailchimpApiKey" className="text-xs">API Key</Label>
                              <Input 
                                id="mailchimpApiKey" 
                                placeholder="xxxxxxxxxxxxxxxxxxxx-usXX" 
                                value={integrationSettings?.mailchimp?.apiKey || ''}
                                onChange={(e) => {
                                  const currentSettings = integrationSettings || {};
                                  handleIntegrationUpdate({
                                    ...currentSettings,
                                    mailchimp: {
                                      ...currentSettings.mailchimp,
                                      apiKey: e.target.value
                                    }
                                  });
                                }}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
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
          </Tabs>
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