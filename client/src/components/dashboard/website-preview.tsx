import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";

interface WebsitePreviewProps {
  userId: number;
}

interface WebsiteData {
  title?: string;
  domain?: string;
  stats?: {
    visitsToday: number;
    leadsGenerated: number;
  }
}

const WebsitePreview = ({ userId }: WebsitePreviewProps) => {
  const { data: websiteData, isLoading, isError } = useQuery<WebsiteData>({
    queryKey: [`/api/users/${userId}/website`],
    retry: false // Don't retry on 403 errors
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Real Estate Website</h3>
          <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 mb-4">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Real Estate Website</h3>

        {isError || !websiteData ? (
          <div className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-lg mb-4">
            <Globe className="h-12 w-12 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600 text-center mb-2">You don't have a website yet</p>
            <p className="text-xs text-gray-500 text-center">Create a professional website to showcase your properties</p>
          </div>
        ) : (
          <>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 mb-4 bg-gray-50">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h4 className="font-semibold">{websiteData?.title || "My Website"}</h4>
                  <p className="text-sm text-white/80">{websiteData?.domain || "mywebsite.realestate.com"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-500">
                  {websiteData?.stats?.visitsToday || 0}
                </p>
                <p className="text-xs text-gray-500">Today's Visitors</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-500">
                  {websiteData?.stats?.leadsGenerated || 0}
                </p>
                <p className="text-xs text-gray-500">Leads Generated</p>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="default" className="bg-orange-500 hover:bg-orange-600">
            {isError || !websiteData ? "Create Website" : "Edit Website"}
          </Button>
          
          {!isError && websiteData && websiteData.domain && (
            <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
              View Website
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebsitePreview;
