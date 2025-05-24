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
  Search
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Componentes personalizados
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

interface EnhancedPropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  onSuccess?: () => void;
}

const EnhancedPropertyForm = ({ initialData, onSuccess }: EnhancedPropertyFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basics");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [highlightFeature, setHighlightFeature] = useState("");

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-7 mb-6">
                <TabsTrigger value="basics" className="flex gap-2 items-center">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Básico</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex gap-2 items-center">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Localização</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex gap-2 items-center">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Características</span>
                </TabsTrigger>
                <TabsTrigger value="specific" className="flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Específicas</span>
                </TabsTrigger>
                <TabsTrigger value="amenities" className="flex gap-2 items-center">
                  <Waves className="h-4 w-4" />
                  <span className="hidden sm:inline">Comodidades</span>
                </TabsTrigger>
                <TabsTrigger value="commercial" className="flex gap-2 items-center">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Comercial</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex gap-2 items-center">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Imagens</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Informações Básicas</h2>
                <Separator />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Apartamento com 3 quartos no Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o imóvel, características, proximidades, etc."
                          className="resize-none min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectValue placeholder="Selecione o tipo"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartamento</SelectItem>
                            <SelectItem value="house">Casa</SelectItem>
                            <SelectItem value="land">Terreno</SelectItem>
                            <SelectItem value="commercial">Comercial</SelectItem>
                          </SelectContent>
                        </Select>
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
                              <SelectValue placeholder="Selecione o status"/>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço*</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                            <Input 
                              type="number"
                              placeholder="0,00"
                              className="pl-10"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseFloat(value));
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Total (m²)*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buildingArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Construída (m²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseFloat(value));
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartos</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseInt(value));
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banheiros</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseInt(value));
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="garageSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vagas de Garagem</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseInt(value));
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano de Construção</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={new Date().getFullYear().toString()}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? "0" : e.target.value;
                            field.onChange(parseInt(value));
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 mt-4">
                  <h3 className="text-md font-medium">Destaques do Imóvel</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Adicione um destaque (ex: Vista para o mar)"
                      value={highlightFeature}
                      onChange={(e) => setHighlightFeature(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addHighlightFeature} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch('highlightFeatures')?.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="py-1.5 px-3">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => removeHighlightFeature(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {form.watch('highlightFeatures')?.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum destaque adicionado. Os destaques aparecerão em primeiro plano na página do imóvel.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Localização</h2>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Centro" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} />
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
                          <Input placeholder="Ex: SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="addressComplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Apto 101, Bloco B" {...field} value={field.value || ""} />
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
                      <FormLabel>Coordenadas (latitude, longitude)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: -23.5505, -46.6333" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        As coordenadas permitem exibir o imóvel corretamente no mapa. Separe latitude e longitude por vírgula.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="nearMetro"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Próximo ao Metrô</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nearSchools"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Próximo a Escolas</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nearShops"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Próximo a Comércio</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nearBeach"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Próximo à Praia</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="specific" className="space-y-6 mt-4">
                <PropertyTypeFields 
                  form={form} 
                  propertyType={form.watch('propertyType')}
                />
              </TabsContent>

              <TabsContent value="features" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Características</h2>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="hasSwimmingPool"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Piscina</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasFurniture"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mobiliado</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasGarden"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Jardim</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="hasGym"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Academia</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasBalcony"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Varanda</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasSecurity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Segurança 24h</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <FormField
                    control={form.control}
                    name="hasAirConditioning"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ar-Condicionado</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasBarbecue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Churrasqueira</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasPartyRoom"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Salão de Festas</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="hasPlayground"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Playground</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasSportsField"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Quadra Esportiva</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasSauna"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Sauna</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="hasHotTub"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hidromassagem</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasPetsAllowed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aceita Animais</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasGatedCommunity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Condomínio Fechado</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="hasIntercom"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Interfone</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasLaundry"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Lavanderia</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasCentralHeating"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aquecimento Central</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="amenities" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Opções de Financiamento e Troca</h2>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <FormLabel>Aceita Financiamento</FormLabel>
                          <FormDescription>
                            O imóvel pode ser adquirido com financiamento bancário
                          </FormDescription>
                        </div>
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
                          <FormLabel>Aceita Permuta</FormLabel>
                          <FormDescription>
                            O proprietário aceita trocar por outro imóvel como parte do pagamento
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">SEO e Metadados</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título SEO</FormLabel>
                        <FormControl>
                          <Input placeholder="Título otimizado para SEO" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          Um bom título SEO tem entre 50-60 caracteres e inclui palavras-chave relevantes
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
                            placeholder="Descrição otimizada para SEO"
                            className="resize-none h-20"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Uma boa descrição SEO tem entre 120-160 caracteres e destaca os principais atributos do imóvel
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palavras-chave SEO</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Palavras-chave separadas por vírgula"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Ex: apartamento, 3 quartos, centro, são paulo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Mídias Adicionais</h3>
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="tourUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Tour Virtual</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: https://matterport.com/tour/123456"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Link para tour virtual 360° (Matterport, ThreeSixty, etc)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: https://youtube.com/watch?v=abc123"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Link para vídeo do imóvel (YouTube, Vimeo, etc)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="commercial" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Informações Comerciais</h2>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyTax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IPTU Anual (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                            <Input 
                              type="number"
                              placeholder="0,00"
                              className="pl-10"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseFloat(value));
                              }}
                              value={field.value || ""}
                            />
                          </div>
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
                        <FormLabel>Taxa de Condomínio (R$)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                            <Input 
                              type="number"
                              placeholder="0,00"
                              className="pl-10"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseFloat(value));
                              }}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Destacar no site</FormLabel>
                        <FormDescription>
                          O imóvel aparecerá em destaque na página inicial
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <PortalIntegrations 
                  form={form}
                  property={initialData}
                />
                
                <FormField
                  control={form.control}
                  name="availableForAffiliation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Disponível para Afiliação</FormLabel>
                        <FormDescription>
                          Permitir que outros corretores possam vender este imóvel
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("availableForAffiliation") && (
                  <FormField
                    control={form.control}
                    name="affiliationCommissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa de Comissão para Afiliados (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseFloat(value));
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Porcentagem do valor do imóvel para comissão aos afiliados
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="images" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Imagens</h2>
                <Separator />
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Dica de otimização</AlertTitle>
                  <AlertDescription>
                    Adicione imagens de alta qualidade (mínimo 1200x800 pixels) para melhorar a aparência do anúncio. 
                    A primeira imagem será usada como principal no anúncio.
                  </AlertDescription>
                </Alert>
                
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center">
                    <CloudUpload className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Arraste e solte as imagens aqui</h3>
                    <p className="text-muted-foreground mb-4">
                      Ou clique para selecionar imagens do seu computador
                    </p>
                    <div className="relative">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className={isUploading ? "pointer-events-none" : ""}
                        disabled={isUploading}
                      >
                        {isUploading ? "Enviando..." : "Selecionar Imagens"}
                      </Button>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-medium mb-4">Imagens Adicionadas ({form.watch('images')?.length || 0})</h3>
                  
                  {form.watch('images')?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {form.watch('images')?.map((image: string, index: number) => (
                        <div key={index} className="relative group rounded-md overflow-hidden border aspect-[4/3]">
                          <img 
                            src={image} 
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {index === 0 && (
                            <Badge variant="secondary" className="absolute top-2 left-2">
                              Principal
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma imagem adicionada. Adicione imagens para melhorar a visibilidade do seu imóvel.
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    Você pode adicionar até 20 imagens. Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB por imagem.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={activeTab === "basics"} onClick={() => {
              const tabs = ["basics", "location", "features", "specific", "amenities", "commercial", "images"];
              const currentIndex = tabs.indexOf(activeTab);
              setActiveTab(tabs[currentIndex - 1]);
            }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button type="button" variant="outline" disabled={activeTab === "images"} onClick={() => {
              const tabs = ["basics", "location", "features", "specific", "amenities", "commercial", "images"];
              const currentIndex = tabs.indexOf(activeTab);
              setActiveTab(tabs[currentIndex + 1]);
            }}>
              Próxima
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <Button type="submit" disabled={propertyMutation.isPending}>
            {propertyMutation.isPending ? "Salvando..." : initialData?.id ? "Atualizar Imóvel" : "Adicionar Imóvel"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EnhancedPropertyForm;