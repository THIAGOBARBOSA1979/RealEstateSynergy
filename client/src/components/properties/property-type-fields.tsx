import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface PropertyTypeFieldsProps {
  form: any;
  propertyType: string;
}

const PropertyTypeFields = ({ form, propertyType }: PropertyTypeFieldsProps) => {
  // Campos específicos para cada tipo de imóvel
  switch (propertyType) {
    case "rural":
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold">Características Específicas - Imóvel Rural</h2>
          <Separator />
          
          <Card className="p-4 bg-muted/30">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">Propriedade Rural</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Preencha os dados específicos para imóveis rurais como fazendas, sítios e chácaras.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="totalArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Total (hectares)</FormLabel>
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
                    1 hectare = 10.000m²
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productiveArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Produtiva (hectares)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="appRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAR (Cadastro Ambiental Rural)</FormLabel>
                  <FormControl>
                    <Input placeholder="Número do CAR" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="ruralFeatures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Infraestrutura</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva a infraestrutura da propriedade (ex: estábulos, galpões, currais, etc.)"
                    className="resize-none h-24"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="waterSources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fontes de Água</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: nascentes, rios, poços artesianos, etc."
                      className="resize-none h-20"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accessRoads"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acessos</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: estrada asfaltada, estrada de terra, etc."
                      className="resize-none h-20"
                      {...field}
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
            name="agriculturalPotential"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Solo / Potencial Agrícola</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de solo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high_fertility">Alta Fertilidade</SelectItem>
                    <SelectItem value="medium_fertility">Média Fertilidade</SelectItem>
                    <SelectItem value="low_fertility">Baixa Fertilidade</SelectItem>
                    <SelectItem value="sandy">Arenoso</SelectItem>
                    <SelectItem value="clay">Argiloso</SelectItem>
                    <SelectItem value="rocky">Rochoso</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="hasMainHouse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Sede / Casa Principal</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasElectricity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Energia Elétrica</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasBarn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Celeiro/Galpão</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="hasFencing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cercamento</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasOrchard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Pomar</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasStables"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Estábulos</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    case "apartment":
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold">Características Específicas - Apartamento</h2>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Andar</FormLabel>
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
              name="totalFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total de Andares no Prédio</FormLabel>
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
              name="unitsPerFloor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidades por Andar</FormLabel>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="apartmentCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado do Apartamento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Bom</SelectItem>
                      <SelectItem value="needsRenovation">Precisa de Reforma</SelectItem>
                      <SelectItem value="underConstruction">Em Construção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="buildingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Edifício/Condomínio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Edifício Solar" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="hasElevator"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Elevador</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasConcierge"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Portaria 24h</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="petsAllowed"
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
          </div>
        </div>
      );
      
    case "house":
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold">Características Específicas - Casa</h2>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="lotSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho do Terreno (m²)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="stories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Pavimentos</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === "" ? "1" : e.target.value;
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
              name="houseCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado da Casa</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">Nova</SelectItem>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="needsRenovation">Precisa de Reforma</SelectItem>
                      <SelectItem value="underConstruction">Em Construção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            
            <FormField
              control={form.control}
              name="hasOutdoorArea"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Área Externa</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isCorner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Casa de Esquina</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="isGated"
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
            
            <FormField
              control={form.control}
              name="hasSolarPanels"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Painéis Solares</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasServiceArea"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Área de Serviço</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      );
      
    case "commercial":
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold">Características Específicas - Comercial</h2>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="commercialType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Imóvel Comercial</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="office">Escritório</SelectItem>
                      <SelectItem value="retail">Loja</SelectItem>
                      <SelectItem value="warehouse">Galpão</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="restaurant">Restaurante</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="floorNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Andar</FormLabel>
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
              name="commercialCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado do Imóvel</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Bom</SelectItem>
                      <SelectItem value="needsRenovation">Precisa de Reforma</SelectItem>
                      <SelectItem value="underConstruction">Em Construção</SelectItem>
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
              name="monthlyMaintenanceFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de Manutenção Mensal (R$)</FormLabel>
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
              name="buildingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Edifício/Condomínio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Centro Empresarial" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="previousUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uso Anterior</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Restaurante" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="has24HourAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Acesso 24 Horas</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasLoadingDock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Doca de Carregamento</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasReceptionArea"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Área de Recepção</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      );
      
    case "land":
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold">Características Específicas - Terreno</h2>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="frontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho da Frente (m)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="sideSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho da Lateral (m)</FormLabel>
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
            
            <FormField
              control={form.control}
              name="topography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topografia</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a topografia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="flat">Plano</SelectItem>
                      <SelectItem value="slightSlope">Leve Inclinação</SelectItem>
                      <SelectItem value="steep">Acentuado</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="landType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Terreno</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="residential">Residencial</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                      <SelectItem value="mixed">Uso Misto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="zoningType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zoneamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: ZR-1, ZEIS" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Zona de uso e ocupação do solo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="hasWaterConnection"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ligação de Água</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasSewerConnection"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ligação de Esgoto</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasPowerConnection"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ligação de Energia</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="isCorner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Terreno de Esquina</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasDemolition"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Com Demolição</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isInCondominium"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Em Condomínio</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

export default PropertyTypeFields;