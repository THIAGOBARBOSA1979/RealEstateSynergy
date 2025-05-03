import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Icons
import { CheckIcon, ArrowRightIcon, StarIcon, BriefcaseIcon, UsersIcon, BarChartIcon, GlobeIcon, 
        LaptopIcon, ShieldCheckIcon, PieChartIcon, PlayCircleIcon, PhoneIcon, MailIcon, MapPinIcon } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  plan?: string;
}

const LandingPage = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    message: "Olá, gostaria de mais informações sobre os planos."
  });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  // Track UTM parameters for marketing campaigns
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  
  // Extract UTM parameters from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const params: Record<string, string> = {};
      
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
        const value = urlParams.get(param);
        if (value) params[param] = value;
      });
      
      setUtmParams(params);
      
      // Track page view in analytics
      if (Object.keys(params).length > 0) {
        if ((window as any).fbq) {
          (window as any).fbq('track', 'PageView', params);
        }
        
        if ((window as any).gtag) {
          (window as any).gtag('event', 'page_view', {
            page_title: 'Landing Page',
            ...params
          });
        }
      }
    }
  });
  
  // Contact form submission handler
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          ...utmParams
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Mensagem enviada",
        description: "Recebemos sua mensagem. Nossa equipe entrará em contato em breve.",
      });
      setShowContactDialog(false);
      setContactForm({
        fullName: "",
        email: "",
        phone: "",
        message: "Olá, gostaria de mais informações sobre os planos."
      });
      
      // Track conversion
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: selectedPlan || 'Contact Form',
          ...utmParams
        });
      }
      
      if ((window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          event_category: 'contact',
          event_label: selectedPlan || 'Contact Form',
          ...utmParams
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Houve um problema ao enviar seu contato. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.fullName || !contactForm.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e email para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    contactMutation.mutate({
      ...contactForm,
      plan: selectedPlan || undefined
    });
  };
  
  const openContactDialog = (plan?: string) => {
    if (plan) {
      setSelectedPlan(plan);
      setContactForm(prev => ({
        ...prev,
        message: `Olá, gostaria de mais informações sobre o plano ${plan}.`
      }));
    } else {
      setSelectedPlan(null);
    }
    
    setShowContactDialog(true);
  };
  
  // Feature list data
  const featureItems: FeatureItem[] = [
    {
      title: "Gerador de Sites Personalizados",
      description: "Crie sites profissionais para seu negócio imobiliário sem precisar de conhecimentos técnicos. Personalize cores, layout e conteúdo.",
      icon: <GlobeIcon className="h-6 w-6 text-primary" />
    },
    {
      title: "CRM Imobiliário Visual",
      description: "Acompanhe leads, negociações e vendas com nosso sistema de CRM visual. Organize seu funil de vendas e nunca perca uma oportunidade.",
      icon: <UsersIcon className="h-6 w-6 text-primary" />
    },
    {
      title: "Sistema de Afiliação",
      description: "Amplie seu alcance com nosso sistema de afiliação. Conecte-se com outros corretores e compartilhe comissões automaticamente.",
      icon: <BriefcaseIcon className="h-6 w-6 text-primary" />
    },
    {
      title: "Integração com Portais",
      description: "Publique seus imóveis em dezenas de portais imobiliários com apenas um clique. Aumente a visibilidade sem esforço adicional.",
      icon: <LaptopIcon className="h-6 w-6 text-primary" />
    },
    {
      title: "Marketing Digital Integrado",
      description: "Crie campanhas de marketing eficientes com integração nativa a Facebook Ads, Google Ads e campanhas de email marketing.",
      icon: <BarChartIcon className="h-6 w-6 text-primary" />
    },
    {
      title: "Gestão de Documentos",
      description: "Armazene e organize todos os documentos relacionados aos seus negócios. Integração com assinatura digital e reconhecimento automático.",
      icon: <ShieldCheckIcon className="h-6 w-6 text-primary" />
    }
  ];
  
  // Pricing tiers
  const pricingTiers: PricingTier[] = [
    {
      name: "Básico",
      price: 99,
      description: "Ideal para corretores autônomos que estão começando",
      features: [
        "Até 10 imóveis ativos",
        "Site personalizado básico",
        "CRM básico",
        "Publicação em 3 portais",
        "1 usuário",
        "Suporte por email"
      ],
      cta: "Iniciar Agora"
    },
    {
      name: "Profissional",
      price: 199,
      description: "Para corretores e pequenas imobiliárias em crescimento",
      features: [
        "Até 50 imóveis ativos",
        "Site personalizado avançado",
        "CRM completo com funil de vendas",
        "Publicação em 10 portais",
        "Sistema de afiliação",
        "3 usuários",
        "Integração com Google Calendar",
        "Suporte prioritário"
      ],
      cta: "Escolher Profissional",
      popular: true
    },
    {
      name: "Empresarial",
      price: 399,
      description: "Solução completa para imobiliárias estabelecidas",
      features: [
        "Imóveis ilimitados",
        "Site personalizado premium",
        "CRM avançado com automações",
        "Publicação em todos os portais",
        "Sistema de afiliação premium",
        "Usuários ilimitados",
        "Integrações avançadas",
        "API completa",
        "Suporte 24/7 com gerente dedicado"
      ],
      cta: "Contato Personalizado"
    }
  ];
  
  // Testimonials data
  const testimonials: TestimonialItem[] = [
    {
      quote: "A plataforma revolucionou minha forma de trabalhar. Aumentei minhas vendas em 40% no primeiro trimestre de uso.",
      author: "Carlos Silva",
      role: "Corretor Autônomo",
      company: "Rio de Janeiro, RJ",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      quote: "O sistema de afiliação nos permitiu expandir nossa rede de colaboradores e aumentar significativamente nosso volume de negócios.",
      author: "Mariana Almeida",
      role: "Diretora",
      company: "Imobiliária Premier",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      quote: "A integração entre site, CRM e portais economiza horas do nosso dia. A equipe está muito mais produtiva e focada nas vendas.",
      author: "Roberto Mendes",
      role: "Gerente Comercial",
      company: "Grupo Imóveis SP",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg"
    }
  ];
  
  // FAQ items
  const faqItems = [
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Oferecemos 14 dias de teste gratuito em todos os planos, sem necessidade de cartão de crédito. Você terá acesso a todas as funcionalidades do plano escolhido para avaliar se atende às suas necessidades."
    },
    {
      question: "Preciso de conhecimentos técnicos para usar a plataforma?",
      answer: "Não, nossa plataforma foi desenvolvida pensando em facilidade de uso. Todas as ferramentas possuem interfaces intuitivas e oferecemos treinamento inicial gratuito para novos usuários. Além disso, nossa base de conhecimento contém tutoriais detalhados."
    },
    {
      question: "Posso migrar meus dados de outro sistema?",
      answer: "Sim, oferecemos serviço de migração de dados para clientes dos planos Profissional e Empresarial. Nossa equipe irá auxiliar na transferência de informações de imóveis, clientes e negociações do seu sistema atual."
    },
    {
      question: "Como funciona o sistema de afiliação de imóveis?",
      answer: "Nosso sistema permite que corretores compartilhem seus imóveis com outros profissionais e definam comissões automaticamente. O proprietário do imóvel mantém o controle total e recebe notificações quando houver interesse de compradores trazidos por afiliados."
    },
    {
      question: "Vocês oferecem suporte para configuração do site?",
      answer: "Sim, todos os planos incluem suporte para configuração inicial do site. Para clientes do plano Empresarial, oferecemos personalização avançada com nossa equipe de design."
    },
    {
      question: "É possível cancelar a assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais. Seus dados ficarão disponíveis até o final do período já pago e você poderá exportá-los antes desse prazo."
    }
  ];
  
  return (
    <div className="bg-white">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200 fixed w-full z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">ImobCloud</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Planos
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Depoimentos
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                FAQ
              </a>
              <Button
                onClick={() => openContactDialog()}
              >
                Fale Conosco
              </Button>
            </nav>
            
            <Button variant="outline" className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-4 px-3 py-1">
                Plataforma All-in-One para Imobiliárias
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
                Revolucione seu negócio imobiliário com tecnologia integrada
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Unificamos site, CRM, sistema de afiliações e geração de leads em uma única plataforma pensada para maximizar suas vendas.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" onClick={() => openContactDialog()}>
                  Iniciar Teste Gratuito
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="lg" onClick={() => window.location.href = "#demo"}>
                  <PlayCircleIcon className="mr-2 h-4 w-4" />
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                <span>Teste grátis por 14 dias, sem cartão de crédito</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <img 
                src="https://via.placeholder.com/600x400?text=ImobCloud+Platform" 
                alt="ImobCloud Platform" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Brands/Trust Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">Utilizado por mais de 1.200 corretores e imobiliárias em todo o Brasil</p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60">
            <img src="https://via.placeholder.com/150x50?text=Brand+1" alt="Client Brand" className="h-8" />
            <img src="https://via.placeholder.com/150x50?text=Brand+2" alt="Client Brand" className="h-8" />
            <img src="https://via.placeholder.com/150x50?text=Brand+3" alt="Client Brand" className="h-8" />
            <img src="https://via.placeholder.com/150x50?text=Brand+4" alt="Client Brand" className="h-8" />
            <img src="https://via.placeholder.com/150x50?text=Brand+5" alt="Client Brand" className="h-8" />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Funcionalidades</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo que você precisa em um só lugar</h2>
            <p className="text-gray-600">
              Nossa plataforma oferece todas as ferramentas necessárias para potencializar seu negócio imobiliário, desde a captação de leads até o fechamento das vendas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureItems.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Demonstração</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Veja a plataforma em ação</h2>
            <p className="text-gray-600">
              Explore as principais funcionalidades da nossa plataforma e descubra como ela pode transformar sua gestão imobiliária.
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-xl mx-auto max-w-4xl aspect-video bg-gray-200 flex items-center justify-center">
            <PlayCircleIcon className="h-16 w-16 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Planos</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha o plano ideal para seu negócio</h2>
            <p className="text-gray-600">
              Oferecemos planos flexíveis que se adaptam às suas necessidades, desde corretores autônomos até grandes imobiliárias.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    Mais Popular
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-end">
                    <span className="text-2xl font-bold">{tier.name}</span>
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">R${tier.price}</span>
                    <span className="text-gray-500 ml-1">/mês</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => openContactDialog(tier.name)}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center text-gray-600">
            <p>Todos os planos incluem 14 dias de teste gratuito. Sem compromisso.</p>
            <p className="mt-2">Precisa de algo específico? <span className="text-primary cursor-pointer" onClick={() => openContactDialog()}>Entre em contato</span> para uma proposta personalizada.</p>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Depoimentos</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos clientes dizem</h2>
            <p className="text-gray-600">
              Descubra como nossa plataforma tem ajudado corretores e imobiliárias a transformar seus negócios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  
                  <p className="italic text-gray-600 mb-6">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="mr-4">
                      <img 
                        src={testimonial.avatar || "https://via.placeholder.com/40"} 
                        alt={testimonial.author} 
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para transformar seu negócio imobiliário?</h2>
            <p className="text-xl opacity-90 mb-8">
              Comece hoje mesmo com 14 dias de teste gratuito. Sem compromisso e sem cartão de crédito.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={() => openContactDialog()}>
                Iniciar Teste Gratuito
              </Button>
              
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                Agendar Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Dúvidas Frequentes</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
            <p className="text-gray-600">
              Encontre respostas para as dúvidas mais comuns sobre nossa plataforma.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-gray-900 font-medium py-4">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Ainda tem dúvidas? Entre em contato com nossa equipe.</p>
              <Button onClick={() => openContactDialog()}>Fale Conosco</Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ImobCloud</h3>
              <p className="text-gray-400 text-sm mb-4">
                A plataforma completa para o mercado imobiliário brasileiro.
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white">Planos</a></li>
                <li><a href="#testimonials" className="hover:text-white">Depoimentos</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="/privacy" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="/cookies" className="hover:text-white">Política de Cookies</a></li>
                <li><a href="/lgpd" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span>(11) 4321-9876</span>
                </li>
                <li className="flex items-center">
                  <MailIcon className="h-4 w-4 mr-2" />
                  <span>contato@imobcloud.com.br</span>
                </li>
                <li className="flex items-start">
                  <MapPinIcon className="h-4 w-4 mr-2 mt-1" />
                  <span>Av. Paulista, 1000<br />São Paulo - SP, 01310-100</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="bg-gray-800 mb-6" />
          
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 ImobCloud. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      
      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fale Conosco</DialogTitle>
            <DialogDescription>
              {selectedPlan 
                ? `Preencha seus dados para receber mais informações sobre o plano ${selectedPlan}.`
                : "Preencha seus dados para que nossa equipe entre em contato."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo*</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                placeholder="João Silva" 
                value={contactForm.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="joao@exemplo.com" 
                value={contactForm.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="(11) 99999-9999" 
                value={contactForm.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="Como podemos ajudar?"
                value={contactForm.message}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Floating Contact Button on Mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-40 flex flex-col gap-2">
        <Button 
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => window.open(`https://wa.me/551143219876?text=${encodeURIComponent('Olá, gostaria de mais informações sobre a plataforma ImobCloud.')}`)}
        >
          <SiWhatsapp className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Tracking Pixels (Non-visible) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {/* Facebook Pixel Code */}
        <img 
          height="1" 
          width="1" 
          src="https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1" 
          alt="" 
        />
        
        {/* Google Analytics Pixel */}
        <img 
          height="1" 
          width="1" 
          src="https://www.google-analytics.com/collect?v=1&tid=UA-XXXXXXXX-X" 
          alt="" 
        />
      </div>
    </div>
  );
};

export default LandingPage;