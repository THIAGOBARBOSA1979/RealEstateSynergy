import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DocumentManager from "@/components/client-portal/document-manager";
import ImportExportDialog from "@/components/client-portal/import-export-dialog";
import { Plus, Settings, Eye, Upload, Download, ArrowDownUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ClientPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isImportExportDialogOpen, setIsImportExportDialogOpen] = useState(false);

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'aprovado':
      case 'approved':
        return 'bg-success/10 text-success';
      case 'rejeitado':
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted-foreground/10 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Portal do Cliente</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4 w-full md:w-auto">
                <Input 
                  placeholder="Buscar clientes por nome, email ou telefone" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsImportExportDialogOpen(true)}
                  className="gap-1"
                >
                  <ArrowDownUp className="h-4 w-4" />
                  Importar/Exportar
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-medium">Cliente</TableHead>
                      <TableHead className="font-medium">Contato</TableHead>
                      <TableHead className="font-medium">Interesse</TableHead>
                      <TableHead className="font-medium text-center">Status</TableHead>
                      <TableHead className="font-medium text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingClients ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (clients && clients.length > 0) ? (
                      clients.map((client: any) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {client.id}</div>
                          </TableCell>
                          <TableCell>
                            <div>{client.email}</div>
                            <div className="text-xs text-muted-foreground">{client.phone}</div>
                          </TableCell>
                          <TableCell>{client.interest}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={getStatusBadgeClass(client.status)}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                Ver
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedClientId(client.id)}
                                className="gap-1"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Docs
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Envio de Documentos</CardTitle>
                  <CardDescription>
                    Configure links personalizados para envio de documentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">Configurações</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Personalize o formulário e os tipos de documentos que os clientes podem enviar.
                    </p>
                    <Button variant="outline" className="w-full gap-1">
                      <Settings className="h-4 w-4" />
                      Configurar Formulário
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Google Drive</CardTitle>
                  <CardDescription>
                    Integração com Google Drive para armazenamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">Status</div>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      Conectado
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Os documentos são armazenados automaticamente no seu Google Drive.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-1">
                    <Settings className="h-4 w-4" />
                    Gerenciar Integração
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentos Recentes</CardTitle>
                  <CardDescription>
                    Últimos documentos enviados por clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDocuments ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (documents && documents.length > 0) ? (
                    <div className="space-y-2">
                      {documents.slice(0, 3).map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <div className="font-medium truncate" style={{ maxWidth: '150px' }}>{doc.title}</div>
                            <div className="text-xs text-muted-foreground">{doc.client}</div>
                          </div>
                          <Badge variant="outline" className={getStatusBadgeClass(doc.status)}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Nenhum documento recente.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="w-full">
                    Ver Todos os Documentos
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="bg-card rounded-lg overflow-hidden shadow-sm mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-medium">Documento</TableHead>
                      <TableHead className="font-medium">Cliente</TableHead>
                      <TableHead className="font-medium">Tipo</TableHead>
                      <TableHead className="font-medium">Data</TableHead>
                      <TableHead className="font-medium text-center">Status</TableHead>
                      <TableHead className="font-medium text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDocuments ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (documents && documents.length > 0) ? (
                      documents.map((doc: any) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-xs text-muted-foreground">ID: {doc.id}</div>
                          </TableCell>
                          <TableCell>{doc.client}</TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>{doc.date}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={getStatusBadgeClass(doc.status)}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                Ver
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Download className="h-3.5 w-3.5" />
                                Baixar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          Nenhum documento encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      {/* DocumentManager Dialog */}
      {selectedClientId && (
        <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Documentos do Cliente</DialogTitle>
              <DialogDescription>
                Gerencie os documentos do cliente
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <DocumentManager clientId={selectedClientId} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ImportExport Dialog */}
      <ImportExportDialog
        isOpen={isImportExportDialogOpen}
        onClose={() => setIsImportExportDialogOpen(false)}
      />
    </div>
  );
};

export default ClientPortal;
