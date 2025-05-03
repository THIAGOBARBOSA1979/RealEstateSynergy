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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PortalCredentialsProps {
  isOpen: boolean;
  onClose: () => void;
  integrationSettings: any;
}

export default function PortalCredentials({
  isOpen,
  onClose,
  integrationSettings,
}: PortalCredentialsProps) {
  const [activeTab, setActiveTab] = useState("zapimoveis");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update integrations mutation
  const updateIntegrationsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/users/me/integrations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/integrations'] });
      toast({
        title: "Credenciais atualizadas",
        description: "As credenciais dos portais foram atualizadas com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as credenciais dos portais.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = () => {
    updateIntegrationsMutation.mutate({
      ...integrationSettings,
    });
  };

  // Helper function to update portal credentials
  const updatePortalCredentials = (portal: string, field: string, value: any) => {
    if (!integrationSettings.portalCredentials) {
      integrationSettings.portalCredentials = {};
    }
    
    if (!integrationSettings.portalCredentials[portal]) {
      integrationSettings.portalCredentials[portal] = {};
    }
    
    queryClient.setQueryData(['/api/users/me/integrations'], {
      ...integrationSettings,
      portalCredentials: {
        ...integrationSettings.portalCredentials,
        [portal]: {
          ...integrationSettings.portalCredentials[portal],
          [field]: value,
          active: integrationSettings.portalCredentials[portal]?.active || false
        }
      }
    });
  };

  // Toggle portal active status
  const togglePortalActive = (portal: string, status: boolean) => {
    updatePortalCredentials(portal, 'active', status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Credenciais dos Portais Imobiliários</DialogTitle>
          <DialogDescription>
            Configure as credenciais para envio automático de imóveis aos portais.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="zapimoveis">ZAP Imóveis</TabsTrigger>
            <TabsTrigger value="vivareal">Viva Real</TabsTrigger>
            <TabsTrigger value="olx">OLX</TabsTrigger>
          </TabsList>

          {/* ZAP Imóveis */}
          <TabsContent value="zapimoveis" className="py-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">ZAP Imóveis</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground mr-2">Ativo</span>
                  <Switch 
                    checked={integrationSettings?.portalCredentials?.zapimoveis?.active || false}
                    onCheckedChange={(checked) => togglePortalActive('zapimoveis', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zapimoveisLogin">Login/Email</Label>
                    <Input
                      id="zapimoveisLogin"
                      value={integrationSettings?.portalCredentials?.zapimoveis?.login || ""}
                      onChange={(e) => updatePortalCredentials('zapimoveis', 'login', e.target.value)}
                      placeholder="Seu login no ZAP Imóveis"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zapimoveisPassword">Senha</Label>
                    <Input
                      id="zapimoveisPassword"
                      type="password"
                      value={integrationSettings?.portalCredentials?.zapimoveis?.password || ""}
                      onChange={(e) => updatePortalCredentials('zapimoveis', 'password', e.target.value)}
                      placeholder="Sua senha no ZAP Imóveis"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zapimoveisApiKey">Chave da API</Label>
                    <Input
                      id="zapimoveisApiKey"
                      value={integrationSettings?.portalCredentials?.zapimoveis?.apiKey || ""}
                      onChange={(e) => updatePortalCredentials('zapimoveis', 'apiKey', e.target.value)}
                      placeholder="Chave de API fornecida pelo ZAP Imóveis"
                    />
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    O ZAP Imóveis cobra por anúncio. Você pode configurar quais imóveis serão enviados individualmente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Viva Real */}
          <TabsContent value="vivareal" className="py-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">Viva Real</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground mr-2">Ativo</span>
                  <Switch 
                    checked={integrationSettings?.portalCredentials?.vivareal?.active || false}
                    onCheckedChange={(checked) => togglePortalActive('vivareal', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vivarealLogin">Login/Email</Label>
                    <Input
                      id="vivarealLogin"
                      value={integrationSettings?.portalCredentials?.vivareal?.login || ""}
                      onChange={(e) => updatePortalCredentials('vivareal', 'login', e.target.value)}
                      placeholder="Seu login no Viva Real"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vivarealPassword">Senha</Label>
                    <Input
                      id="vivarealPassword"
                      type="password"
                      value={integrationSettings?.portalCredentials?.vivareal?.password || ""}
                      onChange={(e) => updatePortalCredentials('vivareal', 'password', e.target.value)}
                      placeholder="Sua senha no Viva Real"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vivarealApiKey">Chave da API</Label>
                    <Input
                      id="vivarealApiKey"
                      value={integrationSettings?.portalCredentials?.vivareal?.apiKey || ""}
                      onChange={(e) => updatePortalCredentials('vivareal', 'apiKey', e.target.value)}
                      placeholder="Chave de API fornecida pelo Viva Real"
                    />
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    O Viva Real cobra por anúncio. Você pode configurar quais imóveis serão enviados individualmente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OLX */}
          <TabsContent value="olx" className="py-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">OLX</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground mr-2">Ativo</span>
                  <Switch 
                    checked={integrationSettings?.portalCredentials?.olx?.active || false}
                    onCheckedChange={(checked) => togglePortalActive('olx', checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="olxLogin">Login/Email</Label>
                    <Input
                      id="olxLogin"
                      value={integrationSettings?.portalCredentials?.olx?.login || ""}
                      onChange={(e) => updatePortalCredentials('olx', 'login', e.target.value)}
                      placeholder="Seu login na OLX"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="olxPassword">Senha</Label>
                    <Input
                      id="olxPassword"
                      type="password"
                      value={integrationSettings?.portalCredentials?.olx?.password || ""}
                      onChange={(e) => updatePortalCredentials('olx', 'password', e.target.value)}
                      placeholder="Sua senha na OLX"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="olxApiToken">Token da API</Label>
                    <Input
                      id="olxApiToken"
                      value={integrationSettings?.portalCredentials?.olx?.apiToken || ""}
                      onChange={(e) => updatePortalCredentials('olx', 'apiToken', e.target.value)}
                      placeholder="Token de API fornecido pela OLX"
                    />
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    A OLX cobra por anúncio. Você pode configurar quais imóveis serão enviados individualmente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={updateIntegrationsMutation.isPending}
          >
            {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar Credenciais"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}