'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle } from 'lucide-react';
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
import { createAIContentFromText } from '@/lib/utils';

// Tipo para la función de debounce
type DebouncedFunction = {
  (...args: any[]): void;
  cancel: () => void;
};

// Función mejorada de debounce para evitar importar lodash
function debounce(func: (...args: any[]) => any, wait: number): DebouncedFunction {
  let timeout: NodeJS.Timeout | null = null;
  
  const debouncedFunction = function(this: any, ...args: any[]) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
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
  const [editorContent, setEditorContent] = useState<AIContent | null>(null);
  const [freeTextContent, setFreeTextContent] = useState<string>('');
  
  // Estados para el modal de reorganización
  const [isReorganizationModalOpen, setReorganizationModalOpen] = useState(false);
  const [reorganizedContent, setReorganizedContent] = useState<AIContent | null>(null);
  
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
  
  // Nuevas referencias para optimización
  const prevContentRef = useRef<string>('');
  const prevEditorContentRef = useRef<AIContent | null>(null);
  const saveInProgressRef = useRef<boolean>(false);

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

  // Guardar o actualizar el storyboard (guardado manual)
  const saveStoryboard = async (includeAIContent = false, customAIContent?: AIContent) => {
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
    console.log(`Tipo de guardado: ${isManuallySaving ? 'manual' : 'automático'}`);
    
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
      
      // Verificar si algún campo del contenido AI tiene datos
      let aiContentToSave: AIContent | undefined = undefined;
      
      if (includeAIContent) {
        // Usar el contenido personalizado si se proporciona, de lo contrario usar editorContent
        aiContentToSave = customAIContent || (editorContent || undefined);
        
        if (aiContentToSave !== null && aiContentToSave !== undefined) {
          const hasContent = Object.values(aiContentToSave).some(
            val => val && typeof val === 'string' && val.trim() !== ''
          );
          
          if (!hasContent) {
            console.log("Contenido AI está vacío, no se incluirá");
            aiContentToSave = undefined;
          }
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
          const newStoryboard = await createStoryboard(storyboardData, aiContentToSave);
          console.log("Storyboard creado exitosamente:", newStoryboard);
          savedStoryboardId = newStoryboard.id;
          setStoryboardId(savedStoryboardId);
          
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

  // Función de autoguardado silencioso mejorada
  const debouncedAutoSave = useCallback(
    debounce(async () => {
      // Evitar guardados redundantes o cuando hay una operación en curso
      if (!pendingChangesRef.current || !userId || saveInProgressRef.current) {
        console.log("Autoguardado cancelado: no hay cambios pendientes, sin usuario o guardado en progreso");
        return;
      }
      
      const currentVersion = contentVersionRef.current;
      console.log(`Iniciando autoguardado silencioso (versión ${currentVersion})...`);
      
      // Marcar que hay un guardado en progreso
      saveInProgressRef.current = true;
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
          
          // Ocultar el indicador de "guardado" después de un tiempo
          setTimeout(() => {
            if (autoSaveStatus === 'saved') {
              setAutoSaveStatus('idle');
            }
          }, 3000);
        } else {
          console.log(`Ignorando resultado de autoguardado antiguo (versión ${currentVersion}, actual ${contentVersionRef.current})`);
        }
      } catch (error) {
        console.error("Error en autoguardado:", error);
        setAutoSaveStatus('error');
      } finally {
        saveInProgressRef.current = false;
        setIsAutoSaving(false);
      }
    }, 2000), // Reducir a 2 segundos para mejor experiencia
    [userId, saveStoryboard, autoSaveStatus]
  );

  // Función mejorada para marcar cambios pendientes
  const markPendingChanges = useCallback(() => {
    // Verificar si hay cambios reales comparando con la versión anterior
    const contentChanged = prevContentRef.current !== freeTextContent;
    const editorContentChanged = JSON.stringify(prevEditorContentRef.current) !== JSON.stringify(editorContent);
    
    if (contentChanged || editorContentChanged) {
      console.log("Cambios reales detectados, marcando como pendientes...");
      pendingChangesRef.current = true;
      contentVersionRef.current += 1;
      
      // Actualizar las referencias con el nuevo contenido
      prevContentRef.current = freeTextContent;
      prevEditorContentRef.current = editorContent ? { ...editorContent } : null;
      
      if (autoSaveStatus === 'saved') {
        setAutoSaveStatus('idle');
      }
      
      // Programar autoguardado mediante debounce
      debouncedAutoSave();
    } else {
      console.log("No se detectaron cambios reales, ignorando");
    }
  }, [freeTextContent, editorContent, debouncedAutoSave, autoSaveStatus]);

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
    const isNewStoryboard = !storyboardId; // Define isNewStoryboard based on storyboardId

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
            prevContentRef.current = storyboard.original_content;
            
            // Intentar parsear como JSON por si es un objeto AIContent
            try {
              const parsedContent = JSON.parse(storyboard.original_content);
              if (parsedContent && typeof parsedContent === 'object') {
                setEditorContent(parsedContent as AIContent);
                prevEditorContentRef.current = { ...parsedContent as AIContent };
              }
            } catch {
              // Si no se puede parsear, es solo texto plano
              console.log("El contenido original no es JSON");
            }
          }
          
          // Establecer el contenido AI si existe
          if (storyboard.ai_content) {
            setReorganizedContent(storyboard.ai_content as AIContent);
            
            // Si no hay contenido válido, usar el AI como contenido actual
            if (!editorContent || Object.keys(editorContent).filter(k => !!editorContent[k]).length === 0) {
              setEditorContent(storyboard.ai_content as AIContent);
              prevEditorContentRef.current = { ...storyboard.ai_content as AIContent };
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
    
    // Solo cargar si hay un ID de storyboard y NO es un nuevo storyboard
    if (storyboardId && !isNewStoryboard) {
      loadExistingStoryboard();
    }
  }, [storyboardId, editorContent]);

  // Inicializar las referencias cuando se carga el componente
  useEffect(() => {
    // Inicializar las referencias cuando se carga el componente
    if (freeTextContent && !prevContentRef.current) {
      prevContentRef.current = freeTextContent;
    }
    
    if (editorContent && !prevEditorContentRef.current) {
      prevEditorContentRef.current = { ...editorContent };
    }
  }, [freeTextContent, editorContent]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  useEffect(() => {
    // Recuperar contenido del localStorage si existe y no hay storyboardId
    if (typeof window !== 'undefined' && !storyboardId && !freeTextContent) {
      const savedContent = localStorage.getItem('draft_content');
      if (savedContent) {
        console.log("Recuperando borrador guardado localmente");
        setFreeTextContent(savedContent);
        prevContentRef.current = savedContent;
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

  // Nuevo flujo: Reorganizar con IA => Modal
  const handleReorganizeWithAI = async () => {
    setIsReorganizing(true);
    setError(null);
    
    try {
      // Guardar el storyboard antes de reorganizar
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
      console.log("Resultado:", result.success ? "Éxito" : "Error");
      
      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Error desconocido al reorganizar contenido';
        console.error("Error en la respuesta:", errorMsg);
        throw new Error(errorMsg);
      }
  
      // Establecer el contenido reorganizado y abrir el modal
      setReorganizedContent(result.aiContent);
      setReorganizationModalOpen(true);
      
    } catch (err) {
      console.error("Error detallado reorganizando:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsReorganizing(false);
    }
  };
  
  // Generar slides desde el modal con fetch
  const handleGenerateSlides = async (content: AIContent) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Guardar el storyboard con el contenido final
      const savedStoryboardId = await saveStoryboard(true, content);
      
      if (!savedStoryboardId) {
        throw new Error('Error al guardar el storyboard');
      }
      
      // Generar slides con el contenido elegido
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboardId: savedStoryboardId,
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
      if (!response.ok || !result.success) throw new Error(result.error || 'Error al generar Slides');
  
      localStorage.setItem('storyboardResult', JSON.stringify({
        ...result,
        storyboardId: savedStoryboardId
      }));
      
      // Cerrar el modal y redireccionar
      setReorganizationModalOpen(false);
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsGenerating(false);
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
          <RichEditor
            initialContent={freeTextContent || (editorContent || emptyAIContent)}
            onChange={(json, text) => {
              if (isUpdating) return;
              
              console.log("Cambio en editor simple");
              setIsUpdating(true);
              setEditorContent(json);
              setFreeTextContent(text);
              
              setTimeout(() => {
                setIsUpdating(false);
                // Llamar a markPendingChanges directamente
                markPendingChanges();
              }, 100);
            }}
            key={`editor-${storyboardId || 'new'}`}
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
        onEdit={(json, text) => {
          // Actualizar el contenido reorganizado cuando se edita
          setReorganizedContent(json);
        }}
      />

      <div className="relative">
        <FloatingButtons
          onReorganize={async () => {
            await handleReorganizeWithAI();
          }}
          onSave={async () => {
            await saveStoryboard(true);
            setAutoSaveStatus('saved');
            setLastSaved(new Date());
          }}
          isReorganizing={isReorganizing}
          isSaving={isSaving}
          charactersCount={freeTextContent.length}
          disabled={{
            reorganize: !freeTextContent.trim() || isGenerating || isSaving,
            save: isReorganizing || isGenerating
          }}
          autoSaveStatus={autoSaveStatus}
          lastSaved={lastSaved}
          // No mostrar el botón de guardar ya que implementamos autoguardado optimizado
          showSaveButton={false}
        />
        
        {/* Componente de notificación de autoguardado mejorado */}
        <AutoSaveNotification 
          status={autoSaveStatus} 
          lastSaved={lastSaved} 
        />
      </div>                        
    </div>
  );
}