import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/stat-card";
import LeadActivity from "@/components/dashboard/lead-activity";
import WebsitePreview from "@/components/dashboard/website-preview";
import CrmPreview from "@/components/dashboard/crm-preview";
import PropertyTable from "@/components/dashboard/property-table";
import { Link } from "wouter";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const userName = userLoading ? 'Usuário' : user?.fullName?.split(' ')[0] || 'Usuário';

  return (
    <div>
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary mb-2">Bem-vindo, {userName}!</h1>
        <p className="text-muted-foreground">Aqui está um resumo da sua atividade imobiliária hoje.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Leads este mês"
          value={statsLoading ? "..." : stats?.leads || 0}
          icon="person_add"
          iconColor="primary"
          change={{ percentage: 12, label: "vs. mês anterior" }}
        />
        <StatCard
          title="Visitas agendadas"
          value={statsLoading ? "..." : stats?.visits || 0}
          icon="calendar_today"
          iconColor="accent"
          change={{ percentage: 8, label: "vs. mês anterior" }}
        />
        <StatCard
          title="Imóveis ativos"
          value={statsLoading ? "..." : stats?.activeProperties || 0}
          icon="home"
          iconColor="secondary"
          change={{ percentage: -3, label: "vs. mês anterior" }}
        />
        <StatCard
          title="Acessos ao site"
          value={statsLoading ? "..." : stats?.websiteVisits || 0}
          icon="language"
          iconColor="info"
          change={{ percentage: 18, label: "vs. mês anterior" }}
        />
      </div>

      {/* Lead Activity and Website Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <LeadActivity />
        </div>
        <div>
          <WebsitePreview userId={userLoading ? 1 : user?.id} />
        </div>
      </div>

      {/* CRM Preview */}
      <div className="mb-8">
        <CrmPreview />
      </div>

      {/* Property Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold">Gerenciamento de Imóveis</h3>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/properties/new">
                <span className="material-icons text-sm mr-1">add</span>
                Adicionar Imóvel
              </Link>
            </Button>
            <Button variant="link" className="text-primary hover:text-primary-dark" asChild>
              <Link href="/properties">Ver Todos</Link>
            </Button>
          </div>
        </div>

        <PropertyTable limit={3} />
      </div>
    </div>
  );
};

export default Dashboard;
