// src/lib/anthropicService.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Definir la interfaz para el contenido generado
interface StoryboardContent {
  objective: string;
  tone: string;
  valueProp1: string;
  valueProp2: string;
  hook?: string;
  description?: string;
  cta?: string;
  scene1Script?: string;
  scene1Visual?: string;
  scene1Sound?: string;
  scene2Script?: string;
  scene2Visual?: string;
  scene2Sound?: string;
  scene3Script?: string;
  scene3Visual?: string;
  scene3Sound?: string;
  scene4Script?: string;
  scene4Visual?: string;
  scene4Sound?: string;
  [key: string]: string | undefined; // Para campos adicionales
}

export async function generateStoryboardContent(prompt: string): Promise<StoryboardContent> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      system: "Eres un experto en marketing digital y creación de storyboards para TikTok. Tu tarea es generar contenido estructurado para un storyboard basado en el brief del usuario. Debes responder en formato JSON."
    });

    // Convertir la respuesta a string para procesarla
    let contentText = '';
    
    // Extraer el texto de los bloques de contenido
    if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'text') {
          contentText += block.text;
        }
      }
    }

    // Intentar extraer el JSON
    try {
      return JSON.parse(contentText);
    } catch{ // Cambiado de `e` a `_` para ignorar el error
      // Si no se puede parsear directamente, intentar extraer el JSON de la respuesta
      const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || 
                        contentText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // Si no podemos extraer JSON, devolver un objeto predeterminado
      console.error('No se pudo extraer JSON de la respuesta:', contentText);
      return {
        objective: "No se pudo generar el contenido automáticamente",
        tone: "Informativo",
        valueProp1: "Valor por defecto 1",
        valueProp2: "Valor por defecto 2",
        hook: "Gancho predeterminado",
        description: "Descripción predeterminada",
        cta: "Llamado a la acción predeterminado",
        scene1Script: "Guión predeterminado para la escena 1",
        scene1Visual: "Visual predeterminado para la escena 1",
        scene1Sound: "Sonido predeterminado para la escena 1",
        scene2Script: "Guión predeterminado para la escena 2",
        scene2Visual: "Visual predeterminado para la escena 2",
        scene2Sound: "Sonido predeterminado para la escena 2",
        scene3Script: "Guión predeterminado para la escena 3",
        scene3Visual: "Visual predeterminado para la escena 3",
        scene3Sound: "Sonido predeterminado para la escena 3",
        scene4Script: "Guión predeterminado para la escena 4",
        scene4Visual: "Visual predeterminado para la escena 4",
        scene4Sound: "Sonido predeterminado para la escena 4"
      };
    }
  } catch (error) {
    console.error('Error al generar contenido con Anthropic:', error);
    throw error;
  }
}