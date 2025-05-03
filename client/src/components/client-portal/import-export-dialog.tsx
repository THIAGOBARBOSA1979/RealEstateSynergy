import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportExportDialog = ({ isOpen, onClose }: ImportExportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("import");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV ou XLSX",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest("/api/clients/import", {
        method: "POST",
        body: formData,
      } as RequestInit);

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Importação concluída",
          description: `${data.imported} clientes importados com sucesso.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Erro na importação",
          description: error.message || "Ocorreu um erro durante a importação",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante a importação",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await apiRequest("/api/clients/export", {
        method: "GET",
      } as RequestInit);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "clientes.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Exportação concluída",
          description: "Clientes exportados com sucesso.",
        });
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Erro na exportação",
          description: error.message || "Ocorreu um erro durante a exportação",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante a exportação",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar/Exportar Clientes</DialogTitle>
          <DialogDescription>
            Importe seus clientes de um arquivo CSV ou XLSX, ou exporte seus clientes atuais.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-4 space-y-4">
            <Alert>
              <AlertDescription>
                O arquivo deve conter as colunas: nome, email, telefone, cidade, estado (obrigatórios).
                Colunas adicionais serão importadas como campos personalizados.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="file">Arquivo CSV ou XLSX</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <a
                href="/templates/clientes-template.xlsx"
                download
                className="text-primary hover:underline"
              >
                Baixar modelo de planilha
              </a>
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-4 space-y-4">
            <Alert>
              <AlertDescription>
                Todos os seus clientes serão exportados em um arquivo XLSX.
                Inclui todos os campos personalizados.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {activeTab === "import" ? (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importando..." : "Importar"}
            </Button>
          ) : (
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportDialog;