import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Building2, Plus, Search, Filter, 
  Trash2, MapPin, Calendar, Tag, 
  ArrowUpDown, Home, ListFilter, Grid
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Development } from '@shared/schema';

export default function DevelopmentsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [developmentToDelete, setDevelopmentToDelete] = useState<Development | null>(null);

  // Buscar empreendimentos
  const { data: developments, isLoading } = useQuery<Development[]>({
    queryKey: ['/api/developments'],
  });

  // Filtrar empreendimentos
  const filteredDevelopments = developments?.filter((development: Development) => {
    const matchesSearch = development.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      development.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      development.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || development.developmentType === typeFilter;
    const matchesStatus = statusFilter === 'all' || development.constructionStatus === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Ordenar empreendimentos
  const sortedDevelopments = filteredDevelopments?.sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if (sortBy === 'name') {
      valueA = a.name;
      valueB = b.name;
    } else if (sortBy === 'createdAt') {
      valueA = new Date(a.createdAt || '').getTime();
      valueB = new Date(b.createdAt || '').getTime();
    } else {
      valueA = new Date(a.updatedAt || '').getTime();
      valueB = new Date(b.updatedAt || '').getTime();
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Mutação para excluir empreendimento
  const deleteDevelopmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/developments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developments'] });
      toast({
        title: 'Empreendimento excluído',
        description: 'O empreendimento foi excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir empreendimento',
        description: error.message || 'Ocorreu um erro ao excluir o empreendimento.',
        variant: 'destructive',
      });
    },
  });

  // Handler para alternar a ordem
  const handleToggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Calcular progresso de vendas
  const calculateSalesProgress = (development: Development): number => {
    if (!development.salesStatus) return 0;
    
    try {
      const salesStatus = typeof development.salesStatus === 'string' 
        ? JSON.parse(development.salesStatus) 
        : development.salesStatus;
      
      const totalUnits = development.totalUnits || 0;
      const soldUnits = salesStatus?.sold || 0;
      
      return totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;
    } catch (error) {
      console.error('Error parsing sales status:', error);
      return 0;
    }
  };

  // Tradução dos tipos de empreendimento
  const getDevelopmentTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      'condominio_vertical': 'Condomínio Vertical',
      'condominio_horizontal': 'Condomínio Horizontal',
      'loteamento': 'Loteamento',
      'apartamentos': 'Edifício de Apartamentos',
      'casas': 'Casas'
    };
    return types[type] || type;
  };

  // Tradução dos status de construção
  const getConstructionStatusLabel = (status: string): string => {
    const statuses: Record<string, string> = {
      'planta': 'Na Planta',
      'em_construcao': 'Em Construção',
      'pronto': 'Pronto para Morar'
    };
    return statuses[status] || 'Não informado';
  };

  // Cor do badge para status de construção
  const getConstructionStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'planta': return 'outline';
      case 'em_construcao': return 'secondary';
      case 'pronto': return 'default';
      default: return 'outline';
    }
  };

  // Calcular estatísticas de vendas
  const getSalesStats = (development: Development) => {
    if (!development.salesStatus) return { available: 0, reserved: 0, sold: 0 };
    
    try {
      const salesStatus = typeof development.salesStatus === 'string' 
        ? JSON.parse(development.salesStatus) 
        : development.salesStatus;
      
      return {
        available: salesStatus?.available || 0,
        reserved: salesStatus?.reserved || 0,
        sold: salesStatus?.sold || 0
      };
    } catch (error) {
      console.error('Error parsing sales status:', error);
      return { available: 0, reserved: 0, sold: 0 };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Home className="h-6 w-6 mr-2" /> Empreendimentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos imobiliários, veja estatísticas e atualize informações
          </p>
        </div>
        <Button onClick={() => navigate('/add-development')} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" /> Novo Empreendimento
        </Button>
      </div>
      
      {/* Barra de filtros e visualização */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar empreendimentos..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="condominio_vertical">Condomínio Vertical</SelectItem>
              <SelectItem value="condominio_horizontal">Condomínio Horizontal</SelectItem>
              <SelectItem value="loteamento">Loteamento</SelectItem>
              <SelectItem value="apartamentos">Edifício de Apartamentos</SelectItem>
              <SelectItem value="casas">Casas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="planta">Na Planta</SelectItem>
              <SelectItem value="em_construcao">Em Construção</SelectItem>
              <SelectItem value="pronto">Pronto para Morar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={`flex-1 rounded-none ${viewMode === 'list' ? '' : 'border-r'}`}
              onClick={() => setViewMode('list')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="flex-1 rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Grade
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <ArrowUpDown className="h-4 w-4" />
                Ordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                Data de Criação {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                Última Atualização {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleSort}>
                {sortOrder === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tabs para segmentar empreendimentos */}
      <Tabs defaultValue="all" className="mt-4">
        <TabsList className="w-full max-w-md grid grid-cols-4">
          <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
            Todos
          </TabsTrigger>
          <TabsTrigger value="planta" onClick={() => setStatusFilter("planta")}>
            Na Planta
          </TabsTrigger>
          <TabsTrigger value="em_construcao" onClick={() => setStatusFilter("em_construcao")}>
            Em Construção
          </TabsTrigger>
          <TabsTrigger value="pronto" onClick={() => setStatusFilter("pronto")}>
            Prontos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {sortedDevelopments?.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Nenhum empreendimento encontrado</CardTitle>
                <CardDescription>
                  Não foram encontrados empreendimentos com os filtros aplicados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Tente ajustar os filtros de busca ou adicione um novo empreendimento.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/add-development')}>
                  <Plus className="mr-2 h-4 w-4" /> Novo Empreendimento
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedDevelopments?.map((development) => {
                    const salesProgress = calculateSalesProgress(development);
                    const salesStats = getSalesStats(development);
                    
                    return (
                      <Card key={development.id} className="overflow-hidden">
                        <div 
                          className="h-40 bg-cover bg-center relative"
                          style={{ 
                            backgroundImage: development.mainImage 
                              ? `url(${development.mainImage})` 
                              : 'none',
                            backgroundColor: !development.mainImage ? 'rgb(243, 244, 246)' : 'transparent'
                          }}
                        >
                          {!development.mainImage && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Building2 className="h-16 w-16 text-muted-foreground/40" />
                            </div>
                          )}
                          
                          <Badge 
                            className="absolute top-2 right-2" 
                            variant={getConstructionStatusBadgeVariant(development.constructionStatus || '')}
                          >
                            {getConstructionStatusLabel(development.constructionStatus || '')}
                          </Badge>
                        </div>
                        
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg truncate" title={development.name}>
                              {development.name}
                            </CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/development/${development.id}`)}>
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/edit-development/${development.id}`)}>
                                  Editar Empreendimento
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setDevelopmentToDelete(development)}
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription className="flex items-center text-xs">
                            <MapPin className="h-3 w-3 mr-1" /> 
                            {development.city}, {development.state}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground flex items-center">
                                <Home className="h-3 w-3 mr-1" /> Unidades
                              </span>
                              <span className="font-medium">{development.totalUnits}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground flex items-center">
                                <Tag className="h-3 w-3 mr-1" /> Preço
                              </span>
                              <span className="font-medium">
                                {development.priceRange ? (
                                  <>
                                    {formatCurrency((development.priceRange as any)?.min || 0)} - {formatCurrency((development.priceRange as any)?.max || 0)}
                                  </>
                                ) : 'Não informado'}
                              </span>
                            </div>
                            
                            {development.deliveryDate && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" /> Entrega
                                </span>
                                <span className="font-medium">{formatDate(development.deliveryDate)}</span>
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Vendas: {salesProgress}%</span>
                                <div className="flex gap-2">
                                  <span className="text-green-600">{salesStats.available} disponíveis</span>
                                  <span className="text-amber-500">{salesStats.reserved} reservados</span>
                                  <span className="text-red-600">{salesStats.sold} vendidos</span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${salesProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/development/${development.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">Nome</th>
                            <th className="text-left p-4">Tipo</th>
                            <th className="text-left p-4">Localização</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Unidades</th>
                            <th className="text-left p-4">Progresso</th>
                            <th className="text-right p-4">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedDevelopments?.map((development) => {
                            const salesProgress = calculateSalesProgress(development);
                            return (
                              <tr key={development.id} className="border-b hover:bg-muted/50">
                                <td className="p-4">
                                  <div className="font-medium">{development.name}</div>
                                </td>
                                <td className="p-4">
                                  {getDevelopmentTypeLabel(development.developmentType || '')}
                                </td>
                                <td className="p-4">
                                  {development.city}, {development.state}
                                </td>
                                <td className="p-4">
                                  <Badge variant={getConstructionStatusBadgeVariant(development.constructionStatus || '')}>
                                    {getConstructionStatusLabel(development.constructionStatus || '')}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  {development.totalUnits || 0}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${salesProgress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs">{salesProgress}%</span>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Filter className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => navigate(`/development/${development.id}`)}>
                                        Ver Detalhes
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => navigate(`/edit-development/${development.id}`)}>
                                        Editar Empreendimento
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => setDevelopmentToDelete(development)}
                                      >
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="planta" className="mt-6">
          {/* Conteúdo semelhante para empreendimentos na planta */}
        </TabsContent>
        
        <TabsContent value="em_construcao" className="mt-6">
          {/* Conteúdo semelhante para empreendimentos em construção */}
        </TabsContent>
        
        <TabsContent value="pronto" className="mt-6">
          {/* Conteúdo semelhante para empreendimentos prontos */}
        </TabsContent>
      </Tabs>
      
      <AlertDialog 
        open={developmentToDelete !== null} 
        onOpenChange={(open) => !open && setDevelopmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o empreendimento
              "{developmentToDelete?.name}" e todas as suas unidades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (developmentToDelete) {
                  deleteDevelopmentMutation.mutate(developmentToDelete.id);
                  setDevelopmentToDelete(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}