import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCep } from "@/hooks/use-cep";
import { 
  CloudUpload, 
  ArrowLeft, 
  ArrowRight, 
  Info, 
  MapPin, 
  Home, 
  Waves, 
  DollarSign, 
  Image,
  Upload,
  AlertCircle,
  X,
  Plus,
  Search,
  Video,
  Compass,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building,
  Check,
  Trash,
  Earth,
  HandCoins,
  Ruler,
  Bed,
  Bath,
  Car
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Componentes personalizados para os tipos de propriedades
import PropertyTypeFields from "./property-type-fields";
import PortalIntegrations from "./portal-integrations";

// Form schema
const propertyFormSchema = z.object({
  // Campos básicos
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  address: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().min(5, "O CEP deve ter pelo menos 5 caracteres"),
  addressComplement: z.string().optional(),
  neighborhood: z.string().optional(),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  propertyType: z.enum(["apartment", "house", "land", "commercial", "rural"]),
  transactionType: z.enum(["sale", "rent", "both"]).default("sale"),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  area: z.coerce.number().min(1, "A área deve ser maior que zero"),
  buildingArea: z.coerce.number().optional(),
  garageSpots: z.coerce.number().optional(),
  status: z.enum(["active", "reserved", "sold", "inactive"]),
  yearBuilt: z.coerce.number().optional(),
  occupancyStatus: z.enum(["vacant", "occupied", "under_construction"]).optional(),
  // Características
  hasSwimmingPool: z.boolean().default(false),
  hasFurniture: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  hasGym: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),
  hasBarbecue: z.boolean().default(false),
  hasPartyRoom: z.boolean().default(false),
  hasPlayground: z.boolean().default(false),
  hasSportsField: z.boolean().default(false),
  hasSauna: z.boolean().default(false),
  hasHotTub: z.boolean().default(false),
  hasPetsAllowed: z.boolean().default(false),
  hasGatedCommunity: z.boolean().default(false),
  hasIntercom: z.boolean().default(false),
  hasLaundry: z.boolean().default(false),
  hasCentralHeating: z.boolean().default(false),
  // Comercial
  propertyTax: z.coerce.number().optional(),
  condoFee: z.coerce.number().optional(),
  featured: z.boolean().default(false),
  availableForAffiliation: z.boolean().default(false),
  affiliationCommissionRate: z.coerce.number().min(0).max(100).optional(),
  published: z.boolean().default(false),
  publishedPortals: z.array(z.string()).default([]),
  acceptsExchange: z.boolean().default(false),
  acceptsFinancing: z.boolean().default(false),
  nearMetro: z.boolean().default(false),
  nearSchools: z.boolean().default(false),
  nearShops: z.boolean().default(false),
  nearBeach: z.boolean().default(false),
  coordinates: z.string().optional(),
  
  // Campos específicos para cada tipo de imóvel
  // Apartamento
  floor: z.coerce.number().optional(),
  totalFloors: z.coerce.number().optional(),
  unitsPerFloor: z.coerce.number().optional(),
  apartmentCondition: z.string().optional(),
  buildingName: z.string().optional(),
  hasElevator: z.boolean().default(false),
  hasConcierge: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  
  // Casa
  lotSize: z.coerce.number().optional(),
  stories: z.coerce.number().optional(),
  houseCondition: z.string().optional(),
  hasOutdoorArea: z.boolean().default(false),
  isCorner: z.boolean().default(false),
  isGated: z.boolean().default(false),
  hasSolarPanels: z.boolean().default(false),
  hasServiceArea: z.boolean().default(false),
  
  // Comercial
  commercialType: z.string().optional(),
  floorNumber: z.coerce.number().optional(),
  commercialCondition: z.string().optional(),
  monthlyMaintenanceFee: z.coerce.number().optional(),
  previousUse: z.string().optional(),
  has24HourAccess: z.boolean().default(false),
  hasLoadingDock: z.boolean().default(false),
  hasReceptionArea: z.boolean().default(false),
  
  // Terreno
  frontSize: z.coerce.number().optional(),
  sideSize: z.coerce.number().optional(),
  topography: z.string().optional(),
  landType: z.string().optional(),
  zoningType: z.string().optional(),
  hasWaterConnection: z.boolean().default(false),
  hasSewerConnection: z.boolean().default(false),
  hasPowerConnection: z.boolean().default(false),
  hasDemolition: z.boolean().default(false),
  isInCondominium: z.boolean().default(false),
  
  // Configurações dos portais
  portalConfig: z.record(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    hidePrice: z.boolean().default(false),
    hideAddress: z.boolean().default(false),
    keywords: z.string().optional()
  })).optional(),
  
  // SEO e metadados
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  
  // Imagens e mídia
  images: z.array(z.any()).default([]),
  tourUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  
  // Características do anúncio
  advertisingTitle: z.string().optional(),
  highlightFeatures: z.array(z.string()).default([]),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface ContinuousPropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  onSuccess?: () => void;
}

const ContinuousPropertyForm = ({ initialData, onSuccess }: ContinuousPropertyFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [highlightFeature, setHighlightFeature] = useState("");
  const { fetchAddressByCep, isLoading: isCepLoading } = useCep();

  // Gerenciar estado das seções expansíveis
  const [expandedSections, setExpandedSections] = useState({
    locationDetails: false,
    propertyFeatures: false,
    propertyAmenities: false,
    commercialDetails: false,
    mediaConfig: false,
    marketingConfig: false,
    portalIntegrations: false,
    advancedSettings: false
  });

  // Alternar estado da seção
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Default values for the form
  const defaultValues: Partial<PropertyFormValues> = {
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    addressComplement: "",
    neighborhood: "",
    price: 0,
    propertyType: "house",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    buildingArea: 0,
    garageSpots: 0,
    status: "active",
    yearBuilt: new Date().getFullYear(),
    hasSwimmingPool: false,
    hasFurniture: false,
    hasGarden: false,
    hasSecurity: false,
    hasGym: false,
    hasBalcony: false,
    propertyTax: 0,
    condoFee: 0,
    featured: false,
    availableForAffiliation: false,
    affiliationCommissionRate: 0,
    published: false,
    publishedPortals: [],
    acceptsExchange: false,
    acceptsFinancing: false,
    nearMetro: false,
    nearSchools: false,
    nearShops: false,
    nearBeach: false,
    coordinates: "",
    images: [],
    highlightFeatures: [],
    ...initialData,
  };

  // Form definition
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Property mutation (create or update)
  const propertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      if (initialData?.id) {
        // Update existing property
        return apiRequest("PUT", `/api/properties/${initialData.id}`, data);
      } else {
        // Create new property
        return apiRequest("POST", "/api/properties", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: initialData?.id ? "Imóvel atualizado com sucesso" : "Imóvel criado com sucesso",
        description: initialData?.id 
          ? "O imóvel foi atualizado com sucesso" 
          : "O imóvel foi adicionado à sua lista",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: initialData?.id ? "Erro ao atualizar imóvel" : "Erro ao criar imóvel",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      });
      console.error("Error:", error);
    },
  });

  // Submit handler
  const onSubmit = (data: PropertyFormValues) => {
    propertyMutation.mutate(data);
  };
  
  // Gerenciamento de imagens
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulação de upload
    setTimeout(() => {
      const newImages = Array.from(files).map((file) => {
        return URL.createObjectURL(file);
      });
      
      form.setValue('images', [...form.getValues('images'), ...newImages]);
      setUploadedImages([...uploadedImages, ...newImages]);
      setIsUploading(false);
      
      toast({
        title: "Imagens adicionadas",
        description: `${files.length} imagem(ns) adicionada(s) com sucesso`,
      });
    }, 1500);
  };
  
  const removeImage = (indexToRemove: number) => {
    const currentImages = form.getValues('images');
    const newImages = currentImages.filter((_, index) => index !== indexToRemove);
    form.setValue('images', newImages);
    
    const newUploadedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(newUploadedImages);
  };
  
  // Gerenciamento de destaques do imóvel
  const addHighlightFeature = () => {
    if (!highlightFeature) return;
    
    const currentFeatures = form.getValues('highlightFeatures') || [];
    form.setValue('highlightFeatures', [...currentFeatures, highlightFeature]);
    setHighlightFeature("");
  };
  
  const removeHighlightFeature = (indexToRemove: number) => {
    const currentFeatures = form.getValues('highlightFeatures');
    const newFeatures = currentFeatures.filter((_, index) => index !== indexToRemove);
    form.setValue('highlightFeatures', newFeatures);
  };
  
  // Função para buscar e preencher os campos de endereço com base no CEP
  const handleCepSearch = async () => {
    const cep = form.getValues('zipCode');
    if (!cep || cep.length < 8) {
      toast({
        title: "CEP incompleto",
        description: "Digite um CEP válido com 8 dígitos",
        variant: "destructive"
      });
      return;
    }
    
    const addressData = await fetchAddressByCep(cep);
    if (addressData) {
      form.setValue('address', addressData.street);
      form.setValue('neighborhood', addressData.neighborhood);
      form.setValue('city', addressData.city);
      form.setValue('state', addressData.state);
      
      toast({
        title: "Endereço encontrado",
        description: "Os campos de endereço foram preenchidos automaticamente",
        variant: "default"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção 1: Informações Básicas */}
        <Card className="border-t-4 border-t-primary overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Informações Básicas do Imóvel</CardTitle>
            </div>
            <CardDescription>
              Preencha os dados essenciais para identificar e classificar o imóvel
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Anúncio*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Apartamento com 3 quartos no Centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Imóvel*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="commercial">Comercial</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transação*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="rent">Aluguel</SelectItem>
                        <SelectItem value="both">Venda e Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)*</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="reserved">Reservado</SelectItem>
                        <SelectItem value="sold">Vendido</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Publicar Imóvel</FormLabel>
                      <FormDescription>
                        Tornar visível no site
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-2 md:col-span-1">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Quartos</FormLabel>
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-1">
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Banheiros</FormLabel>
                      <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-1">
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Área Total (m²)*</FormLabel>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-1">
                <FormField
                  control={form.control}
                  name="garageSpots"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Vagas de Garagem</FormLabel>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Completa*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o imóvel, características, proximidades, etc."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 2: Endereço */}
        <Card className="border-t-4 border-t-blue-500 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Endereço e Localização</CardTitle>
            </div>
            <CardDescription>
              Informe o endereço completo do imóvel e dados de localização
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>CEP*</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCepSearch}
                        disabled={isCepLoading}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço*</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade*</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado*</FormLabel>
                    <FormControl>
                      <Input placeholder="UF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Collapsible 
              open={expandedSections.locationDetails} 
              onOpenChange={() => toggleSection('locationDetails')}
              className="rounded-md border p-4 mt-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-sm font-medium">Detalhes adicionais de localização</h3>
                  {expandedSections.locationDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="addressComplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, Bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordenadas GPS</FormLabel>
                      <FormControl>
                        <Input placeholder="Latitude, Longitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="nearMetro"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Próximo ao Metrô
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nearShops"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Próximo a Comércio
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nearSchools"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Próximo a Escolas
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nearBeach"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Próximo à Praia
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Seção 3: Características do Imóvel */}
        <Card className="border-t-4 border-t-green-500 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Características Específicas</CardTitle>
            </div>
            <CardDescription>
              Informações específicas para o tipo de imóvel selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Renderiza campos específicos com base no tipo de imóvel */}
            <PropertyTypeFields 
              propertyType={form.watch('propertyType')} 
              form={form} 
            />

            <Collapsible 
              open={expandedSections.propertyFeatures} 
              onOpenChange={() => toggleSection('propertyFeatures')}
              className="rounded-md border p-4 mt-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-sm font-medium">Destaques do Imóvel</h3>
                  {expandedSections.propertyFeatures ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-1">
                    <FormLabel htmlFor="highlightFeature">Adicionar Destaque</FormLabel>
                    <Input
                      id="highlightFeature"
                      placeholder="Ex: Vista panorâmica, Reformado, etc."
                      value={highlightFeature}
                      onChange={(e) => setHighlightFeature(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addHighlightFeature}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Adicionar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.watch('highlightFeatures')?.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="py-2 px-3">
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeHighlightFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {form.watch('highlightFeatures')?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum destaque adicionado. Adicione características que tornam este imóvel único.
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Seção 4: Fotos e Mídia */}
        <Card className="border-t-4 border-t-amber-500 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Fotos e Mídia</CardTitle>
            </div>
            <CardDescription>
              Adicione imagens, vídeos e tour virtual do imóvel
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="mx-auto flex flex-col items-center justify-center gap-2">
                  <CloudUpload className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Arraste e solte ou clique para adicionar</h3>
                  <p className="text-sm text-muted-foreground">
                    Suporta JPG, PNG ou GIF até 5MB. As fotos devem ter boa resolução.
                  </p>
                  <div className="mt-4">
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          {isUploading ? (
                            <>Carregando...</>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" /> Selecionar Imagens
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {form.watch('images')?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {form.watch('images').map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2">Principal</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Collapsible 
              open={expandedSections.mediaConfig} 
              onOpenChange={() => toggleSection('mediaConfig')}
              className="rounded-md border p-4 mt-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-sm font-medium">Vídeo e Tour Virtual</h3>
                  {expandedSections.mediaConfig ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Vídeo</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="https://youtube.com/..." {...field} />
                        </FormControl>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" type="button">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cole aqui o link do YouTube, Vimeo ou outro serviço</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormDescription>
                        Links do YouTube, Vimeo ou outro serviço de vídeo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tourUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Tour Virtual</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="https://matterport.com/..." {...field} />
                        </FormControl>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" type="button">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cole aqui o link do Matterport, 3DVista ou outro serviço de tour virtual</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormDescription>
                        Links do Matterport, 3DVista ou outro serviço de tour virtual
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Seção 5: Comodidades */}
        <Collapsible 
          open={expandedSections.propertyAmenities} 
          onOpenChange={() => toggleSection('propertyAmenities')}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium">Comodidades e Lazer</h3>
              </div>
              {expandedSections.propertyAmenities ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hasSwimmingPool"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Piscina
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasGarden"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Jardim
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasSecurity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Segurança 24h
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasGym"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Academia
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasBalcony"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Varanda/Sacada
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasBarbecue"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Churrasqueira
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasPartyRoom"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Salão de Festas
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasPlayground"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Playground
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasFurniture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Mobiliado
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Seção 6: Detalhes Comerciais */}
        <Collapsible 
          open={expandedSections.commercialDetails} 
          onOpenChange={() => toggleSection('commercialDetails')}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <HandCoins className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-medium">Detalhes Comerciais</h3>
              </div>
              {expandedSections.commercialDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="propertyTax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IPTU (R$/ano)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condoFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condomínio (R$/mês)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Destaque</FormLabel>
                      <FormDescription>
                        Exibir como destaque
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="acceptsFinancing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Aceita Financiamento
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptsExchange"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Aceita Permuta
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Seção 7: Configurações Avançadas */}
        <Collapsible 
          open={expandedSections.advancedSettings} 
          onOpenChange={() => toggleSection('advancedSettings')}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-medium">Configurações Avançadas</h3>
              </div>
              {expandedSections.advancedSettings ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availableForAffiliation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Disponível para Afiliação</FormLabel>
                      <FormDescription>
                        Permitir que outros corretores vendam este imóvel
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('availableForAffiliation') && (
                <FormField
                  control={form.control}
                  name="affiliationCommissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Comissão (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" placeholder="Ex: 5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Porcentagem da comissão para afiliados
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título SEO</FormLabel>
                    <FormControl>
                      <Input placeholder="Título otimizado para mecanismos de busca" {...field} />
                    </FormControl>
                    <FormDescription>
                      Título que aparecerá nos resultados de busca (Google, etc)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição SEO</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição otimizada para mecanismos de busca"
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descrição que aparecerá nos resultados de busca
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Seção 8: Integração com Portais */}
        <Collapsible 
          open={expandedSections.portalIntegrations} 
          onOpenChange={() => toggleSection('portalIntegrations')}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer p-4 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Earth className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Integração com Portais</h3>
              </div>
              {expandedSections.portalIntegrations ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 space-y-6">
            <Alert variant="info" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Configuração de Portais</AlertTitle>
              <AlertDescription>
                Selecione os portais onde deseja publicar este imóvel e configure detalhes específicos para cada portal.
              </AlertDescription>
            </Alert>

            <PortalIntegrations 
              form={form} 
              publishedPortals={form.watch('publishedPortals') || []}
              onPortalChange={(portals) => form.setValue('publishedPortals', portals)}
              portalConfig={form.watch('portalConfig') || {}}
              onPortalConfigChange={(config) => form.setValue('portalConfig', config)}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Botões de Ações */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
            disabled={propertyMutation.isPending}
          >
            Cancelar
          </Button>
          
          <Button 
            type="submit" 
            disabled={propertyMutation.isPending}
            className="gap-2"
          >
            {propertyMutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> 
                {initialData?.id ? "Atualizar Imóvel" : "Criar Imóvel"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContinuousPropertyForm;