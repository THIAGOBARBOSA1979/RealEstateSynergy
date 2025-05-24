import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Document } from "@/types";
import { Plus, FileText, Eye, Upload, Cloud } from "lucide-react";

interface DocumentManagerProps {
  leadId?: number;
  clientId?: number;
}

const DocumentManager = ({ leadId, clientId }: DocumentManagerProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents', { leadId, clientId }],
  });

  const uploadToGoogleDrive = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest(`/api/documents/${documentId}/upload-drive`, {
        method: "POST",
      } as RequestInit);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar para o Google Drive");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Documento enviado ao Google Drive com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Por favor, selecione um arquivo");
      }

      if (!title) {
        throw new Error("Por favor, adicione um título ao documento");
      }

      if (!type) {
        throw new Error("Por favor, selecione um tipo de documento");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("type", type);
      
      if (leadId) {
        formData.append("leadId", leadId.toString());
      }
      
      if (clientId) {
        formData.append("clientId", clientId.toString());
      }

      const response = await apiRequest("/api/documents", {
        method: "POST",
        body: formData,
      } as RequestInit);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar documento");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setFile(null);
      setTitle("");
      setType("");
      setActiveTab("list");
      
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const filteredDocuments = documents
    ? (documents as Document[]).filter((doc) => 
        filterStatus === "all" ? true : doc.status === filterStatus
      )
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-700">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "id":
        return "Documento de Identidade";
      case "contract":
        return "Contrato";
      case "proof_of_income":
        return "Comprovante de Renda";
      case "proof_of_address":
        return "Comprovante de Endereço";
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-heading font-semibold">Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Documentos</TabsTrigger>
            <TabsTrigger value="upload">Enviar Novo</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("upload")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Documento
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2" />
                <p>Nenhum documento encontrado.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setActiveTab("upload")}
                >
                  Enviar documento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-md p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-2 rounded">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground">{getDocumentTypeLabel(doc.type)}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            {getStatusBadge(doc.status)}
                            <span className="text-xs text-muted-foreground">
                              Enviado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.fileUrl && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {!doc.googleDriveId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => uploadToGoogleDrive.mutate(doc.id)}
                            disabled={uploadToGoogleDrive.isPending}
                          >
                            <span className="material-icons">cloud_upload</span>
                          </Button>
                        )}
                        {doc.googleDriveId && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`https://drive.google.com/file/d/${doc.googleDriveId}/view`} target="_blank" rel="noopener noreferrer">
                              <span className="material-icons">cloud</span>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {doc.notes && (
                      <div className="mt-2 bg-muted p-2 rounded text-sm">
                        <p>{doc.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Documento</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Contrato de Compra e Venda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Documento</Label>
                <Select
                  value={type}
                  onValueChange={setType}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Documento de Identidade</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="proof_of_income">Comprovante de Renda</SelectItem>
                    <SelectItem value="proof_of_address">Comprovante de Endereço</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Arquivo</Label>
                <Input
                  id="document"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("list")}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => uploadDocument.mutate()}
                disabled={uploadDocument.isPending || !file || !title || !type}
              >
                {uploadDocument.isPending ? "Enviando..." : "Enviar Documento"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentManager;