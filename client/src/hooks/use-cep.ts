import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export function useCep() {
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchAddressByCep = async (cep: string): Promise<AddressData | null> => {
    if (!cep || cep.length < 8) {
      return null;
    }
    
    // Remove qualquer caractere não numérico
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "O CEP deve conter 8 dígitos",
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP e tente novamente",
          variant: "destructive",
        });
        return null;
      }
      
      const addressData: AddressData = {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        zipCode: data.cep.replace(/\D/g, '')
      };
      
      return addressData;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao consultar o serviço de CEP",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { fetchAddressByCep, isLoading };
}