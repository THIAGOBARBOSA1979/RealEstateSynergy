import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import { ArrowLeftIcon, CheckIcon, CreditCardIcon, ShieldCheckIcon } from "lucide-react";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pagamento processado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
        setLocation("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2" />
          Finalizar Assinatura
        </CardTitle>
        <CardDescription>
          Insira os dados do seu cartão para ativar sua assinatura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">Garantia de Segurança</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Dados protegidos por criptografia SSL</li>
              <li>• Processamento seguro via Stripe</li>
              <li>• Não armazenamos dados do cartão</li>
            </ul>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? "Processando..." : "Confirmar Assinatura"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Buscar dados do plano selecionado e criar a assinatura
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'professional';
    
    // Simular dados do plano (em produção, buscar do backend)
    const planData = {
      starter: { name: "Starter", price: "R$ 97", description: "Ideal para corretores autônomos" },
      professional: { name: "Professional", price: "R$ 197", description: "Para pequenas imobiliárias" },
      enterprise: { name: "Enterprise", price: "R$ 397", description: "Para grandes imobiliárias" }
    }[plan];
    
    setSelectedPlan(planData);

    // Criar subscription no backend
    const createSubscription = async () => {
      try {
        const data = await apiRequest("POST", "/api/create-subscription", { plan });
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Erro ao processar pagamento",
          description: "Não foi possível inicializar o pagamento. Tente novamente.",
          variant: "destructive",
        });
      }
    };
    
    createSubscription();
  }, [toast]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Preparando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/register" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="text-2xl font-bold text-primary">ImobCloud</span>
            </Link>
            
            <Badge variant="outline">Pagamento Seguro</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Finalizar Assinatura
            </h1>
            <p className="text-lg text-gray-600">
              Complete seu pagamento para ativar sua conta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Plano */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPlan && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{selectedPlan.name}</h3>
                          <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{selectedPlan.price}</p>
                          <p className="text-sm text-gray-500">/mês</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{selectedPlan.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>14 dias grátis</span>
                          <span>-{selectedPlan.price}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total hoje</span>
                          <span>R$ 0,00</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          A cobrança de {selectedPlan.price} será feita após 14 dias de teste gratuito.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>O que você recebe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">14 dias de teste gratuito</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">Acesso completo a todas funcionalidades</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">Suporte dedicado</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">Cancele a qualquer momento</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Pagamento */}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}