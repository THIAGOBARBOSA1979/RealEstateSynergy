import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import StatCard from "@/components/dashboard/stat-card";
import CrmPreview from "@/components/dashboard/crm-preview";
import LeadActivity from "@/components/dashboard/lead-activity";
import { DashboardStats } from "@/types";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
  });

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {userLoading ? <Skeleton className="h-4 w-24 inline-block" /> : user?.fullName || 'Usuário'}!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-sm gap-1">
            <span className="material-icons text-sm">calendar_today</span>
            Hoje
          </Button>
          <Button variant="outline" className="text-sm gap-1">
            <span className="material-icons text-sm">tune</span>
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          [...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-lg" />
          ))
        ) : (
          <>
            <StatCard
              title="Leads Totais"
              value={stats?.leads || 0}
              icon="people"
              change={{
                percentage: stats?.leadsChange || 0,
                label: "vs. mês anterior"
              }}
              iconColor="primary"
            />
            <StatCard
              title="Visitas ao Site"
              value={stats?.websiteVisits || 0}
              icon="language"
              change={{
                percentage: stats?.websiteVisitsChange || 0,
                label: "vs. mês anterior"
              }}
              iconColor="info"
            />
            <StatCard
              title="Imóveis Ativos"
              value={stats?.activeProperties || 0}
              icon="home"
              change={{
                percentage: stats?.propertiesChange || 0,
                label: "vs. mês anterior"
              }}
              iconColor="accent"
            />
            <StatCard
              title="Visitas Agendadas"
              value={stats?.visits || 0}
              icon="calendar_month"
              change={{
                percentage: stats?.visitsChange || 0,
                label: "vs. mês anterior"
              }}
              iconColor="secondary"
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - CRM Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* CRM Preview Component */}
          <CrmPreview />

          {/* Properties Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-heading font-semibold">Meus Imóveis</CardTitle>
                <CardDescription>Visualize seus imóveis ativos</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/properties">Ver Todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {propertiesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium px-4 py-3">Imóvel</th>
                        <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Tipo</th>
                        <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Cidade</th>
                        <th className="text-right font-medium px-4 py-3">Preço</th>
                        <th className="text-center font-medium px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties && Array.isArray(properties.properties) 
                        ? properties.properties.slice(0, 4).map((property: any) => (
                            <tr key={property.id} className="border-b border-border hover:bg-muted/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 mr-3 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="material-icons text-primary text-sm">home</span>
                                  </div>
                                  <span className="font-medium truncate max-w-[120px]">{property.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">{property.propertyType}</td>
                              <td className="px-4 py-3 hidden md:table-cell">{property.city}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(property.price)}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <Badge className={`${
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
                              </td>
                            </tr>
                          ))
                        : (
                          <tr>
                            <td colSpan={5} className="text-center p-4 text-muted-foreground">
                              Nenhum imóvel encontrado
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activities and Stats */}
        <div className="space-y-8">
          {/* Lead Activity Component */}
          <LeadActivity />

          {/* Performance Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading font-semibold">Desempenho</CardTitle>
              <CardDescription>Resumo de vendas e reservas</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    stroke="#e5e7eb" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="10" 
                    strokeDasharray="283"
                    strokeDashoffset="141.5" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold">50%</span>
                  <span className="text-xs text-muted-foreground">do objetivo mensal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-muted-foreground">Vendas</h4>
                  <p className="font-semibold">{formatCurrency(580000)}</p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-muted-foreground">Meta</h4>
                  <p className="font-semibold">{formatCurrency(1000000)}</p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-muted-foreground">Imóveis Vendidos</h4>
                  <p className="font-semibold">12</p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm text-muted-foreground">Conversão</h4>
                  <p className="font-semibold">25%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
