import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Plus, 
  MoreVertical, 
  Search, 
  Filter, 
  TrendingUp, 
  Eye, 
  Share2, 
  Heart, 
  DollarSign,
  Building,
  MapPin,
  Calendar,
  Users,
  Award,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";

// Components
import AffiliationRequestDialog from "@/components/affiliate/affiliation-request-dialog";

const Affiliate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("marketplace");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isAffiliationDialogOpen, setIsAffiliationDialogOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("all_cities");
  const [typeFilter, setTypeFilter] = useState("all_types");
  const [statusFilter, setStatusFilter] = useState("all_status");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: marketplaceProperties, isLoading: isLoadingMarketplace } = useQuery({
    queryKey: ['/api/affiliate/marketplace'],
  });

  const { data: myAffiliations, isLoading: isLoadingMyAffiliations } = useQuery({
    queryKey: ['/api/affiliate/my-affiliations'],
  });

  const { data: myProperties, isLoading: isLoadingMyProperties } = useQuery({
    queryKey: ['/api/affiliate/my-properties'],
  });

  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'aprovado':
      case 'approved':
        return 'bg-success/10 text-success';
      case 'rejeitado':
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Handle property affiliation approval/rejection for property owners
  const handleAffiliationAction = (affiliationId: number, action: 'approve' | 'reject') => {
    // Add your logic here to handle approval or rejection of affiliation requests
    toast({
      title: action === 'approve' ? 'Afiliação aprovada' : 'Afiliação rejeitada',
      description: action === 'approve' 
        ? 'A solicitação de afiliação foi aprovada com sucesso.' 
        : 'A solicitação de afiliação foi rejeitada.',
    });
  };

  // Filtrar propriedades do marketplace
  const filteredMarketplaceProperties = marketplaceProperties?.filter((property: any) => {
    const matchesSearch = !searchTerm || 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = cityFilter === "all_cities" || property.city === cityFilter;
    const matchesType = typeFilter === "all_types" || property.type === typeFilter;
    const matchesStatus = statusFilter === "all_status" || property.status === statusFilter;
    
    return matchesSearch && matchesCity && matchesType && matchesStatus;
  }) || [];

  // Estatísticas do dashboard
  const stats = {
    totalAffiliations: myAffiliations?.length || 0,
    pendingRequests: myAffiliations?.filter((a: any) => a.status === 'pending')?.length || 0,
    approvedAffiliations: myAffiliations?.filter((a: any) => a.status === 'approved')?.length || 0,
    totalEarnings: 15750.00, // Valor exemplo - você pode conectar com dados reais
    availableProperties: filteredMarketplaceProperties.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Sistema de Afiliação</h1>
          <p className="text-muted-foreground">Gerencie suas afiliações e encontre novas oportunidades</p>
        </div>
      </div>

      {/* Painel de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Afiliações Ativas</p>
                <p className="text-lg font-semibold">{stats.totalAffiliations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-semibold">{stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
                <p className="text-lg font-semibold">{stats.approvedAffiliations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Ganhos</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Imóveis Disponíveis</p>
                <p className="text-lg font-semibold">{stats.availableProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-affiliations">Minhas Afiliações</TabsTrigger>
          <TabsTrigger value="my-properties">Meus Imóveis</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Input 
                placeholder="Buscar imóveis por título, localização ou tipo" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoadingMarketplace ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(marketplaceProperties || []).map((property: any) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      {/* Property image would render here */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <Badge className="bg-accent text-accent-foreground border-0">
                          {property.propertyType}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{property.title}</CardTitle>
                      <CardDescription>{property.address}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">{formatCurrency(property.price)}</span>
                        <Badge variant="outline" className="bg-success/10 text-success">
                          {property.commissionRate}% comissão
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {property.bedrooms} quartos • {property.bathrooms} banheiros • {property.area}m²
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1 inline" />
                        Publicado por: {property.owner.name}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsAffiliationDialogOpen(true);
                        }}
                      >
                        Solicitar Afiliação
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Affiliations Tab */}
          <TabsContent value="my-affiliations" className="space-y-6">
            <div className="bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-medium">Imóvel</TableHead>
                      <TableHead className="font-medium">Proprietário</TableHead>
                      <TableHead className="font-medium text-right">Comissão</TableHead>
                      <TableHead className="font-medium text-center">Status</TableHead>
                      <TableHead className="font-medium text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingMyAffiliations ? (
                      [...Array(3)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (myAffiliations && myAffiliations.length > 0) ? (
                      myAffiliations.map((affiliation: any) => (
                        <TableRow key={affiliation.id}>
                          <TableCell>
                            <div className="font-medium">{affiliation.property.title}</div>
                            <div className="text-xs text-muted-foreground">{affiliation.property.address}</div>
                          </TableCell>
                          <TableCell>{affiliation.owner.name}</TableCell>
                          <TableCell className="text-right font-medium">{affiliation.commissionRate}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={getStatusBadgeClass(affiliation.status)}>
                              {affiliation.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8">Detalhes</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-muted-foreground">Você ainda não tem afiliações.</p>
                          <Button variant="link" className="mt-2" onClick={() => setActiveTab("marketplace")}>
                            Explorar Marketplace
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* My Properties Tab */}
          <TabsContent value="my-properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Imóveis disponíveis para afiliação</p>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Imóvel
              </Button>
            </div>

            <div className="bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-medium">Imóvel</TableHead>
                      <TableHead className="font-medium text-right">Preço</TableHead>
                      <TableHead className="font-medium text-right">Comissão</TableHead>
                      <TableHead className="font-medium text-center">Afiliações</TableHead>
                      <TableHead className="font-medium text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingMyProperties ? (
                      [...Array(3)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (myProperties && myProperties.length > 0) ? (
                      myProperties.map((property: any) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-xs text-muted-foreground">{property.address}</div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(property.price)}
                          </TableCell>
                          <TableCell className="text-right">{property.commissionRate}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{property.affiliationsCount}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                Gerenciar
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 p-0 w-8">
                                <MoreVertical className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-muted-foreground">Você não tem imóveis disponíveis para afiliação.</p>
                          <Button variant="link" className="mt-2">
                            Adicionar Imóvel
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Affiliation Request Dialog */}
      {selectedProperty && (
        <AffiliationRequestDialog
          isOpen={isAffiliationDialogOpen}
          onClose={() => setIsAffiliationDialogOpen(false)}
          property={selectedProperty}
        />
      )}
    </div>
  );
};

export default Affiliate;
