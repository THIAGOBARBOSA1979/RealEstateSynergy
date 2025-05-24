import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ContinuousPropertyForm from "@/components/properties/continuous-property-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Home } from "lucide-react";

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [propertyId, setPropertyId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        setPropertyId(parsedId);
      } else {
        toast({
          title: "ID Inválido",
          description: "O ID da propriedade é inválido.",
          variant: "destructive",
        });
        navigate("/properties");
      }
    }
  }, [id, navigate, toast]);

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ['/api/properties', propertyId],
    enabled: !!propertyId,
  });

  if (isError) {
    return (
      <div className="container mx-auto max-w-5xl py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">Editar Imóvel</h1>
            <p className="text-muted-foreground mt-1">
              Ocorreu um erro ao carregar o imóvel.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/properties")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Imóveis
          </Button>
        </div>
        
        <Card className="border border-destructive shadow-sm p-8 text-center">
          <h2 className="text-xl font-medium text-destructive mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os dados do imóvel. Por favor, tente novamente mais tarde.
          </p>
          <Button onClick={() => navigate("/properties")}>
            Voltar para Imóveis
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold">Editar Imóvel</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                `Editando: ${property?.title || "Carregando..."}`
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/catalog")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Catálogo
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : property ? (
        <>
          <ContinuousPropertyForm 
            initialData={property}
            onSuccess={() => {
              navigate("/catalog");
              toast({
                title: "Imóvel atualizado",
                description: "O imóvel foi atualizado com sucesso",
              });
            }}
          />
        </>
      ) : (
        <Card className="border-t-4 border-t-destructive shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Imóvel não encontrado ou você não tem permissão para editá-lo.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/catalog")} 
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Catálogo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditProperty;