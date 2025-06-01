import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, ArrowRightIcon } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const SimpleLandingPage = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="bg-white min-h-screen">
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
              <Link href="/login">
                <Button variant="outline" className="mr-2">
                  Entrar
                </Button>
              </Link>
              <Button onClick={() => setLocation("/register")}>
                Fale Conosco
              </Button>
            </nav>
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
                <Button size="lg" onClick={() => setLocation("/register")}>
                  Iniciar Teste Gratuito
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="lg">
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Funcionalidades</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo que você precisa em uma plataforma</h2>
            <p className="text-gray-600">
              Ferramentas completas para gestão imobiliária, vendas e marketing digital integradas em uma solução única.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Site Profissional</h3>
              <p className="text-gray-600">Site responsivo e otimizado para conversão com integração completa ao CRM.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CRM Inteligente</h3>
              <p className="text-gray-600">Gestão completa de leads, clientes e oportunidades com automação de vendas.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sistema de Afiliação</h3>
              <p className="text-gray-600">Conecte-se com outros corretores e multiplique suas oportunidades de venda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 px-3 py-1">Planos</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha o plano ideal para seu negócio</h2>
            <p className="text-gray-600">
              Oferecemos planos flexíveis que se adaptam às suas necessidades, desde corretores autônomos até grandes imobiliárias.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Starter */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-3xl font-bold text-primary mb-4">R$ 97<span className="text-sm text-gray-500">/mês</span></p>
              <p className="text-gray-600 mb-6">Ideal para corretores autônomos</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Site personalizado</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">CRM básico</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">5 imóveis ativos</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => setLocation("/register")}>
                Escolher Plano
              </Button>
            </div>

            {/* Plano Professional */}
            <div className="border border-primary rounded-lg p-6 hover:shadow-lg transition-shadow relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">Mais Popular</Badge>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-3xl font-bold text-primary mb-4">R$ 197<span className="text-sm text-gray-500">/mês</span></p>
              <p className="text-gray-600 mb-6">Para pequenas imobiliárias</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Site profissional</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">CRM avançado</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">50 imóveis ativos</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Sistema de afiliação</span>
                </li>
              </ul>
              <Button className="w-full" onClick={() => setLocation("/register")}>
                Escolher Plano
              </Button>
            </div>

            {/* Plano Enterprise */}
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-primary mb-4">R$ 397<span className="text-sm text-gray-500">/mês</span></p>
              <p className="text-gray-600 mb-6">Para grandes imobiliárias</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Site personalizado</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">CRM completo</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Imóveis ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">API integrada</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => setLocation("/register")}>
                Escolher Plano
              </Button>
            </div>
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
            
            <Button size="lg" variant="secondary" onClick={() => setLocation("/register")}>
              Iniciar Teste Gratuito
            </Button>
          </div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Gostaria de mais informações sobre a ImobCloud.", "_blank")}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          size="sm"
        >
          <SiWhatsapp className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">ImobCloud</h3>
            <p className="text-gray-400 mb-4">A plataforma completa para seu negócio imobiliário</p>
            <p className="text-sm text-gray-500">&copy; 2024 ImobCloud. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLandingPage;