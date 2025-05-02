// /src/app/api/generate-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateStoryboardContent } from '@/lib/anthropicService';

// Línea 5: Agregar una interfaz para briefData
interface BriefData {
  cliente: string;
  objetivo: string;
  target: string;
  mensaje: string;
  plataforma: string;
  mom: string;
  creador: string;
  referencias?: string;
}

// Reemplazar: function createPrompt(briefData: any): string
// Con:
function createPrompt(briefData: BriefData): string {
  return `
Necesito que actúes como un experto en marketing digital especializado en la creación de contenido para TikTok.

Aquí está el brief de un cliente para el que debemos generar un storyboard completo:

CLIENTE: ${briefData.cliente}
OBJETIVO: ${briefData.objetivo}
TARGET: ${briefData.target}
MENSAJE CLAVE: ${briefData.mensaje}

Por favor, genera un storyboard completo y estructurado para un video de TikTok, considerando las mejores prácticas de la plataforma: videos cortos, dinámicos, con gancho inicial fuerte y call to action claro.

Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura exacta, sin texto introductorio ni explicaciones adicionales:

{
  "objective": "objetivo refinado de la campaña",
  "tone": "tono de comunicación adecuado para TikTok y el target",
  "valueProp1": "primera propuesta de valor concisa y persuasiva",
  "valueProp2": "segunda propuesta de valor complementaria",
  "dos": "3-4 mejores prácticas a seguir en la producción",
  "donts": "3-4 prácticas a evitar en la producción",
  "locations": "locaciones sugeridas específicas para el video",
  "lighting": "tipo de iluminación recomendada (natural, estudio, etc.)",
  "mainElements": "elementos visuales clave que deben aparecer",
  "look": "estilo visual y estético recomendado",
  "ideaName": "nombre creativo y memorable para la idea",
  "hook": "frase o acción de gancho inicial (5-10 palabras)",
  "description": "descripción general del concepto (30-50 palabras)",
  "cta": "llamado a la acción específico y directo (5-10 palabras)",
  "scene1Script": "guión textual para la primera escena/hook (15-25 palabras)",
  "scene1Sound": "música o efectos de sonido específicos para primera escena",
  "scene1Visual": "descripción visual detallada de la primera escena",
  "scene1Framing": "tipo de encuadre para la primera escena (ej: primer plano, plano general)",
  "scene1Angle": "ángulo de cámara para la primera escena",
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

Asegúrate de que todo el contenido sea creativo, específico para la marca y target indicados, y optimizado para TikTok.
  `;
}

export async function POST(request: NextRequest) {
  try {
    const briefData = await request.json();
    const prompt = createPrompt(briefData);
    const aiContent = await generateStoryboardContent(prompt);

    return NextResponse.json({ success: true, aiContent });
  } catch (error) {
    console.error('Error al generar contenido IA:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
