import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Settings, 
  Edit, 
  MoreVertical, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  Target, 
  BarChart3,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatRelativeTime } from "@/lib/utils";

// Components
import LeadForm from "@/components/crm/lead-form";
import StageSettingsDialog from "@/components/crm/stage-settings-dialog";

// Styles and helper functions imported from CrmPreview
import { getSourceBadgeClass } from "@/components/dashboard/crm-preview";

interface CrmStage {
  id: string;
  name: string;
  count: number;
  leads: {
    id: number;
    name: string;
    source: string;
    description: string;
    timeAgo: string;
    stageId: string;
  }[];
}

const CRM = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggingLeadId, setDraggingLeadId] = useState<number | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isStageSettingsOpen, setIsStageSettingsOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("kanban");
  const [sourceFilter, setSourceFilter] = useState("all_sources");
  const [dateFilter, setDateFilter] = useState("all_dates");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stages, isLoading } = useQuery({
    queryKey: ['/api/crm/stages'],
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, newStageId }: { leadId: number, newStageId: string }) => {
      return apiRequest("PATCH", `/api/crm/leads/${leadId}`, { stageId: newStageId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stages'] });
      toast({
        title: "Lead movido com sucesso!",
        description: "O lead foi movido para o novo estágio.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao mover lead",
        description: "Não foi possível mover o lead. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggingLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggingLeadId !== null) {
      updateLeadStageMutation.mutate({ leadId: draggingLeadId, newStageId: stageId });
      setDraggingLeadId(null);
    }
  };

  const handleAddLeadToStage = (stageId: string) => {
    setSelectedStageId(stageId);
    setIsAddLeadOpen(true);
  };

  // Filter leads based on search term and filters
  const filteredStages = stages && Array.isArray(stages) ? stages.map((stage: CrmStage) => ({
    ...stage,
    leads: stage.leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === "all_sources" || lead.source === sourceFilter;
      return matchesSearch && matchesSource;
    })
  })) : [];

  // Map stage IDs to stage names for the form
  const stageIdToName: Record<string, string> = {};
  if (stages && Array.isArray(stages)) {
    stages.forEach((stage: CrmStage) => {
      stageIdToName[stage.id] = stage.name;
    });
  }

  // Calcular estatísticas do CRM
  const totalLeads = filteredStages.reduce((acc, stage) => acc + stage.leads.length, 0);
  const totalStages = filteredStages.length;
  const conversionRate = totalLeads > 0 ? ((filteredStages.find(s => s.id === 'cliente')?.leads.length || 0) / totalLeads * 100).toFixed(1) : '0';
  const activeLeads = filteredStages.filter(s => s.id !== 'cliente' && s.id !== 'perdido').reduce((acc, stage) => acc + stage.leads.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">CRM (Pipeline de Vendas)</h1>
          <p className="text-muted-foreground">Gerencie seus leads e oportunidades de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddLeadOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
          <Button variant="outline" onClick={() => setIsStageSettingsOpen(true)} className="gap-1">
            <Settings className="h-4 w-4" />
            Configurar Etapas
          </Button>
        </div>
      </div>

      {/* Painel de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads Ativos</p>
                <p className="text-2xl font-bold">{activeLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estágios Ativos</p>
                <p className="text-2xl font-bold">{totalStages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Avançados */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_sources">Todas as Fontes</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_dates">Todos os Períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação por Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Users className="h-4 w-4" />
            Lista de Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          {/* Kanban Board */}
          {isLoading ? (
            <div className="kanban-board">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-[600px] w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="kanban-board" style={{ gridTemplateColumns: `repeat(${filteredStages.length}, 280px)` }}>
              {filteredStages.map((stage: CrmStage) => (
                <Card 
                  key={stage.id} 
                  className="h-fit max-h-[calc(100vh-200px)] flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <CardHeader className="py-3 px-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{stage.name}</h4>
                      <Badge variant="secondary" className="bg-primary-light/20 text-primary-dark hover:bg-primary-light/30">
                        {stage.leads.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3 overflow-y-auto flex-grow">
                    {stage.leads.length > 0 ? (
                      stage.leads.map((lead) => (
                        <div 
                          key={lead.id}
                          className="bg-background rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow border border-border"
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                        >
                          <div className="flex items-start justify-between">
                            <h5 className="font-medium">{lead.name}</h5>
                            <Badge variant="outline" className={getSourceBadgeClass(lead.source)}>
                              {lead.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {lead.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {lead.timeAgo}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Nenhum lead neste estágio</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2"
                          onClick={() => handleAddLeadToStage(stage.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Lead
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredStages.map((stage: CrmStage) => (
              <Card key={stage.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{stage.name}</span>
                    <Badge variant="secondary">{stage.leads.length} leads</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stage.leads.length > 0 ? (
                    <div className="space-y-2">
                      {stage.leads.map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{lead.name}</h4>
                            <p className="text-sm text-muted-foreground">{lead.description}</p>
                            <p className="text-xs text-muted-foreground">{lead.timeAgo}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getSourceBadgeClass(lead.source)}>
                              {lead.source}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Ligar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Enviar Email
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum lead neste estágio
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Lead Form Dialog */}
      <LeadForm
        isOpen={isAddLeadOpen}
        onClose={() => {
          setIsAddLeadOpen(false);
          setSelectedStageId(null);
        }}
        initialStage={selectedStageId || undefined}
      />

      {/* Stage Settings Dialog */}
      <StageSettingsDialog
        isOpen={isStageSettingsOpen}
        onClose={() => setIsStageSettingsOpen(false)}
      />
    </div>
  );
};

export default CRM;