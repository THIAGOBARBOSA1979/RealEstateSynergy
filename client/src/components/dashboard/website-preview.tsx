import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WebsitePreviewProps {
  userId: number;
}

const WebsitePreview = ({ userId }: WebsitePreviewProps) => {
  const { data: websiteData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/website`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Seu Site Imobiliário</h3>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border mb-4">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Seu Site Imobiliário</h3>

        {websiteData ? (
          <>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h4 className="font-heading font-semibold">{websiteData.title}</h4>
                  <p className="text-sm text-white/80">{websiteData.domain}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{websiteData.stats.visitsToday}</p>
                <p className="text-xs text-muted-foreground">Visitas hoje</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{websiteData.stats.leadsGenerated}</p>
                <p className="text-xs text-muted-foreground">Leads gerados</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-6 bg-background rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">Você ainda não tem um site configurado</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button asChild variant="default">
            <a href="/site-editor">
              {websiteData ? "Editar Site" : "Criar Site"}
            </a>
          </Button>
          {websiteData && (
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
              <a href={`https://${websiteData.domain}`} target="_blank" rel="noopener noreferrer">
                Visualizar Site
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebsitePreview;
