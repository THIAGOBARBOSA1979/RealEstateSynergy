import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import DashboardLayout from "@/components/layout/dashboard-layout";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import AddProperty from "@/pages/add-property";
import EditProperty from "@/pages/edit-property";
import Favorites from "@/pages/favorites";
import CRM from "@/pages/crm";
import SiteEditor from "@/pages/site-editor";
import Affiliate from "@/pages/affiliate";
import ClientPortal from "@/pages/client-portal";
import Analytics from "@/pages/analytics";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Novas páginas
import LandingPage from "@/pages/landing-page";
import AgentWebsite from "@/pages/agent-website";
import SuperAdminPanel from "@/pages/super-admin";

function Router() {
  return (
    <Switch>
      {/* Páginas públicas */}
      <Route path="/landing" component={LandingPage} />
      <Route path="/agente/:agentId" component={AgentWebsite} />
      
      {/* Painel Admin */}
      <Route path="/super-admin" component={SuperAdminPanel} />
      
      {/* Painel do Usuário */}
      <Route path="/" component={Dashboard} />
      <Route path="/properties" component={Properties} />
      <Route path="/add-property" component={AddProperty} />
      <Route path="/edit-property/:id" component={EditProperty} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/crm" component={CRM} />
      <Route path="/site-editor" component={SiteEditor} />
      <Route path="/affiliate" component={Affiliate} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/team" component={Team} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Verifica se está em uma página pública ou administrativa
  const isPublicPage = location.startsWith("/landing") || location.startsWith("/agente");
  const isSuperAdmin = location.startsWith("/super-admin");
  
  return (
    <QueryClientProvider client={queryClient}>
      {isPublicPage ? (
        // Renderiza sem o layout de dashboard para páginas públicas
        <Router />
      ) : isSuperAdmin ? (
        // Layout específico para super admin
        <div className="super-admin-layout">
          <Router />
        </div>
      ) : (
        // Layout normal para usuário logado
        <DashboardLayout>
          <Router />
        </DashboardLayout>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
