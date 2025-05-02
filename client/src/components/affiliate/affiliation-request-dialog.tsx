import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AffiliationRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

export default function AffiliationRequestDialog({
  isOpen,
  onClose,
  property,
}: AffiliationRequestDialogProps) {
  const [termsAgreed, setTermsAgreed] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const requestAffiliationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/affiliate/request/${property.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/my-affiliations'] });
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de afiliação foi enviada com sucesso.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: "Ocorreu um erro ao enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!termsAgreed) {
      toast({
        title: "Atenção",
        description: "Você precisa concordar com os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    requestAffiliationMutation.mutate();
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Solicitar Afiliação</DialogTitle>
          <DialogDescription>
            Solicite para se tornar um afiliado deste imóvel
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted/30 p-4 rounded-md">
            <h3 className="font-medium text-lg">{property.title}</h3>
            <p className="text-sm text-muted-foreground">{property.address}</p>
            
            <div className="mt-3 flex justify-between">
              <div>
                <span className="text-sm font-medium">Preço:</span>
                <span className="ml-2 text-primary font-bold">{formatCurrency(property.price)}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Comissão:</span>
                <span className="ml-2 text-success font-bold">{property.commissionRate}%</span>
              </div>
            </div>

            <div className="mt-2 text-sm">
              <span className="text-sm font-medium">Proprietário:</span>
              <span className="ml-2">{property.owner?.name}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Termos da Afiliação</h4>
            <ul className="text-sm space-y-2 pl-5 list-disc">
              <li>Você receberá {property.commissionRate}% do valor da venda como comissão.</li>
              <li>A comissão será paga após a conclusão da venda e recebimento do pagamento.</li>
              <li>Esta afiliação permanecerá ativa enquanto o imóvel estiver disponível para venda.</li>
              <li>O proprietário poderá cancelar a afiliação a qualquer momento.</li>
              <li>Você será responsável por divulgar o imóvel e trazer potenciais compradores.</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAgreed}
              onCheckedChange={(checked) => setTermsAgreed(checked as boolean)}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Concordo com os termos e condições da afiliação
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={requestAffiliationMutation.isPending || !termsAgreed}
          >
            {requestAffiliationMutation.isPending ? "Enviando..." : "Confirmar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}