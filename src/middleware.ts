// src/middleware.ts (versión para pruebas)
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;
  
  // Permitir todas las rutas de autenticación sin restricciones
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Para pruebas: No bloquear ninguna ruta aunque no esté autenticado
  console.log(`Acceso a ruta ${pathname}, autenticado: ${!!token}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};