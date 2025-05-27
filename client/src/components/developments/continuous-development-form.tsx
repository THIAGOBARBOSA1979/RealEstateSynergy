import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCep } from "@/hooks/use-cep";
import { 
  Building,
  MapPin, 
  DollarSign, 
  Info,
  Plus,
  Trash,
  Check,
  X,
  Bed,
  Bath,
  Car,
  Ruler
} from "lucide-react";

import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const developmentFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  address: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().min(8, "O CEP é obrigatório"),
  developmentType: z.enum(["residential", "commercial", "mixed", "industrial"]),
  totalUnits: z.coerce.number().min(1, "Total de unidades deve ser maior que 0"),
  constructionStatus: z.enum(["planning", "construction", "completed"]),
  minPrice: z.coerce.number().min(0, "Preço mínimo deve ser positivo"),
  maxPrice: z.coerce.number().min(0, "Preço máximo deve ser positivo"),
  deliveryDate: z.string().optional(),
  amenities: z.array(z.string()).default([])
});

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Número da unidade é obrigatório"),
  floor: z.coerce.number().optional(),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  area: z.coerce.number().min(1, "Área deve ser maior que 0"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
  garageSpots: z.coerce.number().min(0).default(0)
});

type DevelopmentFormValues = z.infer<typeof developmentFormSchema>;
type UnitFormValues = z.infer<typeof unitSchema>;

interface ContinuousDevelopmentFormProps {
  onSuccess?: () => void;
}

const ContinuousDevelopmentForm = ({ onSuccess }: ContinuousDevelopmentFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fetchAddressByCep } = useCep();
  const [units, setUnits] = useState<UnitFormValues[]>([]);
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  const amenitiesList = [
    'Piscina', 'Academia', 'Playground', 'Salão de Festas', 'Churrasqueira',
    'Quadra Esportiva', 'Sauna', 'Jardim', 'Garagem', 'Elevador',
    'Portaria 24h', 'Área Gourmet', 'Bicicletário', 'Pet Place', 'Coworking'
  ];

  const form = useForm<DevelopmentFormValues>({
    resolver: zodResolver(developmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      developmentType: 'residential',
      totalUnits: 1,
      constructionStatus: 'planning',
      minPrice: 0,
      maxPrice: 0,
      deliveryDate: '',
      amenities: []
    }
  });

  const unitForm = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: '',
      floor: 0,
      bedrooms: 1,
      bathrooms: 1,
      area: 0,
      price: 0,
      status: 'available',
      garageSpots: 0
    }
  });

  const handleCepSearch = async (cep: string) => {
    if (cep.length >= 8) {
      const data = await fetchAddressByCep(cep);
      if (data) {
        form.setValue('address', data.street);
        form.setValue('city', data.city);
        form.setValue('state', data.state);
      }
    }
  };

  const handleAddUnit = (unitData: UnitFormValues) => {
    setUnits(prev => [...prev, unitData]);
    unitForm.reset();
    setIsAddingUnit(false);
    toast({
      title: "Unidade adicionada",
      description: `Unidade ${unitData.unitNumber} foi adicionada com sucesso.`
    });
  };

  const handleRemoveUnit = (index: number) => {
    setUnits(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Unidade removida",
      description: "A unidade foi removida do empreendimento."
    });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = form.getValues('amenities') || [];
    if (currentAmenities.includes(amenity)) {
      form.setValue('amenities', currentAmenities.filter(a => a !== amenity));
    } else {
      form.setValue('amenities', [...currentAmenities, amenity]);
    }
  };

  const createDevelopmentMutation = useMutation({
    mutationFn: async (data: DevelopmentFormValues) => {
      const developmentData = {
        ...data,
        userId: 1,
        priceRange: JSON.stringify({ min: data.minPrice, max: data.maxPrice }),
        amenities: JSON.stringify(data.amenities),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        units: units
      };

      return await apiRequest('/api/developments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(developmentData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developments'] });
      toast({
        title: "Empreendimento criado com sucesso!",
        description: "O empreendimento foi adicionado ao seu catálogo."
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar empreendimento",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: DevelopmentFormValues) => {
    if (units.length === 0) {
      toast({
        title: "Adicione pelo menos uma unidade",
        description: "Um empreendimento deve ter pelo menos uma unidade.",
        variant: "destructive"
      });
      return;
    }
    createDevelopmentMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados principais do empreendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Empreendimento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Residencial Jardim das Flores" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="developmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Empreendimento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">Residencial</SelectItem>
                          <SelectItem value="commercial">Comercial</SelectItem>
                          <SelectItem value="mixed">Misto</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva as características principais do empreendimento..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Unidades</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="constructionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status da Construção</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Planejamento</SelectItem>
                          <SelectItem value="construction">Em Construção</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCepSearch(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da cidade" {...field} />
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
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Faixa de Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Mínimo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Máximo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenidades</CardTitle>
              <CardDescription>
                Selecione as amenidades disponíveis no empreendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenitiesList.map((amenity) => {
                  const isSelected = form.watch('amenities')?.includes(amenity);
                  return (
                    <Button
                      key={amenity}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAmenity(amenity)}
                      className="justify-start"
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {amenity}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Unidades ({units.length})
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingUnit(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Unidade
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {units.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Adicione pelo menos uma unidade ao empreendimento.
                  </AlertDescription>
                </Alert>
              )}

              {units.map((unit, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Unidade {unit.unitNumber}</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bed className="w-4 h-4" />
                      {unit.bedrooms}
                      <Bath className="w-4 h-4" />
                      {unit.bathrooms}
                      <Ruler className="w-4 h-4" />
                      {unit.area}m²
                      <Car className="w-4 h-4" />
                      {unit.garageSpots}
                    </div>
                    <Badge className={unit.status === 'available' ? 'bg-green-500' : 'bg-orange-500'}>
                      {unit.status === 'available' ? 'Disponível' : 
                       unit.status === 'reserved' ? 'Reservado' : 'Vendido'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">R$ {unit.price.toLocaleString()}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveUnit(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {isAddingUnit && (
                <Form {...unitForm}>
                  <form onSubmit={unitForm.handleSubmit(handleAddUnit)} className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={unitForm.control}
                        name="unitNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Unidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 101" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={unitForm.control}
                        name="floor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Andar</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={unitForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="available">Disponível</SelectItem>
                                <SelectItem value="reserved">Reservado</SelectItem>
                                <SelectItem value="sold">Vendido</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={unitForm.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={unitForm.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banheiros</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={unitForm.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (m²)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={unitForm.control}
                        name="garageSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={unitForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="250000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        <Check className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingUnit(false)}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="submit" disabled={createDevelopmentMutation.isPending}>
              {createDevelopmentMutation.isPending ? 'Salvando...' : 'Criar Empreendimento'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContinuousDevelopmentForm;