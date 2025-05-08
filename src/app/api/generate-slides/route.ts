import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import { generateStoryboard } from '@/lib/googleApi';
import { updateStoryboardSlides } from '@/services/storyboardService';

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

// Función para extraer cliente del contenido
function extractClientFromContent(content: AIContent): string {
  // Buscar en diferentes campos si el cliente está escrito
  const searchableContent = [
    content.objective,
    content.description,
    content.hook,
    content.scene1Script,
  ].join(' ');

  // Patrones para encontrar el cliente
  const patterns = [
    /cliente[:\s]+([^\n.]+)/i,
    /marca[:\s]+([^\n.]+)/i,
    /empresa[:\s]+([^\n.]+)/i,
  ];

  for (const pattern of patterns) {
    const match = searchableContent.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Cliente'; // Valor por defecto
}

// Función para validar campos requeridos
function validateRequiredFields(content: AIContent): string[] {
  const requiredFields = {
    objective: 'Objetivo',
    hook: 'Hook',
    description: 'Descripción',
    cta: 'CTA',
    scene1Script: 'Script de Escena 1',
    scene2Script: 'Script de Escena 2',
    scene3Script: 'Script de Escena 3',
    scene4Script: 'Script de Escena 4',
  };

  const missingFields: string[] = [];

  Object.entries(requiredFields).forEach(([key, label]) => {
    if (!content[key] || content[key].trim() === '') {
      missingFields.push(label);
    }
  });

  return missingFields;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { aiContent, storyboardId, cliente, title } = await request.json();

    // Validar campos requeridos
    const missingFields = validateRequiredFields(aiContent);
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Extraer cliente del contenido o usar el proporcionado
    const clienteNombre = cliente || extractClientFromContent(aiContent);
    aiContent.cliente = clienteNombre;

    // Generar storyboard en Google Slides
    const result = await generateStoryboard(session.accessToken, aiContent);
    
    // Si hay un storyboardId, actualizar el registro con la URL y el ID de la presentación
    if (storyboardId) {
      await updateStoryboardSlides(storyboardId, result.url, result.id);
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      presentationId: result.id,
      aiContent,
      storyboardId,
      title
    });
  } catch (error) {
    console.error('Error al generar Slides:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}