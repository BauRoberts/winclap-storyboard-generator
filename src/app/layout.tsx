import './globals.css';
import { Open_Sans } from 'next/font/google';
import { NextAuthProvider } from './providers';

// Configuración de Open Sans con carga completa de todos los pesos
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
  display: 'swap', // Mejora la visualización mientras se carga
  preload: true, // Asegura precarga
});

export const metadata = {
  title: 'Winclap Storyboard Generator',
  description: 'Generador de storyboards para Winclap',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={openSans.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans font-light">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}