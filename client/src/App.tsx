import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import DashboardLayout from "@/components/layout/dashboard-layout";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import AddProperty from "@/pages/add-property";
import CRM from "@/pages/crm";
import SiteEditor from "@/pages/site-editor";
import Affiliate from "@/pages/affiliate";
import ClientPortal from "@/pages/client-portal";
import Analytics from "@/pages/analytics";
import Team from "@/pages/team";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/add" component={AddProperty} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <Router />
      </DashboardLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
