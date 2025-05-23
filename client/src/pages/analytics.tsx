import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, Line, Pie } from "recharts";
import { Download, Globe, Users, TrendingUp, Home } from "lucide-react";

const Analytics = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: [`/api/analytics?timeframe=${timeframe}`],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="website">Site</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Visitantes Totais
                      </CardTitle>
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData?.overview?.visitors.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.visitorsChange >= 0 ? '+' : ''}
                        {analyticsData?.overview?.visitorsChange}% vs. período anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Leads Gerados
                      </CardTitle>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData?.overview?.leads.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.leadsChange >= 0 ? '+' : ''}
                        {analyticsData?.overview?.leadsChange}% vs. período anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Taxa de Conversão
                      </CardTitle>
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData?.overview?.conversionRate.toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.conversionRateChange >= 0 ? '+' : ''}
                        {analyticsData?.overview?.conversionRateChange}% vs. período anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Imóveis Vendidos
                      </CardTitle>
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData?.overview?.sales.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.salesChange >= 0 ? '+' : ''}
                        {analyticsData?.overview?.salesChange}% vs. período anterior
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho ao Longo do Tempo</CardTitle>
                  <CardDescription>Visitantes e leads ao longo do período selecionado</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <div className="h-full">
                      {/* Recharts would go here */}
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Gráfico de linha com dados de desempenho ao longo do tempo
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fontes de Tráfego</CardTitle>
                  <CardDescription>De onde seus visitantes estão vindo</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <div className="h-full">
                      {/* Recharts would go here */}
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Gráfico de pizza mostrando distribuição de fontes de tráfego
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Imóvel</CardTitle>
                <CardDescription>Quais imóveis estão recebendo mais atenção</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <div className="h-full">
                    {/* Recharts would go here */}
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Gráfico de barras mostrando visualizações e leads por imóvel
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Tab */}
          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise do Site</CardTitle>
                <CardDescription>Dados detalhados sobre o desempenho do seu site</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Métricas detalhadas do site serão exibidas aqui
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Leads</CardTitle>
                <CardDescription>Dados detalhados sobre a geração e conversão de leads</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Métricas detalhadas de leads serão exibidas aqui
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Vendas</CardTitle>
                <CardDescription>Dados detalhados sobre vendas e receita</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Métricas detalhadas de vendas serão exibidas aqui
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Analytics;
