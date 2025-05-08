import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📦 SUPABASE_URL:', supabaseUrl);
console.log('📦 SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '[OK]' : '[MISSING]');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

console.log('✅ Usando Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🚀 Iniciando carga de datos...');

  // Insertar clientes
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .insert([
      { name: 'Coca Cola', industry: 'Bebidas', contact_person: 'Juan Pérez', email: 'juan@cocacola.com' },
      { name: 'Pepsi', industry: 'Bebidas', contact_person: 'María López', email: 'maria@pepsi.com' },
      { name: 'Nike', industry: 'Indumentaria', contact_person: 'Carlos Rodríguez', email: 'carlos@nike.com' },
      { name: 'Adidas', industry: 'Indumentaria', contact_person: 'Laura García', email: 'laura@adidas.com' },
      { name: 'Samsung', industry: 'Tecnología', contact_person: 'Martín Gómez', email: 'martin@samsung.com' }
    ])
    .select();

  if (clientsError) {
    console.error('❌ Error al insertar clientes:', clientsError);
  } else {
    console.log(`✅ Clientes insertados: ${clientsData?.length}`);
  }

  // Insertar creadores
  const { data: creatorsData, error: creatorsError } = await supabase
    .from('creators')
    .insert([
      { name: 'Marcos Galperin', category: 'Tech', platform: 'YouTube', email: 'marcos@creator.com', followers: '1.2M' },
      { name: 'Laura Mendez', category: 'Lifestyle', platform: 'Instagram', email: 'laura@creator.com', followers: '850K' },
      { name: 'Carlos Ramos', category: 'Gaming', platform: 'Twitch', email: 'carlos@creator.com', followers: '2.5M' },
      { name: 'Martina Torres', category: 'Fitness', platform: 'TikTok', email: 'martina@creator.com', followers: '3.1M' },
      { name: 'Diego Alvarez', category: 'Cocina', platform: 'YouTube', email: 'diego@creator.com', followers: '950K' }
    ])
    .select();

  if (creatorsError) {
    console.error('❌ Error al insertar creadores:', creatorsError);
  } else {
    console.log(`✅ Creadores insertados: ${creatorsData?.length}`);
  }

  // Insertar templates
  const { data: templatesData, error: templatesError } = await supabase
    .from('templates')
    .insert([
      {
        name: 'Briefing Estándar',
        content: { sections: ["Cliente y Objetivo", "Target Audience", "Hook Principal", "Desarrollo de Escenas", "CTA"] },
        is_default: true
      },
      {
        name: 'Minimalista',
        content: { sections: ["Hook", "Desarrollo", "CTA"] },
        is_default: false
      },
      {
        name: 'Detallado',
        content: { sections: ["Cliente", "Objetivo", "Target Primario", "Hook", "Escenas", "CTA"] },
        is_default: false
      }
    ])
    .select();

  if (templatesError) {
    console.error('❌ Error al insertar templates:', templatesError);
  } else {
    console.log(`✅ Templates insertados: ${templatesData?.length}`);
  }

  console.log('🎉 Proceso de carga de datos finalizado.');
}

seedDatabase().catch(err => {
  console.error('❌ Error inesperado durante seed:', err);
});
