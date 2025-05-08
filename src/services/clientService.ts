// src/services/clientService.ts
import { supabase } from '@/lib/supabase';

export interface Client {
  id?: string;
  name: string;
  industry?: string;
  contact_person?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getClient(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createClient(client: Client) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateClient(id: string, client: Client) {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}