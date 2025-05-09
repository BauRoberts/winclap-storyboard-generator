// src/services/storyboardService.ts
import { supabase } from '@/lib/supabase';
import { AIContent } from '@/types/types';
import { convertObjectKeysToSnakeCase, convertObjectKeysToCamelCase } from '@/lib/utils';

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
  try {
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
    
    // Obtener el contenido AI relacionado con select explícito
    // El error 406 podría estar relacionado con intentar obtener todos los campos con '*'
    const { data: aiContentRaw, error: aiContentError } = await supabase
      .from('storyboard_ai_content')
      .select(`
        id, 
        storyboard_id, 
        objective, 
        tone, 
        value_prop1, 
        value_prop2, 
        hook, 
        description, 
        cta, 
        scene1_script, 
        scene1_visual, 
        scene1_sound, 
        scene2_script, 
        scene2_visual, 
        scene2_sound, 
        scene3_script, 
        scene3_visual, 
        scene3_sound, 
        scene4_script, 
        scene4_visual, 
        scene4_sound
      `)
      .eq('storyboard_id', id)
      .maybeSingle();  // Usa maybeSingle en lugar de single para evitar errores si no hay registro
    
    // Solo mostrar errores reales, no si simplemente no encuentra el registro
    if (aiContentError && aiContentError.code !== 'PGRST116') {
      console.error("Error al obtener AI content:", aiContentError);
    }
    
    // Convertir snake_case a camelCase para el frontend
    const aiContent = aiContentRaw ? convertObjectKeysToCamelCase(aiContentRaw) : undefined;
    
    console.log("Storyboard y AI content cargados correctamente");
    
    return {
      ...storyboard,
      ai_content: aiContent
    };
  } catch (error) {
    console.error("Error completo en getStoryboard:", error);
    throw error;
  }
}

export async function createStoryboard(storyboard: Storyboard, aiContent?: AIContent) {
  console.log("🔹 storyboardService.createStoryboard: Iniciando");
  
  // Insertar el storyboard
  try {
    console.log("🔹 storyboardService.createStoryboard: Enviando datos a Supabase");
    const { data, error } = await supabase
      .from('storyboards')
      .insert(storyboard)
      .select();
    
    if (error) {
      console.error("❌ storyboardService.createStoryboard: Error en Supabase", error);
      throw error;
    }
    
    console.log("🔹 storyboardService.createStoryboard: Storyboard creado con ID:", data?.[0]?.id);
    
    // Solo intentar guardar el contenido AI si explícitamente se proporciona y no es undefined
    if (aiContent && data[0].id) {
      // Verificar si al menos un campo tiene valor no vacío
      const hasContent = Object.values(aiContent).some(val => 
        val && typeof val === 'string' && val.trim() !== ''
      );
      
      if (hasContent) {
        console.log("🔹 storyboardService.createStoryboard: Guardando contenido AI");
        // Convertir claves de camelCase a snake_case
        const aiContentSnakeCase = convertObjectKeysToSnakeCase(aiContent);
        
        const { error: aiContentError } = await supabase
          .from('storyboard_ai_content')
          .insert({
            storyboard_id: data[0].id,
            ...aiContentSnakeCase
          });
        
        if (aiContentError) {
          console.error("❌ storyboardService.createStoryboard: Error al guardar AI content", aiContentError);
          throw aiContentError;
        }
        
        console.log("🔹 storyboardService.createStoryboard: Contenido AI guardado");
      } else {
        console.log("🔹 storyboardService.createStoryboard: Contenido AI vacío, omitido");
      }
    }
    
    console.log("🔹 storyboardService.createStoryboard: Proceso completado");
    return data[0] as Storyboard;
  } catch (error) {
    console.error("❌ storyboardService.createStoryboard: Error completo", error);
    throw error;
  }
}

export async function updateStoryboard(id: string, storyboard: Partial<Storyboard>, aiContent?: AIContent) {
  console.log("🔸 storyboardService.updateStoryboard: Iniciando actualización para ID:", id);
  
  // Actualizar el storyboard
  try {
    console.log("🔸 storyboardService.updateStoryboard: Enviando datos a Supabase");
    const { data, error } = await supabase
      .from('storyboards')
      .update(storyboard)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error("❌ storyboardService.updateStoryboard: Error en Supabase", error);
      throw error;
    }
    
    console.log("🔸 storyboardService.updateStoryboard: Storyboard actualizado");
    
    // Si hay contenido AI, actualizarlo o crearlo
    if (aiContent) {
      // Convertir claves de camelCase a snake_case
      const aiContentSnakeCase = convertObjectKeysToSnakeCase(aiContent);
      console.log("🔸 storyboardService.updateStoryboard: Preparando contenido AI");
      
      // Verificar si ya existe
      console.log("🔸 storyboardService.updateStoryboard: Verificando AI content existente");
      const { data: existingAI, error: checkError } = await supabase
        .from('storyboard_ai_content')
        .select('id')
        .eq('storyboard_id', id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("❌ storyboardService.updateStoryboard: Error al verificar AI content", checkError);
        throw checkError;
      }
      
      if (existingAI) {
        // Actualizar
        console.log("🔸 storyboardService.updateStoryboard: Actualizando AI content existente");
        const { error: updateError } = await supabase
          .from('storyboard_ai_content')
          .update(aiContentSnakeCase)
          .eq('storyboard_id', id);
        
        if (updateError) {
          console.error("❌ storyboardService.updateStoryboard: Error al actualizar AI content", updateError);
          throw updateError;
        }
        
        console.log("🔸 storyboardService.updateStoryboard: AI content actualizado");
      } else {
        // Crear
        console.log("🔸 storyboardService.updateStoryboard: Creando nuevo AI content");
        const { error: insertError } = await supabase
          .from('storyboard_ai_content')
          .insert({
            storyboard_id: id,
            ...aiContentSnakeCase
          });
        
        if (insertError) {
          console.error("❌ storyboardService.updateStoryboard: Error al insertar AI content", insertError);
          throw insertError;
        }
        
        console.log("🔸 storyboardService.updateStoryboard: Nuevo AI content creado");
      }
    }
    
    console.log("🔸 storyboardService.updateStoryboard: Proceso completado");
    return data[0] as Storyboard;
  } catch (error) {
    console.error("❌ storyboardService.updateStoryboard: Error completo", error);
    throw error;
  }
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