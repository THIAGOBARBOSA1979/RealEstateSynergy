import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/users/me'],
  });

  // Fetch subscription data
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/users/me/subscription'],
  });

  // Fetch integration settings
  const { data: integrationSettings, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['/api/users/me/integrations'],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/users/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive",
      });
    },
  });

  // Update integrations mutation
  const updateIntegrationsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/users/me/integrations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/integrations'] });
      toast({
        title: "Integrações atualizadas",
        description: "Suas configurações de integração foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar suas configurações de integração.",
        variant: "destructive",
      });
    },
  });

  // Handle profile update
  const handleProfileUpdate = (formData: any) => {
    updateProfileMutation.mutate(formData);
  };

  // Handle integration update
  const handleIntegrationUpdate = (integrationData: any) => {
    updateIntegrationsMutation.mutate(integrationData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Configurações</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-md">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="domain">Domínio</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e informações de contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      defaultValue={profileData?.fullName}
                      onChange={(e) => {
                        queryClient.setQueryData(['/api/users/me'], {
                          ...profileData,
                          fullName: e.target.value,
                        });
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={profileData?.email}
                      onChange={(e) => {
                        queryClient.setQueryData(['/api/users/me'], {
                          ...profileData,
                          email: e.target.value,
                        });
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      defaultValue={profileData?.phone}
                      onChange={(e) => {
                        queryClient.setQueryData(['/api/users/me'], {
                          ...profileData,
                          phone: e.target.value,
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
                disabled={updateProfileMutation.isPending || isLoadingProfile}
              >
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Atualize sua senha e configure as opções de segurança da conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Alterar Senha</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seu Plano</CardTitle>
              <CardDescription>
                Gerenciamento do seu plano atual e faturamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSubscription ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">
                          Plano {subscriptionData?.plan?.name || "Básico"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Renovação em {subscriptionData?.nextBillingDate || "01/01/2024"}
                        </p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">
                        {subscriptionData?.status || "Ativo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Recursos do seu plano</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                        <span>{subscriptionData?.features?.propertyLimit || 50} imóveis</span>
                      </li>
                      <li className="flex items-center">
                        <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                        <span>{subscriptionData?.features?.teamMembers || 5} membros de equipe</span>
                      </li>
                      <li className="flex items-center">
                        <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                        <span>Site personalizado</span>
                      </li>
                      <li className="flex items-center">
                        <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                        <span>Integração com portais</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Histórico de Faturas</Button>
              <Button>Alterar Plano</Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Plano Básico</CardTitle>
                <CardDescription>Ideal para corretores iniciantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">R$ 99<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>10 imóveis</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>1 membro de equipe</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Site básico</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Selecionar</Button>
              </CardFooter>
            </Card>

            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-primary text-primary-foreground">POPULAR</Badge>
                </div>
                <CardTitle>Plano Professional</CardTitle>
                <CardDescription>Para corretores e pequenas imobiliárias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">R$ 199<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>50 imóveis</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>5 membros de equipe</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Site personalizado</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Integração com portais</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Selecionar</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plano Enterprise</CardTitle>
                <CardDescription>Para imobiliárias e construtoras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">R$ 399<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Imóveis ilimitados</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Equipe ilimitada</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Site avançado</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Todas as integrações</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="material-icons text-success mr-2 text-sm">check_circle</span>
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Selecionar</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Email</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novos Leads</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber emails quando um novo lead for gerado
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Agendamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber emails sobre agendamentos de visitas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Documentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber emails quando novos documentos forem enviados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novidades</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber emails sobre novidades da plataforma
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">WhatsApp</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Novos Leads</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no WhatsApp para novos leads
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Agendamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber lembretes de agendamentos via WhatsApp
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">In-App</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Atividades</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre atividades no sistema
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Atualizações</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre atualizações da plataforma
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salvar Preferências</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Domain Settings */}
        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Domínio</CardTitle>
              <CardDescription>
                Configure seu domínio personalizado e subdomínios para seu site de imóveis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Domínio padrão</h3>
                      <div className="flex items-center p-3 bg-muted rounded-md text-muted-foreground">
                        <span className="material-icons text-sm mr-2">info</span>
                        <span className="text-sm">
                          Seu site está disponível em <span className="font-medium text-foreground">admin-12345.meusite.com.br</span>
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-3">Domínio personalizado</h3>
                      <div className="flex items-center p-3 bg-yellow-50 rounded-md text-yellow-700 mb-4 border border-yellow-200">
                        <span className="material-icons text-sm mr-2">warning</span>
                        <span className="text-sm">
                          A configuração de domínio personalizado está disponível apenas para planos Professional e Enterprise.
                        </span>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="customDomain">Seu domínio personalizado</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="customDomain"
                            placeholder="seudominio.com.br"
                            defaultValue={profileData?.website?.domain || ""}
                            disabled={subscriptionData?.plan?.name !== "Professional" && subscriptionData?.plan?.name !== "Enterprise"}
                          />
                          <Button 
                            disabled={subscriptionData?.plan?.name !== "Professional" && subscriptionData?.plan?.name !== "Enterprise"}
                          >
                            Verificar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Digite seu domínio sem "www" ou "http://".
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-3">Configuração de DNS</h3>
                      <p className="text-sm mb-3 text-muted-foreground">
                        Para conectar seu domínio personalizado, adicione os seguintes registros DNS ao seu provedor de domínio:
                      </p>

                      <div className="bg-muted p-3 rounded-md mb-4 overflow-x-auto">
                        <table className="text-sm w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-2 font-medium">Tipo</th>
                              <th className="text-left pb-2 font-medium">Nome</th>
                              <th className="text-left pb-2 font-medium">Valor</th>
                              <th className="text-left pb-2 font-medium">TTL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 pr-4">A</td>
                              <td className="py-2 pr-4">@</td>
                              <td className="py-2 pr-4">192.168.10.123</td>
                              <td className="py-2">3600</td>
                            </tr>
                            <tr>
                              <td className="py-2 pr-4">CNAME</td>
                              <td className="py-2 pr-4">www</td>
                              <td className="py-2 pr-4">seudominio.com.br</td>
                              <td className="py-2">3600</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center p-3 bg-muted rounded-md text-muted-foreground">
                        <span className="material-icons text-sm mr-2">info</span>
                        <span className="text-sm">
                          As alterações de DNS podem levar até 48 horas para se propagar.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button
                disabled={subscriptionData?.plan?.name !== "Professional" && subscriptionData?.plan?.name !== "Enterprise"}
              >
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações de API</CardTitle>
              <CardDescription>
                Configure as integrações com serviços externos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingIntegrations ? (
                <div className="space-y-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  {/* Google Drive Integration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="material-icons text-secondary text-2xl">cloud</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Google Drive</h3>
                          <p className="text-sm text-muted-foreground">
                            Para armazenamento de documentos
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings?.googleDrive?.enabled || false}
                        onCheckedChange={(checked) => {
                          queryClient.setQueryData(['/api/users/me/integrations'], {
                            ...integrationSettings,
                            googleDrive: {
                              ...integrationSettings?.googleDrive,
                              enabled: checked,
                            },
                          });
                        }}
                      />
                    </div>
                    {integrationSettings?.googleDrive?.enabled && (
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="googleDriveToken">Token de Acesso</Label>
                          <Input
                            id="googleDriveToken"
                            value={integrationSettings?.googleDrive?.token || ""}
                            onChange={(e) => {
                              queryClient.setQueryData(['/api/users/me/integrations'], {
                                ...integrationSettings,
                                googleDrive: {
                                  ...integrationSettings?.googleDrive,
                                  token: e.target.value,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="googleDriveFolder">Pasta Base</Label>
                          <Input
                            id="googleDriveFolder"
                            value={integrationSettings?.googleDrive?.folder || "ImobConnect"}
                            onChange={(e) => {
                              queryClient.setQueryData(['/api/users/me/integrations'], {
                                ...integrationSettings,
                                googleDrive: {
                                  ...integrationSettings?.googleDrive,
                                  folder: e.target.value,
                                },
                              });
                            }}
                          />
                        </div>
                        <Button variant="secondary" size="sm">
                          Conectar com Google Drive
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Integration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                          <span className="material-icons text-success text-2xl">chat</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">WhatsApp</h3>
                          <p className="text-sm text-muted-foreground">
                            Para comunicação com clientes
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings?.whatsapp?.enabled || false}
                        onCheckedChange={(checked) => {
                          queryClient.setQueryData(['/api/users/me/integrations'], {
                            ...integrationSettings,
                            whatsapp: {
                              ...integrationSettings?.whatsapp,
                              enabled: checked,
                            },
                          });
                        }}
                      />
                    </div>
                    {integrationSettings?.whatsapp?.enabled && (
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="whatsappApiKey">API Key</Label>
                          <Input
                            id="whatsappApiKey"
                            value={integrationSettings?.whatsapp?.apiKey || ""}
                            onChange={(e) => {
                              queryClient.setQueryData(['/api/users/me/integrations'], {
                                ...integrationSettings,
                                whatsapp: {
                                  ...integrationSettings?.whatsapp,
                                  apiKey: e.target.value,
                                },
                              });
                            }}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="whatsappPhone">Número de Telefone</Label>
                          <Input
                            id="whatsappPhone"
                            value={integrationSettings?.whatsapp?.phone || ""}
                            onChange={(e) => {
                              queryClient.setQueryData(['/api/users/me/integrations'], {
                                ...integrationSettings,
                                whatsapp: {
                                  ...integrationSettings?.whatsapp,
                                  phone: e.target.value,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Portals Integration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-icons text-primary text-2xl">share</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Portais Imobiliários</h3>
                          <p className="text-sm text-muted-foreground">
                            Para publicação de imóveis em portais
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={integrationSettings?.portals?.enabled || false}
                        onCheckedChange={(checked) => {
                          queryClient.setQueryData(['/api/users/me/integrations'], {
                            ...integrationSettings,
                            portals: {
                              ...integrationSettings?.portals,
                              enabled: checked,
                            },
                          });
                        }}
                      />
                    </div>
                    {integrationSettings?.portals?.enabled && (
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="grid gap-2">
                          <Label>Portais Habilitados</Label>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="portalZap"
                                checked={integrationSettings?.portals?.zapImoveis || false}
                                onCheckedChange={(checked) => {
                                  queryClient.setQueryData(['/api/users/me/integrations'], {
                                    ...integrationSettings,
                                    portals: {
                                      ...integrationSettings?.portals,
                                      zapImoveis: checked,
                                    },
                                  });
                                }}
                              />
                              <Label htmlFor="portalZap">ZAP Imóveis</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="portalVivaReal"
                                checked={integrationSettings?.portals?.vivaReal || false}
                                onCheckedChange={(checked) => {
                                  queryClient.setQueryData(['/api/users/me/integrations'], {
                                    ...integrationSettings,
                                    portals: {
                                      ...integrationSettings?.portals,
                                      vivaReal: checked,
                                    },
                                  });
                                }}
                              />
                              <Label htmlFor="portalVivaReal">Viva Real</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="portalOLX"
                                checked={integrationSettings?.portals?.olx || false}
                                onCheckedChange={(checked) => {
                                  queryClient.setQueryData(['/api/users/me/integrations'], {
                                    ...integrationSettings,
                                    portals: {
                                      ...integrationSettings?.portals,
                                      olx: checked,
                                    },
                                  });
                                }}
                              />
                              <Label htmlFor="portalOLX">OLX</Label>
                            </div>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm">
                          Configurar Credenciais dos Portais
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleIntegrationUpdate(integrationSettings)}
                disabled={updateIntegrationsMutation.isPending || isLoadingIntegrations}
              >
                {updateIntegrationsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
