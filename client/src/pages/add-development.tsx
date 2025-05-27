import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Info, Building } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ContinuousDevelopmentForm from "@/components/developments/continuous-development-form";

const AddDevelopment = () => {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold">Adicionar Empreendimento</h1>
            <p className="text-muted-foreground mt-1">
              Preencha os dados do novo empreendimento e configure suas unidades
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/catalogo-imobiliario")} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Catálogo
          </Button>
        </div>
      </div>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Cadastro de Empreendimento</AlertTitle>
        <AlertDescription>
          Configure as informações gerais do empreendimento e adicione as unidades disponíveis.
          Você pode gerenciar individualmente cada unidade com suas características específicas.
        </AlertDescription>
      </Alert>
      
      <ContinuousDevelopmentForm 
        onSuccess={() => {
          navigate("/catalogo-imobiliario");
        }}
      />
    </div>
  );
};

export default AddDevelopment;