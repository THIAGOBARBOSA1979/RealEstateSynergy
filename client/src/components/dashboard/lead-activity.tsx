import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Clock, UserPlus, Calendar, FileText } from "lucide-react";

interface ActivityItem {
  id: number;
  type: 'lead' | 'appointment' | 'document';
  name: string;
  description: string;
  timeAgo: string;
  icon: string;
}

const LeadActivity = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities/recent'],
  });

  // Helper function to get badge class
  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'lead':
        return 'bg-info/10 text-info';
      case 'appointment':
        return 'bg-accent/10 text-accent';
      case 'document':
        return 'bg-success/10 text-success';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  // Helper function to get icon class
  const getIconClass = (type: string) => {
    switch (type) {
      case 'lead':
        return 'bg-primary-light';
      case 'appointment':
        return 'bg-accent';
      case 'document':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  };
  
  // Helper function to get icon component
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'lead':
        return <UserPlus className="h-5 w-5" />;
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <UserPlus className="h-5 w-5" />;
    }
  };

  // Helper function to get label
  const getLabel = (type: string) => {
    switch (type) {
      case 'lead':
        return 'Novo Lead';
      case 'appointment':
        return 'Agendamento';
      case 'document':
        return 'Documentos';
      default:
        return 'Atividade';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">Atividade de Leads Recentes</h3>
        <Button variant="link" className="text-primary hover:text-primary-dark">
          Ver Todos
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div className="flex gap-4 pb-4 border-b border-border" key={index}>
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-grow">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-4 w-20 ml-2 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(activities || []).map((activity: ActivityItem) => (
            <div key={activity.id} className="flex gap-4 pb-4 border-b border-border">
              <div className={`h-10 w-10 rounded-full ${getIconClass(activity.type)} flex items-center justify-center text-white flex-shrink-0`}>
                {getIconComponent(activity.type)}
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{activity.name}</h4>
                  <span className={`ml-2 px-2 py-0.5 ${getBadgeClass(activity.type)} text-xs rounded-full`}>
                    {getLabel(activity.type)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{activity.timeAgo}</span>
                </div>
              </div>
              <div className="ml-auto flex-shrink-0">
                <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadActivity;
