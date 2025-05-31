import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import { ArrowLeftIcon, CheckIcon, UserIcon, MailIcon, PhoneIcon, BriefcaseIcon } from "lucide-react";

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  creci: string;
  selectedPlan: string;
}

const RegisterPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    creci: "",
    selectedPlan: "starter"
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para ativar sua conta e começar o teste gratuito.",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "R$ 97",
      description: "Ideal para corretores autônomos",
      features: ["Site personalizado", "CRM básico", "5 imóveis ativos", "Suporte por email"]
    },
    {
      id: "professional",
      name: "Professional",
      price: "R$ 197",
      description: "Para pequenas imobiliárias",
      features: ["Site profissional", "CRM avançado", "50 imóveis ativos", "Sistema de afiliação", "Suporte prioritário"],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "R$ 397",
      description: "Para grandes imobiliárias",
      features: ["Site personalizado", "CRM completo", "Imóveis ilimitados", "API integrada", "Suporte 24/7", "Gerente dedicado"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="text-2xl font-bold text-primary">ImobCloud</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Já tem uma conta?</span>
              <Link href="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Crie sua conta e comece o teste gratuito
            </h1>
            <p className="text-lg text-gray-600">
              14 dias grátis, sem cartão de crédito. Cancele a qualquer momento.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário de Cadastro */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Dados da sua conta</CardTitle>
                <CardDescription>
                  Preencha seus dados para começar seu teste gratuito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email profissional</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu.email@empresa.com.br"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Empresa/Imobiliária</Label>
                    <div className="relative">
                      <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="company"
                        type="text"
                        placeholder="Nome da sua empresa"
                        className="pl-10"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="creci">CRECI (opcional)</Label>
                    <Input
                      id="creci"
                      type="text"
                      placeholder="Número do seu CRECI"
                      value={formData.creci}
                      onChange={(e) => handleInputChange("creci", e.target.value)}
                    />
                  </div>

                  <Separator />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Criando conta..." : "Começar teste gratuito"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Ao criar sua conta, você concorda com nossos{" "}
                    <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                    e{" "}
                    <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Planos disponíveis */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Escolha seu plano
              </h2>
              
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    formData.selectedPlan === plan.id 
                      ? "border-primary shadow-md" 
                      : "hover:shadow-md"
                  } ${plan.popular ? "border-primary/50" : ""}`}
                  onClick={() => handleInputChange("selectedPlan", plan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          {plan.popular && (
                            <Badge className="bg-primary text-white">Mais Popular</Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-primary mb-1">
                          {plan.price}<span className="text-sm text-gray-500">/mês</span>
                        </p>
                        <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                        
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="ml-4">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.selectedPlan === plan.id 
                            ? "border-primary bg-primary" 
                            : "border-gray-300"
                        }`}>
                          {formData.selectedPlan === plan.id && (
                            <CheckIcon className="h-3 w-3 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-center mb-2">
                  <CheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">Teste grátis por 14 dias</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Acesso completo a todas as funcionalidades</li>
                  <li>• Sem necessidade de cartão de crédito</li>
                  <li>• Cancele a qualquer momento</li>
                  <li>• Suporte dedicado durante o teste</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;