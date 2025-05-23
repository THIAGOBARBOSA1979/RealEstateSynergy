import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/utils";
import StatCard from "@/components/dashboard/stat-card";
import CrmPreview from "@/components/dashboard/crm-preview";
import LeadActivity from "@/components/dashboard/lead-activity";
import PerformanceRanking from "@/components/dashboard/performance-ranking";
import { DashboardStats } from "@/types";
import { 
  LayoutDashboard,
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Filter, 
  Calendar, 
  Home as HomeIcon,
  Users, 
  Globe,
  CalendarDays,
  TrendingUp,
  Eye,
  MapPin,
  ExternalLink
} from "lucide-react";

const Dashboard = () => {
  // Estado para filtros
  const [timeFilter, setTimeFilter] = useState<string>("today");
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Consultas de dados
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
  });
  
  // Data e hora atual para o cabeçalho
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Meta fictícia para demonstração
  const leadsTarget = 50;
  const progressStatus = stats?.leads
    ? (stats.leads / leadsTarget) * 100 
    : 0;
  
  // Renderizar o status do progresso com cor contextual
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600";
    if (progress >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Dashboard Header - Nova versão com mais informações contextuais */}
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-heading font-bold">Painel de Controle</h1>
            </div>
            <div className="text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-2">
              <span>Bem-vindo, {userLoading ? <Skeleton className="h-4 w-24 inline-block" /> : user?.fullName || 'Usuário'}!</span>
              <span className="hidden sm:block text-gray-400">•</span>
              <span className="text-xs md:text-sm text-gray-500 capitalize">{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select defaultValue={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="default" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" />
              <span>Novo Imóvel</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tabs para navegação entre diferentes visões */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:inline-flex w-full md:w-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
        </TabsList>
        
        {/* Tab de Visão Geral */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          {/* Cards de Estatísticas - Redesenhados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statsLoading ? (
              [...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-[150px] w-full rounded-lg" />
              ))
            ) : (
              <>
                <Card className="overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <div className="flex flex-col justify-between h-full z-10 relative">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Leads Totais</p>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-bold">{stats?.leads || 0}</h3>
                          <span className="text-xs font-medium text-muted-foreground">
                            de {leadsTarget}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${stats?.leadsChange && stats.leadsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats?.leadsChange && stats.leadsChange >= 0 ? (
                              <ArrowUp className="h-3 w-3 inline" />
                            ) : (
                              <ArrowDown className="h-3 w-3 inline" />
                            )}
                            {' '}{Math.abs(stats?.leadsChange || 0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
                          <Link href="/crm">
                            <span className="sr-only">Ver detalhes</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-l-4 border-l-blue-500">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Globe className="h-12 w-12 text-blue-500" />
                    </div>
                    <div className="flex flex-col justify-between h-full z-10 relative">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Visitas ao Site</p>
                        <h3 className="text-3xl font-bold">{stats?.websiteVisits || 0}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${stats?.websiteVisitsChange && stats.websiteVisitsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats?.websiteVisitsChange && stats.websiteVisitsChange >= 0 ? (
                              <ArrowUp className="h-3 w-3 inline" />
                            ) : (
                              <ArrowDown className="h-3 w-3 inline" />
                            )}
                            {' '}{Math.abs(stats?.websiteVisitsChange || 0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
                          <Link href="/analytics">
                            <span className="sr-only">Ver detalhes</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-l-4 border-l-purple-500">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <HomeIcon className="h-12 w-12 text-purple-500" />
                    </div>
                    <div className="flex flex-col justify-between h-full z-10 relative">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Imóveis Ativos</p>
                        <h3 className="text-3xl font-bold">{stats?.activeProperties || 0}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${stats?.propertiesChange && stats.propertiesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats?.propertiesChange && stats.propertiesChange >= 0 ? (
                              <ArrowUp className="h-3 w-3 inline" />
                            ) : (
                              <ArrowDown className="h-3 w-3 inline" />
                            )}
                            {' '}{Math.abs(stats?.propertiesChange || 0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
                          <Link href="/properties">
                            <span className="sr-only">Ver detalhes</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-l-4 border-l-amber-500">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CalendarDays className="h-12 w-12 text-amber-500" />
                    </div>
                    <div className="flex flex-col justify-between h-full z-10 relative">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Visitas Agendadas</p>
                        <h3 className="text-3xl font-bold">{stats?.visits || 0}</h3>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${stats?.visitsChange && stats.visitsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats?.visitsChange && stats.visitsChange >= 0 ? (
                              <ArrowUp className="h-3 w-3 inline" />
                            ) : (
                              <ArrowDown className="h-3 w-3 inline" />
                            )}
                            {' '}{Math.abs(stats?.visitsChange || 0)}%
                          </span>
                          <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="p-0 h-auto" asChild>
                          <Link href="/calendar">
                            <span className="sr-only">Ver detalhes</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Conteúdo Principal - Layout aprimorado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Coluna esquerda - CRM Preview e Imóveis */}
            <div className="lg:col-span-2 space-y-8">
              {/* CRM Preview Component */}
              <CrmPreview />

              {/* Card de Imóveis redesenhado */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded-md">
                      <HomeIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-heading font-semibold">Meus Imóveis</CardTitle>
                      <CardDescription>Imóveis recentemente adicionados ou atualizados</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/properties" className="gap-1">
                      <span>Ver Todos</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                
                <CardContent className="px-4 pt-0 pb-2">
                  {propertiesLoading ? (
                    <div className="space-y-4 py-4">
                      {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-20 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {properties && properties.properties && properties.properties.length > 0 ? (
                        properties.properties.slice(0, 3).map((property: any) => (
                          <div key={property.id} className="flex items-center justify-between py-4 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                {property.images && property.images.length > 0 ? (
                                  <img 
                                    src={property.images[0]} 
                                    alt={property.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <HomeIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <Link href={`/properties/${property.id}`}>
                                  <h4 className="font-medium text-sm hover:text-primary line-clamp-1">{property.title}</h4>
                                </Link>
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground line-clamp-1">{property.city}, {property.state}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="text-xs px-1.5 py-0">{getPropertyTypeLabel(property.propertyType)}</Badge>
                                  <Badge className={`text-xs px-1.5 py-0 ${
                                    property.status === 'sold' ? 'bg-red-100 text-red-600' : 
                                    property.status === 'reserved' ? 'bg-amber-100 text-amber-600' : 
                                    'bg-green-100 text-green-600'
                                  }`}>
                                    {property.status === 'active' ? 'Disponível' : 
                                     property.status === 'reserved' ? 'Reservado' : 
                                     property.status === 'sold' ? 'Vendido' : 
                                     property.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(property.price)}</div>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <Eye className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{property.views || 0} visualizações</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <HomeIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-medium mb-1">Nenhum imóvel encontrado</h3>
                          <p className="text-xs text-muted-foreground mb-4">Adicione seu primeiro imóvel para começar a receber contatos.</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/add-property" className="gap-1">
                              <Plus className="h-3.5 w-3.5" />
                              <span>Adicionar Imóvel</span>
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita - Atividades e Métricas */}
            <div className="space-y-8">
              {/* Card de Performance - Novo */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading font-semibold">Desempenho</CardTitle>
                    <CardDescription>Progresso em relação às metas mensais</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-6 py-2">
                    {statsLoading ? (
                      <Skeleton className="h-48 w-full" />
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div className="text-sm font-medium">Leads Conquistados</div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-bold text-lg">{stats?.leads || 0}</span>
                              <span className="text-xs text-muted-foreground">de {leadsTarget}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(progressStatus, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{Math.round(progressStatus)}% completo</span>
                            <span className={getProgressColor(progressStatus)}>
                              {progressStatus < 30 ? "Precisa melhorar" : 
                               progressStatus < 70 ? "Bom progresso" : 
                               "Excelente!"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-3xl font-bold">18%</div>
                            <div className="text-xs text-muted-foreground">Taxa de conversão</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-3xl font-bold">{formatCurrency(15000)}</div>
                            <div className="text-xs text-muted-foreground">Receita mensal</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Activity Component */}
              <LeadActivity />
            </div>
          </div>
        </TabsContent>
        
        {/* Tab de Leads */}
        <TabsContent value="leads" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Leads</CardTitle>
              <CardDescription>Visualize e gerencie seus leads em um só lugar</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Este painel fornecerá uma visão detalhada de seus leads. Selecione "Visão Geral" para retornar ao dashboard principal.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/crm">Ir para o CRM</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tab de Desempenho */}
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Desempenho</CardTitle>
              <CardDescription>Métricas detalhadas sobre o desempenho do seu negócio</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Este painel fornecerá análises detalhadas de desempenho. Selecione "Visão Geral" para retornar ao dashboard principal.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/analytics">Ver Análises Completas</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;