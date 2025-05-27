import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Query para verificar se o usuário está autenticado
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        return response.json() as Promise<User>;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const isAuthenticated = !!user && !error;
  const isLoading_ = isLoading;

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading_,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}