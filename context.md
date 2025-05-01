🪄 Winclap Storyboard Generator Platform
Una herramienta interna para que los Content Partner Analysts generen storyboards completos para creadores y clientes de forma asistida por IA y automatización vía Google Slides API.

🎯 Project Context
La plataforma surge de la necesidad de acelerar y profesionalizar el armado de storyboards creativos que hoy se construyen manualmente a partir de briefings internos, momentos de inspiración (MOM), y referencias visuales. Actualmente, todo ese input es transformado en un deck de Slides que sigue un template fijo.

El objetivo es poder automatizar el llenado de ese template, generando propuestas creativas en base a inputs estructurados con ayuda de IA, y poblando los campos del storyboard directamente en Google Slides.

👥 User Flow Overview
Login (temporalmente deshabilitado): en el futuro se requerirá login para usar la herramienta.

Carga de briefing estructurado: el analista completa un form web con info del cliente, plataforma, objetivo, MOM y referencias.

Generación asistida por IA: un prompt IA genera el contenido del storyboard completo (hook, desarrollo por escenas, CTA, guion, visuales, sonido).

Google Slides autogenerado: el sistema duplica el template fijo y reemplaza los placeholders con los valores generados.

Link al storyboard: el link editable al deck generado es devuelto al usuario para su revisión, edición y envío.

💡 Core Features
1. Brief Input Form
Cliente

Objetivo de campaña

Plataforma/formato

MOM (texto libre)

Creador asignado

Referencias visuales

2. AI-Driven Content Generation
Prompt unificado que produce:

Hook

Descripción general

Desarrollo por 3 actos

CTA

Guiones

Visuales sugeridos

Música

Encuadres

3. Slides Generator
Duplica template fijo de Google Slides

Reemplaza placeholders como {{HOOK}}, {{SCENE_1_SCRIPT}}, {{CTA}}, etc.

Nombra el storyboard automáticamente (ej: STB-[Cliente]-[Fecha])

Devuelve link editable

⚙️ Technical Stack
Frontend
Next.js 14 (App Router)

Tailwind CSS + shadcn/ui

TypeScript

Backend
Node.js + OpenAI API

Google Slides API

Supabase (si se requiere persistencia futura)

Infraestructura
Vercel (hosting)

Railway (opcional para funciones servidoras)

Google Drive API (almacenamiento de output)

📁 Repository Structure (Propuesta)


storyboard-generator/
├── src/
│   ├── app/
│   │   ├── form/               # Brief input form
│   │   ├── result/             # Slide generated view
│   │   └── api/                # API routes for generation
│   ├── lib/
│   │   ├── prompts/            # IA prompt builder
│   │   ├── google-slides.ts    # Slides API helpers
│   │   └── utils/              # Formatters, mappers, etc
│   ├── components/
│   │   ├── ui/                 # Form UI blocks
│   │   └── preview/            # Optional preview before export
│   └── types/                  # Storyboard types
📦 Prompt IA Inicial (draft)
“Basado en este MOM: {{mom}}, y considerando que el cliente es {{cliente}}, que busca {{objetivo}}, en formato {{plataforma}}, generá un storyboard compuesto por: 1. Hook, 2. Descripción general, 3. Escenas (guion, visual, sonido, encuadre), 4. CTA, 5. Estilo visual y música. El creador que lo grabará es: {{nombre}}. Escribí todo en tono {{tono}} y mantené la estructura clara para que cada campo se pueda mapear.”

(Podemos iterar esto juntos cuando implementemos)

🧪 MVP Scope
Sin login

Sin versionado

Sin historial

Solo uso de template fijo

Solo 1 prompt IA unificado

Slides autogenerado en carpeta por defecto