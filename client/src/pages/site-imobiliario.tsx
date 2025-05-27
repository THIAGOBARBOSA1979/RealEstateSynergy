import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Eye, 
  Settings, 
  Palette, 
  Code, 
  BarChart3,
  ExternalLink,
  Smartphone,
  Monitor
} from "lucide-react";

export default function SiteImobiliarioPage() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const { data: website, isLoading } = useQuery({
    queryKey: ["/api/website"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Site Imobiliário</h1>
          <p className="text-muted-foreground">
            Gerencie e personalize seu site de imóveis profissional
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Site
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitas Hoje</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">+12%</Badge>
              <span className="text-xs text-muted-foreground ml-2">vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leads Gerados</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">+8%</Badge>
              <span className="text-xs text-muted-foreground ml-2">vs semana passada</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
                <p className="text-2xl font-bold">18%</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">+3%</Badge>
              <span className="text-xs text-muted-foreground ml-2">vs mês passado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Imóveis Ativos</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">5 novos</Badge>
              <span className="text-xs text-muted-foreground ml-2">esta semana</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Website Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview do Site</CardTitle>
                  <CardDescription>
                    Veja como seu site aparece para os visitantes
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`bg-gray-100 rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}>
                <div className="bg-white h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Seu Site Imobiliário</h3>
                      <p className="text-sm text-muted-foreground">
                        Preview da página inicial
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Settings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Personalizar Design
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Code className="h-4 w-4 mr-2" />
                Editar Conteúdo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurar SEO
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          {/* Site Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Site Online</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SSL Certificado</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Válido
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Performance</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Excelente
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SEO Score</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  85/100
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}