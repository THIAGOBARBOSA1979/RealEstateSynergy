import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: number;
  fullName: string;
  role: string;
  avatar?: string;
  performance: {
    leads: number;
    closedDeals: number;
    conversion: number;
    progress: number;
    target: number;
  };
}

// Dados estáticos para demonstração
// Estes viriam de uma API em um sistema real
const demoTeamData: TeamMember[] = [
  {
    id: 1,
    fullName: "Carlos Silva",
    role: "Corretor Senior",
    performance: {
      leads: 48,
      closedDeals: 12,
      conversion: 25,
      progress: 80,
      target: 15
    }
  },
  {
    id: 2,
    fullName: "Maria Oliveira",
    role: "Corretora",
    performance: {
      leads: 35,
      closedDeals: 8,
      conversion: 22.8,
      progress: 60,
      target: 15
    }
  },
  {
    id: 3,
    fullName: "Paulo Santos",
    role: "Corretor",
    performance: {
      leads: 22,
      closedDeals: 5,
      conversion: 22.7,
      progress: 40,
      target: 12
    }
  },
  {
    id: 4,
    fullName: "Ana Souza",
    role: "Assistente",
    performance: {
      leads: 18,
      closedDeals: 3,
      conversion: 16.7,
      progress: 30,
      target: 10
    }
  }
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-success";
  if (progress >= 50) return "bg-info";
  if (progress >= 30) return "bg-warning";
  return "bg-destructive";
};

const PerformanceRanking = () => {
  // Em uma implementação real, buscaríamos dados do backend
  // const { data, isLoading } = useQuery({
  //   queryKey: ['/api/team/performance'],
  // });
  
  // Simulando loading state
  const isLoading = false;
  const teamMembers = demoTeamData;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-heading font-semibold">Ranking de Performance</CardTitle>
        <CardDescription>Desempenho da equipe de vendas no mês atual</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 text-center font-medium text-muted-foreground">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10 border-2 border-muted">
                  <AvatarFallback className="bg-primary-light/30 text-primary">
                    {getInitials(member.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{member.fullName}</h4>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary-light/10 text-primary">
                      {member.performance.closedDeals}/{member.performance.target}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso para meta</span>
                      <span className="font-medium">{member.performance.progress}%</span>
                    </div>
                    <Progress value={member.performance.progress} className={`h-2 ${getProgressColor(member.performance.progress)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceRanking;