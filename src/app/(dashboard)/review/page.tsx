'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PencilLine } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReviewPage() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cliente, setCliente] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('aiContent');
    const brief = localStorage.getItem('briefData');
    if (stored) setJsonText(JSON.stringify(JSON.parse(stored), null, 2));
    if (brief) {
      try {
        const parsed = JSON.parse(brief);
        setCliente(parsed.cliente || '');
      } catch {}
    }
  }, []);

  const handleGenerate = async () => {
    try {
      setIsSubmitting(true);
      const parsed = JSON.parse(jsonText);

      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiContent: parsed, cliente }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);

      localStorage.setItem('storyboardResult', JSON.stringify(result));
      router.push('/result');
    } catch (e: any) {
      setError(e.message || 'Error al generar las Slides');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">✍️</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Revisión del Contenido</h1>
        <p className="text-gray-500">Revisá y editá el contenido antes de generar el storyboard</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contenido Generado</CardTitle>
          <CardDescription>Modificá si es necesario antes de crear las Slides</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="w-full h-[500px] font-mono text-sm"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <PencilLine className="h-4 w-4 mr-2" />
                Generar Slides
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
