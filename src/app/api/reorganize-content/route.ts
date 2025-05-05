import { NextRequest, NextResponse } from 'next/server';
import { generateStoryboardContent } from '@/lib/anthropicService';

interface AIContent {
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

function createReorganizePrompt(text: string): string {
  return `
Necesito que actúes como un experto en marketing digital especializado en la creación de contenido para redes sociales.

Aquí está un texto libre que contiene información de un briefing para un video:

"""
${text}
"""

Tu tarea es analizar este texto y extraer información para organizarla en un formato estructurado para un storyboard.

Si el texto no contiene información específica sobre algún campo, usa tu experiencia para inferir valores apropiados basados en el contexto.

Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura exacta, sin texto introductorio ni explicaciones adicionales:

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

Asegúrate de que todo el contenido sea creativo, específico y optimizado para video en redes sociales.
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Texto inválido' 
      }, { status: 400 });
    }

    const prompt = createReorganizePrompt(text);
    const aiContent = await generateStoryboardContent(prompt);

    return NextResponse.json({ success: true, aiContent });
  } catch (error) {
    console.error('Error al reorganizar contenido:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}