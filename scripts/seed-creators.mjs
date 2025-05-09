import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Cargar .env.local si existe

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para parsear fechas en formato "DD/MM/YYYY HH:mm:ss"
function parseDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [day, month, year] = datePart.split('/');
  const isoString = `${year}-${month}-${day}T${timePart}`;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

// Función para determinar plataforma
function determinarPlataforma(url) {
  if (!url) return null;
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return 'YouTube';
  if (lowercaseUrl.includes('instagram.com')) return 'Instagram';
  if (lowercaseUrl.includes('tiktok.com')) return 'TikTok';
  if (lowercaseUrl.includes('twitch.tv')) return 'Twitch';
  return 'Otras';
}

async function seedCreators() {
  try {
    const csvPath = path.resolve(process.cwd(), 'data', 'Creadores.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const offset = parseInt(process.argv[2], 10) || 0;
    const slicedRecords = records.slice(offset);

    console.log(`📊 Encontrados ${records.length} creadores en el CSV`);
    console.log(`🚀 Importando desde el índice ${offset} (${slicedRecords.length} creadores)`);

    const creatorsToInsert = slicedRecords.map(record => ({
      first_name: record['First Name'] || '',
      last_name: record['Last Name'] || '',
      name: `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim(),
      email: record['Email Creator'] || '',
      email_representative: record['Email Representante'] || null,
      email_agency: record['Email Agencia'] || null,
      email_brkaway: record['Email Brkaway'] || null,
      email_billing: record['Email Facturacion/Tipalti'] || null,
      agency_name: record['Nombre Agencia'] || null,
      country: record['Country'] || null,
      business_type: record['Type of business'] || null,
      status: record['Status'] || 'Pendiente',
      onboarding_mail_sent: record['Mail OB Enviado?'] === 'TRUE' || false,
      onboarding_mail_time: parseDateTime(record['Hora de envio Mail OB']),
      tipalti_status: record['Alta en Tipalti'] || null,
      tipalti_login: record['Se Logueo en Tipalti'] === 'Sí' || false,
      contract_type: record['Tipo de Contrato'] || null,
      contract_signed: record['Firmó contrato?'] === 'Sí' || false,
      portfolio_url: record['Portfolio Brkaway'] || null,
      whatsapp_link: record['WPP Link'] || null,
      responsible: record['Responsable'] || null,
      additional_email: record['Otro Mail'] || null,
      platform: determinarPlataforma(record['Portfolio Brkaway'] || ''),
      content_count: 0,
      created_at: new Date().toISOString()
    }));

    const batchSize = 100;
    let successCount = 0;

    for (let i = 0; i < creatorsToInsert.length; i += batchSize) {
      const batch = creatorsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('creators')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`❌ Error en lote ${i / batchSize + 1}:`, error);
      } else {
        successCount += data.length;
        console.log(`✅ Lote ${i / batchSize + 1} completado: ${data.length} creadores insertados`);
      }
    }

    console.log(`\n✨ Importación completada: ${successCount} creadores importados de ${slicedRecords.length} restantes`);
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  }
}

seedCreators()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error no controlado:', error);
    process.exit(1);
  });
