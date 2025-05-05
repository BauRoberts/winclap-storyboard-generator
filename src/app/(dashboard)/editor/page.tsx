'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import EditorTopbar from '@/components/editor/EditorTopbar';
import FloatingButtons from '@/components/editor/FloatingButtons';
import { AIContent, emptyAIContent } from '@/types/types';

const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });

export default function EditorPage() {
  const { status } = useSession();
  const router = useRouter();

  const [isReorganizing, setIsReorganizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<AIContent | null>(null);
  const [freeTextContent, setFreeTextContent] = useState<string>('');

  const [documentTitle, setDocumentTitle] = useState('Storyboard sin título');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [assetCount, setAssetCount] = useState('');

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

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
      if (!response.ok || !result.success) throw new Error(result.error || 'Error al reorganizar contenido');

      setEditorContent(result.aiContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsReorganizing(false);
    }
  };

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
        body: JSON.stringify({
          aiContent: editorContent,
          cliente: selectedClient,
          plataforma: selectedPlatform,
          template: selectedTemplate,
          assets: assetCount,
          title: documentTitle,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Error al generar Slides');

      localStorage.setItem('storyboardResult', JSON.stringify(result));
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col">
        <EditorTopbar
          title={documentTitle}
          onTitleChange={setDocumentTitle}
          client={selectedClient}
          onClientChange={setSelectedClient}
          platform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          template={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          assetCount={assetCount}
          onAssetCountChange={setAssetCount}
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

        <div className="flex-1">
        <RichEditor
  initialContent={editorContent || emptyAIContent}
  onChange={(json, text) => {
    setEditorContent(json);
    setFreeTextContent(text || '');
  }}
/>

        </div>
      </div>

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
