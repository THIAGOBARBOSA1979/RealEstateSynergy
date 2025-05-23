import { useLocation, Link } from "wouter";
import PropertyForm from "@/components/properties/property-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";

const AddProperty = () => {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Adicionar Imóvel</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados do novo imóvel para adicionar ao seu catálogo
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/properties")} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Imóveis
        </Button>
      </div>
      
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardContent className="p-0">
          <PropertyForm 
            onSuccess={() => {
              navigate("/properties");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProperty;