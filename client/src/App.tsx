import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Auth Components
import { PrivateRoute, PublicRoute } from "@/components/auth/route-guard";

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



function App() {
  const [location] = useLocation();
  
  // Determine if current route is public or private
  const isPublicRoute = location === "/" || location === "/login" || 
                       location.startsWith("/agente") || location.startsWith("/imovel");
  const isAdminRoute = location.startsWith("/super-admin");
  
  if (isPublicRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/">
            <PublicRoute redirectTo="/dashboard">
              <LandingPage />
            </PublicRoute>
          </Route>
          <Route path="/login">
            <PublicRoute redirectTo="/dashboard">
              <LoginPage />
            </PublicRoute>
          </Route>
          <Route path="/agente/:agentId" component={AgentWebsite} />
          <Route path="/imovel/:id" component={PropertyDetailNew} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (isAdminRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <PrivateRoute>
          <div className="super-admin-layout">
            <SuperAdminPanel />
          </div>
        </PrivateRoute>
        <Toaster />
      </QueryClientProvider>
    );
  }

  // Private dashboard routes
  return (
    <QueryClientProvider client={queryClient}>
      <PrivateRoute>
        <DashboardLayout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/site-imobiliario" component={SiteImobiliario} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/properties" component={Properties} />
            <Route path="/add-property" component={AddProperty} />
            <Route path="/edit-property/:id" component={EditProperty} />
            <Route path="/property-detail/:id" component={PropertyDetailNew} />
            <Route path="/favorites" component={Favorites} />
            <Route path="/developments" component={Developments} />
            <Route path="/add-development" component={AddDevelopment} />
            <Route path="/development-detail/:id" component={DevelopmentDetail} />
            <Route path="/crm" component={CRM} />
            <Route path="/affiliate" component={Affiliate} />
            <Route path="/client-portal" component={ClientPortal} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/team" component={Team} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </DashboardLayout>
      </PrivateRoute>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
