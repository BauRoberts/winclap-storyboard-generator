// src/app/(dashboard)/editor/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle } from 'lucide-react';

// Componentes UI
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';

// Nuevos componentes
import EditorTopbar from '@/components/editor/EditorTopbar';
import FloatingButtons from '@/components/editor/FloatingButtons';

// Lazy load del Editor de Tiptap
const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });

// Interfaz para el contenido estructurado
interface AIContent {
  objective: string;
  tone: string;
  valueProp1: string;
  valueProp2: string;
  hook: string;
  description: string;
  cta: string;
  scene1Script: string;
  scene1Visual: string;
  scene1Sound: string;
  scene2Script: string;
  scene2Visual: string;
  scene2Sound: string;
  scene3Script: string;
  scene3Visual: string;
  scene3Sound: string;
  scene4Script: string;
  scene4Visual: string;
  scene4Sound: string;
  [key: string]: string;
}

export default function EditorPage() {
  const { status } = useSession();
  const router = useRouter();

  // Estados para controlar el editor y los procesos
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<AIContent | null>(null);
  const [freeTextContent, setFreeTextContent] = useState<string>('');
  
  // Estados para la topbar
  const [documentTitle, setDocumentTitle] = useState('Storyboard sin título');
  const [selectedClient, setSelectedClient] = useState('');

  // Verificar estado de autenticación
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  // Reorganizar con IA
  const handleReorganizeWithAI = async () => {
    setIsReorganizing(true);
    setError(null);

    try {
      const response = await fetch('/api/reorganize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: freeTextContent }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al reorganizar contenido');
      }

      // El editor sobreescribirá el contenido con la versión estructurada
      setEditorContent(result.aiContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('Error:', err);
      setError(errorMessage);
    } finally {
      setIsReorganizing(false);
    }
  };

  // Generar storyboard
  const handleGenerateStoryboard = async () => {
    if (!editorContent) {
      setError('Por favor, reorganiza el contenido primero');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Usar el cliente seleccionado o un valor por defecto
      const clienteToUse = selectedClient 
        ? selectedClient 
        : 'Cliente';

      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aiContent: editorContent, 
          cliente: clienteToUse,
          title: documentTitle
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar Slides');
      }

      localStorage.setItem('storyboardResult', JSON.stringify(result));
      router.push('/result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('Error:', err);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Toda la página sin separación visual */}
      <div className="flex-1 flex flex-col">
        {/* Barra superior estilo Notion */}
        <EditorTopbar 
          title={documentTitle}
          onTitleChange={setDocumentTitle}
          client={selectedClient}
          onClientChange={setSelectedClient}
        />

        {error && (
          <div className="max-w-[900px] mx-auto px-6 mb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Editor principal - perfectamente integrado con el topbar */}
        <div className="flex-1">
          <RichEditor
            initialContent={editorContent || {
              objective: '',
              tone: '',
              valueProp1: '',
              valueProp2: '',
              hook: '',
              description: '',
              cta: '',
              scene1Script: '',
              scene1Visual: '',
              scene1Sound: '',
              scene2Script: '',
              scene2Visual: '',
              scene2Sound: '',
              scene3Script: '',
              scene3Visual: '',
              scene3Sound: '',
              scene4Script: '',
              scene4Visual: '',
              scene4Sound: '',
            }}
            onChange={(json, text) => {
              setEditorContent(json);
              setFreeTextContent(text || '');
            }}
          />
        </div>
      </div>

      {/* Botones flotantes (se mantienen igual) */}
      <FloatingButtons 
        onReorganize={handleReorganizeWithAI}
        onGenerate={handleGenerateStoryboard}
        isReorganizing={isReorganizing}
        isGenerating={isGenerating}
        charactersCount={freeTextContent.length}
        disabled={{
          reorganize: !freeTextContent.trim() || isGenerating,
          generate: !editorContent || isReorganizing
        }}
      />
    </div>
  );
}