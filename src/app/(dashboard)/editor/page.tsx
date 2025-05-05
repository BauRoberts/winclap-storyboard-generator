'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Wand2, AlertCircle, Sparkles } from 'lucide-react';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';

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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">🪄</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Winclap Storyboard Generator</h1>
        <p className="text-gray-500">Pega o escribe tu briefing y genéralo en formato storyboard</p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Editor de Briefing</CardTitle>
          <CardDescription>
            Escribe o pega tu briefing aquí. Incluye información sobre cliente, objetivo, target, mensaje clave y otros detalles.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
        <CardFooter className="flex gap-4">
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
        </CardFooter>
      </Card>

      {/* Ayuda sobre el formato */}
      <Card className="border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="text-sm">Formato sugerido para el briefing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <p>Para mejores resultados, incluye:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Cliente: [Nombre del cliente]</li>
            <li>Objetivo: [Objetivo de la campaña]</li>
            <li>Target: [Descripción del público objetivo]</li>
            <li>Mensaje clave: [Mensaje principal]</li>
            <li>Plataforma: [TikTok, Instagram, etc.]</li>
            <li>MOM: [Momento de inspiración o idea creativa]</li>
            <li>Creador: [Nombre del creador]</li>
            <li>Referencias: [Enlaces o descripciones de referencias]</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}