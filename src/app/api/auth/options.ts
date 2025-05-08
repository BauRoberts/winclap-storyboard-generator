// src/app/api/auth/options.ts (mejorado)
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseServer as supabase } from '@/lib/supabaseServer'; // ✅ backend-safe

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account}) {
      // Guardar tokens de Google en el token JWT
      if (account) {
        console.log('Account info recibida:', { 
          provider: account.provider,
          type: account.type,
          scopes: account.scope
        });
        
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
        
        // Sincronizar usuario con Supabase
        if (token.email) {
          try {
            console.log('Sincronizando usuario con Supabase:', token.email);
            
            // Verificar si el usuario ya existe
            const { data: existingUser, error: queryError } = await supabase
              .from('users')
              .select('id, email, name, avatar_url')
              .eq('email', token.email)
              .single();
            
            if (queryError) {
              if (queryError.code === 'PGRST116') {
                console.log('Usuario no encontrado, se procederá a crear uno nuevo');
              } else {
                console.error('Error al buscar usuario:', queryError);
              }
            }
            
            if (!existingUser) {
              // Crear nuevo usuario con valores predeterminados adecuados
              console.log('Creando nuevo usuario en Supabase');
              const newUserData = {
                email: token.email || '',
                name: token.name || '',
                avatar_url: token.picture || ''
              };
              
              console.log('Datos para nuevo usuario:', newUserData);
              
              const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert(newUserData)
                .select();
              
              if (insertError) {
                console.error('Error al crear usuario en Supabase:', insertError);
              } else {
                console.log('Usuario creado exitosamente:', newUser);
                if (newUser && newUser.length > 0) {
                  // Guardar el ID de Supabase en el token
                  token.supabaseId = newUser[0].id;
                  console.log('ID de Supabase guardado en token:', token.supabaseId);
                }
              }
            } else {
              console.log('Usuario existente en Supabase:', existingUser.id);
              // Guardar el ID de Supabase en el token
              token.supabaseId = existingUser.id;
            }
          } catch (error) {
            console.error('Error en sincronización de usuario:', error);
          }
        }
      }

      // Si el token no expiró, retornamos
      if (Date.now() < (token.expiresAt ?? 0)) return token;

      // Refrescar token si expiró
      try {
        console.log('Refrescando token expirado');
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
          }),
        });

        const refreshed = await res.json();
        if (!res.ok) {
          console.error('Error en respuesta de refresh token:', refreshed);
          throw refreshed;
        }

        console.log('Token refrescado exitosamente');
        return {
          ...token,
          accessToken: refreshed.access_token,
          expiresAt: Date.now() + refreshed.expires_in * 1000,
          refreshToken: refreshed.refresh_token ?? token.refreshToken,
        };
      } catch (err) {
        console.error('Error al refrescar token:', err);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    
    async session({ session, token }) {
      // Añadir accessToken a la sesión para API de Google
      session.accessToken = token.accessToken as string;
      
      // Usar el ID almacenado en el token si está disponible (más rápido)
      if (token.supabaseId) {
        session.user.id = token.supabaseId as string;
        console.log('ID de usuario añadido a la sesión desde token:', token.supabaseId);
        return session;
      }
      
      // Añadir el ID de Supabase al usuario en la sesión como backup
      if (session.user?.email) {
        try {
          console.log('Buscando ID de usuario en Supabase para:', session.user.email);
          const { data: user, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();
          
          if (error) {
            console.error('Error al obtener el ID de usuario:', error);
          } else if (user) {
            session.user.id = user.id;
            console.log('ID de usuario añadido a la sesión desde consulta:', user.id);
          } else {
            console.warn('No se encontró usuario en Supabase para:', session.user.email);
          }
        } catch (error) {
          console.error('Error inesperado al obtener usuario de Supabase:', error);
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth-error', // Página personalizada para errores (crear esta página)
  },
  debug: process.env.NODE_ENV === 'development',
};