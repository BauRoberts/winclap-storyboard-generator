'use client';

import { useSupabase } from '@/hooks/useSupabase';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

export function SupabaseTest() {
  const { supabase, session, getCurrentUser } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener usuario actual
      const user = await getCurrentUser();
      setUserData(user);
      
      // Contar clientes para probar la conexión
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      setClientCount(count);
    } catch (err) {
      console.error('Error testing Supabase connection:', err);
      setError('Error al conectar con Supabase. Verifica tu configuración.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [session]);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={fetchData} />;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Conexión Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Estado de Sesión:</h3>
              <p>{session ? 'Autenticado' : 'No autenticado'}</p>
            </div>
            
            {userData && (
              <div>
                <h3 className="font-medium">Usuario en Supabase:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}
            
            {clientCount !== null && (
              <div>
                <h3 className="font-medium">Cantidad de Clientes:</h3>
                <p>{clientCount}</p>
              </div>
            )}
            
            <Button onClick={fetchData}>Actualizar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}