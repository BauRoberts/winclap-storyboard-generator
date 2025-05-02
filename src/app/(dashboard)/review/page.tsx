// ✅ /src/app/(dashboard)/review/page.tsx — Editor tipo Notion con Tiptap
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Lazy load del Editor de Tiptap
const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });

export default function ReviewPage() {
  const router = useRouter();
  const { status } = useSession();
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
  const [aiContent, setAiContent] = useState<AIContent | null>(null);  
  const [cliente, setCliente] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorJson, setEditorJson] = useState<AIContent | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('aiContent');
    const brief = localStorage.getItem('briefData');
    if (stored) setAiContent(JSON.parse(stored));
    if (brief) {
      try {
        const parsed = JSON.parse(brief);
        setCliente(parsed.cliente || '');
      } catch {}
    }
  }, []);

  const handleGenerateSlides = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiContent: editorJson, cliente }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      localStorage.setItem('storyboardResult', JSON.stringify(result));
      router.push('/result');
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Error al generar Slides';
        setError(errorMsg);
      } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || !aiContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">✍️</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Revisión del Contenido</h1>
        <p className="text-gray-500">Revisá y editá el contenido generado antes de crear las Slides</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>Podés modificar libremente el contenido como si fuera un documento</CardDescription>
        </CardHeader>
        <CardContent>
          <RichEditor
            initialContent={aiContent}
            onChange={(json) => setEditorJson(json)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleGenerateSlides}
            disabled={isSubmitting || !editorJson}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generando...
              </>
            ) : (
              <>
                <PencilLine className="h-4 w-4 mr-2" /> Generar Slides
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
