// src/components/editor/AIReorganizationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AIContent } from '@/types/types';
import dynamic from 'next/dynamic';

// Importar RichEditor de forma dinámica para evitar errores SSR
const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });

interface AIReorganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiContent: AIContent | null;
  isGenerating: boolean;
  onGenerate: (content: AIContent) => Promise<void>;
  onEdit: (json: AIContent, text: string) => void;
}

export default function AIReorganizationModal({
  isOpen,
  onClose,
  aiContent,
  isGenerating,
  onGenerate,
  onEdit
}: AIReorganizationModalProps) {
  // Estado local para el contenido editado
  const [editedContent, setEditedContent] = useState<AIContent | null>(aiContent);
  
  // Cuando se recibe nuevo contenido AI, actualizar el estado local
  useEffect(() => {
    setEditedContent(aiContent);
  }, [aiContent]);

  // Si no hay contenido AI, no mostrar nada
  if (!aiContent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="ai-reorganization-modal max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="DialogTitle">Contenido organizado para Storyboard</DialogTitle>
          <DialogDescription className="DialogDescription">
            La IA ha estructurado tu texto. Puedes editar este contenido antes de generar las slides.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-[calc(80vh-120px)]">
          {/* Editor para el contenido AI - con altura flexible */}
          <div className="flex-grow overflow-auto border rounded-md bg-white">
            <RichEditor
              initialContent={aiContent}
              onChange={(json, text) => {
                setEditedContent(json);
                onEdit(json, text);
              }}
              key="ai-reorganization-editor"
            />
          </div>
          
          {/* Barra inferior con acciones principales */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => editedContent && onGenerate(editedContent)}
                disabled={isGenerating || !editedContent}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando slides...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generar Slides
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}