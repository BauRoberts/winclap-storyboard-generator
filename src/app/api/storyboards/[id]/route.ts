// src/app/api/storyboards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import { updateStoryboard } from '@/services/storyboardService';
import { AIContent } from '@/types/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'ID de storyboard requerido' }, { status: 400 });
    }

    // Obtener datos del cuerpo de la solicitud
    const { storyboard, aiContent } = await request.json();

    // Validar datos requeridos
    if (!storyboard) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Actualizar storyboard
    await updateStoryboard(id, storyboard, aiContent as AIContent);

    return NextResponse.json({ 
      success: true, 
      message: 'Storyboard actualizado exitosamente' 
    });
  } catch (error) {
    console.error(`Error en API PUT /storyboards/${params.id}:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { 
      status: 500 
    });
  }
}