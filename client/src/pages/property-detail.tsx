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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, getPropertyTypeLabel, getPropertyStatusLabel, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, Lead } from "@/types";
import { Bed, Bath } from "lucide-react";
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
  ArrowLeftIcon,
  VideoIcon,
  CompassIcon,
  PlayIcon,
  Building2Icon,
  Loader2Icon,
  Edit2Icon,
  MessageSquareIcon
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

interface ScheduleVisitFormData {
  fullName: string;
  email: string;
  phone: string;
  date: Date | undefined;
  timeSlot: string;
  visitType: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Funções utilitárias para processar URLs de vídeo e tour virtual
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Formatos possíveis:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  
  let videoId: string | null = null;
  
  // Regex para extrair o ID do vídeo do YouTube
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Se o usuário colocou apenas o ID do vídeo
  ];
  
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const getVimeoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Formatos possíveis:
  // - https://vimeo.com/VIDEO_ID
  // - https://player.vimeo.com/video/VIDEO_ID
  
  let videoId: string | null = null;
  
  // Regex para extrair o ID do vídeo do Vimeo
  const regexes = [
    /vimeo\.com\/([0-9]+)/,
    /player\.vimeo\.com\/video\/([0-9]+)/,
    /^([0-9]+)$/ // Se o usuário colocou apenas o ID do vídeo
  ];
  
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
};

const getMatterportEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Formatos possíveis:
  // - https://my.matterport.com/show/?m=MODEL_ID
  // - https://my.matterport.com/models/MODEL_ID
  
  let modelId: string | null = null;
  
  // Regex para extrair o ID do modelo Matterport
  const regexes = [
    /my\.matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/,
    /my\.matterport\.com\/models\/([a-zA-Z0-9]+)/,
    /^([a-zA-Z0-9]{8,})$/ // Se o usuário colocou apenas o ID do modelo
  ];
  
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match && match[1]) {
      modelId = match[1];
      break;
    }
  }
  
  return modelId ? `https://my.matterport.com/show/?m=${modelId}` : null;
};

// Detecta automaticamente o tipo de URL e retorna o embed apropriado
const getEmbedUrl = (url: string): { type: 'youtube' | 'vimeo' | 'matterport' | 'unknown', embedUrl: string | null } => {
  if (!url) return { type: 'unknown', embedUrl: null };
  
  const youtubeUrl = getYouTubeEmbedUrl(url);
  if (youtubeUrl) return { type: 'youtube', embedUrl: youtubeUrl };
  
  const vimeoUrl = getVimeoEmbedUrl(url);
  if (vimeoUrl) return { type: 'vimeo', embedUrl: vimeoUrl };
  
  const matterportUrl = getMatterportEmbedUrl(url);
  if (matterportUrl) return { type: 'matterport', embedUrl: matterportUrl };
  
  return { type: 'unknown', embedUrl: null };
};

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
  const [viewMode, setViewMode] = useState<'photos' | 'map' | 'media'>('photos');
  const [isFloatingCTAVisible, setIsFloatingCTAVisible] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleForm, setScheduleForm] = useState<ScheduleVisitFormData>({
    fullName: "",
    email: "",
    phone: "",
    date: undefined,
    timeSlot: "10:00",
    visitType: "presencial",
    message: "Gostaria de agendar uma visita para conhecer este imóvel."
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
  ]);
  
  // Mostrar CTA flutuante quando o usuário rolar a página
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsFloatingCTAVisible(scrollTop > 300);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
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
  
  // Visit scheduling mutation
  const scheduleVisit = useMutation({
    mutationFn: async (visitData: ScheduleVisitFormData) => {
      return apiRequest('/api/public/schedule-visit', {
        method: 'POST',
        body: JSON.stringify({
          ...visitData,
          propertyId: property?.id,
          scheduledDate: visitData.date ? visitData.date.toISOString() : undefined,
          agentId: property?.userId,
          type: 'visit_request'
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Visita agendada com sucesso!",
        description: "O corretor entrará em contato para confirmar os detalhes.",
        duration: 5000,
      });
      setShowScheduleDialog(false);
      setScheduleForm({
        fullName: "",
        email: "",
        phone: "",
        date: undefined,
        timeSlot: "10:00",
        visitType: "presencial",
        message: "Gostaria de agendar uma visita para conhecer este imóvel."
      });
      setSelectedScheduleDate(undefined);
      
      // Registrar evento de conversão
      if (typeof window !== 'undefined') {
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Schedule', {
            content_name: property?.title,
            content_category: 'property_visit',
            content_ids: [property?.id],
          });
        }
        
        if ((window as any).gtag) {
          (window as any).gtag('event', 'schedule_visit', {
            event_category: 'leads',
            event_label: property?.title,
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar visita",
        description: "Houve um problema ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Erro ao agendar visita:", error);
    },
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
    }
  });
  
  // Mutation para converter um imóvel em empreendimento de unidade única
  const convertToDevelopment = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/properties/${id}/convert-to-development`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Conversão realizada com sucesso!",
        description: "Imóvel transformado em empreendimento de unidade única.",
        duration: 5000,
      });
      
      // Redirecionar para a página de detalhes do novo empreendimento
      setTimeout(() => {
        window.location.href = `/development-detail/${data.development.id}`;
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na conversão",
        description: error.message || "Não foi possível converter o imóvel em empreendimento.",
        variant: "destructive",
        duration: 5000,
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
  
  // SEO Meta setup (in a production app, use Next.js Head or React Helmet)
  useEffect(() => {
    document.title = property ? `${property.title} - ImobCloud` : 'Detalhes do Imóvel - ImobCloud';
    
    // Limpe quaisquer tags meta anteriores
    const existingMetaTags = document.head.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name="keywords"], meta[name="robots"], meta[name="twitter:"]');
    existingMetaTags.forEach(tag => tag.remove());
    
    // Só crie novas tags meta se property existir
    if (property) {
      const metaTags = [
        // Meta description - otimizada para SEO com informações detalhadas e palavras-chave
        {
          name: 'description',
          content: `${getPropertyTypeLabel(property.propertyType)} ${property.bedrooms ? `com ${property.bedrooms} quartos` : ''} ${property.bathrooms ? `e ${property.bathrooms} banheiros` : ''}, ${property.status === 'active' ? 'à venda' : 'vendido'} por ${formatCurrency(property.price)} em ${property.neighborhood}, ${property.city}. ${property.area ? `${property.area}m²` : ''} ${property.description?.substring(0, 100)}...`
        },
        // Keywords para SEO
        {
          name: 'keywords',
          content: `imóvel, ${property.propertyType}, ${property.city}, ${property.neighborhood}, ${property.bedrooms ? `${property.bedrooms} quartos` : ''}, imobiliária, comprar, casa, apartamento`
        },
        // Permitir indexação 
        {
          name: 'robots',
          content: 'index, follow'
        },
        // Open Graph para compartilhamento em redes sociais
        {
          property: 'og:title',
          content: `${property.title} - ${property.neighborhood}, ${property.city}`
        },
        {
          property: 'og:description',
          content: `${getPropertyTypeLabel(property.propertyType)} ${property.bedrooms ? `com ${property.bedrooms} quartos` : ''} por ${formatCurrency(property.price)}. ${property.description?.substring(0, 100)}...`
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:url',
          content: window.location.href
        },
        // Twitter Card
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          name: 'twitter:title',
          content: `${property.title} - ${property.neighborhood}, ${property.city}`
        },
        {
          name: 'twitter:description',
          content: `${getPropertyTypeLabel(property.propertyType)} ${property.bedrooms ? `com ${property.bedrooms} quartos` : ''} por ${formatCurrency(property.price)}`
        }
      ];
      
      // Adicionar imagem para Open Graph e Twitter
      if (property.images?.length > 0) {
        metaTags.push(
          {
            property: 'og:image',
            content: property.images[0]
          },
          {
            name: 'twitter:image',
            content: property.images[0]
          }
        );
      }
      
      // Criar e adicionar todas as tags meta
      metaTags.forEach(tag => {
        const metaElement = document.createElement('meta');
        const key = Object.keys(tag)[0];
        const value = Object.values(tag)[0];
        
        metaElement.setAttribute(key, value as string);
        document.head.appendChild(metaElement);
      });
      
      // Registrar visualização para analytics
      if (typeof window !== 'undefined') {
        // Google Analytics event
        if ((window as any).gtag) {
          (window as any).gtag('event', 'view_item', {
            event_category: 'property',
            event_label: property.title,
            value: property.price,
            currency: 'BRL',
            items: [{
              id: property.id,
              name: property.title,
              category: property.propertyType,
              price: property.price,
              variant: `${property.bedrooms} quartos`,
              location: `${property.neighborhood}, ${property.city}`
            }]
          });
        }
        
        // Facebook Pixel
        if ((window as any).fbq) {
          (window as any).fbq('track', 'ViewContent', {
            content_name: property.title,
            content_category: property.propertyType,
            content_ids: [property.id],
            content_type: 'product',
            value: property.price,
            currency: 'BRL',
          });
        }
      }
    }
    
    return () => {
      // Clean up meta tags when component unmounts
      document.title = 'ImobCloud';
      const metaTags = document.head.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name="keywords"], meta[name="robots"], meta[name="twitter:"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [property]);
  
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
  
  // Função para agendar visita
  const handleScheduleVisit = () => {
    if (!selectedScheduleDate) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para a visita.",
        variant: "destructive",
      });
      return;
    }
    
    // Criar um lead de agendamento
    createLead.mutate({
      fullName: contactForm.fullName,
      email: contactForm.email,
      phone: contactForm.phone,
      message: `Solicitação de visita para ${selectedScheduleDate.toLocaleDateString('pt-BR')}`,
      propertyId: Number(id),
      userId: property?.userId,
      stage: 'visit_scheduled',
      source: contactForm.source || 'website',
      status: 'active',
      customFields: {
        visitDate: selectedScheduleDate.toISOString(),
        utmSource: contactForm.utmSource,
        utmMedium: contactForm.utmMedium,
        utmCampaign: contactForm.utmCampaign,
      }
    });
    
    // Registrar evento de conversão
    if (typeof window !== 'undefined') {
      // Facebook Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ScheduleVisit', {
          content_name: property?.title,
          content_category: property?.propertyType,
          content_ids: [property?.id],
          value: property?.price,
          currency: 'BRL',
        });
      }
      
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'schedule_visit', {
          event_category: 'property',
          event_label: property?.title,
          value: property?.price,
        });
      }
    }
    
    toast({
      title: "Visita agendada",
      description: `Sua visita foi agendada para ${selectedScheduleDate.toLocaleDateString('pt-BR')}. O corretor entrará em contato para confirmar.`,
    });
    
    setShowScheduleDialog(false);
    setSelectedScheduleDate(undefined);
  };

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
              variant="default" 
              size="sm" 
              className="hidden md:flex"
              onClick={() => setShowScheduleDialog(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Agendar visita
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
        {/* Seção administrativa (visível apenas para proprietários) */}
        {isPropertyOwner && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Ações administrativas</h3>
                  <p className="text-sm text-muted-foreground">Ferramentas avançadas para gerenciamento</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/edit-property/${property.id}`)}
                  >
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Editar imóvel
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const confirmConversion = window.confirm(
                        "Ao converter este imóvel em empreendimento, você poderá gerenciá-lo com recursos avançados como espelho de vendas e unidades múltiplas. Deseja continuar?"
                      );
                      if (confirmConversion) {
                        convertToDevelopment.mutate();
                      }
                    }}
                  >
                    <Building2Icon className="h-4 w-4 mr-2" />
                    Converter em empreendimento
                  </Button>
                </div>
              </div>
              
              {convertToDevelopment.isPending && (
                <div className="mt-4 flex items-center text-sm text-primary bg-primary/5 p-3 rounded-md">
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Convertendo imóvel em empreendimento...
                </div>
              )}
              
              <div className="mt-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="conversion-info">
                    <AccordionTrigger className="text-sm">
                      O que significa converter em empreendimento?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Ao converter este imóvel em um empreendimento, você terá acesso a recursos avançados como:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                        <li>Espelho de vendas unificado</li>
                        <li>Possibilidade de adicionar múltiplas unidades</li>
                        <li>Melhor organização no catálogo imobiliário</li>
                        <li>Estatísticas e relatórios específicos para empreendimentos</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        )}

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
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'photos' | 'map' | 'media')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="media">Vídeo & Tour</TabsTrigger>
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
            <TabsContent value="media" className="mt-0">
              {(!property.videoUrl && !property.tourUrl) ? (
                <div className="h-[450px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <VideoIcon className="h-12 w-12 mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">Nenhum conteúdo multimídia disponível</h3>
                  <p>Este imóvel não possui vídeos ou tour virtual cadastrados.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {property.videoUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <VideoIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Vídeo do imóvel</h3>
                      </div>
                      <div className="h-[450px] bg-gray-100 rounded-lg overflow-hidden">
                        {(() => {
                          const { type, embedUrl } = getEmbedUrl(property.videoUrl);
                          if (embedUrl) {
                            if (type === 'youtube' || type === 'vimeo') {
                              return (
                                <iframe 
                                  src={embedUrl}
                                  width="100%" 
                                  height="100%" 
                                  allowFullScreen
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  title={`Vídeo de ${property.title}`}
                                  frameBorder="0"
                                  className="w-full h-full rounded-lg"
                                ></iframe>
                              );
                            }
                          }
                          return (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ExternalLinkIcon className="mr-2 h-4 w-4" />
                              <a 
                                href={property.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Ver vídeo em nova janela
                              </a>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {property.tourUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CompassIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Tour virtual</h3>
                      </div>
                      <div className="h-[450px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8 text-center">
                        <div className="mb-6">
                          <CompassIcon className="h-16 w-16 text-primary/40 mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Tour Virtual Disponível</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            Explore este imóvel em 360° através do nosso tour virtual interativo. 
                            Você será redirecionado para a plataforma do tour.
                          </p>
                        </div>
                        
                        <Button 
                          className="flex items-center gap-2"
                          size="lg"
                          onClick={() => window.open(property.tourUrl, '_blank')}
                        >
                          <PlayIcon className="h-4 w-4" />
                          Acessar Tour Virtual
                        </Button>
                        
                        <p className="text-xs text-muted-foreground mt-4">
                          O tour será aberto em uma nova janela
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                      <Bed className="h-6 w-6 text-primary mb-1" />
                      <span className="text-lg font-bold">{property.bedrooms}</span>
                      <span className="text-xs text-muted-foreground">Quartos</span>
                    </div>
                  )}
                  
                  {property.bathrooms > 0 && (
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                      <Bath className="h-6 w-6 text-primary mb-1" />
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
      
      {/* Diálogo de Agendamento de Visita */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
            <DialogDescription>
              Preencha seus dados para agendar uma visita a este imóvel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            
            if (!scheduleForm.fullName || !scheduleForm.email || !scheduleForm.phone || !scheduleForm.date || !scheduleForm.timeSlot || !scheduleForm.visitType) {
              toast({
                title: "Erro no formulário",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive",
              });
              return;
            }
            
            // Obter UTM params do URL se existirem
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source');
            const utmMedium = urlParams.get('utm_medium');
            const utmCampaign = urlParams.get('utm_campaign');
            
            scheduleVisit.mutate({
              ...scheduleForm,
              utmSource: utmSource || undefined,
              utmMedium: utmMedium || undefined,
              utmCampaign: utmCampaign || undefined,
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="visit-name">Nome completo*</Label>
                <Input
                  id="visit-name"
                  name="fullName"
                  value={scheduleForm.fullName}
                  onChange={(e) => setScheduleForm(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visit-email">Email*</Label>
                <Input
                  id="visit-email"
                  name="email"
                  type="email"
                  value={scheduleForm.email}
                  onChange={(e) => setScheduleForm(prev => ({...prev, email: e.target.value}))}
                  placeholder="Seu email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visit-phone">Telefone*</Label>
                <Input
                  id="visit-phone"
                  name="phone"
                  value={scheduleForm.phone}
                  onChange={(e) => setScheduleForm(prev => ({...prev, phone: e.target.value}))}
                  placeholder="Seu telefone para contato"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visit-date">Data preferencial para visita*</Label>
                <div className="p-4 border rounded-md">
                  <Calendar
                    mode="single"
                    selected={selectedScheduleDate}
                    onSelect={(date) => {
                      setSelectedScheduleDate(date);
                      setScheduleForm(prev => ({...prev, date}));
                    }}
                    className="mx-auto"
                    disabled={(date) => date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 30))}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione uma data nos próximos 30 dias. Horários disponíveis serão confirmados pelo corretor.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="visit-time">Horário preferencial*</Label>
                <Select 
                  value={scheduleForm.timeSlot} 
                  onValueChange={(value) => setScheduleForm(prev => ({...prev, timeSlot: value}))}
                >
                  <SelectTrigger id="visit-time">
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Tipo de visita*</Label>
                <RadioGroup 
                  value={scheduleForm.visitType}
                  onValueChange={(value) => setScheduleForm(prev => ({...prev, visitType: value}))}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="presencial" id="presencial" />
                    <Label htmlFor="presencial" className="font-normal">Presencial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="font-normal">Videochamada</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="visit-message">Observações</Label>
                <Textarea
                  id="visit-message"
                  name="message"
                  value={scheduleForm.message}
                  onChange={(e) => setScheduleForm(prev => ({...prev, message: e.target.value}))}
                  placeholder="Detalhes adicionais sobre sua visita"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={scheduleVisit.isPending}
              >
                {scheduleVisit.isPending ? "Agendando..." : "Agendar Visita"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* CTA Flutuante para Dispositivos Móveis */}
      {isFloatingCTAVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 shadow-lg flex justify-between items-center z-50 md:hidden">
          <div>
            <p className="font-bold text-lg">{formatCurrency(property.price)}</p>
            <p className="text-xs text-muted-foreground">{property.bedrooms} quartos · {property.area}m²</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowScheduleDialog(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Visitar
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => setShowContactDialog(true)}
            >
              <PhoneIcon className="h-4 w-4 mr-1" />
              Contato
            </Button>
          </div>
        </div>
      )}
      
      {/* WhatsApp Flutuante */}
      <div className="fixed bottom-24 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="icon" 
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
                onClick={() => {
                  const message = `Olá, estou interessado no imóvel "${property.title}" (Ref: ${property.id}) anunciado no seu site.`;
                  window.open(`https://wa.me/${agent?.phone?.replace(/\D/g, '') || '5511999999999'}?text=${encodeURIComponent(message)}`);
                  
                  // Registrar evento de conversão
                  if (typeof window !== 'undefined') {
                    if ((window as any).fbq) {
                      (window as any).fbq('track', 'Contact', {
                        content_name: property.title,
                        content_category: 'whatsapp',
                        content_ids: [property.id],
                      });
                    }
                    
                    if ((window as any).gtag) {
                      (window as any).gtag('event', 'whatsapp_click', {
                        event_category: 'contact',
                        event_label: property.title,
                      });
                    }
                  }
                }}
              >
                <SiWhatsapp className="h-7 w-7 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Fale pelo WhatsApp</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PropertyDetail;