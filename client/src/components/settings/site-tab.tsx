import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  MessageSquare,
  Share2,
  Info,
  Save,
  Eye
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface SiteTabProps {
  isLoadingWebsite: boolean;
  isWebsiteError: boolean;
  websiteData: any;
  tempWebsiteData: any;
  updateWebsiteMutation: any;
  handleWebsiteUpdate: (data: any) => void;
}

const SiteTab: React.FC<SiteTabProps> = ({
  isLoadingWebsite,
  isWebsiteError,
  websiteData,
  tempWebsiteData,
  updateWebsiteMutation,
  handleWebsiteUpdate
}) => {
  const queryClient = useQueryClient();
  
  // Use dados temporários se houver erro de autorização
  const currentData = isWebsiteError ? tempWebsiteData : websiteData || tempWebsiteData;
  
  const updateField = (field: string, value: any) => {
    queryClient.setQueryData(['/api/users/me/website'], {
      ...currentData,
      [field]: value
    });
  };
  
  const updateSocialMedia = (field: string, value: string) => {
    const currentSocialMedia = isWebsiteError 
      ? tempWebsiteData.socialMedia 
      : websiteData?.socialMedia || {};
      
    queryClient.setQueryData(['/api/users/me/website'], {
      ...currentData,
      socialMedia: {
        ...currentSocialMedia,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Configurações do Site</h2>
          <p className="text-sm text-muted-foreground">Configure seu site profissional para atrair clientes e converter visitantes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Eye className="h-4 w-4" />
            <span>Visualizar Site</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Informações Gerais
            </CardTitle>
            <CardDescription>
              Configure as informações básicas do seu site imobiliário.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input 
                      id="siteName" 
                      placeholder="Nome do seu site" 
                      defaultValue={currentData?.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Slogan</Label>
                    <Input 
                      id="tagline" 
                      placeholder="Slogan ou frase de efeito" 
                      defaultValue={currentData?.tagline || ''}
                      onChange={(e) => updateField('tagline', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descrição do Site</Label>
                  <Textarea 
                    id="siteDescription" 
                    placeholder="Descreva seu site e serviços em poucas palavras..." 
                    className="resize-none h-24"
                    defaultValue={currentData?.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Esta descrição será usada para SEO e meta tags para melhorar o posicionamento do seu site.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Seções Visíveis
            </CardTitle>
            <CardDescription>
              Escolha quais seções deseja exibir em seu site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between space-y-1">
                  <div className="flex flex-col">
                    <span className="font-medium">Imóveis em Destaque</span>
                    <span className="text-xs text-muted-foreground">Exibir seus melhores imóveis</span>
                  </div>
                  <Switch 
                    checked={currentData.showFeaturedProperties}
                    onCheckedChange={(checked) => updateField('showFeaturedProperties', checked)}
                  />
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between space-y-1">
                  <div className="flex flex-col">
                    <span className="font-medium">Depoimentos</span>
                    <span className="text-xs text-muted-foreground">Exibir depoimentos de clientes</span>
                  </div>
                  <Switch 
                    checked={currentData.showTestimonials}
                    onCheckedChange={(checked) => updateField('showTestimonials', checked)}
                  />
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between space-y-1">
                  <div className="flex flex-col">
                    <span className="font-medium">Sobre Mim</span>
                    <span className="text-xs text-muted-foreground">Exibir seção sobre seu trabalho</span>
                  </div>
                  <Switch 
                    checked={currentData.showAboutSection}
                    onCheckedChange={(checked) => updateField('showAboutSection', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Informações de Contato
            </CardTitle>
            <CardDescription>
              Configure suas informações profissionais de contato.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contato</Label>
                    <Input 
                      id="contactEmail" 
                      type="email" 
                      placeholder="seu@email.com" 
                      defaultValue={currentData.contactEmail || ''}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefone de Contato</Label>
                    <Input 
                      id="contactPhone" 
                      placeholder="(00) 00000-0000" 
                      defaultValue={currentData.contactPhone || ''}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input 
                      id="whatsapp" 
                      placeholder="(00) 00000-0000" 
                      defaultValue={currentData.whatsapp || ''}
                      onChange={(e) => updateField('whatsapp', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creci">CRECI</Label>
                    <Input 
                      id="creci" 
                      placeholder="Número do CRECI" 
                      defaultValue={currentData.creci || ''}
                      onChange={(e) => updateField('creci', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    placeholder="Endereço do escritório" 
                    defaultValue={currentData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Redes Sociais
            </CardTitle>
            <CardDescription>
              Conecte suas redes sociais ao site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input 
                    id="instagram" 
                    placeholder="@seuinstagram" 
                    defaultValue={currentData.socialMedia?.instagram || ''}
                    onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input 
                    id="facebook" 
                    placeholder="URL do Facebook" 
                    defaultValue={currentData.socialMedia?.facebook || ''}
                    onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input 
                    id="youtube" 
                    placeholder="URL do canal" 
                    defaultValue={currentData.socialMedia?.youtube || ''}
                    onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={() => handleWebsiteUpdate(queryClient.getQueryData(['/api/users/me/website']))}
          disabled={updateWebsiteMutation.isPending}
          size="lg"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {updateWebsiteMutation.isPending ? "Salvando alterações..." : "Salvar todas as alterações"}
        </Button>
      </div>
    </div>
  );
};

export default SiteTab;