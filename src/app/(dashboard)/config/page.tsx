"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

// Simple template type
type Template = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
};

export default function ConfigPage() {
  // Mock templates state
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Briefing Estándar",
      content: "# Cliente y Objetivo\n\n...\n\n# Target Audience\n\n...\n\n# Hook Principal\n\n...\n\n# Desarrollo de Escenas\n\n...\n\n# CTA\n\n...",
      isDefault: true,
    },
    {
      id: "2",
      name: "Minimalista",
      content: "# Hook\n\n...\n\n# Desarrollo\n\n...\n\n# CTA\n\n...",
      isDefault: false,
    },
    {
      id: "3",
      name: "Detallado",
      content: "# Cliente\n\n...\n\n# Objetivo\n\n...\n\n# Target Primario\n\n...\n\n# Hook\n\n...\n\n# Escenas\n\n...\n\n# CTA\n\n...",
      isDefault: false,
    },
  ]);

  // Simple form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    isDefault: false,
  });

  // Simple user preferences
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Handle new template submission
  const handleAddTemplate = () => {
    if (newTemplate.name.length < 3 || newTemplate.content.length < 10) {
      alert("El nombre debe tener al menos 3 caracteres y el contenido al menos 10 caracteres");
      return;
    }

    const newTemplateObject: Template = {
      id: (templates.length + 1).toString(),
      name: newTemplate.name,
      content: newTemplate.content,
      isDefault: newTemplate.isDefault,
    };

    // If new template is default, make all others non-default
    if (newTemplate.isDefault) {
      setTemplates(
        templates.map((template) => ({
          ...template,
          isDefault: false,
        }))
      );
    }

    setTemplates([...templates, newTemplateObject]);
    
    // Reset form
    setNewTemplate({
      name: "",
      content: "",
      isDefault: false,
    });

    console.log("Template creado");
  };

  // Handle setting a template as default
  const setDefaultTemplate = (id: string) => {
    setTemplates(
      templates.map((template) => ({
        ...template,
        isDefault: template.id === id,
      }))
    );
    
    console.log("Template por defecto actualizado");
  };

  // Handle template deletion
  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id));
    console.log("Template eliminado");
  };

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
                <div className="border rounded-md divide-y">
                  {templates.map((template) => (
                    <div key={template.id} className="p-5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{template.name}</span>
                        {template.isDefault && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!template.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultTemplate(template.id)}
                            className="text-sm"
                          >
                            Definir como default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={template.isDefault}
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                      checked={newTemplate.isDefault}
                      onChange={(e) => 
                        setNewTemplate({...newTemplate, isDefault: e.target.checked})
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
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Template
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
    </div>
  );
}