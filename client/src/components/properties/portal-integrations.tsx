import { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { AlertCircle, ExternalLink, Check, Settings, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Lista de portais imobiliários brasileiros
const imobiliaryPortals = [
  { id: "vivareal", name: "Viva Real", logo: "https://www.vivareal.com.br/favicon.ico", popular: true },
  { id: "zap", name: "ZAP Imóveis", logo: "https://www.zapimoveis.com.br/favicon.ico", popular: true },
  { id: "imovelweb", name: "ImovelWeb", logo: "https://www.imovelweb.com.br/favicon.ico", popular: true },
  { id: "olx", name: "OLX", logo: "https://www.olx.com.br/favicon.ico", popular: true },
  { id: "quintoandar", name: "QuintoAndar", logo: "https://www.quintoandar.com.br/favicon.ico", popular: true },
  { id: "lugarcerto", name: "Lugar Certo", logo: "https://www.lugarcerto.com.br/favicon.ico" },
  { id: "chaves", name: "Chaves na Mão", logo: "https://www.chavesnamao.com.br/favicon.ico" },
  { id: "trovit", name: "Trovit", logo: "https://www.trovit.com.br/favicon.ico" },
  { id: "loft", name: "Loft", logo: "https://www.loft.com.br/favicon.ico" },
  { id: "mitula", name: "Mitula", logo: "https://www.mitula.com.br/favicon.ico" },
  { id: "nestoria", name: "Nestoria", logo: "https://www.nestoria.com.br/favicon.ico" },
  { id: "mercadolivre", name: "Mercado Livre", logo: "https://www.mercadolivre.com.br/favicon.ico" },
  { id: "imovelguide", name: "Imóvel Guide", logo: "https://www.imovelguide.com.br/favicon.ico" },
  { id: "habitissimo", name: "Habitissimo", logo: "https://www.habitissimo.com.br/favicon.ico" },
  { id: "group", name: "Group Imóveis", logo: "https://www.groupzap.com/favicon.ico" },
  { id: "imobiliariaweb", name: "ImobiliariaWeb", logo: "https://www.imobiliariaweb.com.br/favicon.ico" },
  { id: "remax", name: "RE/MAX", logo: "https://www.remax.com.br/favicon.ico" },
  { id: "infoimoveis", name: "Info Imóveis", logo: "https://www.infoimoveis.com.br/favicon.ico" },
  { id: "dreamcasa", name: "Dream Casa", logo: "https://www.dreamcasa.com.br/favicon.ico" },
  { id: "portaldoimovel", name: "Portal do Imóvel", logo: "https://www.portaldoimovel.com.br/favicon.ico" },
  { id: "123i", name: "123i", logo: "https://www.123i.com.br/favicon.ico" },
  { id: "lopes", name: "Lopes", logo: "https://www.lopes.com.br/favicon.ico" },
  { id: "wimoveis", name: "WImóveis", logo: "https://www.wimoveis.com.br/favicon.ico" },
  { id: "jetimob", name: "Jetimob", logo: "https://www.jetimob.com/favicon.ico" },
  { id: "casamineira", name: "Casa Mineira", logo: "https://www.casamineira.com.br/favicon.ico" },
  { id: "portalvgv", name: "Portal VGV", logo: "https://www.portalvgv.com.br/favicon.ico" },
  { id: "apolar", name: "Apolar", logo: "https://www.apolar.com.br/favicon.ico" },
  { id: "ingaia", name: "inGaia", logo: "https://www.ingaia.com.br/favicon.ico" },
  { id: "okimob", name: "Okimob", logo: "https://www.okimob.com/favicon.ico" },
  { id: "imoveissc", name: "Imóveis SC", logo: "https://www.imoveissc.com.br/favicon.ico" },
  { id: "superimobiliare", name: "Super Imobiliare", logo: "https://www.superimobiliare.com.br/favicon.ico" },
];

interface PortalIntegrationsProps {
  form: any;
  property?: any;
}

const PortalIntegrations = ({ form, property }: PortalIntegrationsProps) => {
  const [activePortalTab, setActivePortalTab] = useState("popular");
  const publishedPortals = form.watch("publishedPortals") || [];
  
  const handleTogglePortal = (portalId: string, isChecked: boolean) => {
    const currentPortals = form.getValues("publishedPortals") || [];
    
    if (isChecked) {
      form.setValue("publishedPortals", [...currentPortals, portalId]);
    } else {
      form.setValue(
        "publishedPortals",
        currentPortals.filter((id: string) => id !== portalId)
      );
    }
  };

  const handleToggleAllPortals = (isChecked: boolean) => {
    if (isChecked) {
      const allPortalIds = imobiliaryPortals.map(portal => portal.id);
      form.setValue("publishedPortals", allPortalIds);
    } else {
      form.setValue("publishedPortals", []);
    }
  };

  const popularPortals = imobiliaryPortals.filter((portal) => portal.popular);
  const otherPortals = imobiliaryPortals.filter((portal) => !portal.popular);
  
  const isAllSelected = () => {
    return imobiliaryPortals.every(portal => 
      publishedPortals.includes(portal.id)
    );
  };

  const isPartiallySelected = () => {
    return publishedPortals.length > 0 && !isAllSelected();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Integrações com Portais</h2>
        
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  {field.value ? "Imóvel Publicado" : "Imóvel Não Publicado"}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Para publicar seu imóvel em portais imobiliários:</p>
          <ol className="text-sm text-muted-foreground list-decimal ml-4 mt-1 space-y-1">
            <li>Ative o botão "Imóvel Publicado" acima</li>
            <li>Selecione os portais onde deseja publicar este imóvel</li>
            <li>Configure as opções específicas de cada portal (se necessário)</li>
            <li>Salve o imóvel para iniciar a sincronização</li>
          </ol>
        </div>
      </div>
      
      {form.watch("published") && (
        <>
          <div className="flex items-center justify-between mb-4">
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={isAllSelected()}
                  onCheckedChange={handleToggleAllPortals}
                  className={isPartiallySelected() ? "opacity-70" : ""}
                />
              </FormControl>
              <FormLabel className="font-medium cursor-pointer">
                Selecionar todos os portais
              </FormLabel>
            </FormItem>
            
            <Badge variant="outline" className="ml-auto">
              {publishedPortals.length} de {imobiliaryPortals.length} selecionados
            </Badge>
          </div>
          
          <Tabs value={activePortalTab} onValueChange={setActivePortalTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="popular">Portais Populares</TabsTrigger>
              <TabsTrigger value="other">Outros Portais</TabsTrigger>
              <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="popular" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {popularPortals.map((portal) => (
                  <Card key={portal.id} className={`overflow-hidden ${publishedPortals.includes(portal.id) ? 'border-primary/30' : ''}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-background rounded-md overflow-hidden border">
                          <img 
                            src={portal.logo} 
                            alt={portal.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24?text=' + portal.name.charAt(0);
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{portal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {publishedPortals.includes(portal.id) ? 'Selecionado' : 'Não selecionado'}
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        checked={publishedPortals.includes(portal.id)}
                        onCheckedChange={(checked) => handleTogglePortal(portal.id, !!checked)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {otherPortals.map((portal) => (
                    <Card key={portal.id} className={`overflow-hidden ${publishedPortals.includes(portal.id) ? 'border-primary/30' : ''}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-background rounded-md overflow-hidden border">
                            <img 
                              src={portal.logo} 
                              alt={portal.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24?text=' + portal.name.charAt(0);
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{portal.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {publishedPortals.includes(portal.id) ? 'Selecionado' : 'Não selecionado'}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={publishedPortals.includes(portal.id)}
                          onCheckedChange={(checked) => handleTogglePortal(portal.id, !!checked)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Configurações por Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize as configurações específicas para cada portal selecionado. Estas configurações afetam como seu imóvel é exibido em cada plataforma.
                </p>
                
                {publishedPortals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Selecione portais na aba "Portais Populares" ou "Outros Portais"</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {publishedPortals.map((portalId: string) => {
                      const portal = imobiliaryPortals.find(p => p.id === portalId);
                      if (!portal) return null;
                      
                      return (
                        <Card key={portalId} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-background rounded-md overflow-hidden border">
                                  <img 
                                    src={portal.logo} 
                                    alt={portal.name}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24?text=' + portal.name.charAt(0);
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{portal.name}</p>
                                </div>
                              </div>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Abrir portal</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`portalConfig.${portalId}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título específico para {portal.name}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder={`Título para ${portal.name} (opcional)`}
                                        {...field}
                                        value={field.value || ''}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Deixe em branco para usar o título padrão do imóvel
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`portalConfig.${portalId}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Descrição específica</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder={`Descrição para ${portal.name} (opcional)`}
                                        {...field}
                                        value={field.value || ''}
                                        className="resize-none h-20"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex items-center gap-4">
                                <FormField
                                  control={form.control}
                                  name={`portalConfig.${portalId}.hidePrice`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer">Ocultar preço</FormLabel>
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`portalConfig.${portalId}.hideAddress`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer">Ocultar endereço</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={form.control}
                                name={`portalConfig.${portalId}.keywords`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Palavras-chave</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Palavras-chave separadas por vírgula"
                                        {...field}
                                        value={field.value || ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Status de Sincronização</h3>
                {property && property.id ? (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Configuração salva</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      O imóvel será sincronizado com os portais selecionados em até 24 horas.
                    </p>
                    
                    <div className="space-y-2">
                      {publishedPortals.map((portalId: string) => {
                        const portal = imobiliaryPortals.find(p => p.id === portalId);
                        if (!portal) return null;
                        
                        return (
                          <div key={portalId} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 flex items-center justify-center bg-background rounded-md overflow-hidden border">
                                <img 
                                  src={portal.logo} 
                                  alt={portal.name}
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/16?text=' + portal.name.charAt(0);
                                  }}
                                />
                              </div>
                              <span className="text-sm">{portal.name}</span>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Sincronizado
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      O status de sincronização estará disponível após salvar o imóvel.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PortalIntegrations;