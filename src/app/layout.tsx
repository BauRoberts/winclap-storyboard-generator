import './globals.css';
import { Open_Sans } from 'next/font/google';
import { NextAuthProvider } from './providers';

// Configurar Open Sans con diferentes pesos de fuente
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans', // Definir una variable CSS para usar en toda la app
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
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${openSans.variable} font-sans font-light`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}