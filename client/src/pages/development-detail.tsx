import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Building2, MapPin, Calendar, Tag, 
  Home, Edit, ChevronLeft, ListFilter,
  Grid3X3, Table, PlusCircle, Search,
  GalleryVertical, Check, X, Info, MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Development, Unit } from '@shared/schema';

export default function DevelopmentDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [unitViewMode, setUnitViewMode] = useState<'grid' | 'table'>('grid');
  const [unitFilter, setUnitFilter] = useState('all');
  const [unitSearch, setUnitSearch] = useState('');
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [newUnitData, setNewUnitData] = useState<Partial<Unit>>({
    unitNumber: '',
    block: '',
    floor: undefined,
    unitType: '',
    bedrooms: undefined,
    bathrooms: undefined,
    area: undefined,
    privateArea: undefined,
    price: undefined,
    status: 'available'
  });

  // Buscar dados do empreendimento
  const { data: development, isLoading } = useQuery<Development>({
    queryKey: [`/api/developments/${id}`],
  });

  // Buscar unidades do empreendimento
  const { data: units, isLoading: isLoadingUnits } = useQuery<Unit[]>({
    queryKey: [`/api/developments/${id}/units`],
  });

  // Mutação para adicionar uma nova unidade
  const addUnitMutation = useMutation({
    mutationFn: async (unitData: Partial<Unit>) => {
      return apiRequest(`/api/developments/${id}/units`, {
        method: 'POST',
        body: JSON.stringify({
          ...unitData,
          developmentId: Number(id)
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/developments/${id}/units`] });
      queryClient.invalidateQueries({ queryKey: [`/api/developments/${id}`] });
      toast({
        title: 'Unidade adicionada',
        description: 'A unidade foi adicionada com sucesso.',
      });
      setIsAddUnitDialogOpen(false);
      setNewUnitData({
        unitNumber: '',
        block: '',
        floor: undefined,
        unitType: '',
        bedrooms: undefined,
        bathrooms: undefined,
        area: undefined,
        privateArea: undefined,
        price: undefined,
        status: 'available'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao adicionar unidade',
        description: error.message || 'Ocorreu um erro ao adicionar a unidade.',
        variant: 'destructive',
      });
    },
  });

  // Mutação para atualizar o status de uma unidade
  const updateUnitStatusMutation = useMutation({
    mutationFn: async ({ unitId, status }: { unitId: number, status: string }) => {
      return apiRequest(`/api/developments/${id}/units/${unitId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/developments/${id}/units`] });
      queryClient.invalidateQueries({ queryKey: [`/api/developments/${id}`] });
      toast({
        title: 'Status atualizado',
        description: 'O status da unidade foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Ocorreu um erro ao atualizar o status da unidade.',
        variant: 'destructive',
      });
    },
  });

  // Filtrar unidades
  const filteredUnits = units?.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(unitSearch.toLowerCase()) ||
      (unit.block && unit.block.toLowerCase().includes(unitSearch.toLowerCase())) ||
      (unit.unitType && unit.unitType.toLowerCase().includes(unitSearch.toLowerCase()));
    
    const matchesFilter = unitFilter === 'all' || unit.status === unitFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Função para adicionar nova unidade
  const handleAddUnit = () => {
    if (!newUnitData.unitNumber) {
      toast({
        title: 'Dados incompletos',
        description: 'O número/identificador da unidade é obrigatório.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newUnitData.price || newUnitData.price <= 0) {
      toast({
        title: 'Dados incompletos',
        description: 'Informe um preço válido para a unidade.',
        variant: 'destructive',
      });
      return;
    }
    
    addUnitMutation.mutate(newUnitData as Unit);
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

  // Tradução dos status de unidades
  const getUnitStatusLabel = (status: string): string => {
    const statuses: Record<string, string> = {
      'available': 'Disponível',
      'reserved': 'Reservado',
      'sold': 'Vendido'
    };
    return statuses[status] || status;
  };

  // Cor do badge para status de unidades
  const getUnitStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'available': return 'default';
      case 'reserved': return 'secondary';
      case 'sold': return 'destructive';
      default: return 'outline';
    }
  };

  // Calcular estatísticas do empreendimento
  const calculateStats = () => {
    if (!units) return { available: 0, reserved: 0, sold: 0, total: 0 };
    
    const available = units.filter(unit => unit.status === 'available').length;
    const reserved = units.filter(unit => unit.status === 'reserved').length;
    const sold = units.filter(unit => unit.status === 'sold').length;
    
    return {
      available,
      reserved,
      sold,
      total: units.length
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-muted rounded-lg animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-40 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-40 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!development) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Empreendimento não encontrado</CardTitle>
            <CardDescription>
              Não foi possível localizar o empreendimento solicitado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Verifique se o ID está correto ou se o empreendimento existe.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/developments')}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Empreendimentos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => navigate('/developments')}
            >
              <ChevronLeft className="h-4 w-4" /> Empreendimentos
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-bold">{development.name}</h1>
          </div>
          <p className="text-muted-foreground">
            {getDevelopmentTypeLabel(development.developmentType)} | {getConstructionStatusLabel(development.constructionStatus || '')}
          </p>
        </div>
        <Button onClick={() => navigate(`/edit-development/${id}`)}>
          <Edit className="mr-2 h-4 w-4" /> Editar Empreendimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-full md:col-span-2">
          <div 
            className="h-[300px] bg-cover bg-center rounded-t-lg relative"
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
          </div>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> 
                {development.address}, {development.city} - {development.state}
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {development.totalUnits} unidades
              </Badge>
              
              {development.deliveryDate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Entrega: {formatDate(development.deliveryDate)}
                </Badge>
              )}
            </div>
            
            <p className="mb-4 text-muted-foreground">{development.description}</p>
            
            {development.priceRange && (
              <div className="flex items-center mb-4">
                <Tag className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">
                  Faixa de preço: {formatCurrency((development.priceRange as any)?.min || 0)} - {formatCurrency((development.priceRange as any)?.max || 0)}
                </span>
              </div>
            )}
            
            {(development.amenities as string[])?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Comodidades</h3>
                <div className="flex flex-wrap gap-2">
                  {(development.amenities as string[]).map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-full md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Espelho de Vendas</CardTitle>
              <CardDescription>Status das unidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-green-600">{stats.available}</div>
                  <div className="text-sm text-muted-foreground">Disponíveis</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-amber-500">{stats.reserved}</div>
                  <div className="text-sm text-muted-foreground">Reservados</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-red-600">{stats.sold}</div>
                  <div className="text-sm text-muted-foreground">Vendidos</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <div className="flex h-2 mb-2 overflow-hidden rounded bg-gray-200">
                  <div 
                    className="bg-green-500" 
                    style={{width: `${stats.total ? (stats.available / stats.total) * 100 : 0}%`}}
                  ></div>
                  <div 
                    className="bg-amber-500" 
                    style={{width: `${stats.total ? (stats.reserved / stats.total) * 100 : 0}%`}}
                  ></div>
                  <div 
                    className="bg-red-500" 
                    style={{width: `${stats.total ? (stats.sold / stats.total) * 100 : 0}%`}}
                  ></div>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  {stats.total} unidades no total
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Empreendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Tipo:</div>
                <div>{getDevelopmentTypeLabel(development.developmentType)}</div>
                
                <div className="font-medium">Status:</div>
                <div>{getConstructionStatusLabel(development.constructionStatus || '')}</div>
                
                <div className="font-medium">Total de Unidades:</div>
                <div>{development.totalUnits}</div>
                
                {development.deliveryDate && (
                  <>
                    <div className="font-medium">Entrega:</div>
                    <div>{formatDate(development.deliveryDate)}</div>
                  </>
                )}
                
                <div className="font-medium">CEP:</div>
                <div>{development.zipCode}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Empreendimento</CardTitle>
              <CardDescription>
                Resumo e detalhes do empreendimento {development.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>Este empreendimento possui um total de {development.totalUnits} unidades, sendo:</p>
                <ul>
                  <li>{stats.available} unidades disponíveis para venda</li>
                  <li>{stats.reserved} unidades reservadas</li>
                  <li>{stats.sold} unidades vendidas</li>
                </ul>
                
                <p>Localizado em {development.address}, {development.city} - {development.state}, o empreendimento 
                está com status de construção "{getConstructionStatusLabel(development.constructionStatus || '')}".</p>
                
                {development.deliveryDate && (
                  <p>A entrega está prevista para {formatDate(development.deliveryDate)}.</p>
                )}
                
                <p>Para gerenciar as unidades deste empreendimento, acesse a aba "Unidades".</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="units" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Unidades</h2>
              <p className="text-muted-foreground">Gerencie as unidades do empreendimento</p>
            </div>
            <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Unidade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Unidade</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova unidade do empreendimento.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="unitNumber">Número/Identificador*</label>
                    <Input
                      id="unitNumber"
                      value={newUnitData.unitNumber || ''}
                      onChange={(e) => setNewUnitData({...newUnitData, unitNumber: e.target.value})}
                      placeholder="Ex: Apto 101 ou Casa 25"
                    />
                    <p className="text-xs text-muted-foreground">Identificação única da unidade</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="block">Bloco/Setor</label>
                    <Input
                      id="block"
                      value={newUnitData.block || ''}
                      onChange={(e) => setNewUnitData({...newUnitData, block: e.target.value})}
                      placeholder="Ex: Bloco A ou Torre 1"
                    />
                    <p className="text-xs text-muted-foreground">Bloco ou setor da unidade (se aplicável)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="floor">Andar</label>
                    <Input
                      id="floor"
                      type="number"
                      value={newUnitData.floor || ''}
                      onChange={(e) => setNewUnitData({
                        ...newUnitData, 
                        floor: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Ex: 10"
                    />
                    <p className="text-xs text-muted-foreground">Andar da unidade (para apartamentos)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="unitType">Tipo</label>
                    <Input
                      id="unitType"
                      value={newUnitData.unitType || ''}
                      onChange={(e) => setNewUnitData({...newUnitData, unitType: e.target.value})}
                      placeholder="Ex: Garden ou Tipo 1"
                    />
                    <p className="text-xs text-muted-foreground">Tipo ou modelo da unidade</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="bedrooms">Quartos</label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={newUnitData.bedrooms || ''}
                      onChange={(e) => setNewUnitData({
                        ...newUnitData, 
                        bedrooms: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Ex: 2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="bathrooms">Banheiros</label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={newUnitData.bathrooms || ''}
                      onChange={(e) => setNewUnitData({
                        ...newUnitData, 
                        bathrooms: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Ex: 2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="area">Área Total (m²)</label>
                    <Input
                      id="area"
                      type="number"
                      value={newUnitData.area || ''}
                      onChange={(e) => setNewUnitData({
                        ...newUnitData, 
                        area: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="Ex: 70.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="privateArea">Área Privativa (m²)</label>
                    <Input
                      id="privateArea"
                      type="number"
                      value={newUnitData.privateArea || ''}
                      onChange={(e) => setNewUnitData({
                        ...newUnitData, 
                        privateArea: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="Ex: 65.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="price">Preço (R$)*</label>
                    <Input
                      id="price"
                      type="number"
                      value={newUnitData.price || ''}
                      onChange={(e) => setNewUnitData({
                        ...newUnitData, 
                        price: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="Ex: 450000"
                    />
                    <p className="text-xs text-muted-foreground">Preço de venda da unidade</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="status">Status</label>
                    <Select 
                      value={newUnitData.status || 'available'} 
                      onValueChange={(value) => setNewUnitData({...newUnitData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="reserved">Reservado</SelectItem>
                        <SelectItem value="sold">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddUnitDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddUnit}
                    disabled={addUnitMutation.isPending}
                  >
                    {addUnitMutation.isPending ? 'Adicionando...' : 'Adicionar Unidade'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="w-full flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar unidades..."
                  className="pl-8"
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                />
              </div>
              
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="available">Disponíveis</SelectItem>
                  <SelectItem value="reserved">Reservados</SelectItem>
                  <SelectItem value="sold">Vendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={unitViewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setUnitViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={unitViewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setUnitViewMode('table')}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isLoadingUnits ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUnits?.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Nenhuma unidade encontrada</CardTitle>
                <CardDescription>
                  Não foram encontradas unidades com os filtros aplicados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Tente ajustar os filtros de busca ou adicione uma nova unidade.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setIsAddUnitDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Unidade
                </Button>
              </CardFooter>
            </Card>
          ) : unitViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredUnits?.map((unit) => (
                <Card key={unit.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{unit.unitNumber}</CardTitle>
                      <Badge variant={getUnitStatusBadgeVariant(unit.status)}>
                        {getUnitStatusLabel(unit.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {unit.block && `${unit.block} • `}
                      {unit.floor !== undefined && `Andar ${unit.floor} • `}
                      {unit.unitType && `${unit.unitType}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {unit.bedrooms !== undefined && (
                        <>
                          <div className="text-muted-foreground">Quartos:</div>
                          <div>{unit.bedrooms}</div>
                        </>
                      )}
                      
                      {unit.bathrooms !== undefined && (
                        <>
                          <div className="text-muted-foreground">Banheiros:</div>
                          <div>{unit.bathrooms}</div>
                        </>
                      )}
                      
                      {unit.area !== undefined && (
                        <>
                          <div className="text-muted-foreground">Área Total:</div>
                          <div>{unit.area} m²</div>
                        </>
                      )}
                      
                      {unit.privateArea !== undefined && (
                        <>
                          <div className="text-muted-foreground">Área Privativa:</div>
                          <div>{unit.privateArea} m²</div>
                        </>
                      )}
                      
                      <div className="text-muted-foreground">Preço:</div>
                      <div className="font-medium">{formatCurrency(unit.price)}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div>
                      {unit.status !== 'available' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => updateUnitStatusMutation.mutate({ 
                                  unitId: unit.id, 
                                  status: 'available' 
                                })}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como disponível</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {unit.status !== 'reserved' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => updateUnitStatusMutation.mutate({ 
                                  unitId: unit.id, 
                                  status: 'reserved' 
                                })}
                              >
                                <Info className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como reservado</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {unit.status !== 'sold' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => updateUnitStatusMutation.mutate({ 
                                  unitId: unit.id, 
                                  status: 'sold' 
                                })}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como vendido</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opções</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <GalleryVertical className="h-4 w-4 mr-2" /> Adicionar imagens
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Bloco</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Quartos</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits?.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                        <TableCell>{unit.block || '-'}</TableCell>
                        <TableCell>{unit.unitType || '-'}</TableCell>
                        <TableCell>{unit.area ? `${unit.area} m²` : '-'}</TableCell>
                        <TableCell>{unit.bedrooms || '-'}</TableCell>
                        <TableCell>{formatCurrency(unit.price)}</TableCell>
                        <TableCell>
                          <Badge variant={getUnitStatusBadgeVariant(unit.status)}>
                            {getUnitStatusLabel(unit.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {unit.status !== 'available' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => updateUnitStatusMutation.mutate({ 
                                        unitId: unit.id, 
                                        status: 'available' 
                                      })}
                                    >
                                      <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Marcar como disponível</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            {unit.status !== 'reserved' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => updateUnitStatusMutation.mutate({ 
                                        unitId: unit.id, 
                                        status: 'reserved' 
                                      })}
                                    >
                                      <Info className="h-4 w-4 text-amber-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Marcar como reservado</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            {unit.status !== 'sold' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => updateUnitStatusMutation.mutate({ 
                                        unitId: unit.id, 
                                        status: 'sold' 
                                      })}
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Marcar como vendido</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <GalleryVertical className="h-4 w-4 mr-2" /> Adicionar imagens
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}