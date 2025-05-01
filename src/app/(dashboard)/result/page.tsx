///Users/bautistaroberts/winclap-storyboard-generator/src/app/(dashboard)/result/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, FileText, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ResultPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<null | any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('storyboardResult');
    if (saved) {
      try {
        setStoryboard(JSON.parse(saved));
      } catch (e) {
        setError('No se pudo cargar el storyboard generado.');
      }
    } else {
      setError('No se encontró información del storyboard. Volvé a generar uno.');
    }
  }, []);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const url = storyboard?.url;

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

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url)
        .then(() => setCopied(true))
        .catch(() => setError('No se pudo copiar el enlace'));
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">🪄</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Storyboard Generado</h1>
        <p className="text-gray-500">Tu storyboard ha sido creado exitosamente</p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {url && (
        <Card className="form-card mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Storyboard Listo
            </CardTitle>
            <CardDescription>
              El storyboard ha sido generado en Google Slides
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 relative overflow-hidden">
              <p className="text-gray-700 text-sm font-mono truncate">{url}</p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2.5"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-gray-50 rounded-md border border-gray-200 h-60 flex items-center justify-center mb-4">
              <div className="text-center p-4">
                <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Vista previa no disponible</p>
                <p className="text-xs text-gray-500">Accede al enlace para ver el storyboard completo</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/form')}
              className="w-full sm:w-auto border-gray-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Crear
            </Button>
            <Button
              className="w-full sm:w-auto bg-black text-white hover:bg-gray-800"
              onClick={() => window.open(url, '_blank')}
            >
              Abrir en Google Slides <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {storyboard?.aiContent && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contenido Generado por IA</CardTitle>
            <CardDescription>
              Hook, descripción, escenas y CTA generados por Claude
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-800 leading-relaxed">
            <p><strong>🎯 Hook:</strong> {storyboard.aiContent.hook}</p>
            <p><strong>📝 Descripción:</strong> {storyboard.aiContent.description}</p>
            <p><strong>🎬 Escena 1:</strong> {storyboard.aiContent.scene1Script}</p>
            <p><strong>📣 CTA:</strong> {storyboard.aiContent.cta}</p>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>El storyboard fue creado con Winclap Storyboard Generator</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="w-2 h-2 bg-black rounded-full"></span>
          <span>Powered by Winclap</span>
        </div>
      </div>
    </div>
  );
}
