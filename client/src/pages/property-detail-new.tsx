import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, getPropertyTypeLabel, getPropertyStatusLabel, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, Lead } from "@/types";
import { 
  CheckIcon, 
  ImageIcon, 
  MapPinIcon, 
  HomeIcon, 
  TagIcon, 
  PhoneIcon, 
  ShareIcon, 
  HeartIcon, 
  ClipboardCopyIcon,
  ArrowLeftIcon
} from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";

interface PropertyFeature {
  name: string;
  checked: boolean;
}

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const PropertyDetailNew = () => {
  // Todos os hooks chamados primeiro, de forma consistente
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Estados locais
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'photos' | 'map'>('photos');
  const [contactForm, setContactForm] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    message: "Olá, gostaria de mais informações sobre este imóvel.",
    source: "website"
  });

  // Consultas e mutações
  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });
  
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: [`/api/users/${property?.userId}`],
    enabled: !!property?.userId,
  });
  
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/favorites/${id}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      
      toast({
        title: property?.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: property?.isFavorite 
          ? "Este imóvel foi removido da sua lista de favoritos." 
          : "Este imóvel foi adicionado à sua lista de favoritos.",
      });
    }
  });
  
  const createLead = useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada",
        description: "Seus dados foram enviados com sucesso. O corretor entrará em contato em breve.",
      });
      setShowContactDialog(false);
      setContactForm({
        fullName: "",
        email: "",
        phone: "",
        message: "Olá, gostaria de mais informações sobre este imóvel.",
        source: "website"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Houve um problema ao enviar sua mensagem. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Efeitos
  // Obter UTM parameters da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    if (utmSource || utmMedium || utmCampaign) {
      setContactForm(prev => ({
        ...prev,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        source: utmSource || 'website'
      }));
    }
  }, []);
  
  // Definir primeira imagem como ativa
  useEffect(() => {
    if (property?.images?.length > 0 && !activeImage) {
      setActiveImage(property.images[0]);
    }
  }, [property, activeImage]);
  
  // Configuração de metadados SEO
  useEffect(() => {
    document.title = property ? `${property.title} - ImobCloud` : 'Detalhes do Imóvel - ImobCloud';
    
    const existingMetaTags = document.head.querySelectorAll('meta[name="description"], meta[property="og:image"]');
    existingMetaTags.forEach(tag => tag.remove());
    
    if (property) {
      const metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = `${getPropertyTypeLabel(property.propertyType)} ${property.bedrooms ? `com ${property.bedrooms} quartos` : ''} ${property.bathrooms ? `e ${property.bathrooms} banheiros` : ''}, ${property.status === 'active' ? 'à venda' : 'vendido'} em ${property.city}. ${property.description?.substring(0, 100)}...`;
      document.head.appendChild(metaDesc);
      
      if (property.images?.length > 0) {
        const ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        ogImage.content = property.images[0];
        document.head.appendChild(ogImage);
      }
    }
    
    return () => {
      document.title = 'ImobCloud';
      const metaTags = document.head.querySelectorAll('meta[name="description"], meta[property="og:image"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [property]);

  // Dados computados com useMemo
  const featureCategories = useMemo(() => [
    {
      title: "Diferenciais",
      features: [
        { name: "Apartamento à beira mar", checked: property?.features?.includes("beachfront") ?? false },
        { name: "Ar-condicionado", checked: property?.features?.includes("air_conditioning") ?? false },
        { name: "Arquitetura de autor", checked: property?.features?.includes("designer_architecture") ?? false },
        { name: "Reformado", checked: property?.features?.includes("renovated") ?? false },
        { name: "Banheira", checked: property?.features?.includes("bathtub") ?? false },
      ]
    },
    {
      title: "Conveniência",
      features: [
        { name: "Academia", checked: property?.features?.includes("gym") ?? false },
        { name: "Elevador", checked: property?.features?.includes("elevator") ?? false },
        { name: "Estacionamento", checked: property?.features?.includes("parking") ?? false },
        { name: "Piscina", checked: property?.features?.includes("pool") ?? false },
        { name: "Segurança 24h", checked: property?.features?.includes("security") ?? false },
      ]
    },
    {
      title: "Itens Inclusos",
      features: [
        { name: "Mobiliado", checked: property?.features?.includes("furnished") ?? false },
        { name: "Eletrodomésticos", checked: property?.features?.includes("appliances") ?? false },
        { name: "Wi-Fi", checked: property?.features?.includes("wifi") ?? false },
        { name: "Churrasqueira", checked: property?.features?.includes("barbecue") ?? false },
        { name: "Área de Serviço", checked: property?.features?.includes("laundry") ?? false },
      ]
    },
  ], [property?.features]);

  // Handlers
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.fullName || !contactForm.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e email para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    createLead.mutate({
      fullName: contactForm.fullName,
      email: contactForm.email,
      phone: contactForm.phone,
      message: contactForm.message,
      propertyId: Number(id),
      userId: property?.userId,
      stage: 'initial_contact',
      source: contactForm.source,
      status: 'active',
      customFields: {
        utmSource: contactForm.utmSource,
        utmMedium: contactForm.utmMedium,
        utmCampaign: contactForm.utmCampaign,
      }
    });
  };
  
  const handleShare = (platform: string) => {
    if (typeof window === 'undefined' || !property) return;

    const url = window.location.href;
    const title = property.title;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Confira este imóvel: ${url}`)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          toast({
            title: "Link copiado",
            description: "O link deste imóvel foi copiado para a área de transferência.",
          });
        });
        break;
    }
  };

  // Renderização para estado de carregamento
  if (isLoadingProperty || isLoadingAgent) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div>
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização para property não encontrado
  if (!property) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Imóvel não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível encontrar as informações do imóvel solicitado.
        </p>
        <Button asChild>
          <Link href="/properties">Ver Todos os Imóveis</Link>
        </Button>
      </div>
    );
  }

  // Renderização principal do componente
  return (
    <div className="property-detail bg-gray-50 min-h-screen">
      {/* Header com branding */}
      <header className="bg-primary text-white py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary/20" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <Link href="/">
              <div className="text-xl font-bold cursor-pointer">ImobCloud</div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {agent && (
              <div className="hidden md:flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agent.profilePicture} alt={agent.fullName} />
                  <AvatarFallback>{getInitials(agent.fullName)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{agent.fullName}</p>
                  <p className="text-xs opacity-80">{agent.phone || "(11) 99999-9999"}</p>
                </div>
              </div>
            )}
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="hidden md:flex"
              onClick={() => setShowContactDialog(true)}
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              Contatar corretor
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="text-white border-white hover:bg-primary/20 hover:text-white"
              onClick={() => toggleFavorite.mutate()}
            >
              <HeartIcon className={`h-5 w-5 ${property.isFavorite ? 'fill-white' : ''}`} />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Container com detalhes do imóvel */}
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs e título */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-2">
            <Link href="/properties">
              <span className="hover:text-primary cursor-pointer">Imóveis</span>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/properties?city=${encodeURIComponent(property.city)}`}>
              <span className="hover:text-primary cursor-pointer">{property.city}</span>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/properties?type=${encodeURIComponent(property.propertyType)}`}>
              <span className="hover:text-primary cursor-pointer">{getPropertyTypeLabel(property.propertyType)}</span>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary">{property.title}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {property.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {property.address}, {property.city} - {property.state}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`${property.status === 'active' ? 'bg-green-100 text-green-800' : property.status === 'sold' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                {getPropertyStatusLabel(property.status)}
              </Badge>
              
              <Badge className="bg-primary/10 text-primary">
                {getPropertyTypeLabel(property.propertyType)}
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleShare('copy')}
                    >
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compartilhar imóvel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Galeria e Toggle de Mapa */}
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'photos' | 'map')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="mt-0">
              <div className="grid grid-cols-12 gap-4">
                {/* Imagem principal da galeria */}
                <div className="col-span-12 md:col-span-8 h-[400px] rounded-lg overflow-hidden">
                  {activeImage ? (
                    <img 
                      src={activeImage} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Imagens em miniatura */}
                <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-4">
                  {property.images?.slice(0, 4).map((image: string, index: number) => (
                    <div 
                      key={index} 
                      className={`h-[190px] rounded-lg overflow-hidden cursor-pointer ${activeImage === image ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setActiveImage(image)}
                    >
                      <img 
                        src={image} 
                        alt={`${property.title} - ${index + 1}`} 
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="map" className="mt-0">
              <div className="h-[450px] bg-gray-100 rounded-lg flex items-center justify-center">
                <iframe 
                  title="Localização do imóvel"
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address + ', ' + property.city + ', ' + property.state)}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Área de conteúdo principal - Layout em grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna de conteúdo à esquerda */}
          <div className="md:col-span-2">
            {/* Destaques do imóvel */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.price > 0 && (
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                      <TagIcon className="h-6 w-6 text-primary mb-2" />
                      <span className="text-lg font-bold">{formatCurrency(property.price)}</span>
                      <span className="text-xs text-muted-foreground">{property.status === 'active' ? 'Preço' : 'Vendido por'}</span>
                    </div>
                  )}
                  
                  {property.area && (
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                      <HomeIcon className="h-6 w-6 text-primary mb-2" />
                      <span className="text-lg font-bold">{property.area} m²</span>
                      <span className="text-xs text-muted-foreground">Área total</span>
                    </div>
                  )}
                  
                  {property.bedrooms > 0 && (
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                      <span className="material-icons text-2xl text-primary mb-1">bed</span>
                      <span className="text-lg font-bold">{property.bedrooms}</span>
                      <span className="text-xs text-muted-foreground">Quartos</span>
                    </div>
                  )}
                  
                  {property.bathrooms > 0 && (
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                      <span className="material-icons text-2xl text-primary mb-1">shower</span>
                      <span className="text-lg font-bold">{property.bathrooms}</span>
                      <span className="text-xs text-muted-foreground">Banheiros</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Sobre este imóvel</h2>
                  <p className="text-gray-700">
                    {property.description}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Características do imóvel */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Características</h2>
                <div className="space-y-6">
                  {featureCategories.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="font-medium text-gray-900 mb-3">{category.title}</h3>
                      <div className="grid grid-cols-2 gap-y-2">
                        {category.features.map((feature, featIdx) => (
                          <div key={featIdx} className="flex items-center gap-2">
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.checked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {feature.checked && <CheckIcon className="h-3.5 w-3.5" />}
                            </span>
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                      {idx < featureCategories.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna lateral à direita */}
          <div>
            {/* Card de contato com o corretor */}
            <Card className="mb-6 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Interessado neste imóvel?</h2>
                <p className="text-muted-foreground mb-6">Entre em contato com o corretor para mais informações, agendar uma visita ou fazer uma proposta.</p>
                
                <div className="flex flex-col space-y-3">
                  <Button 
                    className="w-full gap-2"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <PhoneIcon className="h-4 w-4" />
                    Falar com o corretor
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <SiWhatsapp className="h-4 w-4" />
                    Enviar por WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => handleShare('facebook')}
                  >
                    <SiFacebook className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => handleShare('copy')}
                  >
                    <ClipboardCopyIcon className="h-4 w-4" />
                    Copiar link
                  </Button>
                </div>
                
                {agent && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={agent.profilePicture} alt={agent.fullName} />
                        <AvatarFallback>{getInitials(agent.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.fullName}</p>
                        <p className="text-sm text-muted-foreground">{agent.phone || "(11) 99999-9999"}</p>
                        <p className="text-sm text-muted-foreground mt-1">{agent.email}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          window.open(`tel:${agent.phone || "11999999999"}`);
                        }}
                      >
                        <PhoneIcon className="h-3.5 w-3.5 mr-2" />
                        Ligar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          window.open(`https://wa.me/${agent.phone?.replace(/\D/g, "") || "11999999999"}`);
                        }}
                      >
                        <SiWhatsapp className="h-3.5 w-3.5 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm text-muted-foreground">{property.city}, {property.state}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">ID: {property.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialog de contato */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Falar com o corretor</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitContact}>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome completo*</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={contactForm.fullName} 
                    onChange={handleContactFormChange} 
                    className="mt-1" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email*</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={contactForm.email} 
                    onChange={handleContactFormChange} 
                    className="mt-1" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={contactForm.phone} 
                    onChange={handleContactFormChange} 
                    className="mt-1" 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={contactForm.message} 
                    onChange={handleContactFormChange} 
                    className="mt-1" 
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowContactDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetailNew;