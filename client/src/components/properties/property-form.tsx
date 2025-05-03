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

// Form schema
const propertyFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  address: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().min(5, "O CEP deve ter pelo menos 5 caracteres"),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  propertyType: z.enum(["apartment", "house", "land", "commercial"]),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  area: z.coerce.number().min(1, "A área deve ser maior que zero"),
  garageSpots: z.coerce.number().optional(),
  status: z.enum(["active", "reserved", "sold", "inactive"]),
  featured: z.boolean().default(false),
  availableForAffiliation: z.boolean().default(false),
  affiliationCommissionRate: z.coerce.number().min(0).max(100).optional(),
  published: z.boolean().default(false),
  publishedPortals: z.array(z.string()).optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues>;
  onSuccess?: () => void;
}

const PropertyForm = ({ initialData, onSuccess }: PropertyFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default values for the form
  const defaultValues: Partial<PropertyFormValues> = {
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    price: 0,
    propertyType: "house",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    garageSpots: 0,
    status: "active",
    featured: false,
    availableForAffiliation: false,
    affiliationCommissionRate: 0,
    published: false,
    publishedPortals: [],
    ...initialData,
  };

  // Form definition
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      return apiRequest("POST", "/api/properties", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Imóvel criado com sucesso",
        description: "O imóvel foi adicionado à sua lista",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar imóvel",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: PropertyFormValues) => {
    createPropertyMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da esquerda */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-heading font-semibold">Endereço</h2>
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
                
                <div className="grid grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-heading font-semibold">Características</h2>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-heading font-semibold">Opções de Publicação</h2>
                <Separator />
                
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
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button type="submit" size="lg" disabled={createPropertyMutation.isPending}>
                {createPropertyMutation.isPending ? "Salvando..." : "Salvar Imóvel"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PropertyForm;