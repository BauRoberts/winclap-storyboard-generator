// src/services/creatorService.ts

import { supabase } from '@/lib/supabase';

// Interfaz para el creador
export interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_representative?: string;
  email_agency?: string;
  email_brkaway?: string;
  email_billing?: string;
  additional_email?: string;
  agency_name?: string;
  country?: string;
  business_type?: string;
  status?: string;
  platform?: string;
  category?: string;
  onboarding_mail_sent?: boolean;
  onboarding_mail_time?: string;
  tipalti_status?: string;
  tipalti_login?: boolean;
  contract_type?: string;
  contract_signed?: boolean;
  portfolio_url?: string;
  whatsapp_link?: string;
  responsible?: string;
  content_count?: number;
  created_at?: string;
  [key: string]: string | number | boolean | undefined; // Añadir esta línea
}

// Interfaz para actividades
export interface CreatorActivity {
  id: string;
  creator_id: string;
  storyboard_id?: string;
  storyboard_title?: string;
  activity_type: string;
  description: string;
  status?: string;
  created_at: string;
}

// Interfaz para storyboards
export interface Storyboard {
  id: string;
  title: string;
  client_id?: string;
  client_name?: string;
  status: string;
  slides_url?: string;
  created_at: string;
}

// Obtener todos los creadores
export const getCreators = async (): Promise<Creator[]> => {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching creators:', error);
    throw error;
  }
  
  return data || [];
};

// Obtener un creador por ID
export const getCreatorById = async (id: string): Promise<Creator> => {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching creator:', error);
    throw error;
  }
  
  return data;
};

// Crear un nuevo creador
export const createCreator = async (creator: Partial<Creator>): Promise<Creator> => {
  const { data, error } = await supabase
    .from('creators')
    .insert(creator)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating creator:', error);
    throw error;
  }
  
  // Registrar actividad
  await logCreatorActivity({
    creator_id: data.id,
    activity_type: 'created',
    description: 'Creador registrado',
    status: creator.status
  });
  
  return data;
};

// Actualizar un creador existente
export const updateCreator = async (id: string, creator: Partial<Creator>): Promise<Creator> => {
  const { data, error } = await supabase
    .from('creators')
    .update(creator)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating creator:', error);
    throw error;
  }
  
  // Registrar actividad
  await logCreatorActivity({
    creator_id: id,
    activity_type: 'updated',
    description: 'Información del creador actualizada',
    status: creator.status
  });
  
  return data;
};

// Eliminar un creador
export const deleteCreator = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('creators')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting creator:', error);
    throw error;
  }
};

// Obtener actividades de un creador
export const getCreatorActivities = async (creatorId: string): Promise<CreatorActivity[]> => {
  const { data, error } = await supabase
    .from('creator_activities')
    .select(`
      *,
      storyboards (
        id,
        title
      )
    `)
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching creator activities:', error);
    throw error;
  }
  
  // Transformar datos para incluir el título del storyboard
  return (data || []).map(activity => ({
    ...activity,
    storyboard_title: activity.storyboards?.title,
  }));
};

// Obtener storyboards de un creador
export const getCreatorStoryboards = async (creatorId: string): Promise<Storyboard[]> => {
  const { data, error } = await supabase
    .from('storyboards')
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching creator storyboards:', error);
    throw error;
  }
  
  // Transformar datos para incluir el nombre del cliente
  return (data || []).map(storyboard => ({
    ...storyboard,
    client_name: storyboard.clients?.name,
  }));
};

// Registrar una actividad del creador
export const logCreatorActivity = async (activity: {
  creator_id: string;
  storyboard_id?: string;
  activity_type: string;
  description: string;
  status?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('creator_activities')
    .insert(activity);
  
  if (error) {
    console.error('Error logging creator activity:', error);
    // No lanzar error para evitar interrumpir el flujo principal
  }
};

// Importar creadores desde CSV
export const importCreatorsFromCSV = async (csvData: any[]): Promise<{ success: number; errors: number }> => {
  let successCount = 0;
  let errorCount = 0;
  
  // Procesar en lotes para optimizar
  const batchSize = 50;
  const batches = [];
  
  for (let i = 0; i < csvData.length; i += batchSize) {
    batches.push(csvData.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const { data, error } = await supabase
      .from('creators')
      .upsert(
        batch.map(row => ({
          first_name: row['First Name'],
          last_name: row['Last Name'],
          email: row['Email Creator'],
          email_representative: row['Email Representante'],
          email_agency: row['Email Agencia'],
          email_brkaway: row['Email Brkaway'],
          email_billing: row['Email Facturacion/Tipalti'],
          agency_name: row['Nombre Agencia'],
          country: row['Country'],
          business_type: row['Type of business'],
          status: row['Status'],
          onboarding_mail_sent: row['Mail OB Enviado?'] === true,
          onboarding_mail_time: row['Hora de envio Mail OB'],
          tipalti_status: row['Alta en Tipalti'],
          tipalti_login: row['Se Logueo en Tipalti'] === 'Sí',
          contract_type: row['Tipo de Contrato'],
          contract_signed: row['Firmó contrato?'] === 'Sí',
          portfolio_url: row['Portfolio Brkaway'],
          whatsapp_link: row['WPP Link'],
          responsible: row['Responsable'],
          additional_email: row['Otro Mail']
        })),
        { onConflict: 'email' }
      ) as { data: object[] | null; error: any };
    
    if (error) {
      console.error('Error importing creators batch:', error);
      errorCount += batch.length;
    } else {
      successCount += (data ? data.length : 0);
    }
  }
  
  return { success: successCount, errors: errorCount };
};