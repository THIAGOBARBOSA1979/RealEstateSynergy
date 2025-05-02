import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import PropertyForm from "@/components/properties/property-form";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";

const AddProperty = () => {
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-heading font-bold">Adicionar Imóvel</h1>
          <Button variant="outline" onClick={() => navigate("/properties")}>
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Voltar para Imóveis
          </Button>
        </div>
        
        <PropertyForm 
          onSuccess={() => {
            navigate("/properties");
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddProperty;