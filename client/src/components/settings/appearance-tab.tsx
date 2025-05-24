import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Palette,
  Type,
  ImageIcon,
  Save,
  Eye,
  Info,
  Layers
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppearanceTabProps {
  isLoadingWebsite: boolean;
  isWebsiteError: boolean;
  websiteData: any;
  tempWebsiteData: any;
  updateWebsiteMutation: any;
  handleWebsiteUpdate: (data: any) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({
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

  // Preview de cores
  const getContrastColor = (hexColor: string) => {
    // Remove o # se existir
    const hex = hexColor.replace('#', '');
    
    // Converte para RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcula luminosidade
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retorna branco ou preto com base na luminosidade
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Aparência do Site</h2>
          <p className="text-sm text-muted-foreground">Personalize as cores, fontes e elementos visuais do seu site.</p>
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
              <Palette className="h-5 w-5 text-primary" />
              Cores e Temas
            </CardTitle>
            <CardDescription>
              Escolha as cores principais do seu site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <Label htmlFor="themeColor">Cor Principal</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="themeColor" 
                        type="color"
                        className="w-12 h-12 p-1 cursor-pointer"
                        defaultValue={currentData.themeColor || '#FF5A00'}
                        onChange={(e) => updateField('themeColor', e.target.value)}
                      />
                      <Input 
                        value={currentData.themeColor || '#FF5A00'}
                        className="flex-1"
                        onChange={(e) => updateField('themeColor', e.target.value)}
                      />
                    </div>
                    <div 
                      className="p-3 rounded-md text-center font-medium" 
                      style={{ 
                        backgroundColor: currentData.themeColor || '#FF5A00',
                        color: getContrastColor(currentData.themeColor || '#FF5A00')
                      }}
                    >
                      Prévia da cor principal
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="secondaryColor" 
                        type="color"
                        className="w-12 h-12 p-1 cursor-pointer"
                        defaultValue={currentData.secondaryColor || '#222222'}
                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                      />
                      <Input 
                        value={currentData.secondaryColor || '#222222'}
                        className="flex-1"
                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                      />
                    </div>
                    <div 
                      className="p-3 rounded-md text-center font-medium" 
                      style={{ 
                        backgroundColor: currentData.secondaryColor || '#222222',
                        color: getContrastColor(currentData.secondaryColor || '#222222')
                      }}
                    >
                      Prévia da cor secundária
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm font-medium mb-2">Prévia das Cores</p>
                  <div className="flex flex-col gap-2 p-4 border rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      <div 
                        className="h-16 w-16 rounded-md flex items-center justify-center text-xs font-bold" 
                        style={{ 
                          backgroundColor: currentData.themeColor || '#FF5A00',
                          color: getContrastColor(currentData.themeColor || '#FF5A00')
                        }}
                      >
                        Botões
                      </div>
                      <div 
                        className="h-16 w-16 rounded-md flex items-center justify-center text-xs font-bold" 
                        style={{ 
                          backgroundColor: currentData.secondaryColor || '#222222',
                          color: getContrastColor(currentData.secondaryColor || '#222222')
                        }}
                      >
                        Cabeçalho
                      </div>
                      <div 
                        className="h-16 w-16 rounded-md flex items-center justify-center text-xs font-bold border"
                        style={{ 
                          borderColor: currentData.themeColor || '#FF5A00',
                          color: currentData.themeColor || '#FF5A00'
                        }}
                      >
                        Bordas
                      </div>
                    </div>
                    <button 
                      className="px-4 py-2 rounded-md font-medium mt-2 w-32"
                      style={{ 
                        backgroundColor: currentData.themeColor || '#FF5A00',
                        color: getContrastColor(currentData.themeColor || '#FF5A00')
                      }}
                    >
                      Botão CTA
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Tipografia
            </CardTitle>
            <CardDescription>
              Escolha a fonte do seu site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Fonte Principal</Label>
                  <Select 
                    value={currentData.fontFamily || 'inter'} 
                    onValueChange={(value) => updateField('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Prévia da Fonte</p>
                  <div className="p-4 border rounded-lg">
                    <div className={`font-${currentData.fontFamily || 'inter'}`}>
                      <p className="text-2xl font-bold mb-2">Título Principal</p>
                      <p className="text-lg font-medium mb-2">Subtítulo do Site</p>
                      <p className="text-sm mb-2">Este é um exemplo de texto para mostrar como a fonte escolhida será exibida em seu site. Uma boa escolha de fonte contribui significativamente para a experiência do usuário.</p>
                      <p className="text-xs text-muted-foreground">Informações secundárias e notas de rodapé</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Imagens
            </CardTitle>
            <CardDescription>
              Configure as imagens do seu site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logoUrl" className="mb-2 block">Logo do Site</Label>
                      <Input 
                        id="logoUrl" 
                        placeholder="URL da sua logo" 
                        defaultValue={currentData.logoUrl || ''}
                        onChange={(e) => updateField('logoUrl', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Formatos suportados: PNG, JPG, SVG. Tamanho recomendado: 200x80px.
                      </p>
                    </div>
                    
                    {currentData.logoUrl && (
                      <div className="border p-4 rounded-md flex items-center justify-center bg-gray-50">
                        <img 
                          src={currentData.logoUrl} 
                          alt="Logo Preview" 
                          className="max-h-16 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/200x80?text=Logo+Preview';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="heroImageUrl" className="mb-2 block">Imagem do Banner</Label>
                      <Input 
                        id="heroImageUrl" 
                        placeholder="URL da imagem do banner" 
                        defaultValue={currentData.heroImageUrl || ''}
                        onChange={(e) => updateField('heroImageUrl', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Tamanho recomendado: 1920x600px.
                      </p>
                    </div>
                    
                    {currentData.heroImageUrl && (
                      <div className="border p-2 rounded-md bg-gray-50 h-32 overflow-hidden">
                        <img 
                          src={currentData.heroImageUrl} 
                          alt="Banner Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/1920x600?text=Banner+Preview';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Layout e Estrutura
            </CardTitle>
            <CardDescription>
              Configure a estrutura e layout do seu site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingWebsite ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Estilo de Exibição de Imóveis</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div 
                        className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                          (currentData.propertyDisplayStyle || 'grid') === 'grid' ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => updateField('propertyDisplayStyle', 'grid')}
                      >
                        <div className="grid grid-cols-2 gap-1 mb-2">
                          <div className="bg-gray-200 rounded h-10"></div>
                          <div className="bg-gray-200 rounded h-10"></div>
                          <div className="bg-gray-200 rounded h-10"></div>
                          <div className="bg-gray-200 rounded h-10"></div>
                        </div>
                        <p className="text-center text-sm font-medium">Grid</p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                          (currentData.propertyDisplayStyle || 'grid') === 'list' ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => updateField('propertyDisplayStyle', 'list')}
                      >
                        <div className="flex flex-col gap-1 mb-2">
                          <div className="bg-gray-200 rounded h-6 w-full"></div>
                          <div className="bg-gray-200 rounded h-6 w-full"></div>
                          <div className="bg-gray-200 rounded h-6 w-full"></div>
                        </div>
                        <p className="text-center text-sm font-medium">Lista</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Ordem de Exibição nas Seções</Label>
                    <div className="space-y-2 border rounded-md p-3">
                      <p className="text-sm font-medium">Ordem:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <span className="text-sm">1. Imóveis em Destaque</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <span className="text-sm">2. Sobre Mim</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <span className="text-sm">3. Depoimentos</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        A ordem das seções será aplicada na versão final.
                      </p>
                    </div>
                  </div>
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

export default AppearanceTab;