import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { 
  Building2, Plus, Search, Filter, 
  MoreHorizontal, Edit, Trash2, 
  Eye, Home, Tag, Calendar, Package, 
  BarChart4, ChevronRight, Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Development } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DevelopmentsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Buscar lista de empreendimentos
  const { data: developments, isLoading } = useQuery<Development[]>({
    queryKey: ['/api/developments'],
  });

  // Filtragem dos empreendimentos
  const filteredDevelopments = developments?.filter((development: Development) => {
    // Filtro por termo de busca
    const matchesSearch = development.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      development.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      development.address.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por tipo
    const matchesType = typeFilter === 'all' || development.developmentType === typeFilter;
    
    // Filtro por status
    const matchesStatus = statusFilter === 'all' || development.constructionStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

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

  // Calcular progresso de vendas
  const calculateSalesProgress = (development: Development): number => {
    const salesStatus = development.salesStatus as any;
    if (!salesStatus) return 0;
    
    const total = development.totalUnits || 0;
    const sold = salesStatus.sold || 0;
    const reserved = salesStatus.reserved || 0;
    
    if (total === 0) return 0;
    return Math.floor(((sold + reserved) / total) * 100);
  };

  // Função para deletar um empreendimento
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/developments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developments'] });
      toast({
        title: 'Empreendimento removido',
        description: 'O empreendimento foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover empreendimento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Verificar status de carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Empreendimentos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="mr-2 h-6 w-6" />
            Empreendimentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos imobiliários e suas unidades
          </p>
        </div>
        <Button onClick={() => navigate('/add-development')}>
          <Plus className="mr-2 h-4 w-4" /> Novo Empreendimento
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto flex-1 flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar empreendimentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="condominio_vertical">Condomínio Vertical</SelectItem>
              <SelectItem value="condominio_horizontal">Condomínio Horizontal</SelectItem>
              <SelectItem value="loteamento">Loteamento</SelectItem>
              <SelectItem value="apartamentos">Edifício de Apartamentos</SelectItem>
              <SelectItem value="casas">Casas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="planta">Na Planta</SelectItem>
              <SelectItem value="em_construcao">Em Construção</SelectItem>
              <SelectItem value="pronto">Pronto para Morar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <BarChart4 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredDevelopments?.length === 0 ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Nenhum empreendimento encontrado</CardTitle>
            <CardDescription>
              Não foram encontrados empreendimentos com os filtros aplicados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Tente ajustar os filtros de busca ou adicione um novo empreendimento.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/add-development')}>
              <Plus className="mr-2 h-4 w-4" /> Novo Empreendimento
            </Button>
          </CardFooter>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevelopments?.map((development) => (
            <Card key={development.id} className="flex flex-col overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center bg-gray-100 relative"
                style={{ 
                  backgroundImage: development.mainImage 
                    ? `url(${development.mainImage})` 
                    : 'none'
                }}
              >
                {!development.mainImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/development/${development.id}`)}>
                        <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/edit-development/${development.id}`)}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este empreendimento?')) {
                            deleteMutation.mutate(development.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <Badge className="mb-2" variant={development.featured ? "default" : "outline"}>
                    {development.featured ? "Destaque" : getDevelopmentTypeLabel(development.developmentType)}
                  </Badge>
                </div>
              </div>
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{development.name}</CardTitle>
                  <Badge variant={
                    development.constructionStatus === 'pronto' ? 'default' :
                    development.constructionStatus === 'em_construcao' ? 'secondary' : 'outline'
                  }>
                    {getConstructionStatusLabel(development.constructionStatus || '')}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {development.address}, {development.city} - {development.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {development.totalUnits} unidades
                    </span>
                  </div>
                  {development.deliveryDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        Entrega: {formatDate(development.deliveryDate)}
                      </span>
                    </div>
                  )}
                  {development.priceRange && (
                    <div className="flex items-center text-sm">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {formatCurrency((development.priceRange as any)?.min || 0)} - {formatCurrency((development.priceRange as any)?.max || 0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Vendas</span>
                      <span>
                        {calculateSalesProgress(development)}%
                      </span>
                    </div>
                    <Progress value={calculateSalesProgress(development)} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 mt-auto">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => navigate(`/development/${development.id}`)}
                >
                  Ver detalhes
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevelopments?.map((development) => (
                <TableRow key={development.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {development.mainImage ? (
                        <img 
                          src={development.mainImage} 
                          alt={development.name} 
                          className="w-10 h-10 mr-3 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 mr-3 rounded-md bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground/70" />
                        </div>
                      )}
                      <span>{development.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getDevelopmentTypeLabel(development.developmentType)}
                  </TableCell>
                  <TableCell>
                    {development.city}, {development.state}
                  </TableCell>
                  <TableCell>{development.totalUnits}</TableCell>
                  <TableCell>
                    <Badge variant={
                      development.constructionStatus === 'pronto' ? 'default' :
                      development.constructionStatus === 'em_construcao' ? 'secondary' : 'outline'
                    }>
                      {getConstructionStatusLabel(development.constructionStatus || '')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={calculateSalesProgress(development)} className="h-2 w-20" />
                      <span className="text-sm">{calculateSalesProgress(development)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/development/${development.id}`)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/edit-development/${development.id}`)}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este empreendimento?')) {
                              deleteMutation.mutate(development.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}