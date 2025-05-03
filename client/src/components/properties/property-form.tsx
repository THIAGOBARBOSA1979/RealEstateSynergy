import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

// Form schema
const propertyFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  address: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().min(5, "O CEP deve ter pelo menos 5 caracteres"),
  addressComplement: z.string().optional(),
  neighborhood: z.string().optional(),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  propertyType: z.enum(["apartment", "house", "land", "commercial"]),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  area: z.coerce.number().min(1, "A área deve ser maior que zero"),
  buildingArea: z.coerce.number().optional(),
  garageSpots: z.coerce.number().optional(),
  status: z.enum(["active", "reserved", "sold", "inactive"]),
  yearBuilt: z.coerce.number().optional(),
  hasSwimmingPool: z.boolean().default(false),
  hasFurniture: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  hasGym: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  propertyTax: z.coerce.number().optional(),
  condoFee: z.coerce.number().optional(),
  featured: z.boolean().default(false),
  availableForAffiliation: z.boolean().default(false),
  affiliationCommissionRate: z.coerce.number().min(0).max(100).optional(),
  published: z.boolean().default(false),
  publishedPortals: z.array(z.string()).optional(),
  acceptsExchange: z.boolean().default(false),
  acceptsFinancing: z.boolean().default(false),
  nearMetro: z.boolean().default(false),
  nearSchools: z.boolean().default(false),
  nearShops: z.boolean().default(false),
  nearBeach: z.boolean().default(false),
  coordinates: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  onSuccess?: () => void;
}

const PropertyForm = ({ initialData, onSuccess }: PropertyFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basics");

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-6 mb-6">
                <TabsTrigger value="basics" className="flex gap-2 items-center">
                  <span className="material-icons text-sm">info</span>
                  <span className="hidden sm:inline">Básico</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex gap-2 items-center">
                  <span className="material-icons text-sm">location_on</span>
                  <span className="hidden sm:inline">Localização</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex gap-2 items-center">
                  <span className="material-icons text-sm">home</span>
                  <span className="hidden sm:inline">Características</span>
                </TabsTrigger>
                <TabsTrigger value="amenities" className="flex gap-2 items-center">
                  <span className="material-icons text-sm">pool</span>
                  <span className="hidden sm:inline">Comodidades</span>
                </TabsTrigger>
                <TabsTrigger value="commercial" className="flex gap-2 items-center">
                  <span className="material-icons text-sm">attach_money</span>
                  <span className="hidden sm:inline">Comercial</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex gap-2 items-center">
                  <span className="material-icons text-sm">image</span>
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
                          placeholder="Ex: 2010"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? "0" : e.target.value;
                            field.onChange(parseInt(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="location" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Localização</h2>
                <Separator />
                
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
                  name="addressComplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Apto 101, Bloco B" {...field} />
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
                        <Input placeholder="Ex: Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          <Input placeholder="Ex: 01234-567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordenadas GPS</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: -23.5505,-46.6333" {...field} />
                      </FormControl>
                      <FormDescription>
                        Latitude e longitude separadas por vírgula
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <h3 className="text-lg font-medium mt-6">Proximidades</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nearMetro"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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

              <TabsContent value="features" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Características</h2>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hasBalcony"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Possui Varanda</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasFurniture"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                    name="acceptsFinancing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aceita Financiamento</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptsExchange"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Aceita Permuta</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-6 mt-4">
                <h2 className="text-xl font-heading font-semibold">Comodidades</h2>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="hasSwimmingPool"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                    name="hasGarden"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Jardim/Área Verde</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasGym"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                    name="hasSecurity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publicar imóvel</FormLabel>
                        <FormDescription>
                          Tornar este imóvel público no site
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
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
                
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center">
                    <span className="material-icons text-4xl text-muted-foreground mb-4">cloud_upload</span>
                    <h3 className="font-medium text-lg mb-2">Arraste e solte as imagens aqui</h3>
                    <p className="text-muted-foreground mb-4">
                      Ou clique para selecionar imagens do seu computador
                    </p>
                    <Button type="button" variant="outline">Selecionar Imagens</Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Você poderá adicionar até 20 imagens. Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB por imagem.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabIndex = ["basics", "location", "features", "amenities", "commercial", "images"].indexOf(activeTab);
                if (tabIndex > 0) {
                  setActiveTab(["basics", "location", "features", "amenities", "commercial", "images"][tabIndex - 1]);
                }
              }}
              disabled={activeTab === "basics"}
            >
              <span className="material-icons text-sm mr-2">arrow_back</span>
              Anterior
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabIndex = ["basics", "location", "features", "amenities", "commercial", "images"].indexOf(activeTab);
                if (tabIndex < 5) {
                  setActiveTab(["basics", "location", "features", "amenities", "commercial", "images"][tabIndex + 1]);
                }
              }}
              disabled={activeTab === "images"}
            >
              Próximo
              <span className="material-icons text-sm ml-2">arrow_forward</span>
            </Button>
          </div>
          
          <Button type="submit" size="lg" disabled={createPropertyMutation.isPending}>
            {createPropertyMutation.isPending ? "Salvando..." : "Salvar Imóvel"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;