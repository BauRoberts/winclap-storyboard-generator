import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import { generateStoryboard } from '@/lib/googleApi';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { aiContent, cliente } = await request.json();
    aiContent.cliente = cliente;

    const result = await generateStoryboard(session.accessToken, aiContent);

    return NextResponse.json({
      success: true,
      url: result.url,
      presentationId: result.id,
      aiContent
    });
  } catch (error: any) {
    console.error('Error al generar Slides:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
