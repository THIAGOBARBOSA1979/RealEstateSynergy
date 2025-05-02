import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Link } from "wouter";

interface PropertyTableProps {
  limit?: number;
}

const PropertyTable = ({ limit }: PropertyTableProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/properties?page=${page}&limit=${limit || 10}`],
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-success/10 text-success';
      case 'reservado':
        return 'bg-warning/10 text-warning';
      case 'vendido':
        return 'bg-info/10 text-info';
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
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark h-8 w-8">
                        <span className="material-icons">edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark h-8 w-8">
                        <span className="material-icons">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                        <span className="material-icons">delete_outline</span>
                      </Button>
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
              <span className="material-icons">chevron_left</span>
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
              <span className="material-icons">chevron_right</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyTable;
