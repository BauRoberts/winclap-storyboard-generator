'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import EditorTopbar from '@/components/editor/EditorTopbar';
import FloatingButtons from '@/components/editor/FloatingButtons';
import { AIContent, emptyAIContent } from '@/types/types';

const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });
const DualEditorView = dynamic(() => import('@/components/editor/DualEditorView'), { ssr: false });

export default function EditorPage() {
  const { status } = useSession();
  const router = useRouter();

  // Estados generales
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modo de vista y contenidos
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [editorContent, setEditorContent] = useState<AIContent | null>(null);
  const [originalContent, setOriginalContent] = useState<AIContent | null>(null);
  const [reorganizedContent, setReorganizedContent] = useState<AIContent | null>(null);
  const [freeTextContent, setFreeTextContent] = useState<string>('');
  const [selectedContentSource, setSelectedContentSource] = useState<'original' | 'reorganized'>('original');
  
  // Estado para prevenir actualizaciones en cascada
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para los selectores
  const [documentTitle, setDocumentTitle] = useState('Storyboard sin título');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');

  // Monitorear cambios en los estados clave para depuración
  useEffect(() => {
    console.log("Modo de vista actual:", viewMode);
    console.log("Fuente seleccionada:", selectedContentSource);
  }, [viewMode, selectedContentSource]);

  // Handlers de cambio con logging
  const handleClientChange = (value: string) => {
    console.log('EditorPage - Cliente seleccionado:', value);
    setSelectedClient(value);
  };

  const handleAssetsChange = (value: string) => {
    console.log('EditorPage - Assets seleccionados:', value);
    setSelectedAssets(value);
  };

  const handlePlatformChange = (values: string[]) => {
    console.log('EditorPage - Plataformas seleccionadas:', values);
    setSelectedPlatform(values);
  };

  const handleStatusChange = (value: string) => {
    console.log('EditorPage - Estado seleccionado:', value);
    setSelectedStatus(value);
  };

  const handleCreatorChange = (value: string) => {
    console.log('EditorPage - Creador seleccionado:', value);
    setSelectedCreator(value);
  };

  // Handler para seleccionar qué contenido usar para la generación
  const handleContentSelect = (source: 'original' | 'reorganized') => {
    if (isUpdating) return;
    
    console.log('Seleccionando fuente:', source);
    setIsUpdating(true);
    setSelectedContentSource(source);
    
    if (source === 'original' && originalContent) {
      setEditorContent(originalContent);
    } else if (source === 'reorganized' && reorganizedContent) {
      setEditorContent(reorganizedContent);
    }
    
    setTimeout(() => setIsUpdating(false), 100);
  };

  // Manejadores para los cambios en los editores
  const handleOriginalChange = (json: AIContent, text: string) => {
    if (isUpdating) return;
    
    console.log("Actualización en editor original");
    setIsUpdating(true);
    setOriginalContent(json);
    
    if (selectedContentSource === 'original') {
      setEditorContent(json);
      setFreeTextContent(text);
    }
    
    setTimeout(() => setIsUpdating(false), 100);
  };

  const handleReorganizedChange = (json: AIContent, text: string) => {
    if (isUpdating) return;
    
    console.log("Actualización en editor reorganizado");
    setIsUpdating(true);
    setReorganizedContent(json);
    
    if (selectedContentSource === 'reorganized') {
      setEditorContent(json);
      setFreeTextContent(text);
    }
    
    setTimeout(() => setIsUpdating(false), 100);
  };

  // Volver a la vista simple
  const handleBackToSingle = () => {
    if (isUpdating) return;
    
    console.log("Volviendo a vista simple con fuente:", selectedContentSource);
    setIsUpdating(true);
    setViewMode('single');
    
    // Usar el contenido seleccionado actualmente
    if (selectedContentSource === 'original' && originalContent) {
      setEditorContent(originalContent);
    } else if (reorganizedContent) {
      setEditorContent(reorganizedContent);
    }
    
    setTimeout(() => setIsUpdating(false), 100);
  };

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
      // Guardar el contenido original primero
      setOriginalContent(editorContent || emptyAIContent);
      
      const response = await fetch('/api/reorganize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: freeTextContent }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Error al reorganizar contenido');

      console.log("API Response:", result);
      
      // Asegurarse de que tenemos un objeto AIContent válido
      const aiContent = result.aiContent;
      
      // Establecer el contenido reorganizado
      setReorganizedContent(aiContent);
      
      // Cambiar a vista dual y seleccionar el contenido reorganizado por defecto
      setViewMode('dual');
      setSelectedContentSource('reorganized');
      
      // También actualizar el contenido del editor actual
      setEditorContent(aiContent);
    } catch (err) {
      console.error("Error reorganizando:", err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsReorganizing(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!editorContent) {
      setError('Por favor, asegúrate de tener contenido para generar el storyboard');
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
          assets: selectedAssets,
          status: selectedStatus,
          creator: selectedCreator,
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

  // Renderizar el editor apropiado según el modo de vista
  const renderEditor = () => {
    if (viewMode === 'single') {
      return (
        <RichEditor
          initialContent={editorContent || emptyAIContent}
          onChange={(json, text) => {
            if (isUpdating) return;
            
            console.log("Cambio en editor simple");
            setIsUpdating(true);
            setEditorContent(json);
            setFreeTextContent(text);
            
            // También actualizar el contenido original o reorganizado según cuál esté seleccionado
            if (selectedContentSource === 'original') {
              setOriginalContent(json);
            } else {
              setReorganizedContent(json);
            }
            
            setTimeout(() => setIsUpdating(false), 100);
          }}
          key="single-editor-static"
        />
      );
    } else {
      return (
        <DualEditorView
          originalContent={originalContent || emptyAIContent}
          reorganizedContent={reorganizedContent || emptyAIContent}
          onOriginalChange={handleOriginalChange}
          onReorganizedChange={handleReorganizedChange}
          selectedSource={selectedContentSource}
          onSelectSource={handleContentSelect}
          onBackToSingle={handleBackToSingle}
        />
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col">
        <EditorTopbar
          title={documentTitle}
          onTitleChange={setDocumentTitle}
          client={selectedClient}
          onClientChange={handleClientChange}
          assets={selectedAssets}
          onAssetsChange={handleAssetsChange}
          platform={selectedPlatform}
          onPlatformChange={handlePlatformChange}
          status={selectedStatus}
          onStatusChange={handleStatusChange}
          creator={selectedCreator}
          onCreatorChange={handleCreatorChange}
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
          {renderEditor()}
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
        viewMode={viewMode}
      />
    </div>
  );
}