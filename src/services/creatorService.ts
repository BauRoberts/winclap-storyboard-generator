import { supabase } from '@/lib/supabase';

export interface Creator {
  id?: string;
  name: string;
  category?: string;
  platform?: string;
  email?: string;
  followers?: string;
}

export async function getCreators() {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getCreator(id: string) {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCreator(creator: Creator) {
  const { data, error } = await supabase
    .from('creators')
    .insert(creator)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateCreator(id: string, creator: Creator) {
  const { data, error } = await supabase
    .from('creators')
    .update(creator)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteCreator(id: string) {
  const { error } = await supabase
    .from('creators')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}