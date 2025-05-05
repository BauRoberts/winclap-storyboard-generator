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
  hook: string;
  description: string;
  cta: string;
  scene1Script: string;
  scene1Visual: string;
  scene1Sound: string;
  scene2Script: string;
  scene2Visual: string;
  scene2Sound: string;
  scene3Script: string;
  scene3Visual: string;
  scene3Sound: string;
  scene4Script: string;
  scene4Visual: string;
  scene4Sound: string;
  [key: string]: string;
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
      system: "Eres un experto en marketing digital y creación de storyboards para redes sociales. Tu tarea es generar contenido estructurado para un storyboard basado en el brief del usuario. Debes responder ÚNICAMENTE en formato JSON."
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
      // Remover posibles etiquetas de formato
      const cleanedContent = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleanedContent);
    } catch {
      // Si no se puede parsear directamente, intentar extraer el JSON de la respuesta
      const jsonMatch = contentText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        contentText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonContent);
      }
      
      // Si no podemos extraer JSON, lanzar error
      console.error('No se pudo extraer JSON de la respuesta:', contentText);
      throw new Error('No se pudo parsear la respuesta de IA');
    }
  } catch (error) {
    console.error('Error al generar contenido con Anthropic:', error);
    throw error;
  }
}