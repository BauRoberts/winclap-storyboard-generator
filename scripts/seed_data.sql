-- seed_data.sql
-- Insertar algunos clientes de ejemplo
INSERT INTO clients (name, industry, contact_person, email)
VALUES 
  ('Coca Cola', 'Bebidas', 'Juan Pérez', 'juan@cocacola.com'),
  ('Pepsi', 'Bebidas', 'María López', 'maria@pepsi.com'),
  ('Nike', 'Indumentaria', 'Carlos Rodríguez', 'carlos@nike.com'),
  ('Adidas', 'Indumentaria', 'Laura García', 'laura@adidas.com'),
  ('Samsung', 'Tecnología', 'Martín Gómez', 'martin@samsung.com');

-- Insertar algunos creadores de ejemplo
INSERT INTO creators (name, category, platform, email, followers)
VALUES 
  ('Marcos Galperin', 'Tech', 'YouTube', 'marcos@creator.com', '1.2M'),
  ('Laura Mendez', 'Lifestyle', 'Instagram', 'laura@creator.com', '850K'),
  ('Carlos Ramos', 'Gaming', 'Twitch', 'carlos@creator.com', '2.5M'),
  ('Martina Torres', 'Fitness', 'TikTok', 'martina@creator.com', '3.1M'),
  ('Diego Alvarez', 'Cocina', 'YouTube', 'diego@creator.com', '950K');

-- Insertar algunas plantillas de ejemplo
INSERT INTO templates (name, content, is_default)
VALUES 
  ('Briefing Estándar', '{"sections": ["Cliente y Objetivo", "Target Audience", "Hook Principal", "Desarrollo de Escenas", "CTA"]}', true),
  ('Minimalista', '{"sections": ["Hook", "Desarrollo", "CTA"]}', false),
  ('Detallado', '{"sections": ["Cliente", "Objetivo", "Target Primario", "Hook", "Escenas", "CTA"]}', false);