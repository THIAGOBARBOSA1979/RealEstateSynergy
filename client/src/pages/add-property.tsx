import { useLocation, Link } from "wouter";
import ContinuousPropertyForm from "@/components/properties/continuous-property-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Info, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AddProperty = () => {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold">Adicionar Imóvel</h1>
            <p className="text-muted-foreground mt-1">
              Preencha os dados do novo imóvel para adicionar ao seu catálogo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/catalog")} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Catálogo
          </Button>
        </div>
      </div>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Nova Interface de Cadastro</AlertTitle>
        <AlertDescription>
          Esta nova interface apresenta os campos de forma contínua e organizada em blocos para facilitar o preenchimento.
          Configure apenas o necessário e expanda as seções adicionais conforme sua necessidade.
        </AlertDescription>
      </Alert>
      
      <ContinuousPropertyForm 
        onSuccess={() => {
          navigate("/catalog");
        }}
      />
    </div>
  );
};

export default AddProperty;