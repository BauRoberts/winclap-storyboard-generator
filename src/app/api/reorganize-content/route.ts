// src/app/api/reorganize-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateStoryboardContent } from '@/lib/anthropicService';
import { updateStoryboard } from '@/services/storyboardService';


function createReorganizePrompt(text: string): string {
  return `
Necesito que actúes como un experto en marketing digital especializado en la creación de contenido para redes sociales.

Aquí está un texto libre que contiene información de un briefing para un video:

"""
${text}
"""

Tu tarea es analizar este texto y extraer información para organizarla en un formato estructurado para un storyboard.

Si el texto no contiene información específica sobre algún campo, usa tu experiencia para inferir valores apropiados basados en el contexto.

Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura exacta:

{
  "objective": "objetivo refinado de la campaña",
  "tone": "tono de comunicación adecuado para la plataforma",
  "valueProp1": "primera propuesta de valor concisa y persuasiva",
  "valueProp2": "segunda propuesta de valor complementaria",
  "hook": "frase o acción de gancho inicial (5-10 palabras)",
  "description": "descripción general del concepto (30-50 palabras)",
  "cta": "llamado a la acción específico y directo (5-10 palabras)",
  "scene1Script": "guión textual para la primera escena/hook (15-25 palabras)",
  "scene1Sound": "música o efectos de sonido específicos para primera escena",
  "scene1Visual": "descripción visual detallada de la primera escena",
  "scene2Script": "guión textual para la segunda escena (15-25 palabras)",
  "scene2Sound": "música o efectos de sonido para segunda escena",
  "scene2Visual": "descripción visual detallada de la segunda escena",
  "scene3Script": "guión textual para la tercera escena (15-25 palabras)",
  "scene3Sound": "música o efectos de sonido para tercera escena",
  "scene3Visual": "descripción visual detallada de la tercera escena",
  "scene4Script": "guión textual para el call to action final (10-20 palabras)",
  "scene4Sound": "música o efectos de sonido para call to action",
  "scene4Visual": "descripción visual detallada del call to action"
}

Tu respuesta DEBE ser un objeto JSON válido sin comentarios adicionales, texto introductorio o texto de cierre.
Solo devuelve el objeto JSON puro, sin rodeos ni explicaciones.
`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Recibida solicitud de reorganización de contenido');
    
    const body = await request.json();
    console.log('Body recibido:', JSON.stringify(body, null, 2).substring(0, 200) + '...');
    
    const { text, storyboardId } = body;
    
    if (!text || typeof text !== 'string') {
      console.error('Error: Texto inválido o vacío');
      return NextResponse.json({ 
        success: false, 
        error: 'Texto inválido o vacío' 
      }, { status: 400 });
    }

    console.log(`Procesando texto de ${text.length} caracteres para storyboard ID: ${storyboardId || 'nuevo'}`);

    // Generar el contenido AI
    try {
      const prompt = createReorganizePrompt(text);
      console.log('Prompt generado, enviando a generateStoryboardContent');
      
      const aiContent = await generateStoryboardContent(prompt);
      console.log('Contenido AI generado exitosamente');
      
      // Si se proporcionó un ID de storyboard, actualizarlo con el contenido AI
      if (storyboardId) {
        console.log(`Actualizando storyboard ${storyboardId} con contenido AI`);
        
        try {
          // Convertir el contenido AI a snake_case antes de enviarlo a la base de datos
          
          console.log('Contenido AI convertido a snake_case para la base de datos');
          
          await updateStoryboard(storyboardId, {}, aiContent);
          console.log('Storyboard actualizado exitosamente con el contenido AI');
        } catch (updateError) {
          console.error('Error al actualizar el storyboard:', updateError);
          
          // Loguear más detalles para depuración
          if (updateError instanceof Error) {
            console.error('Mensaje de error:', updateError.message);
            console.error('Stack trace:', updateError.stack);
          } else {
            console.error('Error desconocido:', updateError);
          }
          
          // Devolver el contenido pero con una advertencia
          return NextResponse.json({ 
            success: true, 
            aiContent,
            warning: 'Se generó el contenido pero no se pudo guardar en la base de datos',
            error: updateError instanceof Error ? updateError.message : 'Error desconocido'
          });
        }
      }

      return NextResponse.json({ 
        success: true, 
        aiContent 
      });
    } catch (aiError) {
      console.error('Error en la generación de contenido AI:', aiError);
      return NextResponse.json({ 
        success: false, 
        error: aiError instanceof Error ? aiError.message : 'Error en el procesamiento de IA' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error general al reorganizar contenido:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}