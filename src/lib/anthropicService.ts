import Anthropic from '@anthropic-ai/sdk';

// Configuración con validación de API key
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY no está configurada en las variables de entorno');
}

export const anthropicClient = new Anthropic({
  apiKey: apiKey || 'dummy-key' // Evita error en tiempo de compilación si la key no existe
});

// Definir la interfaz para el contenido generado
export interface StoryboardContent {
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
    // Verificar que tenemos una API key válida
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY no está configurada');
    }

    console.log('Enviando prompt a Anthropic:', prompt.substring(0, 100) + '...');
    
    const message = await anthropicClient.messages.create({
      model: "claude-3-sonnet-20240229", // Cambiado a Sonnet por ser más equilibrado
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

    console.log('Respuesta recibida de Anthropic');
    
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

    console.log('Contenido de texto extraído:', contentText.substring(0, 100) + '...');

    // Intentar extraer el JSON con mejor manejo de errores
    try {
      // Limpiar el texto para mejorar las posibilidades de parseo
      let jsonString = contentText;
      
      // Quitar markdown si existe
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Intentar extraer el objeto JSON
      const jsonMatch = jsonString.match(/{[\s\S]*}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      console.log('JSON a parsear:', jsonString.substring(0, 100) + '...');
      
      // Parsear el JSON
      const parsedContent = JSON.parse(jsonString);
      
      // Verificar que es un objeto
      if (typeof parsedContent !== 'object' || parsedContent === null) {
        throw new Error('La respuesta no es un objeto JSON válido');
      }
      
      // Verificar campos requeridos
      const requiredFields = ['objective', 'hook', 'cta'];
      const missingFields = requiredFields.filter(field => 
        !parsedContent[field] || typeof parsedContent[field] !== 'string' || !parsedContent[field].trim()
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos en la respuesta: ${missingFields.join(', ')}`);
      }
      
      return parsedContent as StoryboardContent;
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      console.error('Contenido que causó el error:', contentText);
      throw new Error(`Error al parsear la respuesta de la IA: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error al generar contenido con Anthropic:', error);
    throw error;
  }
}