// src/lib/anthropicService.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateStoryboardContent(prompt: string): Promise<any> {
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
    } catch (e) {
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
        // ... resto de campos con valores predeterminados
      };
    }
  } catch (error) {
    console.error('Error al generar contenido con Anthropic:', error);
    throw error;
  }
}