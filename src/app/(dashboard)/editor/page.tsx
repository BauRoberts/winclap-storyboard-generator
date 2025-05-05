'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Wand2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const [isReorganizing, setIsReorganizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<AIContent | null>(null);
  const [freeTextContent, setFreeTextContent] = useState<string>('');

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
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiContent: editorContent, cliente: 'Cliente' }), // TODO: extraer cliente del contenido
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪄</span>
            <h1 className="text-xl font-semibold">Winclap Storyboard Generator</h1>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">Tips rápidos:</p>
                <ul className="list-disc ml-4 text-sm space-y-1">
                  <li>Escribiste &quot;/&quot; para comandos</li> {/* Escapamos las comillas */}
                  <li>Incluí cliente, objetivo, target</li>
                  <li>Editá antes de generar</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Editor principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

        {/* Barra de acciones fija */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-sm">
          <div className="container mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={handleReorganizeWithAI}
                disabled={isReorganizing || !freeTextContent.trim() || isGenerating}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {isReorganizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Reorganizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Reorganizar con IA
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerateStoryboard}
                disabled={isGenerating || !editorContent || isReorganizing}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar Storyboard
                  </>
                )}
              </Button>
            </div>

            {/* Indicador de progreso */}
            <div className="text-sm text-gray-500">
              {freeTextContent ? freeTextContent.length + ' caracteres' : 'Escribe tu briefing...'}
            </div>
          </div>
        </div>

        {/* Espacio para compensar la barra fija */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}