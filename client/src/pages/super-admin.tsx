import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Subscription } from "@/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Activity,
  Users,
  Home,
  Settings,
  CreditCard,
  HelpCircle,
  BarChart3,
  LogOut,
  Search,
  Bell,
  MoreVertical,
  PlusCircle,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

interface SuperAdminStat {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

const SuperAdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [userFilterPlan, setUserFilterPlan] = useState("all");
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });
  
  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users', { role: userFilterRole, plan: userFilterPlan }],
  });
  
  // Fetch subscriptions
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['/api/admin/subscriptions'],
  });
  
  // Fetch revenue data
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['/api/admin/revenue'],
  });
  
  // Mutation to update user status
  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, active }: { userId: number, active: boolean }) => {
      return apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao atualizar o status do usuário.",
        variant: "destructive",
      });
    },
  });
  
  // Filter users based on search term
  const filteredUsers = users?.filter((user: User) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  });
  
  // Stats cards data
  const statsCards: SuperAdminStat[] = [
    {
      title: "Total de Usuários",
      value: dashboardStats?.users?.total || 0,
      change: dashboardStats?.users?.change || 0,
      icon: <Users className="h-5 w-5" />,
      trend: dashboardStats?.users?.change >= 0 ? "up" : "down",
    },
    {
      title: "Receita Mensal",
      value: `R$ ${dashboardStats?.revenue?.monthly?.toLocaleString('pt-BR') || 0}`,
      change: dashboardStats?.revenue?.change || 0,
      icon: <CreditCard className="h-5 w-5" />,
      trend: dashboardStats?.revenue?.change >= 0 ? "up" : "down",
    },
    {
      title: "Imóveis Publicados",
      value: dashboardStats?.properties?.total || 0,
      change: dashboardStats?.properties?.change || 0,
      icon: <Home className="h-5 w-5" />,
      trend: dashboardStats?.properties?.change >= 0 ? "up" : "down",
    },
    {
      title: "Taxa de Conversão",
      value: `${dashboardStats?.conversion?.rate || 0}%`,
      change: dashboardStats?.conversion?.change || 0,
      icon: <Activity className="h-5 w-5" />,
      trend: dashboardStats?.conversion?.change >= 0 ? "up" : "down",
    },
  ];
  
  // Get plan badge color
  const getPlanBadgeClass = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get role badge color
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'agent':
        return 'bg-green-100 text-green-800';
      case 'assistant':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle user status change
  const handleStatusChange = (userId: number, active: boolean) => {
    updateUserStatus.mutate({ userId, active });
  };
  
  // Get user initials for avatar
  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="super-admin-panel flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="space-y-1">
          <Link href="/super-admin">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/super-admin/users">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Users className="h-5 w-5" />
              <span>Usuários</span>
            </a>
          </Link>
          <Link href="/super-admin/subscriptions">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <CreditCard className="h-5 w-5" />
              <span>Assinaturas</span>
            </a>
          </Link>
          <Link href="/super-admin/properties">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Home className="h-5 w-5" />
              <span>Imóveis</span>
            </a>
          </Link>
          <Link href="/super-admin/revenue">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Activity className="h-5 w-5" />
              <span>Receita</span>
            </a>
          </Link>
          <Link href="/super-admin/settings">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </a>
          </Link>
          
          <Separator className="my-4" />
          
          <Link href="/super-admin/help">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <HelpCircle className="h-5 w-5" />
              <span>Ajuda</span>
            </a>
          </Link>
          <Link href="/logout">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </a>
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard de Administração</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Super Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">admin@imobcloud.com.br</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoadingStats ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardDescription><Skeleton className="h-4 w-24" /></CardDescription>
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : (
              statsCards.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{stat.title}</CardDescription>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl">{stat.value}</CardTitle>
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                        {stat.icon}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : stat.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      ) : null}
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : ''}`}>
                        {stat.change > 0 && '+'}{stat.change}% desde o último mês
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Receita Mensal</CardTitle>
                  <Select defaultValue="6months">
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Últimos 30 dias</SelectItem>
                      <SelectItem value="6months">Últimos 6 meses</SelectItem>
                      <SelectItem value="1year">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRevenue ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      Gráfico de Receita Mensal<br />
                      (Dados de visualização)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Planos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Plano Básico</span>
                        <span className="font-medium">{dashboardStats?.plans?.basic || 0} usuários</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ 
                            width: `${dashboardStats?.plans?.basicPercentage || 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Plano Profissional</span>
                        <span className="font-medium">{dashboardStats?.plans?.professional || 0} usuários</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ 
                            width: `${dashboardStats?.plans?.professionalPercentage || 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Plano Empresarial</span>
                        <span className="font-medium">{dashboardStats?.plans?.enterprise || 0} usuários</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ 
                            width: `${dashboardStats?.plans?.enterprisePercentage || 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center py-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Relatório Completo
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Usuários Recentes</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={userFilterRole}
                    onValueChange={setUserFilterRole}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Corretor</SelectItem>
                      <SelectItem value="assistant">Assistente</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={userFilterPlan}
                    onValueChange={setUserFilterPlan}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="enterprise">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                        <DialogDescription>
                          Preencha os campos abaixo para criar um novo usuário na plataforma.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input id="fullName" placeholder="João Silva" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Nome de Usuário</Label>
                            <Input id="username" placeholder="joaosilva" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="joao@exemplo.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role">Tipo de Usuário</Label>
                            <Select defaultValue="agent">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="agent">Corretor</SelectItem>
                                <SelectItem value="assistant">Assistente</SelectItem>
                                <SelectItem value="client">Cliente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="plan">Plano</Label>
                            <Select defaultValue="basic">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o plano" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Básico</SelectItem>
                                <SelectItem value="professional">Profissional</SelectItem>
                                <SelectItem value="enterprise">Empresarial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Senha</Label>
                          <Input id="password" type="password" placeholder="********" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button>Criar Usuário</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredUsers?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.slice(0, 5).map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback>{getUserInitials(user.fullName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeClass(user.role)}>
                            {user.role === 'admin' ? 'Admin' : 
                             user.role === 'agent' ? 'Corretor' : 
                             user.role === 'assistant' ? 'Assistente' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPlanBadgeClass(user.planType)}>
                            {user.planType === 'basic' ? 'Básico' : 
                             user.planType === 'professional' ? 'Profissional' : 'Empresarial'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={user.active}
                              onCheckedChange={(checked) => handleStatusChange(user.id, checked)}
                            />
                            <span className={user.active ? 'text-green-600' : 'text-red-600'}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Gerenciar Usuário</DialogTitle>
                                <DialogDescription>
                                  {user.fullName} ({user.email})
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Ver Detalhes</span>
                                  <Button variant="outline" size="sm">
                                    Perfil Completo
                                  </Button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Editar Informações</span>
                                  <Button variant="outline" size="sm">
                                    Editar
                                  </Button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Resetar Senha</span>
                                  <Button variant="outline" size="sm">
                                    Resetar
                                  </Button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Alterar Plano</span>
                                  <Button variant="outline" size="sm">
                                    Mudar Plano
                                  </Button>
                                </div>
                                
                                <Separator />
                                
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-red-600">Excluir Usuário</span>
                                  <Button variant="destructive" size="sm">
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="mt-4 text-center">
                <Button variant="outline">
                  Ver Todos os Usuários
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Assinaturas Recentes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingSubscriptions ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                subscriptions?.slice(0, 3).map((subscription: Subscription) => (
                  <Card key={subscription.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: subscription.plan.id === 'basic' ? '#3b82f6' : subscription.plan.id === 'professional' ? '#8b5cf6' : '#f59e0b' }}></div>
                    <CardHeader>
                      <CardDescription>
                        {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                      </CardDescription>
                      <CardTitle>{subscription.plan.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Usuário:</span>
                          <span className="font-medium">{subscription.user?.fullName || `Usuário #${subscription.userId}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {subscription.status === 'active' ? 'Ativo' :
                             subscription.status === 'inactive' ? 'Inativo' :
                             subscription.status === 'pending' ? 'Pendente' :
                             subscription.status === 'cancelled' ? 'Cancelado' : 
                             subscription.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Próximo Pagamento:</span>
                          <span className="font-medium">
                            {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium">
                            R$ {subscription.plan.price.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminPanel;