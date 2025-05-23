import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit, 
  Star, 
  StarOff, 
  Copy, 
  Trash2 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PropertyView from "@/components/properties/property-view";

interface PropertyTableProps {
  limit?: number;
}

const PropertyTable = ({ limit }: PropertyTableProps) => {
  const [page, setPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/properties?page=${page}&limit=${limit || 10}`],
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      return apiRequest("DELETE", `/api/properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir imóvel",
        description: "Não foi possível excluir o imóvel. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      return apiRequest("PUT", `/api/properties/${id}`, { featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Status de destaque atualizado",
        description: "O status de destaque do imóvel foi atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status de destaque",
        description: "Não foi possível atualizar o status de destaque. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handle edit property
  const handleEdit = (propertyId: number) => {
    navigate(`/edit-property/${propertyId}`);
  };

  // Handle duplicate property
  const handleDuplicate = (property: any) => {
    // Create a duplicate with the same data
    const duplicateData = {
      ...property,
      title: `Cópia de ${property.title}`,
      status: 'inactive',
      featured: false,
    };
    
    apiRequest("POST", "/api/properties", duplicateData)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        toast({
          title: "Imóvel duplicado",
          description: "Uma cópia do imóvel foi criada com sucesso",
        });
      })
      .catch(() => {
        toast({
          title: "Erro ao duplicar imóvel",
          description: "Não foi possível duplicar o imóvel. Tente novamente.",
          variant: "destructive",
        });
      });
  };

  // Handle delete confirmation
  const handleDeleteClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (selectedPropertyId) {
      deletePropertyMutation.mutate(selectedPropertyId);
    }
  };

  // Handle toggle featured status
  const handleToggleFeatured = (property: any) => {
    toggleFeaturedMutation.mutate({
      id: property.id,
      featured: !property.featured,
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ativo':
        return 'bg-success/10 text-success';
      case 'reserved':
      case 'reservado':
        return 'bg-warning/10 text-warning';
      case 'sold':
      case 'vendido':
        return 'bg-info/10 text-info';
      case 'inactive':
      case 'inativo':
        return 'bg-muted-foreground/10 text-muted-foreground';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden card-shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="font-medium">Imóvel</TableHead>
              <TableHead className="font-medium">Endereço</TableHead>
              <TableHead className="font-medium">Tipo</TableHead>
              <TableHead className="font-medium text-right">Valor</TableHead>
              <TableHead className="font-medium text-center">Status</TableHead>
              <TableHead className="font-medium text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(limit || 3)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded flex-shrink-0" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-32 ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Erro ao carregar os imóveis. Tente novamente.
                </TableCell>
              </TableRow>
            ) : data && data.properties.length > 0 ? (
              data.properties.map((property: any) => (
                <TableRow key={property.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0 bg-muted">
                        {property.images && property.images.length > 0 && (
                          <div className="h-full w-full bg-muted" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{property.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {property.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {property.address}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {property.propertyType}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(property.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusBadgeClass(property.status)} inline-block px-2 py-1 text-xs font-medium text-center w-24`}
                    >
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedPropertyId(property.id);
                            setIsViewDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(property.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(property)}>
                            {property.featured ? (
                              <StarOff className="h-4 w-4 mr-2" />
                            ) : (
                              <Star className="h-4 w-4 mr-2" />
                            )}
                            {property.featured ? "Remover destaque" : "Destacar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(property)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(property.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum imóvel encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="bg-muted p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {data.properties.length} de {data.total} imóveis
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {[...Array(Math.min(3, data.totalPages))].map((_, index) => (
              <Button
                key={index}
                variant={page === index + 1 ? 'default' : 'ghost'}
                size="icon"
                className={`h-8 w-8 rounded-full ${page === index + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              disabled={page === data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Property View Dialog */}
      <PropertyView
        propertyId={selectedPropertyId}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyTable;
