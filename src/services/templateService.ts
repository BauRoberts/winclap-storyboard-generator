import { supabase } from '@/lib/supabase';

export interface Template {
  id?: string;
  name: string;
  content: any;
  is_default?: boolean;
  created_by?: string;
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getDefaultTemplate() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_default', true)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getTemplate(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createTemplate(template: Template) {
  // Si este template será el default, primero resetear todos
  if (template.is_default) {
    await supabase
      .from('templates')
      .update({ is_default: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // ID inválido para que aplique a todos
  }
  
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateTemplate(id: string, template: Template) {
  // Si este template será el default, primero resetear todos
  if (template.is_default) {
    await supabase
      .from('templates')
      .update({ is_default: false })
      .neq('id', id);
  }
  
  const { data, error } = await supabase
    .from('templates')
    .update(template)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function setDefaultTemplate(id: string) {
  // Resetear todos los templates
  await supabase
    .from('templates')
    .update({ is_default: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Establecer el nuevo default
  const { data, error } = await supabase
    .from('templates')
    .update({ is_default: true })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}