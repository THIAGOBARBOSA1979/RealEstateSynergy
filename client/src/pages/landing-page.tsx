import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";

const LandingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"mensal" | "anual">("mensal");

  const features = {
    basic: [
      { name: "Até 10 imóveis", included: true },
      { name: "Domínio personalizado", included: false },
      { name: "Leads ilimitados", included: true },
      { name: "Integração com portais", included: false },
      { name: "Suporte ao cliente", included: true },
      { name: "Módulo CRM", included: true },
      { name: "Programa de afiliados", included: false },
      { name: "Webhooks e APIs", included: false },
    ],
    professional: [
      { name: "Até 50 imóveis", included: true },
      { name: "Domínio personalizado", included: true },
      { name: "Leads ilimitados", included: true },
      { name: "Integração com portais", included: true },
      { name: "Suporte ao cliente prioritário", included: true },
      { name: "Módulo CRM", included: true },
      { name: "Programa de afiliados", included: true },
      { name: "Webhooks e APIs", included: false },
    ],
    enterprise: [
      { name: "Imóveis ilimitados", included: true },
      { name: "Domínio personalizado", included: true },
      { name: "Leads ilimitados", included: true },
      { name: "Integração com portais", included: true },
      { name: "Suporte ao cliente dedicado", included: true },
      { name: "Módulo CRM avançado", included: true },
      { name: "Programa de afiliados premium", included: true },
      { name: "Webhooks e APIs", included: true },
    ],
  };

  const pricingPlans = [
    {
      id: "basic",
      name: "Básico",
      description: "Ideal para corretores autônomos iniciando no mercado imobiliário.",
      price: billingCycle === "mensal" ? 97 : 897,
      features: features.basic,
      popular: false,
    },
    {
      id: "professional",
      name: "Profissional",
      description: "Para corretores estabelecidos que buscam expandir seu negócio.",
      price: billingCycle === "mensal" ? 197 : 1897,
      features: features.professional,
      popular: true,
    },
    {
      id: "enterprise",
      name: "Empresarial",
      description: "Para imobiliárias e equipes de corretores de alto desempenho.",
      price: billingCycle === "mensal" ? 497 : 4897,
      features: features.enterprise,
      popular: false,
    },
  ];

  return (
    <div className="landing-page flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-icons text-white text-2xl">apartment</span>
            <h1 className="text-white text-xl font-bold">ImobCloud</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="bg-white text-primary hover:bg-gray-100">
                Entrar
              </Button>
            </Link>
            <Button onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-20 px-6">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transforme sua Carreira Imobiliária com a Melhor Tecnologia do Mercado
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Site profissional, CRM intuitivo e ferramentas de marketing em uma única plataforma
            para impulsionar suas vendas de imóveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Demonstração Gratuita
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-dark">
              Conheça os Recursos
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Tudo o que você precisa para vender mais imóveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <span className="material-icons text-primary text-3xl mb-2">language</span>
                <CardTitle>Site Profissional</CardTitle>
                <CardDescription>
                  Site responsivo e personalizado com seu domínio e identidade visual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Design responsivo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Domínio personalizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>SEO otimizado para Google</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <span className="material-icons text-primary text-3xl mb-2">people</span>
                <CardTitle>CRM Visual</CardTitle>
                <CardDescription>
                  Gestão completa de leads com pipeline visual e automações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Pipeline customizável</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Automação de follow-up</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Histórico de interações</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <span className="material-icons text-primary text-3xl mb-2">handshake</span>
                <CardTitle>Sistema de Afiliação</CardTitle>
                <CardDescription>
                  Aumente seu alcance com uma rede de afiliados vendendo seus imóveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Marketplace de afiliação</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Comissões configuráveis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Dashboard de desempenho</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <span className="material-icons text-primary text-3xl mb-2">publish</span>
                <CardTitle>Integrações com Portais</CardTitle>
                <CardDescription>
                  Integre com os principais portais imobiliários do Brasil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>ZAP Imóveis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Viva Real</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>OLX e outros</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <span className="material-icons text-primary text-3xl mb-2">trending_up</span>
                <CardTitle>Análises e Relatórios</CardTitle>
                <CardDescription>
                  Monitore seu desempenho com métricas e análises detalhadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Dashboard personalizável</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Relatórios de conversão</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Histórico de desempenho</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <span className="material-icons text-primary text-3xl mb-2">sync</span>
                <CardTitle>Automações Avançadas</CardTitle>
                <CardDescription>
                  Automatize tarefas repetitivas para focar no que importa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>E-mails automáticos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Webhooks personalizáveis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Integração com WhatsApp</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano que melhor se adapta às suas necessidades. Todos os planos incluem atualizações gratuitas.
            </p>
            
            <div className="flex justify-center mt-8">
              <Tabs
                value={billingCycle}
                onValueChange={(value) => setBillingCycle(value as "mensal" | "anual")}
                className="w-[300px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mensal">Mensal</TabsTrigger>
                  <TabsTrigger value="anual">
                    Anual
                    <Badge variant="outline" className="ml-2 bg-primary text-white">
                      -15%
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`${plan.popular ? 'border-primary shadow-lg relative' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R${plan.price}</span>
                    <span className="text-muted-foreground">/{billingCycle === "mensal" ? "mês" : "ano"}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.included ? (
                          <CheckIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <XIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Escolher Plano
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">O que nossos clientes dizem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">RP</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Ricardo Pereira</h4>
                    <p className="text-sm text-muted-foreground">Corretor Autônomo</p>
                  </div>
                </div>
                <p className="italic">
                  "Desde que comecei a usar o ImobCloud, minhas vendas aumentaram em 40%. O site profissional e o CRM 
                  me ajudaram a organizar melhor meus leads e fechar mais negócios."
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">MS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Márcia Silva</h4>
                    <p className="text-sm text-muted-foreground">Imobiliária Silva & Filhos</p>
                  </div>
                </div>
                <p className="italic">
                  "A integração com os portais e o sistema de afiliados revolucionou nossa operação. Economizamos tempo e 
                  aumentamos nossa visibilidade no mercado."
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <span className="font-bold text-primary">CA</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Carlos Almeida</h4>
                    <p className="text-sm text-muted-foreground">Corretor Especialista</p>
                  </div>
                </div>
                <p className="italic">
                  "O diferencial do ImobCloud é o suporte e as constantes atualizações. A equipe está sempre disponível para 
                  ajudar e a plataforma melhora a cada mês."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-2">Como funciona o teste gratuito?</h3>
              <p className="text-muted-foreground">
                Você tem acesso a todas as funcionalidades do plano Profissional por 14 dias, sem necessidade de cartão de crédito.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim, não há contratos de fidelidade. Você pode cancelar sua assinatura a qualquer momento, sem taxas adicionais.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Como funciona o sistema de afiliados?</h3>
              <p className="text-muted-foreground">
                Você pode disponibilizar seus imóveis para que outros corretores vendam e definir a comissão que deseja pagar por cada venda.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Posso usar meu próprio domínio?</h3>
              <p className="text-muted-foreground">
                Sim, nos planos Profissional e Empresarial você pode conectar seu próprio domínio ao seu site na plataforma.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Como é feita a integração com portais?</h3>
              <p className="text-muted-foreground">
                Nossas integrações são automáticas. Basta configurar suas credenciais de cada portal e publicar seus imóveis com um clique.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Preciso de conhecimento técnico?</h3>
              <p className="text-muted-foreground">
                Não, nossa plataforma foi desenvolvida para ser intuitiva e fácil de usar, mesmo para quem não tem experiência com tecnologia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar seu negócio imobiliário?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Comece hoje mesmo com nosso teste gratuito de 14 dias e veja como a tecnologia pode impulsionar suas vendas.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
            Começar Teste Gratuito
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-white text-2xl">apartment</span>
                <h3 className="text-xl font-bold">ImobCloud</h3>
              </div>
              <p className="text-gray-400">
                A melhor plataforma para corretores e imobiliárias impulsionarem seus negócios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Clientes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 ImobCloud. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;