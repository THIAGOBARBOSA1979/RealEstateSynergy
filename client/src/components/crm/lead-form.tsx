import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Form schema
const leadFormSchema = z.object({
  fullName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  propertyId: z.string().optional(),
  message: z.string().optional(),
  stage: z.string().default("initial_contact"),
  source: z.string().default("manual"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<LeadFormValues>;
  initialStage?: string;
}

const LeadForm = ({ isOpen, onClose, initialData, initialStage }: LeadFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for property selection
  const { data: propertiesData } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Default values for the form
  const defaultValues: Partial<LeadFormValues> = {
    fullName: "",
    email: "",
    phone: "",
    propertyId: "",
    message: "",
    stage: initialStage || "initial_contact",
    source: "manual",
    ...initialData,
  };

  // Form definition
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/crm/leads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stages'] });
      toast({
        title: "Lead criado com sucesso",
        description: "O lead foi adicionado ao seu CRM",
      });
      form.reset(defaultValues);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar lead",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: LeadFormValues) => {
    // Convert propertyId to number or undefined
    const formData = {
      ...data,
      propertyId: data.propertyId && data.propertyId !== "" ? parseInt(data.propertyId) : undefined,
    };
    
    createLeadMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
          <DialogDescription>
            Preencha os dados do lead que você deseja adicionar ao seu CRM.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: joao@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imóvel de Interesse</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um imóvel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum imóvel específico</SelectItem>
                        {propertiesData && 
                         typeof propertiesData === 'object' && 
                         'properties' in propertiesData && 
                         Array.isArray(propertiesData.properties) ? 
                            propertiesData.properties.map((property: any) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.title}
                              </SelectItem>
                            ))
                          : null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Contato Direto</SelectItem>
                        <SelectItem value="website">Site</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="portal">Portal Imobiliário</SelectItem>
                        <SelectItem value="referral">Indicação</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem / Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes do contato ou as necessidades do cliente" 
                      className="resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa no Funil</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="initial_contact">Contato Inicial</SelectItem>
                      <SelectItem value="qualification">Qualificação</SelectItem>
                      <SelectItem value="scheduled_visit">Visita Agendada</SelectItem>
                      <SelectItem value="proposal">Proposta</SelectItem>
                      <SelectItem value="documentation">Documentação</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createLeadMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createLeadMutation.isPending}
              >
                {createLeadMutation.isPending ? "Salvando..." : "Adicionar Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadForm;