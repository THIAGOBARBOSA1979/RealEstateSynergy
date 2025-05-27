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

function PublicRouter() {
  return (
    <Switch>
      {/* Landing Page - Rota Raiz Pública */}
      <Route path="/">
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      </Route>
      
      {/* Login Page */}
      <Route path="/login">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>
      
      {/* Public Agent Websites */}
      <Route path="/agente/:agentId">
        <AgentWebsite />
      </Route>
      
      {/* Public Property Details */}
      <Route path="/imovel/:id">
        <PropertyDetailNew />
      </Route>
      
      {/* 404 for unmatched public routes */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function PrivateRouter() {
  return (
    <DashboardLayout>
      <Switch>
        {/* Dashboard - Área Privada Principal */}
        <Route path="/dashboard">
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        </Route>
        
        {/* Site Imobiliário - Interface do Site do Corretor */}
        <Route path="/site-imobiliario">
          <PrivateRoute>
            <SiteImobiliario />
          </PrivateRoute>
        </Route>
        
        {/* Property Management */}
        <Route path="/catalog">
          <PrivateRoute>
            <Catalog />
          </PrivateRoute>
        </Route>
        <Route path="/properties">
          <PrivateRoute>
            <Properties />
          </PrivateRoute>
        </Route>
        <Route path="/add-property">
          <PrivateRoute>
            <AddProperty />
          </PrivateRoute>
        </Route>
        <Route path="/edit-property/:id">
          <PrivateRoute>
            <EditProperty />
          </PrivateRoute>
        </Route>
        <Route path="/property-detail/:id">
          <PrivateRoute>
            <PropertyDetailNew />
          </PrivateRoute>
        </Route>
        <Route path="/favorites">
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        </Route>
        
        {/* Development Management */}
        <Route path="/developments">
          <PrivateRoute>
            <Developments />
          </PrivateRoute>
        </Route>
        <Route path="/add-development">
          <PrivateRoute>
            <AddDevelopment />
          </PrivateRoute>
        </Route>
        <Route path="/development-detail/:id">
          <PrivateRoute>
            <DevelopmentDetail />
          </PrivateRoute>
        </Route>
        
        {/* CRM & Business */}
        <Route path="/crm">
          <PrivateRoute>
            <CRM />
          </PrivateRoute>
        </Route>
        <Route path="/affiliate">
          <PrivateRoute>
            <Affiliate />
          </PrivateRoute>
        </Route>
        <Route path="/client-portal">
          <PrivateRoute>
            <ClientPortal />
          </PrivateRoute>
        </Route>
        
        {/* Analytics & Reports */}
        <Route path="/analytics">
          <PrivateRoute>
            <Analytics />
          </PrivateRoute>
        </Route>
        
        {/* Team & Settings */}
        <Route path="/team">
          <PrivateRoute>
            <Team />
          </PrivateRoute>
        </Route>
        <Route path="/settings">
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        </Route>
        
        {/* 404 for unmatched private routes */}
        <Route>
          <PrivateRoute>
            <NotFound />
          </PrivateRoute>
        </Route>
      </Switch>
    </DashboardLayout>
  );
}

function AdminRouter() {
  return (
    <div className="super-admin-layout">
      <Switch>
        <Route path="/super-admin">
          <PrivateRoute>
            <SuperAdminPanel />
          </PrivateRoute>
        </Route>
        <Route>
          <PrivateRoute>
            <NotFound />
          </PrivateRoute>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  
  // Determine routing strategy based on current path
  const isPublicRoute = location === "/" || location === "/login" || 
                       location.startsWith("/agente") || location.startsWith("/imovel");
  const isAdminRoute = location.startsWith("/super-admin");
  
  return (
    <QueryClientProvider client={queryClient}>
      {isPublicRoute ? (
        // Public routes (landing, login, agent websites, property details)
        <PublicRouter />
      ) : isAdminRoute ? (
        // Super Admin routes
        <AdminRouter />
      ) : (
        // Private authenticated routes (dashboard area)
        <PrivateRouter />
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
