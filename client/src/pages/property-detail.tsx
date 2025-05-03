import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getPropertyTypeLabel, getPropertyStatusLabel, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, Lead } from "@/types";
import { 
  CheckIcon, 
  ImageIcon, 
  MapPinIcon, 
  HomeIcon, 
  TagIcon, 
  UserIcon, 
  PhoneIcon, 
  CalendarIcon, 
  ShareIcon, 
  ExternalLinkIcon, 
  ChevronUpIcon, 
  HeartIcon, 
  MailIcon, 
  ClipboardCopyIcon, 
  MousePointerClickIcon,
  ArrowLeftIcon
} from "lucide-react";
import { SiWhatsapp, SiFacebook, SiInstagram, SiGmail } from "react-icons/si";

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

const PropertyDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    message: "Olá, gostaria de mais informações sobre este imóvel.",
    source: "website"
  });
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'photos' | 'map'>('photos');
  
  // Get UTM parameters if present in URL
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
  
  // Fetch property data
  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });
  
  // Fetch agent data (property owner)
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: [`/api/users/${property?.userId}`],
    enabled: !!property?.userId,
  });
  
  // Lead creation mutation
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
      
      // Trigger conversion pixel events
      if (typeof window !== 'undefined') {
        // Facebook Pixel event
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Lead', {
            content_name: property?.title,
            content_category: property?.propertyType,
            value: property?.price,
            currency: 'BRL',
          });
        }
        
        // Google Analytics event
        if ((window as any).gtag) {
          (window as any).gtag('event', 'generate_lead', {
            event_category: 'property',
            event_label: property?.title,
            value: property?.price,
          });
        }
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: "Houve um problema ao enviar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/properties/${id}/favorite`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: property?.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: property?.isFavorite 
          ? "Este imóvel foi removido da sua lista de favoritos." 
          : "Este imóvel foi adicionado à sua lista de favoritos.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Houve um problema ao atualizar seus favoritos. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Update active image when property data is loaded
  useEffect(() => {
    if (property?.images?.length > 0) {
      setActiveImage(property.images[0]);
    }
  }, [property]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
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
  
  // Handle share functionality
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
  
  // Property features categories
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
      title: "Cômodos",
      features: [
        { name: "Área de serviço", checked: property?.features?.includes("service_area") ?? false },
        { name: "Closet", checked: property?.features?.includes("closet") ?? false },
        { name: "Despensa", checked: property?.features?.includes("pantry") ?? false },
        { name: "Varanda", checked: property?.features?.includes("balcony") ?? false },
        { name: "Home office", checked: property?.features?.includes("home_office") ?? false },
        { name: "Lavabo", checked: property?.features?.includes("half_bath") ?? false },
      ]
    },
    {
      title: "Condomínio",
      features: [
        { name: "Academia", checked: property?.condoFeatures?.includes("gym") ?? false },
        { name: "Estacionamento", checked: property?.condoFeatures?.includes("parking") ?? false },
        { name: "Brinquedoteca", checked: property?.condoFeatures?.includes("playroom") ?? false },
        { name: "Churrasqueira", checked: property?.condoFeatures?.includes("bbq") ?? false },
      ]
    },
    {
      title: "Segurança",
      features: [
        { name: "Portaria 24hs", checked: property?.securityFeatures?.includes("24h_security") ?? false },
        { name: "Portaria diurna", checked: property?.securityFeatures?.includes("day_security") ?? false },
        { name: "Portaria eletrônica", checked: property?.securityFeatures?.includes("electronic_gate") ?? false },
        { name: "Câmeras", checked: property?.securityFeatures?.includes("cameras") ?? false },
      ]
    },
  ], [property]);
  
  // Loading state
  if (isLoadingProperty) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-2 mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-36" />
          </div>
          
          <Skeleton className="h-96 w-full rounded-lg" />
          
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          
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
  
  // Not found state
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
  
  // SEO Meta setup (in a production app, use Next.js Head or React Helmet)
  useEffect(() => {
    if (property) {
      document.title = `${property.title} - ImobCloud`;
      
      // Create meta description
      const metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = `${getPropertyTypeLabel(property.propertyType)} ${property.bedrooms ? `com ${property.bedrooms} quartos` : ''} ${property.bathrooms ? `e ${property.bathrooms} banheiros` : ''}, ${property.status === 'active' ? 'à venda' : 'vendido'} em ${property.city}. ${property.description?.substring(0, 100)}...`;
      document.head.appendChild(metaDesc);
      
      // Create og:image if there are images
      if (property.images?.length > 0) {
        const ogImage = document.createElement('meta');
        ogImage.property = 'og:image';
        ogImage.content = property.images[0];
        document.head.appendChild(ogImage);
      }
      
      return () => {
        // Clean up meta tags when component unmounts
        document.title = 'ImobCloud';
        const metaTags = document.head.querySelectorAll('meta[name="description"], meta[property="og:image"]');
        metaTags.forEach(tag => tag.remove());
      };
    }
  }, [property]);
  
  return (
    <div className="property-detail bg-gray-50 min-h-screen">
      {/* Header with property branding */}
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
      
      {/* Property Details Container */}
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs and Title */}
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
        
        {/* Gallery and Map Toggle */}
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'photos' | 'map')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="mt-0">
              <div className="grid grid-cols-12 gap-4">
                {/* Main gallery image */}
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
                
                {/* Thumbnail images */}
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
        
        {/* Main content area - Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left content column */}
          <div className="md:col-span-2">
            {/* Property highlights */}
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
            
            {/* Property features */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Características do Imóvel</h2>
                
                <div className="space-y-6">
                  {featureCategories.map((category, index) => {
                    // Only show categories that have at least one checked item
                    const hasCheckedFeatures = category.features.some(f => f.checked);
                    if (!hasCheckedFeatures) return null;
                    
                    return (
                      <div key={index}>
                        <h3 className="text-lg font-semibold mb-3">{category.title}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                          {category.features.filter(f => f.checked).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center">
                              <CheckIcon className="h-4 w-4 text-primary mr-2" />
                              <span className="text-sm">{feature.name}</span>
                            </div>
                          ))}
                        </div>
                        {index < featureCategories.length - 1 && <Separator className="mt-4" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Location */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Localização</h2>
                <p className="text-gray-700 mb-4">
                  {property.address}, {property.city} - {property.state}, {property.zipCode}
                </p>
                
                <div className="h-60 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe 
                    title="Localização do imóvel"
                    className="w-full h-full"
                    frameBorder="0"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address + ', ' + property.city + ', ' + property.state)}&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>
            
            {/* CTA Section for mobile */}
            <div className="md:hidden">
              <Button 
                className="w-full mb-4" 
                size="lg"
                onClick={() => setShowContactDialog(true)}
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Falar com o corretor
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
                onClick={() => window.open(`https://wa.me/${agent?.phone?.replace(/\D/g, '') || '5511999999999'}?text=${encodeURIComponent(`Olá, gostaria de informações sobre o imóvel: ${property.title} (${window.location.href})`)}`)}
              >
                <SiWhatsapp className="h-4 w-4 mr-2" />
                Contato via WhatsApp
              </Button>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="md:col-span-1">
            {/* Price and Contact Card */}
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <div className="flex items-end">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {formatCurrency(property.price)}
                    </h2>
                  </div>
                </div>
                
                {property.status === 'active' && (
                  <>
                    <Separator />
                    
                    <div className="space-y-3">
                      {property.area > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Valor do m²</span>
                          <span className="text-sm font-medium">{formatCurrency(property.price / property.area)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Publicado</span>
                        <span className="text-sm font-medium">{formatDate(property.createdAt)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Código</span>
                        <span className="text-sm font-medium">#{property.id}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setShowContactDialog(true)}
                    >
                      <MailIcon className="h-4 w-4 mr-2" />
                      Solicitar informações
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(`https://wa.me/${agent?.phone?.replace(/\D/g, '') || '5511999999999'}?text=${encodeURIComponent(`Olá, gostaria de informações sobre o imóvel: ${property.title} (${window.location.href})`)}`)}
                    >
                      <SiWhatsapp className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(`tel:${agent?.phone?.replace(/\D/g, '') || '5511999999999'}`)}
                    >
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                  </>
                )}
                
                {/* Agent info */}
                {agent && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={agent.profilePicture} alt={agent.fullName} />
                        <AvatarFallback>{getInitials(agent.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.fullName}</p>
                        <p className="text-xs text-muted-foreground">Corretor(a) Responsável</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <Link href={`/agente/${agent.id}`}>
                        Ver todos os imóveis
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Share options */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Compartilhar este imóvel
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9"
                      onClick={() => handleShare('whatsapp')}
                    >
                      <SiWhatsapp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9"
                      onClick={() => handleShare('facebook')}
                    >
                      <SiFacebook className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9"
                      onClick={() => handleShare('email')}
                    >
                      <MailIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9"
                      onClick={() => handleShare('copy')}
                    >
                      <ClipboardCopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Similar properties */}
        <div className="mt-12 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Gostou desse imóvel? Encontre imóveis semelhantes</h2>
          <Button 
            size="lg"
            asChild
          >
            <Link href={`/properties?type=${property.propertyType}&city=${property.city}`}>
              <MousePointerClickIcon className="h-4 w-4 mr-2" />
              Encontrar imóveis semelhantes
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Contact Form Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Solicitar informações</DialogTitle>
            <DialogDescription>
              Preencha seus dados abaixo para receber mais informações sobre este imóvel.
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
                placeholder="Olá, gostaria de mais informações sobre este imóvel."
                value={contactForm.message}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createLead.isPending}
              >
                {createLead.isPending ? "Enviando..." : "Enviar solicitação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Floating CTA for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex gap-2">
        <Button 
          className="flex-1"
          onClick={() => setShowContactDialog(true)}
        >
          <MailIcon className="h-4 w-4 mr-2" />
          Contato
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.open(`https://wa.me/${agent?.phone?.replace(/\D/g, '') || '5511999999999'}?text=${encodeURIComponent(`Olá, gostaria de informações sobre o imóvel: ${property.title} (${window.location.href})`)}`)}
        >
          <SiWhatsapp className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </div>
      
      {/* Tracking pixels (Non-visible) */}
      {property.pixelTracking && (
        <div style={{ display: 'none' }} aria-hidden="true">
          {/* Facebook Pixel Code */}
          <img 
            height="1" 
            width="1" 
            src={`https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1&cd[content_name]=${encodeURIComponent(property.title)}&cd[content_category]=${encodeURIComponent(property.propertyType)}&cd[content_ids]=${property.id}`} 
            alt="" 
          />
          
          {/* Google Ads Pixel */}
          <img 
            height="1" 
            width="1" 
            src={`https://www.googleadservices.com/pagead/conversion/CONVERSION_ID/?label=LABEL&guid=ON&script=0&value=${property.price}`} 
            alt="" 
          />
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;