// src/app/api/storyboards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import { createStoryboard } from '@/services/storyboardService';
import { AIContent } from '@/types/types';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos del cuerpo de la solicitud
    const { storyboard, aiContent } = await request.json();

    // Validar datos requeridos
    if (!storyboard) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Crear storyboard
    const newStoryboard = await createStoryboard(storyboard, aiContent as AIContent);

    return NextResponse.json({ 
      success: true, 
      id: newStoryboard.id,
      message: 'Storyboard creado exitosamente' 
    });
  } catch (error) {
    console.error('Error en API POST /storyboards:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { 
      status: 500 
    });
  }
}