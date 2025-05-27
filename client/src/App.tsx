import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";

// Layout Components
import DashboardLayout from "@/components/layout/dashboard-layout";

// Public Pages
import LandingPage from "./pages/landing-page";
import LoginPage from "./pages/login";
import AgentWebsite from "./pages/agent-website";
import PropertyDetailNew from "./pages/property-detail-new";

// Private Pages - Dashboard Area
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import AddProperty from "@/pages/add-property";
import EditProperty from "@/pages/edit-property";
import Favorites from "@/pages/favorites";
import CRM from "@/pages/crm";
import Affiliate from "@/pages/affiliate";
import ClientPortal from "@/pages/client-portal";
import Analytics from "@/pages/analytics";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import Catalog from "./pages/catalog";

// Private Pages - Site Imobiliário
import SiteImobiliario from "./pages/site-imobiliario";

// Private Pages - Developments
import Developments from "./pages/developments";
import AddDevelopment from "./pages/add-development";
import DevelopmentDetail from "./pages/development-detail";

// Admin Pages
import SuperAdminPanel from "./pages/super-admin";

// Error Pages
import NotFound from "@/pages/not-found";

function AppContent() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Check if user needs to be redirected
  const isPublicRoute = location === "/" || location === "/login" || 
                       location.startsWith("/agente") || location.startsWith("/imovel");

  // Redirect authenticated users from public pages to dashboard
  if (isAuthenticated && (location === "/" || location === "/login")) {
    setLocation("/dashboard");
    return null;
  }

  // Redirect unauthenticated users from private pages to login
  if (!isAuthenticated && !isPublicRoute) {
    setLocation("/login");
    return null;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/agente/:agentId" component={AgentWebsite} />
      <Route path="/imovel/:id" component={PropertyDetailNew} />
      
      {/* Super Admin Route */}
      <Route path="/super-admin">
        <div className="super-admin-layout">
          <SuperAdminPanel />
        </div>
      </Route>
      
      {/* Private Routes with Dashboard Layout */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      <Route path="/site-imobiliario">
        <DashboardLayout>
          <SiteImobiliario />
        </DashboardLayout>
      </Route>
      
      <Route path="/catalog">
        <DashboardLayout>
          <Catalog />
        </DashboardLayout>
      </Route>
      
      <Route path="/properties">
        <DashboardLayout>
          <Properties />
        </DashboardLayout>
      </Route>
      
      <Route path="/add-property">
        <DashboardLayout>
          <AddProperty />
        </DashboardLayout>
      </Route>
      
      <Route path="/edit-property/:id">
        <DashboardLayout>
          <EditProperty />
        </DashboardLayout>
      </Route>
      
      <Route path="/property-detail/:id">
        <DashboardLayout>
          <PropertyDetailNew />
        </DashboardLayout>
      </Route>
      
      <Route path="/favorites">
        <DashboardLayout>
          <Favorites />
        </DashboardLayout>
      </Route>
      
      <Route path="/developments">
        <DashboardLayout>
          <Developments />
        </DashboardLayout>
      </Route>
      
      <Route path="/add-development">
        <DashboardLayout>
          <AddDevelopment />
        </DashboardLayout>
      </Route>
      
      <Route path="/development-detail/:id">
        <DashboardLayout>
          <DevelopmentDetail />
        </DashboardLayout>
      </Route>
      
      <Route path="/crm">
        <DashboardLayout>
          <CRM />
        </DashboardLayout>
      </Route>
      
      <Route path="/affiliate">
        <DashboardLayout>
          <Affiliate />
        </DashboardLayout>
      </Route>
      
      <Route path="/client-portal">
        <DashboardLayout>
          <ClientPortal />
        </DashboardLayout>
      </Route>
      
      <Route path="/analytics">
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      
      <Route path="/team">
        <DashboardLayout>
          <Team />
        </DashboardLayout>
      </Route>
      
      <Route path="/settings">
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      
      {/* 404 - Not Found */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
