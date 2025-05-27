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
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Public Routes - Landing Page */}
        <Route path="/">
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        </Route>
        
        {/* Public Routes - Login */}
        <Route path="/login">
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        </Route>
        
        {/* Public Routes - Agent Websites */}
        <Route path="/agente/:agentId">
          <AgentWebsite />
        </Route>
        
        {/* Public Routes - Property Details */}
        <Route path="/imovel/:id">
          <PropertyDetailNew />
        </Route>
        
        {/* Super Admin Routes */}
        <Route path="/super-admin">
          <PrivateRoute>
            <div className="super-admin-layout">
              <SuperAdminPanel />
            </div>
          </PrivateRoute>
        </Route>
        
        {/* Private Routes - All Dashboard Area */}
        <Route path="/dashboard">
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/site-imobiliario">
          <PrivateRoute>
            <DashboardLayout>
              <SiteImobiliario />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/catalog">
          <PrivateRoute>
            <DashboardLayout>
              <Catalog />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/properties">
          <PrivateRoute>
            <DashboardLayout>
              <Properties />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/add-property">
          <PrivateRoute>
            <DashboardLayout>
              <AddProperty />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/edit-property/:id">
          <PrivateRoute>
            <DashboardLayout>
              <EditProperty />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/property-detail/:id">
          <PrivateRoute>
            <DashboardLayout>
              <PropertyDetailNew />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/favorites">
          <PrivateRoute>
            <DashboardLayout>
              <Favorites />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/developments">
          <PrivateRoute>
            <DashboardLayout>
              <Developments />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/add-development">
          <PrivateRoute>
            <DashboardLayout>
              <AddDevelopment />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/development-detail/:id">
          <PrivateRoute>
            <DashboardLayout>
              <DevelopmentDetail />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/crm">
          <PrivateRoute>
            <DashboardLayout>
              <CRM />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/affiliate">
          <PrivateRoute>
            <DashboardLayout>
              <Affiliate />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/client-portal">
          <PrivateRoute>
            <DashboardLayout>
              <ClientPortal />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/analytics">
          <PrivateRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/team">
          <PrivateRoute>
            <DashboardLayout>
              <Team />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        <Route path="/settings">
          <PrivateRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </PrivateRoute>
        </Route>
        
        {/* Fallback - 404 */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
