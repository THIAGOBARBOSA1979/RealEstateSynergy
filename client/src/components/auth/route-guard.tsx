import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Usuário não autenticado tentando acessar rota privada
        setLocation("/login");
      } else if (!requireAuth && isAuthenticated && redirectTo) {
        // Usuário autenticado em página pública com redirecionamento
        setLocation(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, setLocation]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-blue-600 rounded-full animate-pulse">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>
              <div className="space-y-2 w-full">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifica condições de acesso
  if (requireAuth && !isAuthenticated) {
    return null; // Redirecionamento já foi feito no useEffect
  }

  if (!requireAuth && isAuthenticated && redirectTo) {
    return null; // Redirecionamento já foi feito no useEffect
  }

  return <>{children}</>;
}

// Componente específico para proteger rotas privadas
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard requireAuth={true}>{children}</RouteGuard>;
}

// Componente específico para rotas públicas com redirecionamento
export function PublicRoute({ 
  children, 
  redirectTo = "/dashboard" 
}: { 
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <RouteGuard requireAuth={false} redirectTo={redirectTo}>
      {children}
    </RouteGuard>
  );
}