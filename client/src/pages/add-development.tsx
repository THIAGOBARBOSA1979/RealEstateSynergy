import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { 
  Building2, Home, CalendarIcon, 
  Tag, Upload, Plus, Trash2, X, ArrowLeft, Building, MapPin, Users, Check
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  developmentType: z.string().min(1, "Tipo de empreendimento é obrigatório"),
  totalUnits: z.coerce.number().min(1, "Total de unidades deve ser maior que 0"),
  constructionStatus: z.string().optional(),
  deliveryDate: z.date().optional(),
  priceRange: z.object({
    min: z.coerce.number().min(0),
    max: z.coerce.number().min(0)
  }),
  amenities: z.array(z.string()).default([])
});

type DevelopmentFormValues = z.infer<typeof developmentFormSchema>;

export default function AddDevelopmentPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { fetchAddressByCep } = useCep();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Lista de amenidades disponíveis
  const amenitiesList = [
    'Piscina', 'Academia', 'Playground', 'Salão de Festas', 'Churrasqueira',
    'Quadra Esportiva', 'Sauna', 'Jardim', 'Garagem', 'Elevador',
    'Portaria 24h', 'Área Gourmet', 'Bicicletário', 'Pet Place', 'Coworking'
  ];

  // Configuração do formulário
  const form = useForm<DevelopmentFormValues>({
    resolver: zodResolver(developmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      developmentType: '',
      totalUnits: 1,
      constructionStatus: '',
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
      const data = await fetchAddressByCep(cep);
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
        amenities: JSON.stringify(data.amenities),
        deliveryDate: data.deliveryDate || null,
        constructionStatus: data.constructionStatus || null
      };

      return await apiRequest('/api/developments', {
        method: 'POST',
        body: JSON.stringify(developmentData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developments'] });
      toast({
        title: 'Empreendimento criado com sucesso!',
        description: 'O empreendimento foi adicionado ao seu catálogo.',
      });
      navigate('/catalogo-imobiliario');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Adicionar Empreendimento</h1>
          <p className="text-muted-foreground">
            Cadastre um novo empreendimento imobiliário com todas as informações
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/catalogo-imobiliario')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário Principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectItem value="residencial">Residencial</SelectItem>
                              <SelectItem value="comercial">Comercial</SelectItem>
                              <SelectItem value="misto">Misto</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Input type="number" placeholder="Ex: 120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Localização */}
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

              {/* Informações Comerciais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Informações Comerciais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceRange.min"
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
                      name="priceRange.max"
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

                  <FormField
                    control={form.control}
                    name="constructionStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status da Construção</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lancamento">Lançamento</SelectItem>
                            <SelectItem value="em_construcao">Em Construção</SelectItem>
                            <SelectItem value="pronto">Pronto para Morar</SelectItem>
                            <SelectItem value="entregue">Entregue</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Amenidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Amenidades
                  </CardTitle>
                  <CardDescription>
                    Selecione as amenidades do empreendimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {amenitiesList.map((amenity) => (
                      <div
                        key={amenity}
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleAmenity(amenity)}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}>
                          {selectedAmenities.includes(amenity) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createDevelopmentMutation.isPending}
                    >
                      {createDevelopmentMutation.isPending ? 'Salvando...' : 'Salvar Empreendimento'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/catalogo-imobiliario')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}