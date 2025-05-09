'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import EditorTopbar from '@/components/editor/EditorTopbar';
import FloatingButtons from '@/components/editor/FloatingButtons';
import AutoSaveNotification from '@/components/editor/AutoSaveNotification';
import { AIContent, emptyAIContent } from '@/types/types';
import { getStoryboard, updateStoryboard, createStoryboard } from '@/services/storyboardService';
import { useSupabase } from '@/hooks/useSupabase';
import { LoadingState } from '@/components/LoadingState';
import AIReorganizationModal from '@/components/editor/AIReorganizationModal';

// Importación dinámica del editor para evitar problemas de SSR
const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });

// Definir tipos para el hook de autoguardado
interface AutoSaveOptions {
  storyboardId: string | null;
  userId: string | null;
  saveFunction: () => Promise<any>;
  initialSaveDelay?: number;
  regularSaveDelay?: number;
}

interface AutoSaveResult {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  markDirty: (content: string, stateObj?: Record<string, any>) => void;
  save: (forceUpdate?: boolean) => Promise<void>;
}

// Hook personalizado para auto-guardado
function useAutoSave(options: AutoSaveOptions): AutoSaveResult {
  const { 
    storyboardId, 
    userId, 
    saveFunction, 
    initialSaveDelay = 2000, 
    regularSaveDelay = 2000 
  } = options;
  
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Referencias para el manejo de cambios y guardado
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>('');
  const isDirtyRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);
  
  // Nueva referencia para el hash del estado completo
  const stateHashRef = useRef<string>('');
  
  // Función para generar un hash del estado completo
  const generateStateHash = useCallback((stateObj: Record<string, any>): string => {
    // Crear una representación de string del estado completo
    return JSON.stringify({
      title: stateObj.title || '',
      client: stateObj.client || '',
      creator: stateObj.creator || '',
      status: stateObj.status || '',
      platforms: stateObj.platforms || [],
      assets: stateObj.assets || '',
      content: stateObj.content || ''
    });
  }, []);
  
  // Función para guardar contenido
  const save = useCallback(async (forceUpdate: boolean = false) => {
    // Permitir guardado forzado aunque isDirty sea false
    if ((!isDirtyRef.current && !forceUpdate) || isSavingRef.current || !userId) {
      // Si se solicita guardar forzadamente, pero ya hay un guardado en progreso, lo registramos
      if (forceUpdate && isSavingRef.current) {
        console.log("Guardado forzado solicitado pero ya hay un guardado en progreso");
      }
      return;
    }
    
    // Establecer estado de guardado
    isSavingRef.current = true;
    setStatus('saving');
    
    try {
      // Llamar la función de guardado provista
      const result = await saveFunction();
      
      // Actualizar estado solo si el guardado fue exitoso
      if (result) {
        setLastSaved(new Date());
        setStatus('saved');
        isDirtyRef.current = false;
        
        // Cambiar a estado 'idle' después de un tiempo
        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [userId, saveFunction]);
  
  // Función para programar guardado
  const scheduleSave = useCallback((delay = regularSaveDelay) => {
    // Cancelar cualquier guardado programado existente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Programar nuevo guardado
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, delay);
  }, [save, regularSaveDelay]);
  
  // Función para marcar cambios mejorada
  const markDirty = useCallback((content: string, stateObj?: Record<string, any>) => {
    let isDirty = false;
    
    // Si se proporciona stateObj, verificar cambios en todo el estado
    if (stateObj) {
      const newStateHash = generateStateHash({
        ...stateObj,
        content: content // Incluir el contenido en el hash
      });
      
      // Verificar si el estado ha cambiado
      if (newStateHash !== stateHashRef.current) {
        stateHashRef.current = newStateHash;
        isDirty = true;
        console.log("Cambios detectados en el estado del storyboard");
      }
    } 
    // Mantener compatibilidad hacia atrás verificando también el contenido directamente
    else if (content !== contentRef.current) {
      isDirty = true;
    }
    
    // Si hay cambios, actualizar referencias y programar guardado
    if (isDirty) {
      contentRef.current = content;
      isDirtyRef.current = true;
      scheduleSave();
    }
  }, [scheduleSave, generateStateHash]);
  
  // Efecto para guardar al montar (si ya existe un storyboard)
  useEffect(() => {
    if (storyboardId && userId && !lastSaved) {
      // Programar guardado inicial si es un storyboard existente
      scheduleSave(initialSaveDelay);
    }
    
    // Limpiar al desmontar
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [storyboardId, userId, lastSaved, scheduleSave, initialSaveDelay]);
  
  return {
    status,
    lastSaved,
    markDirty,
    save, // Exponer función para guardado manual
  };
}

export default function EditorPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyboardIdParam = searchParams.get('id');
  
  // Estado de UI
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReorganizing, setIsReorganizing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Estados principales
  const [storyboardId, setStoryboardId] = useState<string | null>(storyboardIdParam);
  const [userId, setUserId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('Storyboard sin título');
  const [freeTextContent, setFreeTextContent] = useState<string>('');
  const [editorContent, setEditorContent] = useState<AIContent | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  
  // Estados para seleccionables
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('draft');
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  
  // Estado para modal de reorganización
  const [isReorganizationModalOpen, setReorganizationModalOpen] = useState<boolean>(false);
  const [reorganizedContent, setReorganizedContent] = useState<AIContent | null>(null);
  
  // Prevenir actualizaciones mientras se está cargando
  const isUpdatingRef = useRef<boolean>(false);
  
  // Obtener usuario actual
  const { getCurrentUser } = useSupabase();
  
  const saveStoryboard = useCallback(async (includeAIContent: boolean = false, customAIContent?: AIContent) => {
    if (!userId) {
      console.log("No hay un usuario autenticado");
      return null;
    }
    
    try {
      // Preparar datos del storyboard
      const storyboardData = {
        title: documentTitle,
        client_id: selectedClient || null,
        creator_id: selectedCreator || null,
        status: selectedStatus || 'draft',
        original_content: htmlContent, // Usar HTML en lugar de texto plano
        platforms: selectedPlatform,
        assets: selectedAssets,
        created_by: userId
      };
      
      // Determinar qué contenido AI usar
      let aiContentToSave: AIContent | undefined = undefined;
      
      if (includeAIContent) {
        // Usar customAIContent si está disponible, sino editorContent
        if (customAIContent) {
          aiContentToSave = customAIContent;
        } else if (editorContent) {
          aiContentToSave = editorContent;
        }
      }
      
      let result;
      
      if (storyboardId) {
        // Actualizar storyboard existente
        console.log("Actualizando storyboard:", storyboardId);
        result = await updateStoryboard(storyboardId, storyboardData, aiContentToSave);
      } else {
        // Crear nuevo storyboard
        console.log("Creando nuevo storyboard");
        result = await createStoryboard(storyboardData, aiContentToSave);
        
        // Actualizar ID y URL
        if (result && result.id) {
          setStoryboardId(result.id);
          
          // Actualizar URL sin recargar
          const url = new URL(window.location.href);
          url.searchParams.set('id', result.id);
          window.history.replaceState({}, '', url.toString());
        }
      }
      
      return result;
    } catch (err) {
      console.error("Error al guardar storyboard:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, [
    userId, documentTitle, selectedClient, selectedCreator, 
    selectedStatus, htmlContent, selectedPlatform, 
    selectedAssets, editorContent, storyboardId
  ]);
  
  // Configurar auto-guardado
  const { status: autoSaveStatus, lastSaved, markDirty, save } = useAutoSave({
    storyboardId,
    userId,
    saveFunction: () => saveStoryboard(false),
    initialSaveDelay: 5000,  // Esperar 5s para el primer guardado
    regularSaveDelay: 2000   // Guardar cada 2s después de cambios
  });
  
  // Obtener user ID
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const fetchUserId = async () => {
        try {
          const user = await getCurrentUser();
          if (user && user.id) {
            setUserId(user.id);
          }
        } catch (error) {
          console.error("Error al obtener usuario:", error);
        }
      };
      
      fetchUserId();
    }
  }, [status, session, getCurrentUser]);
  
  // Cargar storyboard existente (UNA SOLA VEZ)
  useEffect(() => {
    if (!storyboardId || isInitialized || !userId) {
      // Si no hay ID, ya se inicializó, o no hay usuario, no cargar
      if (!storyboardId && !isInitialized) {
        setIsLoading(false);
        setIsInitialized(true);
      }
      return;
    }
    
    const loadStoryboard = async () => {
      try {
        console.log("Cargando storyboard:", storyboardId);
        const storyboard = await getStoryboard(storyboardId);
        
        // Configurar estados con datos del storyboard
        setDocumentTitle(storyboard.title || 'Storyboard sin título');
        setSelectedClient(storyboard.client_id || '');
        setSelectedCreator(storyboard.creator_id || '');
        setSelectedPlatform(storyboard.platforms || []);
        setSelectedAssets(storyboard.assets || '');
        setSelectedStatus(storyboard.status || 'draft');
        
        // Configurar contenido - guardar el HTML para preservar estilos
        if (storyboard.original_content) {
          // Si parece HTML, guardarlo como tal
          if (storyboard.original_content.trim().startsWith('<') && 
              storyboard.original_content.includes('</')) {
            setHtmlContent(storyboard.original_content);
            
            // También extraer texto plano para compatibilidad
            // Usa un enfoque simple, se puede mejorar si es necesario
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = storyboard.original_content;
            setFreeTextContent(tempDiv.textContent || tempDiv.innerText || '');
          } else {
            // Si no parece HTML, tratarlo como texto plano
            setFreeTextContent(storyboard.original_content);
            setHtmlContent(`<p>${storyboard.original_content}</p>`);
          }
        }
        
        // Configurar contenido AI si existe
        if (storyboard.ai_content) {
          setReorganizedContent(storyboard.ai_content);
          
          // Si no hay contenido normal, usar el AI
          if (!storyboard.original_content) {
            setEditorContent(storyboard.ai_content);
          }
        }
        
        console.log("Storyboard cargado correctamente");
      } catch (err) {
        console.error("Error al cargar storyboard:", err);
        setError(err instanceof Error ? err.message : 'Error inesperado');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    setIsLoading(true);
    loadStoryboard();
  }, [storyboardId, isInitialized, userId, getCurrentUser]);
  
  // Manejar cambios en el editor
  const handleEditorChange = useCallback((json: AIContent, text: string, html: string) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    setEditorContent(json);
    setFreeTextContent(text);
    setHtmlContent(html); // Nuevo: Guardar contenido HTML
    
    // Marcar como modificado para guardado automático incluyendo todo el estado
    markDirty(html, {
      title: documentTitle,
      client: selectedClient,
      creator: selectedCreator,
      status: selectedStatus,
      platforms: selectedPlatform,
      assets: selectedAssets,
      content: html
    });
    
    // Permitir actualizaciones después de un tiempo
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  }, [markDirty, documentTitle, selectedClient, selectedCreator, selectedStatus, selectedPlatform, selectedAssets]);
  
  // Manejar cambio de título
  const handleTitleChange = useCallback((value: string) => {
    setDocumentTitle(value);
    
    // Pasar todo el estado para detectar cambios
    markDirty(htmlContent, {
      title: value, // Usar el nuevo valor
      client: selectedClient,
      creator: selectedCreator,
      status: selectedStatus,
      platforms: selectedPlatform,
      assets: selectedAssets,
      content: htmlContent
    });
  }, [markDirty, htmlContent, selectedClient, selectedCreator, selectedStatus, selectedPlatform, selectedAssets]);
  
  // Otros manejadores de cambio - actualizar para considerar todo el estado
  const handleClientChange = useCallback((value: string) => {
    setSelectedClient(value);
    
    markDirty(htmlContent, {
      title: documentTitle,
      client: value, // Usar el nuevo valor
      creator: selectedCreator,
      status: selectedStatus,
      platforms: selectedPlatform,
      assets: selectedAssets,
      content: htmlContent
    });
  }, [markDirty, htmlContent, documentTitle, selectedCreator, selectedStatus, selectedPlatform, selectedAssets]);
  
  const handlePlatformChange = useCallback((values: string[]) => {
    setSelectedPlatform(values);
    
    markDirty(htmlContent, {
      title: documentTitle,
      client: selectedClient,
      creator: selectedCreator,
      status: selectedStatus,
      platforms: values, // Usar el nuevo valor
      assets: selectedAssets,
      content: htmlContent
    });
  }, [markDirty, htmlContent, documentTitle, selectedClient, selectedCreator, selectedStatus, selectedAssets]);
  
  const handleAssetsChange = useCallback((value: string) => {
    setSelectedAssets(value);
    
    markDirty(htmlContent, {
      title: documentTitle,
      client: selectedClient,
      creator: selectedCreator,
      status: selectedStatus,
      platforms: selectedPlatform,
      assets: value, // Usar el nuevo valor
      content: htmlContent
    });
  }, [markDirty, htmlContent, documentTitle, selectedClient, selectedCreator, selectedStatus, selectedPlatform]);
  
  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value);
    
    markDirty(htmlContent, {
      title: documentTitle,
      client: selectedClient,
      creator: selectedCreator,
      status: value, // Usar el nuevo valor
      platforms: selectedPlatform,
      assets: selectedAssets,
      content: htmlContent
    });
  }, [markDirty, htmlContent, documentTitle, selectedClient, selectedCreator, selectedPlatform, selectedAssets]);
  
  const handleCreatorChange = useCallback((value: string) => {
    setSelectedCreator(value);
    
    markDirty(htmlContent, {
      title: documentTitle,
      client: selectedClient,
      creator: value, // Usar el nuevo valor
      status: selectedStatus,
      platforms: selectedPlatform,
      assets: selectedAssets,
      content: htmlContent
    });
  }, [markDirty, htmlContent, documentTitle, selectedClient, selectedStatus, selectedPlatform, selectedAssets]);
  
  // Manejar reorganización con IA
  const handleReorganizeWithAI = async () => {
    if (!freeTextContent.trim()) {
      setError('El contenido está vacío. Por favor, añade algún texto antes de reorganizar.');
      return;
    }
    
    setIsReorganizing(true);
    setError(null);
    
    try {
      // Guardar primero (forzando el guardado)
      await save(true);
      
      if (!storyboardId) {
        throw new Error('Error al guardar el storyboard');
      }
      
      // Solicitar reorganización
      const response = await fetch('/api/reorganize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: freeTextContent,
          storyboardId: storyboardId
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al reorganizar contenido');
      }
      
      // Establecer contenido reorganizado y abrir modal
      setReorganizedContent(result.aiContent);
      setReorganizationModalOpen(true);
    } catch (err) {
      console.error("Error al reorganizar:", err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsReorganizing(false);
    }
  };
  
  // Generar slides
  const handleGenerateSlides = async (content: AIContent) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Guardar con contenido AI (forzando el guardado)
      await saveStoryboard(true, content);
      
      if (!storyboardId) {
        throw new Error('Error al guardar el storyboard');
      }
      
      // Generar slides
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboardId,
          aiContent: content,
          cliente: selectedClient,
          plataforma: selectedPlatform,
          assets: selectedAssets,
          status: selectedStatus,
          creator: selectedCreator,
          title: documentTitle,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar Slides');
      }
      
      // Guardar resultado y redirigir
      localStorage.setItem('storyboardResult', JSON.stringify({
        ...result,
        storyboardId
      }));
      
      setReorganizationModalOpen(false);
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Manejo de estado de sesión
  if (status === 'loading' || isLoading) {
    return <LoadingState />;
  }
  
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col">
        {/* Topbar con propiedades */}
        <EditorTopbar
          title={documentTitle}
          onTitleChange={handleTitleChange}
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
        
        {/* Alerta de error */}
        {error && (
          <div className="max-w-[900px] mx-auto px-6 mb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Editor de texto */}
        <div className="flex-1">
        <RichEditor
          initialContent={htmlContent || freeTextContent || editorContent || emptyAIContent}
          onChange={handleEditorChange}
          key={`editor-${isInitialized ? (storyboardId || 'new') : 'loading'}`}
        />
        </div>
      </div>
      
      {/* Modal de reorganización */}
      <AIReorganizationModal
        isOpen={isReorganizationModalOpen}
        onClose={() => setReorganizationModalOpen(false)}
        aiContent={reorganizedContent}
        isGenerating={isGenerating}
        onGenerate={handleGenerateSlides}
        onEdit={(json: AIContent) => setReorganizedContent(json)}
      />
      
      {/* Botones flotantes */}
      <FloatingButtons
        onReorganize={handleReorganizeWithAI}
        onSave={async () => {
          // Forzar el guardado independientemente del estado dirty
          await save(true);
        }}
        isReorganizing={isReorganizing}
        charactersCount={freeTextContent.length}
        disabled={{
          reorganize: !freeTextContent.trim() || isGenerating,
          save: isReorganizing || isGenerating
        }}
        autoSaveStatus={autoSaveStatus}
        lastSaved={lastSaved}
        showSaveButton={true} // Permitir guardado manual
      />
      
      {/* Notificación de autoguardado */}
      <AutoSaveNotification 
        status={autoSaveStatus} 
        lastSaved={lastSaved} 
      />
    </div>
  );
}