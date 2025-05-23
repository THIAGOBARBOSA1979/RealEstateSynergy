import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import SectionEditor from "@/components/site-editor/section-editor";
import { Eye, Save } from "lucide-react";

const SiteEditor = () => {
  const [activeTab, setActiveTab] = useState("geral");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: websiteData, isLoading } = useQuery({
    queryKey: ['/api/users/me/website'],
  });

  const updateWebsiteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/users/me/website", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/website'] });
      toast({
        title: "Alterações salvas",
        description: "As alterações do seu site foram salvas com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (websiteData) {
      updateWebsiteMutation.mutate(websiteData);
    }
  };

  const updateField = (field: string, value: any) => {
    if (websiteData) {
      queryClient.setQueryData(['/api/users/me/website'], {
        ...websiteData,
        [field]: value,
      });
    }
  };

  const updateTheme = (field: string, value: any) => {
    if (websiteData) {
      queryClient.setQueryData(['/api/users/me/website'], {
        ...websiteData,
        theme: {
          ...websiteData.theme,
          [field]: value,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const website = websiteData || { 
    title: "", 
    domain: "", 
    theme: { 
      primaryColor: "#1a237e", 
      secondaryColor: "#00796b", 
      accentColor: "#ff9800",
      fontHeading: "Poppins",
      fontBody: "Inter"
    } 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Editor do Site</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={website.domain ? `https://${website.domain}` : "#"} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-1" />
              Visualizar
            </a>
          </Button>
          <Button onClick={handleSave} disabled={updateWebsiteMutation.isPending}>
            {updateWebsiteMutation.isPending ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="paginas">Páginas</TabsTrigger>
          <TabsTrigger value="integracao">Integrações</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-heading font-semibold">Informações Básicas</h2>
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="site-title">Título do Site</Label>
                    <Input 
                      id="site-title" 
                      value={website.title} 
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Este é o título principal que aparecerá no seu site.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="domain">Domínio</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        https://
                      </span>
                      <Input 
                        id="domain" 
                        className="rounded-l-none"
                        value={website.domain} 
                        onChange={(e) => updateField("domain", e.target.value)}
                        placeholder="seudominio.com.br"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entre com seu domínio personalizado ou use nosso subdomínio gratuito.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-heading font-semibold">Tema e Cores</h2>
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: website.theme?.primaryColor }} />
                      <Input 
                        id="primary-color" 
                        type="text" 
                        value={website.theme?.primaryColor} 
                        onChange={(e) => updateTheme("primaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: website.theme?.secondaryColor }} />
                      <Input 
                        id="secondary-color" 
                        type="text" 
                        value={website.theme?.secondaryColor} 
                        onChange={(e) => updateTheme("secondaryColor", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="accent-color">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: website.theme?.accentColor }} />
                      <Input 
                        id="accent-color" 
                        type="text" 
                        value={website.theme?.accentColor} 
                        onChange={(e) => updateTheme("accentColor", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="heading-font">Fonte de Títulos</Label>
                    <Select 
                      value={website.theme?.fontHeading} 
                      onValueChange={(value) => updateTheme("fontHeading", value)}
                    >
                      <SelectTrigger id="heading-font">
                        <SelectValue placeholder="Escolha uma fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Raleway">Raleway</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="body-font">Fonte de Texto</Label>
                    <Select 
                      value={website.theme?.fontBody} 
                      onValueChange={(value) => updateTheme("fontBody", value)}
                    >
                      <SelectTrigger id="body-font">
                        <SelectValue placeholder="Escolha uma fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paginas" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-heading font-semibold">Páginas e Seções</h2>
                <Separator />
                
                <p className="text-muted-foreground">
                  Adicione e organize as seções do seu site. Arraste para reordenar.
                </p>
                
                <div className="mt-6">
                  <SectionEditor 
                    websiteData={websiteData} 
                    updateWebsiteData={(newData) => {
                      queryClient.setQueryData(['/api/users/me/website'], newData);
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracao" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-heading font-semibold">Integrações</h2>
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="google-analytics">Google Analytics ID</Label>
                    <Input 
                      id="google-analytics" 
                      placeholder="UA-XXXXXXXXX-X ou G-XXXXXXXXXX"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                    <Input 
                      id="facebook-pixel" 
                      placeholder="XXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="custom-code">Código Personalizado</Label>
                    <Textarea 
                      id="custom-code" 
                      rows={6} 
                      placeholder="<!-- Insira código HTML, JavaScript ou CSS personalizado aqui -->"
                    />
                    <p className="text-xs text-muted-foreground">
                      Este código será inserido no cabeçalho de todas as páginas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SiteEditor;
