import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useCallback } from 'react';

export function useSupabase() {
  const { data: session } = useSession();
  
  const getCurrentUser = useCallback(async () => {
    if (!session?.user?.email) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return data;
  }, [session]);
  
  return {
    supabase,
    session,
    getCurrentUser,
  };
}