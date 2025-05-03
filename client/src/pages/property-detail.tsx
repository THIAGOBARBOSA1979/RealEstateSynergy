import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@/types";
import { CheckIcon, ImageIcon, LocateIcon } from "lucide-react";

interface PropertyFeature {
  name: string;
  checked: boolean;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Fetch property data
  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });
  
  // Update active image when property data is loaded
  useEffect(() => {
    if (property?.images?.length > 0) {
      setActiveImage(property.images[0]);
    }
  }, [property]);
  
  // Mock data for features based on the image reference
  const diferenciais: { title: string, features: PropertyFeature[] }[] = [
    {
      title: "Diferenciais",
      features: [
        { name: "Apartamento à beira", checked: true },
        { name: "Ar-condicionado", checked: true },
        { name: "Arquitetura de autor", checked: true },
        { name: "Reformado", checked: true },
        { name: "Banheira", checked: true },
      ]
    },
    {
      title: "Cômodos",
      features: [
        { name: "Área de serviço", checked: true },
        { name: "Closet", checked: true },
        { name: "Despensa", checked: true },
        { name: "Varanda", checked: true },
        { name: "Home office", checked: true },
        { name: "Lavabo", checked: true },
        { name: "Varanda", checked: true },
      ]
    },
    {
      title: "Condomínio",
      features: [
        { name: "Academia", checked: true },
        { name: "Estacionamento", checked: true },
        { name: "Brinquedoteca", checked: true },
        { name: "Churrasqueira", checked: true },
      ]
    },
    {
      title: "Área externa",
      features: [
        { name: "Academia", checked: true },
        { name: "Estacionamento", checked: true },
        { name: "Brinquedoteca", checked: true },
        { name: "Churrasqueira", checked: true },
      ]
    },
    {
      title: "Diferenciais",
      features: [
        { name: "Bicicletário", checked: true },
        { name: "Playground", checked: true },
        { name: "Piscina", checked: true },
        { name: "Sauna", checked: true },
        { name: "Quadra esportiva", checked: true },
      ]
    },
    {
      title: "Facilidades",
      features: [
        { name: "Portaria 24hs", checked: true },
        { name: "Portaria diurna", checked: true },
        { name: "Portaria eletrônica", checked: true },
        { name: "Portaria noturna", checked: true },
      ]
    },
  ];
  
  // Format property type text
  const getPropertyTypeText = (type: string): string => {
    switch (type) {
      case 'apartment':
        return 'Apartamento';
      case 'house':
        return 'Casa';
      case 'land':
        return 'Terreno';
      case 'commercial':
        return 'Comercial';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div>
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Propriedade não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível encontrar as informações da propriedade solicitada.
        </p>
        <Button asChild>
          <Link href="/properties">Ver Todas as Propriedades</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="property-detail bg-gray-50 min-h-screen">
      {/* Header/Nav */}
      <header className="bg-[#551A8B] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold">Pilar</a>
          </Link>
          <div className="flex items-center">
            <span className="material-icons text-sm mr-2">call</span>
            <span>(11) 99999-9999</span>
          </div>
        </div>
      </header>
      
      {/* Property Gallery */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Main gallery image */}
          <div className="col-span-12 md:col-span-8 h-[400px] rounded-lg overflow-hidden">
            {activeImage ? (
              <img 
                src={activeImage} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Thumbnail images */}
          <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-4">
            {property.images?.slice(1, 5).map((image: string, index: number) => (
              <div 
                key={index} 
                className="h-[190px] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setActiveImage(image)}
              >
                <img 
                  src={image} 
                  alt={`${property.title} - ${index + 1}`} 
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Property breadcrumbs and title */}
        <div className="mt-6">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/">
              <a className="hover:text-purple-700">Imóveis</a>
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/?city=${property.city}`}>
              <a className="hover:text-purple-700">{property.city}</a>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-purple-700">{property.title}</span>
          </div>
          
          <h1 className="text-2xl font-bold">
            {property.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <span>{property.address}, {property.city}</span>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            {/* Main info section */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">
                    Casa com 180 m², 10 quartos e 3 suítes, à venda no bairro Itaim Bibi
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Casa com 180 m², 10 quartos e 3 suítes, à venda no bairro Itaim Bibi. Com 180 m² privativos, possui 10 quartos sendo 3 suítes e 2 vagas de garagem.
                  </p>
                </div>
                
                {/* Key information icons */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-purple-700">square_foot</span>
                    <span className="text-sm text-gray-600 mt-1">10.000 m² total</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-purple-700">grid_3x3</span>
                    <span className="text-sm text-gray-600 mt-1">8.000 m² útil</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-purple-700">shower</span>
                    <span className="text-sm text-gray-600 mt-1">4 Banheiros</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-purple-700">bed</span>
                    <span className="text-sm text-gray-600 mt-1">3 Suítes</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-purple-700">single_bed</span>
                    <span className="text-sm text-gray-600 mt-1">4 Quartos</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-purple-700">garage</span>
                    <span className="text-sm text-gray-600 mt-1">2 Vagas</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features section */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Características do Imóvel</h2>
              
              <div className="space-y-6">
                {diferenciais.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                      {section.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          {feature.checked && <CheckIcon className="h-4 w-4 text-purple-700 mr-2" />}
                          <span className="text-sm">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                    {index < diferenciais.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Condominium section */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Condomínio</h2>
              <p className="text-gray-700 mb-4">
                Condomínio luxuoso com quadra de tênis, piscina e área gourmet no bairro Itaim Bibi
              </p>
              <p className="text-gray-600 text-sm mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla non tortor nibh. Praesent ornare pretium mi non auctor. Aliquam a molestie, odio et quis, finibus nisl.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="https://via.placeholder.com/400x300?text=Condominio+1"
                    alt="Condominio 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="https://via.placeholder.com/400x300?text=Condominio+2"
                    alt="Condominio 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="https://via.placeholder.com/400x300?text=Condominio+3"
                    alt="Condominio 3"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Location section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Localização</h2>
              <p className="text-gray-600 text-sm mb-4">
                Próximo ao Parque Ibirapuera, Itaim Bibi, SP
              </p>
              
              <div className="h-60 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/800x400?text=Mapa+da+Localização"
                  alt="Mapa da localização"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <Button variant="outline" className="w-full">
                <LocateIcon className="h-4 w-4 mr-2" />
                Ver mapa
              </Button>
            </div>
          </div>
          
          {/* Price and contact section */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-500">Venda</p>
                  <div className="flex items-end">
                    <h2 className="text-3xl font-bold text-gray-900">R$ 3.580.400</h2>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Aluguel</p>
                  <div className="flex items-end">
                    <h2 className="text-xl font-bold text-gray-900">R$ 5.450</h2>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Valor do m²</span>
                    <span className="text-sm font-medium">R$ 25.560</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Condomínio</span>
                    <span className="text-sm font-medium">R$ 1.245</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">IPTU (anual)</span>
                    <span className="text-sm font-medium">Não informado</span>
                  </div>
                </div>
                
                <Button className="w-full bg-purple-700 hover:bg-purple-800">
                  Receber mais informações
                </Button>
                
                <div className="pt-4">
                  <p className="text-center text-sm text-gray-500 mb-4">
                    Compartilhar este imóvel
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                      <span className="material-icons text-lg">facebook</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                      <span className="material-icons text-lg">whatsapp</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                      <span className="material-icons text-lg">email</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                      <span className="material-icons text-lg">content_copy</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Similar properties section - Optional */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-6">Gostou desse imóvel? Encontre imóveis semelhantes</h2>
          <Button>Encontrar imóveis semelhantes</Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0">
              <p className="text-2xl font-bold">Pilar</p>
              <p className="text-sm text-gray-400 mt-1">© 2024 Powered by Pilar</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="material-icons">attach_email</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="material-icons">instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="material-icons">picture_in_picture</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="material-icons">youtube_searched_for</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PropertyDetail;