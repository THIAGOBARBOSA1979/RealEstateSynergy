import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink, 
  Plus,
  Trash,
  AlertTriangle,
  Webhook,
  CheckCircle,
  LinkIcon,
  LogIn
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PortalIntegrationsProps {
  isLoadingIntegrations: boolean;
  integrationSettings: any;
  updateIntegrationsMutation: any;
  handleIntegrationUpdate: (data: any) => void;
}

const PortalIntegrations: React.FC<PortalIntegrationsProps> = ({
  isLoadingIntegrations,
  integrationSettings,
  updateIntegrationsMutation,
  handleIntegrationUpdate
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [newPortalData, setNewPortalData] = useState({
    name: "",
    apiKey: "",
    portalId: "",
    url: ""
  });
  
  const PORTALS = [
    { 
      id: "zapimoveis", 
      name: "ZAP Imóveis", 
      description: "Maior portal de imóveis do Brasil",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQANGn5jk3mDoxFjfPKYwbMRnfO-MRpRyqU6Fz7fFHOig&s",
      fields: ["apiKey", "portalId"]
    },
    { 
      id: "vivareal", 
      name: "Viva Real", 
      description: "Portal imobiliário para compra, venda e aluguel",
      icon: "https://s1.vivareal.com/p/5-mobile/assets/9.32.0/app/common/images/favicon.png",
      fields: ["apiKey", "portalId", "userId"]
    },
    { 
      id: "imovelweb", 
      name: "Imóvel Web", 
      description: "Portal para anúncios de imóveis",
      icon: "https://www.imovelweb.com.br/nfavicon.ico",
      fields: ["apiKey", "accountId"]
    },
    { 
      id: "olx", 
      name: "OLX", 
      description: "Plataforma de anúncios classificados",
      icon: "https://static.olx.com.br/cd/listing/favicon.ico",
      fields: ["apiKey", "userId"]
    },
    { 
      id: "mercadolivre", 
      name: "Mercado Livre", 
      description: "Maior marketplace da América Latina",
      icon: "https://http2.mlstatic.com/ui/navigation/5.19.5/mercadolibre/favicon.svg",
      fields: ["apiKey", "sellerId", "accessToken"]
    },
    { 
      id: "chaves", 
      name: "Chaves na Mão", 
      description: "Portal especializado em imóveis",
      icon: "https://chavesnamao.com.br/favicon/favicon-32x32.png",
      fields: ["apiKey", "userId"]
    },
    { 
      id: "loft", 
      name: "Loft", 
      description: "Plataforma digital de compra e venda",
      icon: "https://loft.com.br/favicon.ico",
      fields: ["apiKey", "clientId"]
    }
  ];

  // Atualiza integração para um portal específico
  const updatePortalIntegration = (portalId: string, enabled: boolean, credentials: any = {}) => {
    const currentPortals = integrationSettings?.portals || {};
    const portalData = currentPortals[portalId] || { enabled: false, credentials: {} };
    
    const updatedPortals = {
      ...currentPortals,
      [portalId]: {
        ...portalData,
        enabled,
        credentials: {
          ...portalData.credentials,
          ...credentials
        }
      }
    };
    
    handleIntegrationUpdate({
      ...integrationSettings,
      portals: updatedPortals
    });
  };

  const addNewPortal = () => {
    if (!newPortalData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do portal é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const portalId = newPortalData.name.toLowerCase().replace(/\s+/g, "");
    
    updatePortalIntegration(portalId, true, {
      apiKey: newPortalData.apiKey,
      portalId: newPortalData.portalId,
      url: newPortalData.url
    });
    
    setNewPortalData({
      name: "",
      apiKey: "",
      portalId: "",
      url: ""
    });
    
    setIsPortalModalOpen(false);
    
    toast({
      title: "Portal adicionado",
      description: `${newPortalData.name} foi adicionado com sucesso.`
    });
  };

  const removePortalIntegration = (portalId: string) => {
    const currentPortals = integrationSettings?.portals || {};
    const { [portalId]: removedPortal, ...restPortals } = currentPortals;
    
    handleIntegrationUpdate({
      ...integrationSettings,
      portals: restPortals
    });
    
    toast({
      title: "Portal removido",
      description: `O portal foi removido com sucesso.`
    });
  };

  // Renderiza as credenciais de um portal
  const renderPortalCredentials = (portal: any, portalSettings: any) => {
    if (!portal || !portal.fields) return null;
    
    const credentials = portalSettings?.credentials || {};
    
    return (
      <div className="space-y-4 mt-4">
        {portal.fields.map((field: string) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={`${portal.id}-${field}`}>
              {field === "apiKey" ? "Chave de API" : 
               field === "portalId" ? "ID do Portal" :
               field === "userId" ? "ID do Usuário" :
               field === "sellerId" ? "ID do Vendedor" :
               field === "accessToken" ? "Token de Acesso" :
               field === "accountId" ? "ID da Conta" :
               field === "clientId" ? "ID do Cliente" :
               field.charAt(0).toUpperCase() + field.slice(1)}
            </Label>
            <Input
              id={`${portal.id}-${field}`}
              type={field.includes("key") || field.includes("token") ? "password" : "text"}
              value={credentials[field] || ""}
              placeholder={`Digite o ${field}`}
              onChange={(e) => {
                const newCredentials = { ...credentials, [field]: e.target.value };
                updatePortalIntegration(portal.id, true, newCredentials);
              }}
            />
          </div>
        ))}
        
        <div className="space-y-2">
          <Label htmlFor={`${portal.id}-webhook`}>URL do Webhook (Opcional)</Label>
          <Input
            id={`${portal.id}-webhook`}
            placeholder="URL para notificações"
            value={credentials.webhook || ""}
            onChange={(e) => {
              const newCredentials = { ...credentials, webhook: e.target.value };
              updatePortalIntegration(portal.id, true, newCredentials);
            }}
          />
          <p className="text-xs text-muted-foreground">
            URL para receber notificações de alterações no portal.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Integrações com Portais</h2>
          <p className="text-sm text-muted-foreground">
            Configure integrações com portais imobiliários para publicar seus imóveis automaticamente.
          </p>
        </div>
      </div>

      {/* Portais de Imóveis Conhecidos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Portais Habilitados</h3>
          <Button variant="outline" size="sm" onClick={() => setIsPortalModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Portal
          </Button>
        </div>

        {isLoadingIntegrations ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {PORTALS.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {PORTALS.map((portal) => {
                  const portalSettings = integrationSettings?.portals?.[portal.id];
                  const isEnabled = portalSettings?.enabled || false;
                  const hasCredentials = portalSettings?.credentials && 
                    Object.values(portalSettings.credentials).some(val => val);
                  
                  return (
                    <Card key={portal.id} className={`overflow-hidden border ${isEnabled ? 'border-primary/30' : ''}`}>
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center space-x-3">
                          {portal.icon ? (
                            <img src={portal.icon} alt={portal.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <ExternalLink className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-base">{portal.name}</CardTitle>
                            <CardDescription className="text-xs">{portal.description}</CardDescription>
                          </div>
                        </div>
                        <Switch 
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            updatePortalIntegration(portal.id, checked);
                          }}
                        />
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {isEnabled ? (
                          <>
                            <div className="flex items-center justify-between">
                              <Badge variant={hasCredentials ? "default" : "outline"} className="mb-2">
                                {hasCredentials ? "Configurado" : "Pendente"}
                              </Badge>
                              {hasCredentials && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-destructive"
                                  onClick={() => removePortalIntegration(portal.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {renderPortalCredentials(portal, portalSettings)}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              Ative esta integração para configurar as credenciais
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Webhook className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhum portal habilitado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione integrações com portais imobiliários para publicar seus imóveis automaticamente.
                  </p>
                  <Button onClick={() => setIsPortalModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Portal
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal para adicionar novo portal */}
      <Dialog open={isPortalModalOpen} onOpenChange={setIsPortalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Portal</DialogTitle>
            <DialogDescription>
              Configure as credenciais para integração com um novo portal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="portal-name">Nome do Portal</Label>
              <Input
                id="portal-name"
                placeholder="Ex: Portal de Imóveis XYZ"
                value={newPortalData.name}
                onChange={(e) => setNewPortalData({...newPortalData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="portal-api-key">Chave de API</Label>
              <Input
                id="portal-api-key"
                type="password"
                placeholder="Chave de API do portal"
                value={newPortalData.apiKey}
                onChange={(e) => setNewPortalData({...newPortalData, apiKey: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="portal-id">ID do Portal ou Usuário</Label>
              <Input
                id="portal-id"
                placeholder="ID associado à sua conta"
                value={newPortalData.portalId}
                onChange={(e) => setNewPortalData({...newPortalData, portalId: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="portal-url">URL do Portal (opcional)</Label>
              <Input
                id="portal-url"
                placeholder="https://www.exemplo.com.br"
                value={newPortalData.url}
                onChange={(e) => setNewPortalData({...newPortalData, url: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsPortalModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={addNewPortal}>
              Adicionar Portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seção de Integrações Configuradas */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Configurações de Sincronização</h3>
        </div>
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sincronização Automática</h4>
                <p className="text-sm text-muted-foreground">
                  Atualize automaticamente os imóveis nos portais integrados.
                </p>
              </div>
              <Switch 
                checked={integrationSettings?.autoSync || false}
                onCheckedChange={(checked) => {
                  handleIntegrationUpdate({
                    ...integrationSettings,
                    autoSync: checked
                  });
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificações de Sincronização</h4>
                <p className="text-sm text-muted-foreground">
                  Receba notificações sobre o status das sincronizações.
                </p>
              </div>
              <Switch 
                checked={integrationSettings?.syncNotifications || false}
                onCheckedChange={(checked) => {
                  handleIntegrationUpdate({
                    ...integrationSettings,
                    syncNotifications: checked
                  });
                }}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Leads Automáticos</h4>
                <p className="text-sm text-muted-foreground">
                  Crie leads automaticamente a partir dos contatos dos portais.
                </p>
              </div>
              <Switch 
                checked={integrationSettings?.autoLeads || false}
                onCheckedChange={(checked) => {
                  handleIntegrationUpdate({
                    ...integrationSettings,
                    autoLeads: checked
                  });
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Todas as configurações são salvas automaticamente
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Documentação e Suporte */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LinkIcon className="mr-2 h-5 w-5 text-primary" />
            Links e Documentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <LogIn className="mr-2 h-4 w-4" />
              Guia de Integração com Portais
            </Button>
            <Button variant="outline" className="justify-start">
              <LogIn className="mr-2 h-4 w-4" />
              Perguntas Frequentes
            </Button>
            <Button variant="outline" className="justify-start">
              <LogIn className="mr-2 h-4 w-4" />
              Suporte Técnico
            </Button>
            <Button variant="outline" className="justify-start">
              <LogIn className="mr-2 h-4 w-4" />
              Central de Ajuda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalIntegrations;