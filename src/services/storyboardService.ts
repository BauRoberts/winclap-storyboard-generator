// src/services/storyboardService.ts
import { supabase } from '@/lib/supabase';
import { AIContent } from '@/types/types';

export interface Storyboard {
  id?: string;
  title: string;
  client_id?: string | null;
  creator_id?: string | null;
  created_by?: string;
  template_id?: string | null;
  status?: string;
  original_content?: string | null;
  platforms?: string[] | null;
  assets?: string | null;
  slides_url?: string | null;
  presentation_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoryboardWithRelations extends Storyboard {
  client?: { name: string };
  creator?: { name: string };
  ai_content?: AIContent;
}

export async function getStoryboards() {
  const { data, error } = await supabase
    .from('storyboards')
    .select(`
      *,
      client:client_id (name),
      creator:creator_id (name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as StoryboardWithRelations[];
}

export async function getStoryboard(id: string) {
  // Obtener el storyboard con sus relaciones
  const { data: storyboard, error: storyboardError } = await supabase
    .from('storyboards')
    .select(`
      *,
      client:client_id (name),
      creator:creator_id (name)
    `)
    .eq('id', id)
    .single();
  
  if (storyboardError) throw storyboardError;
  
  // Obtener el contenido AI relacionado
  const { data: aiContent, error: aiContentError } = await supabase
    .from('storyboard_ai_content')
    .select('*')
    .eq('storyboard_id', id)
    .single();
  
  if (aiContentError && aiContentError.code !== 'PGRST116') {
    // PGRST116 es "No se encontraron registros", lo que está bien si no hay contenido AI
    throw aiContentError;
  }
  
  return {
    ...storyboard,
    ai_content: aiContent || undefined
  } as StoryboardWithRelations;
}

export async function createStoryboard(storyboard: Storyboard, aiContent?: AIContent) {
  console.log("Inicio de createStoryboard:", storyboard);
  
  // Insertar el storyboard
  try {
    const { data, error } = await supabase
      .from('storyboards')
      .insert(storyboard)
      .select();
    
    if (error) {
      console.error("Error al insertar storyboard:", error);
      throw error;
    }
    
    console.log("Storyboard insertado exitosamente:", data);
    
    // Solo intentar guardar el contenido AI si explícitamente se proporciona y no es undefined
    if (aiContent && data[0].id) {
      // Verificar si al menos un campo tiene valor no vacío
      const hasContent = Object.values(aiContent).some(val => 
        val && typeof val === 'string' && val.trim() !== ''
      );
      
      if (hasContent) {
        console.log("Guardando contenido AI con datos:", aiContent);
        const { error: aiContentError } = await supabase
          .from('storyboard_ai_content')
          .insert({
            storyboard_id: data[0].id,
            ...aiContent
          });
        
        if (aiContentError) {
          console.error("Error al insertar contenido AI:", aiContentError);
          throw aiContentError;
        }
      } else {
        console.log("El contenido AI está completamente vacío, omitiendo guardado en la tabla storyboard_ai_content");
      }
    }
    
    return data[0] as Storyboard;
  } catch (error) {
    console.error("Error completo en createStoryboard:", error);
    throw error;
  }
}

export async function updateStoryboard(id: string, storyboard: Partial<Storyboard>, aiContent?: AIContent) {
  // Actualizar el storyboard
  const { data, error } = await supabase
    .from('storyboards')
    .update(storyboard)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  
  // Si hay contenido AI, actualizarlo o crearlo
  if (aiContent) {
    // Verificar si ya existe
    const { data: existingAI, error: checkError } = await supabase
      .from('storyboard_ai_content')
      .select('id')
      .eq('storyboard_id', id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (existingAI) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('storyboard_ai_content')
        .update(aiContent)
        .eq('storyboard_id', id);
      
      if (updateError) throw updateError;
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('storyboard_ai_content')
        .insert({
          storyboard_id: id,
          ...aiContent
        });
      
      if (insertError) throw insertError;
    }
  }
  
  return data[0] as Storyboard;
}

export async function deleteStoryboard(id: string) {
  // El contenido AI se eliminará automáticamente por la restricción ON DELETE CASCADE
  const { error } = await supabase
    .from('storyboards')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

export async function updateStoryboardSlides(id: string, slidesUrl: string, presentationId: string) {
  const { data, error } = await supabase
    .from('storyboards')
    .update({
      slides_url: slidesUrl,
      presentation_id: presentationId
    })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0] as Storyboard;
}