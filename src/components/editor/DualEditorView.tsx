'use client';

import { useState, useEffect, useRef } from 'react';
import { AIContent } from '@/types/types';
import dynamic from 'next/dynamic';
import { ArrowLeft, Split, Columns, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Importar RichEditor de forma dinámica para evitar errores SSR
const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });

interface DualEditorViewProps {
  originalContent: AIContent; 
  reorganizedContent: AIContent;
  onOriginalChange: (json: AIContent, text: string) => void;
  onReorganizedChange: (json: AIContent, text: string) => void;
  selectedSource: 'original' | 'reorganized';
  onSelectSource: (source: 'original' | 'reorganized') => void;
  onBackToSingle: () => void;
}

export default function DualEditorView({
  originalContent,
  reorganizedContent,
  onOriginalChange,
  onReorganizedChange,
  selectedSource,
  onSelectSource,
  onBackToSingle
}: DualEditorViewProps) {
  const [displayMode, setDisplayMode] = useState<'tabs' | 'split'>('tabs');
  const [isEditingOriginal, setIsEditingOriginal] = useState(false);
  const [isEditingReorganized, setIsEditingReorganized] = useState(false);

  // Logging para depuración
  useEffect(() => {
    console.log("DualEditorView - Contenido original:", originalContent);
    console.log("DualEditorView - Contenido reorganizado:", reorganizedContent);
    console.log("DualEditorView - Fuente seleccionada:", selectedSource);
  }, [originalContent, reorganizedContent, selectedSource]);

  // Manejadores con protección contra ciclos
  const handleOriginalEditorChange = (json: AIContent, text: string) => {
    if (isEditingOriginal) return;
    
    setIsEditingOriginal(true);
    onOriginalChange(json, text);
    setTimeout(() => setIsEditingOriginal(false), 100);
  };

  const handleReorganizedEditorChange = (json: AIContent, text: string) => {
    if (isEditingReorganized) return;
    
    setIsEditingReorganized(true);
    onReorganizedChange(json, text);
    setTimeout(() => setIsEditingReorganized(false), 100);
  };

  // Vista de pestañas
  if (displayMode === 'tabs') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackToSingle}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayMode('split')}
              className="flex items-center"
            >
              <Split className="h-4 w-4 mr-1" />
              Vista dividida
            </Button>
            
            <Button
              variant={selectedSource === 'reorganized' ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectSource('reorganized')}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Usar Reorganizado
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue={selectedSource} 
          className="flex-1 flex flex-col"
          onValueChange={(value) => onSelectSource(value as 'original' | 'reorganized')}
          value={selectedSource}
        >
          <TabsList className="grid grid-cols-2 mx-6 my-4">
            <TabsTrigger value="original">Contenido Original</TabsTrigger>
            <TabsTrigger value="reorganized">Contenido Reorganizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="original" className="flex-1 p-0 m-0">
            <RichEditor
              initialContent={originalContent}
              onChange={handleOriginalEditorChange}
              key="original-editor-static"
            />
          </TabsContent>
          
          <TabsContent value="reorganized" className="flex-1 p-0 m-0">
            <RichEditor
              initialContent={reorganizedContent}
              onChange={handleReorganizedEditorChange}
              key="reorganized-editor-static"
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Vista dividida
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackToSingle}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDisplayMode('tabs')}
            className="flex items-center"
          >
            <Columns className="h-4 w-4 mr-1" />
            Vista pestañas
          </Button>
          
          <Button
            variant={selectedSource === 'original' ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectSource('original')}
            className="flex items-center"
          >
            <Check className="h-4 w-4 mr-1" />
            Usar Original
          </Button>
          
          <Button
            variant={selectedSource === 'reorganized' ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectSource('reorganized')}
            className="flex items-center"
          >
            <Check className="h-4 w-4 mr-1" />
            Usar Reorganizado
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-0 flex-1 h-full">
        <div className="border-r h-full overflow-auto">
          <div className="p-2 bg-gray-50 text-sm font-medium border-b sticky top-0 z-10">
            Contenido Original
          </div>
          <div className="h-[calc(100%-35px)]">
            <RichEditor
              initialContent={originalContent}
              onChange={handleOriginalEditorChange}
              key="original-editor-split-static"
            />
          </div>
        </div>
        
        <div className="h-full overflow-auto">
          <div className="p-2 bg-gray-50 text-sm font-medium border-b sticky top-0 z-10">
            Contenido Reorganizado
          </div>
          <div className="h-[calc(100%-35px)]">
            <RichEditor
              initialContent={reorganizedContent}
              onChange={handleReorganizedEditorChange}
              key="reorganized-editor-split-static"
            />
          </div>
        </div>
      </div>
    </div>
  );
}