import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { 
  Building2, Home, CalendarIcon, 
  Tag, Upload, Plus, Trash2, X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useCep } from '@/hooks/use-cep';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { InsertDevelopment } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/utils';

// Esquema de validação
const developmentFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  zipCode: z.string().min(8, "CEP é obrigatório"),
  developmentType: z.enum([
    "condominio_vertical", 
    "condominio_horizontal", 
    "loteamento", 
    "apartamentos", 
    "casas"
  ], {
    errorMap: () => ({ message: "Selecione um tipo de empreendimento" })
  }),
  totalUnits: z.coerce.number().min(1, "Número de unidades deve ser maior que zero"),
  mainImage: z.string().optional(),
  constructionStatus: z.enum(["planta", "em_construcao", "pronto"], {
    errorMap: () => ({ message: "Selecione um status de construção" })
  }),
  deliveryDate: z.date().optional(),
  images: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.coerce.number().min(0, "Preço mínimo deve ser maior ou igual a zero"),
    max: z.coerce.number().min(0, "Preço máximo deve ser maior ou igual a zero")
  }).refine(data => data.max >= data.min, {
    message: "Preço máximo deve ser maior ou igual ao preço mínimo",
    path: ["max"]
  }),
  amenities: z.array(z.string()).optional()
});

type DevelopmentFormValues = z.infer<typeof developmentFormSchema>;

const amenitiesOptions = [
  { id: 'piscina', label: 'Piscina' },
  { id: 'academia', label: 'Academia' },
  { id: 'salao_festas', label: 'Salão de Festas' },
  { id: 'playground', label: 'Playground' },
  { id: 'quadra', label: 'Quadra Esportiva' },
  { id: 'churrasqueira', label: 'Churrasqueira' },
  { id: 'seguranca', label: 'Segurança 24h' },
  { id: 'pet_place', label: 'Pet Place' },
  { id: 'bicicletario', label: 'Bicicletário' },
  { id: 'coworking', label: 'Espaço Coworking' },
  { id: 'jardim', label: 'Jardim' },
  { id: 'portaria', label: 'Portaria' },
  { id: 'gerador', label: 'Gerador' }
];

export default function AddDevelopmentPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { searchCep } = useCep();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Inicializa o formulário com valores padrão
  const form = useForm<DevelopmentFormValues>({
    resolver: zodResolver(developmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      developmentType: "condominio_vertical",
      totalUnits: 1,
      mainImage: "",
      constructionStatus: "planta",
      images: [],
      priceRange: {
        min: 0,
        max: 0
      },
      amenities: []
    }
  });

  // Consulta de CEP para preenchimento automático
  const handleCepSearch = async (cep: string) => {
    if (cep.length >= 8) {
      const data = await searchCep(cep);
      if (data) {
        form.setValue('address', data.street);
        form.setValue('city', data.city);
        form.setValue('state', data.state);
      }
    }
  };

  // Função para adicionar/remover amenidades
  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityId)) {
        const newAmenities = prev.filter(id => id !== amenityId);
        form.setValue('amenities', newAmenities);
        return newAmenities;
      } else {
        const newAmenities = [...prev, amenityId];
        form.setValue('amenities', newAmenities);
        return newAmenities;
      }
    });
  };

  // Mutação para criar um novo empreendimento
  const createDevelopmentMutation = useMutation({
    mutationFn: async (data: DevelopmentFormValues) => {
      // Convertendo para o formato esperado pela API
      const developmentData: InsertDevelopment = {
        ...data,
        userId: 1, // Isso deve ser obtido do usuário autenticado
        priceRange: JSON.stringify(data.priceRange),
        amenities: JSON.stringify(data.amenities || []),
        images: JSON.stringify(data.images || []),
        salesStatus: JSON.stringify({ available: data.totalUnits, reserved: 0, sold: 0 })
      };

      return apiRequest('/api/developments', {
        method: 'POST',
        body: JSON.stringify(developmentData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developments'] });
      toast({
        title: 'Empreendimento criado',
        description: 'O empreendimento foi criado com sucesso.',
      });
      navigate('/developments');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar empreendimento',
        description: error.message || 'Ocorreu um erro ao criar o empreendimento.',
        variant: 'destructive',
      });
    },
  });

  // Handler para submissão do formulário
  const onSubmit = (values: DevelopmentFormValues) => {
    createDevelopmentMutation.mutate(values);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="mr-2 h-6 w-6" />
            Novo Empreendimento
          </h1>
          <p className="text-muted-foreground">
            Cadastre um novo projeto imobiliário
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/developments')}>
          Cancelar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Empreendimento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Residencial Vila Verde" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome completo do empreendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva detalhes do empreendimento..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição detalhada do empreendimento e seus diferenciais
                      </FormDescription>
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
                          <SelectItem value="condominio_vertical">Condomínio Vertical</SelectItem>
                          <SelectItem value="condominio_horizontal">Condomínio Horizontal</SelectItem>
                          <SelectItem value="loteamento">Loteamento</SelectItem>
                          <SelectItem value="apartamentos">Edifício de Apartamentos</SelectItem>
                          <SelectItem value="casas">Casas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione o tipo que melhor descreve o empreendimento
                      </FormDescription>
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
                          <SelectItem value="planta">Na Planta</SelectItem>
                          <SelectItem value="em_construcao">Em Construção</SelectItem>
                          <SelectItem value="pronto">Pronto para Morar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Estágio atual da construção do empreendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Entrega</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Data prevista para entrega do empreendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total de Unidades</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === "" ? "1" : e.target.value;
                            field.onChange(parseInt(value, 10));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Número total de unidades disponíveis
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Localização</CardTitle>
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
                          placeholder="12345-678" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleCepSearch(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Digite o CEP para preenchimento automático
                      </FormDescription>
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
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Endereço completo do empreendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
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
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem Principal</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="URL da imagem principal" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL da imagem de capa do empreendimento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Faixa de Preço</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceRange.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                min={0} 
                                placeholder="Preço mínimo" 
                                className="pl-8" 
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
                      name="priceRange.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                min={0} 
                                placeholder="Preço máximo" 
                                className="pl-8" 
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
                  <FormDescription>
                    Defina a faixa de preço das unidades
                  </FormDescription>
                </div>

                <FormItem>
                  <FormLabel>Comodidades/Áreas Comuns</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {amenitiesOptions.map((amenity) => (
                      <Button
                        key={amenity.id}
                        type="button"
                        variant={selectedAmenities.includes(amenity.id) ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        {selectedAmenities.includes(amenity.id) ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        {amenity.label}
                      </Button>
                    ))}
                  </div>
                  <FormDescription>
                    Selecione as comodidades disponíveis no empreendimento
                  </FormDescription>
                </FormItem>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/developments')}
              type="button"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createDevelopmentMutation.isPending}
            >
              {createDevelopmentMutation.isPending ? 'Salvando...' : 'Salvar Empreendimento'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}