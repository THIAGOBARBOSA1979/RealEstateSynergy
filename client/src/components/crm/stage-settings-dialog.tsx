import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Plus, GripVertical, Check, Info, Trash } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Color palette for stages
const STAGE_COLORS = [
  { label: "Azul", value: "#4F46E5" },
  { label: "Roxo", value: "#8B5CF6" },
  { label: "Verde", value: "#10B981" },
  { label: "Amarelo", value: "#F59E0B" },
  { label: "Vermelho", value: "#EF4444" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Índigo", value: "#6366F1" },
  { label: "Ciano", value: "#06B6D4" },
  { label: "Azul-marinho", value: "#1D4ED8" },
  { label: "Cinza", value: "#6B7280" },
];

// Define a stage type that includes the display name and other properties
interface StageConfig {
  id: string;
  name: string;
  color?: string;
  position: number;
  isDefault?: boolean;
  isArchive?: boolean;
}

interface StageSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const StageSettingsDialog = ({ isOpen, onClose }: StageSettingsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newStageName, setNewStageName] = useState("");
  
  // Fetch current stages
  const { data: stages, isLoading, isError } = useQuery({
    queryKey: ['/api/crm/stages/config'],
    enabled: isOpen
  });
  
  // Initialize stage configs state
  const [stageConfigs, setStageConfigs] = useState<StageConfig[]>([]);

  // Update stage configs when data is loaded
  useEffect(() => {
    if (stages && Array.isArray(stages)) {
      setStageConfigs(stages);
    } else if (isOpen && !isLoading && !stages) {
      // If no custom stages are defined, use default stages
      setStageConfigs([
        { id: 'initial_contact', name: 'Contato Inicial', position: 0, isDefault: true },
        { id: 'qualification', name: 'Qualificação', position: 1, isDefault: true },
        { id: 'scheduled_visit', name: 'Visita Agendada', position: 2, isDefault: true },
        { id: 'proposal', name: 'Proposta', position: 3, isDefault: true },
        { id: 'documentation', name: 'Documentação', position: 4, isDefault: true },
        { id: 'closed', name: 'Fechado', position: 5, isArchive: true }
      ]);
    }
  }, [stages, isLoading, isOpen]);
  
  // Update stages mutation
  const updateStagesMutation = useMutation({
    mutationFn: async (data: StageConfig[]) => {
      return apiRequest("PUT", "/api/crm/stages/config", { stages: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stages/config'] });
      toast({
        title: "Etapas atualizadas",
        description: "As configurações das etapas foram atualizadas com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar etapas",
        description: "Não foi possível atualizar as configurações das etapas.",
        variant: "destructive"
      });
    }
  });

  // Add new stage
  const handleAddStage = () => {
    if (newStageName.trim() === "") {
      toast({
        title: "Nome da etapa vazio",
        description: "Por favor, insira um nome para a nova etapa.",
        variant: "destructive"
      });
      return;
    }

    // Generate a unique ID based on the name
    const id = newStageName.toLowerCase().replace(/\s+/g, '_');
    
    // Check if the ID already exists
    if (stageConfigs.some(stage => stage.id === id)) {
      toast({
        title: "Etapa já existe",
        description: "Uma etapa com este nome já existe.",
        variant: "destructive"
      });
      return;
    }
    
    const newStage: StageConfig = {
      id,
      name: newStageName,
      position: stageConfigs.length,
      isDefault: false,
      isArchive: false
    };
    
    setStageConfigs([...stageConfigs, newStage]);
    setNewStageName("");
  };

  // Remove stage
  const handleRemoveStage = (id: string) => {
    // Don't allow removing default or archive stages
    const stageToRemove = stageConfigs.find(stage => stage.id === id);
    if (stageToRemove?.isDefault || stageToRemove?.isArchive) {
      toast({
        title: "Não é possível remover esta etapa",
        description: "Etapas padrão ou arquivadas não podem ser removidas.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove the stage and reorder positions
    const updatedStages = stageConfigs
      .filter(stage => stage.id !== id)
      .map((stage, index) => ({ ...stage, position: index }));
    
    setStageConfigs(updatedStages);
  };

  // Handle stage name edit
  const handleEditStageName = (id: string, newName: string) => {
    setStageConfigs(stageConfigs.map(stage => 
      stage.id === id ? { ...stage, name: newName } : stage
    ));
  };
  
  // Handle stage color update
  const handleUpdateStageColor = (id: string, newColor: string) => {
    setStageConfigs(stageConfigs.map(stage => 
      stage.id === id ? { ...stage, color: newColor } : stage
    ));
  };

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // If dropped outside the list or at the same position, do nothing
    if (!destination || destination.index === source.index) return;
    
    // Reorder the stages
    const reorderedStages = Array.from(stageConfigs);
    const [removed] = reorderedStages.splice(source.index, 1);
    reorderedStages.splice(destination.index, 0, removed);
    
    // Update positions
    const updatedStages = reorderedStages.map((stage, index) => ({
      ...stage,
      position: index
    }));
    
    setStageConfigs(updatedStages);
  };

  // Save changes
  const handleSaveChanges = () => {
    updateStagesMutation.mutate(stageConfigs);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Etapas do Pipeline</DialogTitle>
          <DialogDescription>
            Adicione, remova ou reordene as etapas do seu pipeline de vendas. Arraste as etapas para reordenar.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Nome da nova etapa"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddStage} disabled={updateStagesMutation.isPending}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              <Separator className="my-4" />

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="stages">
                  {(provided) => (
                    <div 
                      className="space-y-2"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {stageConfigs.map((stage, index) => (
                        <Draggable 
                          key={stage.id} 
                          draggableId={stage.id} 
                          index={index}
                          isDragDisabled={updateStagesMutation.isPending}
                        >
                          {(provided) => (
                            <Card 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="p-3 flex items-center justify-between gap-2 border"
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={stage.name}
                                  onChange={(e) => handleEditStageName(stage.id, e.target.value)}
                                  disabled={stage.isDefault || stage.isArchive || updateStagesMutation.isPending}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-8 h-8 p-0"
                                      style={{ 
                                        backgroundColor: stage.color || '#6B7280',
                                        borderColor: stage.color || '#6B7280'
                                      }}
                                      disabled={updateStagesMutation.isPending}
                                    >
                                      <span className="sr-only">Escolher cor</span>
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-2">
                                    <div className="grid grid-cols-5 gap-2">
                                      {STAGE_COLORS.map((color) => (
                                        <Button
                                          key={color.value}
                                          variant="outline"
                                          className="w-8 h-8 p-0 border-2"
                                          style={{ 
                                            backgroundColor: color.value,
                                            borderColor: stage.color === color.value ? 'white' : color.value
                                          }}
                                          onClick={() => handleUpdateStageColor(stage.id, color.value)}
                                          title={color.label}
                                        >
                                          {stage.color === color.value && (
                                            <Check className="h-3 w-3 text-white" />
                                          )}
                                          <span className="sr-only">{color.label}</span>
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                
                                {stage.isDefault && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary">
                                    Padrão
                                  </Badge>
                                )}
                                {stage.isArchive && (
                                  <Badge variant="outline" className="bg-muted/10 text-muted-foreground">
                                    Arquivada
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveStage(stage.id)}
                                  disabled={stage.isDefault || stage.isArchive || updateStagesMutation.isPending}
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="text-sm text-muted-foreground mt-4">
                <p className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Etapas padrão e arquivadas não podem ser removidas.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={updateStagesMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={updateStagesMutation.isPending}
              >
                {updateStagesMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StageSettingsDialog;