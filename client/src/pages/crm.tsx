import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

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
  const queryClient = useQueryClient();

  const { data: stages, isLoading } = useQuery({
    queryKey: ['/api/crm/stages'],
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, newStageId }: { leadId: number, newStageId: string }) => {
      return apiRequest("PATCH", `/api/crm/leads/${leadId}`, { stageId: newStageId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stages'] });
    },
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

  // Filter leads based on search term
  const filteredStages = stages ? stages.map((stage: CrmStage) => ({
    ...stage,
    leads: stage.leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })) : [];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold">CRM (Pipeline de Vendas)</h1>
        <div className="flex gap-2">
          <Button>
            <span className="material-icons text-sm mr-1">add</span>
            Novo Lead
          </Button>
          <Button variant="outline">
            <span className="material-icons text-sm mr-1">settings</span>
            Configurar Etapas
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input 
          placeholder="Buscar leads por nome ou descrição" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

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
                      <p className="text-sm text-muted-foreground mt-1">{lead.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{lead.timeAgo}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
                            <span className="material-icons text-sm">more_vert</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 bg-background rounded-lg border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Arraste leads para esta etapa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CRM;
