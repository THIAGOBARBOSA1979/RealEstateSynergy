import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { WebsiteSection } from "@/types";

interface SectionEditorProps {
  websiteData: any;
  updateWebsiteData: (newData: any) => void;
}

const sectionTypes = [
  { value: "hero", label: "Banner Principal" },
  { value: "about", label: "Sobre Nós" },
  { value: "features", label: "Benefícios" },
  { value: "properties", label: "Imóveis em Destaque" },
  { value: "testimonials", label: "Depoimentos" },
  { value: "contact", label: "Formulário de Contato" },
  { value: "cta", label: "Chamada para Ação" },
];

export default function SectionEditor({ websiteData, updateWebsiteData }: SectionEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<WebsiteSection | null>(null);
  const [newSectionType, setNewSectionType] = useState(sectionTypes[0].value);
  const queryClient = useQueryClient();

  const sections = websiteData?.layout?.sections || [];

  const handleAddSection = () => {
    const newSection: WebsiteSection = {
      id: uuidv4(),
      type: newSectionType,
      title: "",
      content: "",
      items: [],
      settings: {},
    };

    const updatedSections = [...sections, newSection];
    
    updateWebsiteData({
      ...websiteData,
      layout: {
        ...websiteData.layout,
        sections: updatedSections,
      },
    });

    setIsAddDialogOpen(false);
  };

  const handleEditSection = (section: WebsiteSection) => {
    setSelectedSection(section);
    setIsEditDialogOpen(true);
  };

  const handleSaveSection = () => {
    if (!selectedSection) return;

    const updatedSections = sections.map((section: WebsiteSection) => {
      if (section.id === selectedSection.id) {
        return selectedSection;
      }
      return section;
    });

    updateWebsiteData({
      ...websiteData,
      layout: {
        ...websiteData.layout,
        sections: updatedSections,
      },
    });

    setIsEditDialogOpen(false);
    setSelectedSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(
      (section: WebsiteSection) => section.id !== sectionId
    );

    updateWebsiteData({
      ...websiteData,
      layout: {
        ...websiteData.layout,
        sections: updatedSections,
      },
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateWebsiteData({
      ...websiteData,
      layout: {
        ...websiteData.layout,
        sections: items,
      },
    });
  };

  const updateSectionField = (field: string, value: any) => {
    if (!selectedSection) return;

    setSelectedSection({
      ...selectedSection,
      [field]: value,
    });
  };

  const getSectionTypeLabel = (type: string) => {
    const sectionType = sectionTypes.find(t => t.value === type);
    return sectionType ? sectionType.label : type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">Seções do Site</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <span className="material-icons text-sm mr-2">add</span>
          Adicionar Seção
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Seu site não tem seções. Adicione seções para construir seu site.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
              <span className="material-icons text-sm mr-2">add</span>
              Adicionar Primeira Seção
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sections.map((section: WebsiteSection, index: number) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border border-border"
                      >
                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                          <div className="flex items-center">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab mr-2"
                            >
                              <span className="material-icons text-muted-foreground">
                                drag_indicator
                              </span>
                            </div>
                            <CardTitle className="text-base font-medium">
                              {getSectionTypeLabel(section.type)}
                              {section.title && ` - ${section.title}`}
                            </CardTitle>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSection(section)}
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <span className="material-icons text-sm">delete</span>
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Seção</DialogTitle>
            <DialogDescription>
              Escolha o tipo de seção que deseja adicionar ao seu site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-type">Tipo de Seção</Label>
              <Select value={newSectionType} onValueChange={setNewSectionType}>
                <SelectTrigger id="section-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSection}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Seção</DialogTitle>
            <DialogDescription>
              Personalize as configurações desta seção.
            </DialogDescription>
          </DialogHeader>

          {selectedSection && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="section-title">Título da Seção</Label>
                <Input
                  id="section-title"
                  value={selectedSection.title || ""}
                  onChange={(e) => updateSectionField("title", e.target.value)}
                  placeholder="Ex: Imóveis em Destaque"
                />
              </div>

              {(selectedSection.type === "about" || 
                selectedSection.type === "cta") && (
                <div className="space-y-2">
                  <Label htmlFor="section-content">Conteúdo</Label>
                  <Textarea
                    id="section-content"
                    value={selectedSection.content || ""}
                    onChange={(e) => updateSectionField("content", e.target.value)}
                    placeholder="Digite o conteúdo da seção..."
                    className="min-h-[120px]"
                  />
                </div>
              )}

              {selectedSection.type === "hero" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-headline">Título Principal</Label>
                    <Input
                      id="hero-headline"
                      value={selectedSection.settings?.headline || ""}
                      onChange={(e) => 
                        updateSectionField("settings", {
                          ...selectedSection.settings,
                          headline: e.target.value
                        })
                      }
                      placeholder="Ex: Encontre o Imóvel dos Seus Sonhos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-subheadline">Subtítulo</Label>
                    <Textarea
                      id="hero-subheadline"
                      value={selectedSection.settings?.subheadline || ""}
                      onChange={(e) => 
                        updateSectionField("settings", {
                          ...selectedSection.settings,
                          subheadline: e.target.value
                        })
                      }
                      placeholder="Ex: Trabalhamos com os melhores imóveis da região..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-cta-text">Texto do Botão</Label>
                    <Input
                      id="hero-cta-text"
                      value={selectedSection.settings?.ctaText || ""}
                      onChange={(e) => 
                        updateSectionField("settings", {
                          ...selectedSection.settings,
                          ctaText: e.target.value
                        })
                      }
                      placeholder="Ex: Ver Imóveis"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSection}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}