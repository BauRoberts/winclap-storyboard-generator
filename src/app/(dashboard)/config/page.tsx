"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { getTemplates, Template, createTemplate, updateTemplate, deleteTemplate, setDefaultTemplate } from "@/services/templateService";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function ConfigPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    is_default: false,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Cargar templates
  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Error al cargar los templates. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Handle new template submission
  const handleAddTemplate = async () => {
    if (newTemplate.name.length < 3 || newTemplate.content.length < 10) {
      alert("El nombre debe tener al menos 3 caracteres y el contenido al menos 10 caracteres");
      return;
    }

    setIsSaving(true);
    
    try {
      await createTemplate({
        name: newTemplate.name,
        content: JSON.stringify({ content: newTemplate.content }),
        is_default: newTemplate.is_default
      });
      
      // Reset form
      setNewTemplate({
        name: "",
        content: "",
        is_default: false,
      });
      
      await loadTemplates();
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Error al crear el template. Por favor, intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle setting a template as default
  const handleSetDefaultTemplate = async (id: string) => {
    try {
      await setDefaultTemplate(id);
      await loadTemplates();
    } catch (err) {
      console.error('Error setting default template:', err);
      setError('Error al establecer el template por defecto. Por favor, intenta nuevamente.');
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate?.id) return;
    
    try {
      await deleteTemplate(selectedTemplate.id);
      await loadTemplates();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Error al eliminar el template. Por favor, intenta nuevamente.');
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={loadTemplates} />;

  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold mb-8">Configuración</h1>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Storyboard</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Template List */}
              <div className="space-y-4 mb-8">
                <h3 className="font-medium text-sm">Templates Disponibles</h3>
                {templates.length === 0 ? (
                  <div className="p-4 border rounded-md text-center text-gray-500">
                    No hay templates disponibles. Crea uno nuevo abajo.
                  </div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {templates.map((template) => (
                      <div key={template.id} className="p-5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{template.name}</span>
                          {template.is_default && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!template.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultTemplate(template.id!)}
                              className="text-sm"
                            >
                              Definir como default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={template.is_default}
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New Template Form */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Nuevo Template</h3>
                <div className="grid gap-5">
                  <div>
                    <Label htmlFor="name" className="text-sm">Nombre</Label>
                    <Input 
                      id="name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                      placeholder="Nombre del template"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content" className="text-sm">Contenido (formato Markdown)</Label>
                    <Textarea
                      id="content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                      placeholder="# Cliente y Objetivo..."
                      className="min-h-32 font-mono text-sm"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usa formato Markdown para estructurar el template
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isDefault" 
                      checked={newTemplate.is_default}
                      onChange={(e) => 
                        setNewTemplate({...newTemplate, is_default: e.target.checked})
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label 
                      htmlFor="isDefault"
                      className="font-normal text-sm"
                    >
                      Establecer como template por defecto
                    </Label>
                  </div>
                  <Button 
                    onClick={handleAddTemplate}
                    className="w-fit text-sm"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Apariencia</h3>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="darkMode" 
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)} 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label 
                      htmlFor="darkMode"
                      className="font-normal text-sm"
                    >
                      Modo Oscuro
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Notificaciones</h3>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="notifications" 
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)} 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label 
                      htmlFor="notifications"
                      className="font-normal text-sm"
                    >
                      Activar notificaciones
                    </Label>
                  </div>
                </div>

                <Button className="w-fit text-sm">
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el template "{selectedTemplate?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}