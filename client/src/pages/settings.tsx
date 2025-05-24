import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Settings as SettingsIcon, 
  Palette, 
  Link, 
  KeyRound,
  Laptop,
  FileText,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Componentes de UI
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Componentes de Configurações
import SiteTab from "@/components/settings/site-tab";
import AppearanceTab from "@/components/settings/appearance-tab";
import PortalIntegrations from "@/components/settings/portal-integrations";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/users/me/subscription'],
  });

  // Dados temporários para o website (solução alternativa)
  const tempWebsiteData = {
    title: "Meu Site Imobiliário",
    domain: "meusimoveis.com.br",
    theme: {
      primaryColor: "#1a237e",
      secondaryColor: "#00796b",
      accentColor: "#ff9800",
      fontHeading: "Poppins",
      fontBody: "Inter"
    },
    analytics: {
      googleAnalyticsId: "",
      facebookPixelId: "",
      tiktokPixelId: "",
      googleAdsId: "",
      gtmContainerId: ""
    },
    utmSettings: {
      enableUtmTracking: false,
      defaultUtmSource: "imobconnect",
      defaultUtmMedium: "website",
      defaultUtmCampaign: "organic",
      saveUtmParameters: true
    },
    socialMedia: {
      instagram: "",
      facebook: "",
      youtube: ""
    },
    customJs: "",
    customCss: "",
    tagline: "Encontre seu imóvel ideal",
    description: "Site especializado em imóveis de alto padrão",
    showFeaturedProperties: true,
    showTestimonials: true,
    showAboutSection: true,
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    creci: "",
    address: ""
  };

  const { data: websiteData, isLoading: isLoadingWebsite, isError: isWebsiteError } = useQuery({
    queryKey: ['/api/users/me/website'],
    staleTime: 0, // Sempre refetcha ao visitar a página
    retry: 0,     // Não tenta novamente em caso de erro
    onError: () => {
      console.log("Usando dados temporários do website devido a erro de autorização");
    }
  });

  const { data: integrationSettings, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['/api/users/me/integrations'],
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile) => apiRequest('/api/users/me', 'PUT', updatedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Houve um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    },
  });

  const updateWebsiteMutation = useMutation({
    mutationFn: (updatedWebsite) => apiRequest('/api/users/me/website', 'PUT', updatedWebsite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/website'] });
      toast({
        title: "Website atualizado",
        description: "As configurações do seu website foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar website",
        description: error.message || "Houve um erro ao atualizar as configurações do website.",
        variant: "destructive",
      });
    },
  });

  const updateIntegrationsMutation = useMutation({
    mutationFn: (updatedIntegrations) => apiRequest('/api/users/me/integrations', 'PUT', updatedIntegrations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/integrations'] });
      toast({
        title: "Integrações atualizadas",
        description: "Suas integrações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar integrações",
        description: error.message || "Houve um erro ao atualizar suas integrações.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleProfileUpdate = (updatedProfile) => {
    updateProfileMutation.mutate(updatedProfile);
  };

  const handleWebsiteUpdate = (updatedWebsite) => {
    updateWebsiteMutation.mutate(updatedWebsite);
  };

  const handleIntegrationUpdate = (updatedIntegrations) => {
    updateIntegrationsMutation.mutate(updatedIntegrations);
  };

  return (
    <div className="container py-8 relative w-full mx-auto space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações e preferências
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="profile" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>

        {/* Perfil Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e de contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingProfile ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      defaultValue={profileData?.name || ""} 
                      onChange={(e) => {
                        handleProfileUpdate({
                          ...profileData,
                          name: e.target.value
                        });
                      }}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={profileData?.email || ""} 
                      onChange={(e) => {
                        handleProfileUpdate({
                          ...profileData,
                          email: e.target.value
                        });
                      }}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      defaultValue={profileData?.phone || ""} 
                      onChange={(e) => {
                        handleProfileUpdate({
                          ...profileData,
                          phone: e.target.value
                        });
                      }}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="creci">CRECI</Label>
                    <Input 
                      id="creci" 
                      defaultValue={profileData?.creci || ""} 
                      onChange={(e) => {
                        handleProfileUpdate({
                          ...profileData,
                          creci: e.target.value
                        });
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button
                onClick={() => handleProfileUpdate(profileData)}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Site Settings */}
        <TabsContent value="site">
          <SiteTab 
            isLoadingWebsite={isLoadingWebsite}
            isWebsiteError={isWebsiteError}
            websiteData={websiteData}
            tempWebsiteData={tempWebsiteData}
            updateWebsiteMutation={updateWebsiteMutation}
            handleWebsiteUpdate={handleWebsiteUpdate}
            subscriptionData={subscriptionData}
          />
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <AppearanceTab 
            isLoadingWebsite={isLoadingWebsite}
            isWebsiteError={isWebsiteError}
            websiteData={websiteData}
            tempWebsiteData={tempWebsiteData}
            updateWebsiteMutation={updateWebsiteMutation}
            handleWebsiteUpdate={handleWebsiteUpdate}
          />
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <PortalIntegrations
            isLoadingIntegrations={isLoadingIntegrations}
            integrationSettings={integrationSettings}
            updateIntegrationsMutation={updateIntegrationsMutation}
            handleIntegrationUpdate={handleIntegrationUpdate}
          />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configurações de segurança de sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingProfile ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="2fa">Autenticação de dois fatores</Label>
                      <div className="text-sm text-muted-foreground">
                        Adicione segurança extra à sua conta.
                      </div>
                    </div>
                    <Switch id="2fa" />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Salvando..." : "Atualizar Senha"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configurações avançadas e opções de exclusão de conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="data-export">Exportar Dados</Label>
                <p className="text-sm text-muted-foreground">
                  Exporte todos os seus dados para um arquivo JSON.
                </p>
                <Button variant="outline" className="mt-2">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground">
                  Cuidado! Estas ações são irreversíveis.
                </p>
                
                <div className="space-y-4 pt-2">
                  <div className="rounded-md border border-destructive/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-destructive">Excluir Conta</h4>
                        <p className="text-sm text-muted-foreground">
                          Todos os seus dados serão permanentemente excluídos.
                        </p>
                      </div>
                      <Button variant="destructive">
                        Excluir Conta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;