// src/lib/googleApi.ts
import { google } from 'googleapis';

// Tipos para TypeScript
interface Replacement {
  [key: string]: string;
}

interface StoryboardData {
  cliente?: string;
  objective?: string;
  tone?: string;
  valueProp1?: string;
  valueProp2?: string;
  dos?: string;
  donts?: string;
  locations?: string;
  lighting?: string;
  mainElements?: string;
  look?: string;
  ideaName?: string;
  hook?: string;
  description?: string;
  cta?: string;
  scene1Number?: string;
  scene1Script?: string;
  scene1Sound?: string;
  scene1Visual?: string;
  scene1Framing?: string;
  scene1Angle?: string;
  scene2Script?: string;
  scene2Sound?: string;
  scene2Visual?: string;
  scene3Script?: string;
  scene3Sound?: string;
  scene3Visual?: string;
  scene4Script?: string;
  scene4Sound?: string;
  scene4Visual?: string;
  [key: string]: any;
}

interface StoryboardResult {
  id: string;
  url: string;
}

// Configurar autenticación con el token de la sesión del usuario
const getAuth = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: accessToken
  });
  return auth;
};

// Duplicar el template
export const duplicateTemplate = async (accessToken: string, templateId: string, newFileName: string): Promise<string> => {
  try {
    const auth = getAuth(accessToken);
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newFileName
      }
    });
    
    return response.data.id as string;
  } catch (error) {
    console.error('Error al duplicar template:', error);
    throw error;
  }
};

// Reemplazar placeholders - VERSIÓN CORREGIDA
export const replacePlaceholders = async (accessToken: string, presentationId: string, replacements: Replacement): Promise<string> => {
  try {
    const auth = getAuth(accessToken);
    const slides = google.slides({ version: 'v1', auth });
    
    // Preparar las solicitudes de reemplazo de texto
    const requests = Object.entries(replacements).map(([placeholder, replacement]) => {
      // Registramos cada sustitución para debugging
      console.log(`Reemplazando: "${placeholder}" con "${replacement.substring(0, 30)}${replacement.length > 30 ? '...' : ''}"`);
      
      return {
        replaceAllText: {
          containsText: {
            text: placeholder,
            matchCase: true
          },
          replaceText: replacement || ''  // Aseguramos que nunca sea undefined
        }
      };
    });
    
    // Log para ver la estructura completa (sin detalles)
    console.log(`Solicitudes totales: ${requests.length}`);
    
    // Ejecutar los reemplazos
    if (requests.length > 0) {
      try {
        const response = await slides.presentations.batchUpdate({
          presentationId,
          requestBody: {
            requests: requests  // Aseguramos que la propiedad se llama "requests"
          }
        });
        console.log('Reemplazo exitoso:', response.status);
      } catch (updateError: any) {
        console.error('Error específico en batchUpdate:', updateError.message);
        
        // Si hay error con múltiples solicitudes, intentar por lotes más pequeños
        if (requests.length > 10) {
          console.log('Intentando por lotes más pequeños...');
          const batchSize = 5;
          
          for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            try {
              await slides.presentations.batchUpdate({
                presentationId,
                requestBody: {
                  requests: batch
                }
              });
              console.log(`Lote ${i/batchSize + 1} procesado correctamente.`);
            } catch (batchError) {
              console.error(`Error en lote ${i/batchSize + 1}:`, batchError);
            }
          }
        } else {
          throw updateError;
        }
      }
    }
    
    return presentationId;
  } catch (error) {
    console.error('Error al reemplazar placeholders:', error);
    throw error;
  }
};

// Obtener la URL del documento
export const getPresentationUrl = (presentationId: string): string => {
  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
};

// Función principal que orquesta todo el proceso
export const generateStoryboard = async (accessToken: string, data: StoryboardData): Promise<StoryboardResult> => {
  try {
    // Generar nombre para el nuevo storyboard
    const newFileName = `STB-${data.cliente || 'Test'}-${new Date().toISOString().split('T')[0]}`;
    
    // Duplicar el template
    const templateId = process.env.TEMPLATE_ID || '1sg_LM3RO0APKJh8esqZRyKq1fOKAu0Uwt-8XmrtqRtE';
    const newPresentationId = await duplicateTemplate(accessToken, templateId, newFileName);
    
    // Preparar los reemplazos completos
    const replacements: Replacement = {
      // Información General
      '{{OBJECTIVE}}': data.objective || 'Aumentar engagement y descarga de la app',
      '{{TONE}}': data.tone || 'Cercano y juvenil',
      '{{VALUE_PROP_1}}': data.valueProp1 || 'Facilidad de uso y experiencia fluida',
      '{{VALUE_PROP_2}}': data.valueProp2 || 'Disponibilidad inmediata en cualquier dispositivo',
      '{{DOS}}': data.dos || 'Mostrar claramente la funcionalidad del producto',
      '{{DONTS}}': data.donts || 'Evitar lenguaje técnico complejo',
      
      // Moodboard
      '{{LOCATIONS}}': data.locations || 'Espacios iluminados, modernos y minimalistas',
      '{{LIGHTING}}': data.lighting || 'Natural, brillante, con buen contraste',
      '{{MAIN_ELEMENTS}}': data.mainElements || 'Smartphone, interfaz de la app, expresiones de satisfacción',
      '{{LOOK}}': data.look || 'Casual, actual, colores vibrantes',
      
      // Ideas y detalles de campaña
      '{{IDEA_NAME}}': data.ideaName || 'Simplifica tu vida',
      '{{HOOK}}': data.hook || '¿Cansado de complicarte la vida?',
      '{{DESCRIPTION}}': data.description || 'Muestra cómo nuestra app facilita tareas cotidianas',
      '{{CTA}}': data.cta || 'Descargá la app ahora',
      
      // Escena 1 (Hook)
      '{{SCENE_1_NUMBER}}': data.scene1Number || 'Escena 1',
      '{{SCENE_1_SCRIPT}}': data.scene1Script || 'La vida puede ser complicada...',
      '{{SCENE_1_SOUND}}': data.scene1Sound || 'Música intrigante, crescendo',
      '{{SCENE_1_VISUAL}}': data.scene1Visual || 'Persona frustrada intentando realizar una tarea',
      '{{SCENE_1_FRAMING}}': data.scene1Framing || 'Plano medio',
      '{{SCENE_1_ANGLE}}': data.scene1Angle || 'Eye-level',
      
      // Escena 2 (Desarrollo)
      '{{SCENE_2_SCRIPT}}': data.scene2Script || 'Pero con nuestra app, todo es más fácil',
      '{{SCENE_2_SOUND}}': data.scene2Sound || 'Cambio a música positiva y enérgica',
      '{{SCENE_2_VISUAL}}': data.scene2Visual || 'La misma persona sonriendo mientras usa la app',
      
      // Escena 3 (Desarrollo)
      '{{SCENE_3_SCRIPT}}': data.scene3Script || 'Funcionalidades intuitivas para tu día a día',
      '{{SCENE_3_SOUND}}': data.scene3Sound || 'Continúa la música positiva',
      '{{SCENE_3_VISUAL}}': data.scene3Visual || 'Close-up de la app mostrando funcionalidades',
      
      // Escena 4 (CTA)
      '{{SCENE_4_SCRIPT}}': data.scene4Script || '¡Descargá ahora y simplificá tu vida!',
      '{{SCENE_4_SOUND}}': data.scene4Sound || 'Remate musical con call to action claro',
      '{{SCENE_4_VISUAL}}': data.scene4Visual || 'Smartphone con la app y botón de descarga visible',

      // Nuevos campos del formulario
      '{{CREADOR}}': data.creador || '',
      '{{MOM}}': data.mom || '',
      '{{REFERENCIAS}}': data.referencias || '',
      '{{PLATAFORMA}}': data.plataforma || '',
    };
    
    // Reemplazar los placeholders
    await replacePlaceholders(accessToken, newPresentationId, replacements);
    
    // Obtener la URL del documento generado
    const url = getPresentationUrl(newPresentationId);
    
    return { id: newPresentationId, url };
  } catch (error) {
    console.error('Error al generar storyboard:', error);
    throw error;
  }
};