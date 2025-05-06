//Users/bautistaroberts/winclap-storyboard-generator/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir automáticamente si ya hay sesión
  useEffect(() => {
    if (session) {
      router.push('/editor');
    }
  }, [session, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Mostrar login si no hay sesión
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-[350px] border-gray-200 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🪄</span>
            </div>
            <CardTitle className="text-2xl font-semibold text-center">Winclap Storyboard</CardTitle>
            <CardDescription className="text-center text-gray-500">
              Plataforma de generación de storyboards
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-gray-500">Acceso</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-gray-200 bg-white text-black hover:bg-gray-50 flex items-center justify-center gap-2"
              onClick={async () => {
                setIsLoading(true);
                await signIn('google', { callbackUrl: '/editor' });
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continuar con Google
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex-col space-y-2 text-center text-xs text-gray-500">
            <p>Herramienta interna para Content Partner Analysts</p>
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Winclap Storyboard Generator</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Evitar parpadeos: mientras redirige, mantener pantalla limpia
  return null;
}
