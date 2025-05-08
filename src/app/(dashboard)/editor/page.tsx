// src/app/(dashboard)/editor/page.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import EditorTopbar from '@/components/editor/EditorTopbar';
import FloatingButtons from '@/components/editor/FloatingButtons';
import { AIContent, emptyAIContent } from '@/types/types';
import { createStoryboard, updateStoryboard, getStoryboard } from '@/services/storyboardService';
import { useSupabase } from '@/hooks/useSupabase';
import { LoadingState } from '@/components/LoadingState';

// Tipo para la función de debounce
type DebouncedFunction = {
  (...args: any[]): void;
  cancel: () => void;
};

// Función simple de debounce para evitar importar lodash
function debounce(func: (...args: any[]) => any, wait: number): DebouncedFunction {
  let timeout: NodeJS.Timeout | null = null;
  
  const debouncedFunction = function(this: any, ...args: any[]) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
  
  debouncedFunction.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debouncedFunction;
}

const RichEditor = dynamic(() => import('@/components/editor/editor'), { ssr: false });
const DualEditorView = dynamic(() => import('@/components/editor/DualEditorView'), { ssr: false });

export default function EditorPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyboardIdParam = searchParams.get('id');

  // Estados generales
  const [isLoading, setIsLoading] = useState(false);
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para Supabase y usuario
  const { getCurrentUser } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [storyboardId, setStoryboardId] = useState<string | undefined>(storyboardIdParam || undefined);
  
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
  
  // Estados para autoguardado
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Referencias para autoguardado
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<boolean>(false);
  const contentVersionRef = useRef<number>(0);
  const initialSaveCompleted = useRef<boolean>(false);

  // Monitorear estado de autoguardado para depuración
  useEffect(() => {
    console.log("Editor page mounted, storyboardId:", storyboardId);
    
    // Verificar parámetros de URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      console.log("URL params:", Object.fromEntries(urlParams.entries()));
    }
    
    return () => {
      console.log("Editor page unmounting");
    };
  }, []);

  // Guardar o actualizar el storyboard
  const saveStoryboard = async (includeAIContent = false) => {
    if (!userId) {
      console.error("No hay un usuario autenticado o ID de usuario no disponible");
      setError("No se pudo obtener el ID de usuario. Por favor, recarga la página e intenta nuevamente.");
      return null;
    }
    
    if (!includeAIContent && autoSaveStatus === 'saving') {
      console.log("Guardado manual ignorado, hay un autoguardado en progreso");
      return storyboardId;
    }
    
    const isManuallySaving = !isAutoSaving;
    if (isManuallySaving) setIsSaving(true);
    console.log(`Iniciando ${isManuallySaving ? 'guardado manual' : 'autoguardado'} de storyboard. Usuario ID:`, userId);
    console.log("Contenido antes de guardar:", freeTextContent ? freeTextContent.substring(0, 100) + "..." : "");
    
    try {
      const storyboardData = {
        title: documentTitle,
        client_id: selectedClient || null,
        creator_id: selectedCreator || null,
        status: selectedStatus || 'draft',
        original_content: freeTextContent,
        platforms: selectedPlatform,
        assets: selectedAssets,
        created_by: userId
      };
      
      console.log("Datos a guardar:", JSON.stringify(storyboardData, null, 2));
      console.log("¿Incluir contenido AI?", includeAIContent);
      
      // Verificar si algún campo del contenido AI tiene datos
      let aiContentToSave = undefined;
      
      if (includeAIContent && editorContent) {
        const hasContent = Object.values(editorContent).some(
          val => val && typeof val === 'string' && val.trim() !== ''
        );
        
        if (hasContent) {
          console.log("Contenido AI tiene datos, se incluirá");
          aiContentToSave = editorContent;
        } else {
          console.log("Contenido AI está vacío, no se incluirá");
        }
      }
      
      let savedStoryboardId;
      
      if (storyboardId) {
        // Actualizar
        console.log("Actualizando storyboard existente ID:", storyboardId);
        const updatedStoryboard = await updateStoryboard(storyboardId, storyboardData, aiContentToSave);
        console.log("Storyboard actualizado:", updatedStoryboard);
        savedStoryboardId = storyboardId;
      } else {
        // Crear nuevo
        console.log("Creando nuevo storyboard");
        
        try {
          console.log("Llamando a createStoryboard");
          const newStoryboard = await createStoryboard(storyboardData, aiContentToSave);
          console.log("Storyboard creado exitosamente:", newStoryboard);
          savedStoryboardId = newStoryboard.id;
          setStoryboardId(savedStoryboardId);
          
          // AÑADIR ESTE CÓDIGO AQUÍ:
          // Actualizar la URL sin recargar la página
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('id', savedStoryboardId ?? '');
            window.history.replaceState({}, '', url.toString());
          }
          
          initialSaveCompleted.current = true;
        } catch (createError) {
          console.error("Error detallado al crear storyboard:", createError);
          
          if (createError instanceof Error) {
            console.error("Error message:", createError.message);
            console.error("Error stack:", createError.stack);
            setError(`Error al crear storyboard: ${createError.message}`);
          } else {
            console.error("Tipo de error desconocido:", typeof createError);
            setError('Error desconocido al crear storyboard');
          }
          
          return null;
        }
      }
      
      console.log("Storyboard guardado con ID:", savedStoryboardId);
      console.log("Contenido después de guardar:", freeTextContent ? freeTextContent.substring(0, 100) + "..." : "");
      return savedStoryboardId;
    } catch (err) {
      console.error("Error general en saveStoryboard:", err);
      
      // Mejorar el logging para capturar mejor el tipo de error
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(`Error al guardar: ${err.message}`);
      } else {
        console.error("Unknown error type:", typeof err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        setError('Error desconocido al guardar el storyboard');
      }
      
      return null;
    } finally {
      if (isManuallySaving) setIsSaving(false);
      console.log("Proceso de guardado finalizado");
    }
  };

  // Obtener el ID del usuario actual
  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user) {
        try {
          console.log("Obteniendo usuario actual con sesión:", session.user.email);
          const user = await getCurrentUser();
          console.log("Usuario obtenido de Supabase:", user);
          
          if (user) {
            console.log("ID de usuario establecido:", user.id);
            setUserId(user.id);
          } else {
            console.error("getCurrentUser() devolvió null o undefined");
          }
        } catch (error) {
          console.error("Error al obtener el usuario actual:", error);
        }
      } else {
        console.log("No hay sesión de usuario disponible");
      }
    };
    
    if (status === 'authenticated') {
      fetchUserId();
    }
  }, [session, getCurrentUser, status]);

  // Cargar storyboard existente si hay un ID
  useEffect(() => {
    const loadExistingStoryboard = async () => {
      if (storyboardId) {
        setIsLoading(true);
        try {
          console.log("Cargando storyboard existente ID:", storyboardId);
          const storyboard = await getStoryboard(storyboardId);
          console.log("Storyboard cargado:", storyboard);
          
          // Añadir más logs aquí para ver qué contiene el storyboard
          console.log("Contenido original:", storyboard.original_content ? 
            storyboard.original_content.substring(0, 50) + "..." : "No hay contenido");
          
          // Establecer los valores del formulario
          setDocumentTitle(storyboard.title);
          setSelectedClient(storyboard.client_id || '');
          setSelectedCreator(storyboard.creator_id || '');
          setSelectedPlatform(storyboard.platforms || []);
          setSelectedAssets(storyboard.assets || '');
          setSelectedStatus(storyboard.status || '');
          
          // Establecer el contenido original si existe
          if (storyboard.original_content) {
            setFreeTextContent(storyboard.original_content);
            
            // Intentar parsear como JSON por si es un objeto AIContent
            try {
              const parsedContent = JSON.parse(storyboard.original_content);
              if (parsedContent && typeof parsedContent === 'object') {
                setOriginalContent(parsedContent as AIContent);
                setEditorContent(parsedContent as AIContent);
              }
            } catch {
              // Si no se puede parsear, es solo texto plano
              console.log("El contenido original no es JSON");
            }
          }
          
          // Establecer el contenido AI si existe
          if (storyboard.ai_content) {
            setReorganizedContent(storyboard.ai_content as AIContent);
            
            // Si no hay contenido original válido, usar el AI como contenido actual
            if (!originalContent || Object.keys(originalContent).filter(k => !!originalContent[k]).length === 0) {
              setEditorContent(storyboard.ai_content as AIContent);
              setSelectedContentSource('reorganized');
            }
          }
          
          // Marcar como último guardado
          setLastSaved(new Date());
          setAutoSaveStatus('saved');
          initialSaveCompleted.current = true;
          
        } catch (err) {
          console.error("Error loading storyboard:", err);
          setError(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (storyboardId) {
      loadExistingStoryboard();
    }
  }, [storyboardId]);

  // Función de autoguardado con debounce
  const debouncedAutoSave = useCallback(
    debounce(async () => {
      if (!pendingChangesRef.current || !userId) {
        console.log("Autoguardado cancelado: no hay cambios pendientes o sin usuario");
        return;
      }
      
      // Solo guardar si han pasado al menos 3 segundos desde el último cambio
      const currentVersion = contentVersionRef.current;
      console.log(`Iniciando autoguardado (versión ${currentVersion})...`);
      setIsAutoSaving(true);
      setAutoSaveStatus('saving');
      
      try {
        // Guardamos el storyboard con el contenido actual
        const savedId = await saveStoryboard(true);
        
        // Solo actualizar si esta es aún la versión más reciente
        if (currentVersion === contentVersionRef.current) {
          setLastSaved(new Date());
          setAutoSaveStatus('saved');
          pendingChangesRef.current = false;
          console.log(`Autoguardado completado (versión ${currentVersion})`);
        } else {
          console.log(`Ignorando resultado de autoguardado antiguo (versión ${currentVersion}, actual ${contentVersionRef.current})`);
        }
      } catch (error) {
        console.error("Error en autoguardado:", error);
        setAutoSaveStatus('error');
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000), // Aumentar a 3 segundos para reducir frecuencia
    [saveStoryboard, userId]
  );

  // Función para marcar que hay cambios pendientes
  const markPendingChanges = useCallback(() => {
    pendingChangesRef.current = true;
    contentVersionRef.current += 1;
    
    if (autoSaveStatus === 'saved') {
      setAutoSaveStatus('idle');
    }
    
    // Programar autoguardado
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      debouncedAutoSave();
    }, 3000); // 3 segundos después del último cambio
  }, [debouncedAutoSave]);

  // Añadir efecto para iniciar el autoguardado cuando cambia el contenido del editor
  useEffect(() => {
    // Solo iniciar autoguardado si hay contenido significativo
    if (freeTextContent.trim() && userId && !isAutoSaving) {
      console.log("Detectado cambio de contenido, programando autoguardado");
      markPendingChanges();
    }
  }, [freeTextContent, userId, isAutoSaving, markPendingChanges]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  // Monitorear cambios en los estados clave para depuración
  useEffect(() => {
    console.log("Modo de vista actual:", viewMode);
    console.log("Fuente seleccionada:", selectedContentSource);
  }, [viewMode, selectedContentSource]);

  useEffect(() => {
    // Recuperar contenido del localStorage si existe y no hay storyboardId
    if (typeof window !== 'undefined' && !storyboardId && !freeTextContent) {
      const savedContent = localStorage.getItem('draft_content');
      if (savedContent) {
        console.log("Recuperando borrador guardado localmente");
        setFreeTextContent(savedContent);
      }
    }
  }, [storyboardId, freeTextContent]);
  
  // Guardar contenido en localStorage cuando cambia
  useEffect(() => {
    // Guardar contenido en localStorage
    if (typeof window !== 'undefined' && freeTextContent && freeTextContent.trim() !== '') {
      localStorage.setItem('draft_content', freeTextContent);
      console.log("Guardando borrador localmente");
    }
  }, [freeTextContent]);

  // Handlers de cambio con logging
  const handleClientChange = (value: string) => {
    console.log('EditorPage - Cliente seleccionado:', value);
    setSelectedClient(value);
    markPendingChanges();
  };

  const handleAssetsChange = (value: string) => {
    console.log('EditorPage - Assets seleccionados:', value);
    setSelectedAssets(value);
    markPendingChanges();
  };

  const handlePlatformChange = (values: string[]) => {
    console.log('EditorPage - Plataformas seleccionadas:', values);
    setSelectedPlatform(values);
    markPendingChanges();
  };

  const handleStatusChange = (value: string) => {
    console.log('EditorPage - Estado seleccionado:', value);
    setSelectedStatus(value);
    markPendingChanges();
  };

  const handleCreatorChange = (value: string) => {
    console.log('EditorPage - Creador seleccionado:', value);
    setSelectedCreator(value);
    markPendingChanges();
  };

  const handleTitleChange = (value: string) => {
    setDocumentTitle(value);
    markPendingChanges();
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
    markPendingChanges();
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
    
    setTimeout(() => {
      setIsUpdating(false);
      markPendingChanges();
    }, 100);
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
    
    setTimeout(() => {
      setIsUpdating(false);
      markPendingChanges();
    }, 100);
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
    
    setTimeout(() => {
      setIsUpdating(false);
      markPendingChanges();
    }, 100);
  };

  const handleReorganizeWithAI = async () => {
    setIsReorganizing(true);
    setError(null);
    
    // Deshabilitar autoguardado durante el proceso
    pendingChangesRef.current = false;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  
    try {
      // Guardar el contenido original primero
      setOriginalContent(editorContent || emptyAIContent);
      
      console.log("Iniciando reorganización con IA, contenido:", 
        freeTextContent ? freeTextContent.substring(0, 50) + "..." : "vacío");
      
      // Guardar o actualizar el storyboard solo una vez antes de reorganizar
      const savedStoryboardId = await saveStoryboard();
      console.log("Storyboard guardado con ID:", savedStoryboardId);
      
      if (!savedStoryboardId) {
        throw new Error('Error al guardar el storyboard');
      }
      
      // Continuar con la reorganización
      console.log("Enviando solicitud a /api/reorganize-content");
      const response = await fetch('/api/reorganize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: freeTextContent,
          storyboardId: savedStoryboardId
        }),
      });
  
      console.log("Respuesta recibida, status:", response.status);
      const result = await response.json();
      console.log("Resultado:", result.success ? "Éxito" : "Error", result);
      
      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Error desconocido al reorganizar contenido';
        console.error("Error en la respuesta:", errorMsg);
        throw new Error(errorMsg);
      }
  
      // Establecer el contenido reorganizado
      const aiContent = result.aiContent;
      console.log("Contenido AI recibido:", aiContent ? "OK" : "No hay contenido");
      
      if (!aiContent) {
        throw new Error("No se recibió contenido AI de la API");
      }
      
      setReorganizedContent(aiContent);
      
      // Cambiar a vista dual y seleccionar el contenido reorganizado por defecto
      setViewMode('dual');
      setSelectedContentSource('reorganized');
      
      // También actualizar el contenido del editor actual
      setEditorContent(aiContent);
      
      // Actualizar a guardado manualmente, sin autoguardado
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    } catch (err) {
      console.error("Error detallado reorganizando:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsReorganizing(false);
      
      // Reactivar autoguardado después de 5 segundos para evitar guardados inmediatos
      setTimeout(() => {
        pendingChangesRef.current = true;
        markPendingChanges();
      }, 5000);
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
      // Guardar o actualizar el storyboard primero con el contenido AI
      const savedStoryboardId = await saveStoryboard(true);
      if (!savedStoryboardId) {
        throw new Error('Error al guardar el storyboard');
      }
      
      // Generar slides con el contenido actual
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboardId: savedStoryboardId,
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

      localStorage.setItem('storyboardResult', JSON.stringify({
        ...result,
        storyboardId: savedStoryboardId
      }));
      
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
      // Usar el storyboardId como clave, pero sin el timestamp que causa rerenderizaciones
      const editorKey = `single-editor-${storyboardId || 'new'}`;
      
      return (
        <RichEditor
          initialContent={freeTextContent || (editorContent || emptyAIContent)}
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
            
            setTimeout(() => {
              setIsUpdating(false);
              markPendingChanges();
            }, 100);
          }}
          key={editorKey}
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

      <div className="relative">
        <FloatingButtons
          onReorganize={handleReorganizeWithAI}
          onGenerate={handleGenerateStoryboard}
          onSave={async () => {
            await saveStoryboard(true);
            setAutoSaveStatus('saved');
            setLastSaved(new Date());
          }}
          isReorganizing={isReorganizing}
          isGenerating={isGenerating}
          isSaving={isSaving}
          charactersCount={freeTextContent.length}
          disabled={{
            reorganize: !freeTextContent.trim() || isGenerating || isSaving,
            generate: !editorContent || isReorganizing || isSaving,
            save: isReorganizing || isGenerating
          }}
          viewMode={viewMode}
          autoSaveStatus={autoSaveStatus}
          lastSaved={lastSaved}
        />
        
        {/* Indicador de autoguardado muy visible y separado */}
        {autoSaveStatus !== 'idle' && (
          <div className={`fixed bottom-24 right-6 py-2 px-4 rounded-lg shadow-lg z-[100] text-sm font-medium
            ${autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-700' : 
              autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' : 
              'bg-red-100 text-red-700'}`}>
            <div className="flex items-center space-x-2">
              {autoSaveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
              {autoSaveStatus === 'saved' && <Check className="h-4 w-4" />}
              {autoSaveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
              <span>
                {autoSaveStatus === 'saving' ? 'Guardando...' : 
                 autoSaveStatus === 'saved' ? 'Guardado automático' : 
                 'Error al guardar'}
              </span>
              {lastSaved && autoSaveStatus === 'saved' && (
                <span className="text-gray-500">
                  {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}