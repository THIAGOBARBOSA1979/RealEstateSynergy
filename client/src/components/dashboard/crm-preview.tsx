import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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
  }[];
}

export const getSourceBadgeClass = (source: string) => {
  switch (source.toLowerCase()) {
    case 'site':
      return 'bg-info/10 text-info';
    case 'whatsapp':
      return 'bg-accent/10 text-accent';
    case 'indica':
      return 'bg-secondary/10 text-secondary';
    default:
      return 'bg-primary/10 text-primary';
  }
};

const CrmPreview = () => {
  const { data: stages, isLoading } = useQuery({
    queryKey: ['/api/crm/stages'],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold">Seu CRM (Pipeline de Vendas)</h3>
        <Button variant="link" className="text-primary hover:text-primary-dark" asChild>
          <Link href="/crm">Ver CRM Completo</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="kanban-board mb-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="kanban-board mb-4">
          {(Array.isArray(stages) ? stages : []).map((stage: CrmStage) => (
            <Card key={stage.id} className="h-fit">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{stage.name}</h4>
                  <Badge variant="secondary" className="bg-primary-light/20 text-primary-dark hover:bg-primary-light/30">
                    {stage.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {stage.leads.length > 0 ? (
                  stage.leads.map((lead) => (
                    <div 
                      key={lead.id}
                      className="bg-background rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow border border-border"
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
                        <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-primary">
                          <span className="material-icons text-sm">more_vert</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">Nenhum lead nesta etapa</p>
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

export default CrmPreview;
