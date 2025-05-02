🪄 Winclap Storyboard Generator Platform
Una herramienta interna para que los Content Partner Analysts generen storyboards completos para creadores y clientes de forma asistida por IA y automatización vía Google Slides API.

🎯 Project Context
La plataforma surge de la necesidad de acelerar y profesionalizar el armado de storyboards creativos que hoy se construyen manualmente a partir de briefings internos, momentos de inspiración (MOM), y referencias visuales. Actualmente, todo ese input es transformado en un deck de Slides que sigue un template fijo.

El objetivo es automatizar ese proceso, generando propuestas creativas en base a inputs estructurados con ayuda de IA, revisarlas con control humano, y poblar directamente los campos del storyboard en Google Slides.

👥 User Flow Overview
Login (implementado con NextAuth): se requiere autenticación para acceder al flujo completo.

Carga de briefing estructurado: el analista completa un form web con info del cliente, objetivo, MOM, plataforma, etc.

Generación asistida por IA: se envía el briefing a la API /api/generate-content, que retorna un JSON con todo el contenido creativo.

Revisión y edición tipo Notion: el contenido generado se visualiza y edita con un editor enriquecido (Tiptap) en la página /review.

Generación de Slides: al confirmar, se envía el contenido revisado a /api/generate-slides, que duplica el template y reemplaza los placeholders.

Visualización del resultado: se muestra el link editable a Google Slides en /result.

💡 Core Features
1. Brief Input Form
Cliente

Objetivo de campaña

Target

Mensaje clave

Plataforma/formato

MOM (texto libre)

Creador asignado

Referencias visuales

2. IA (Anthropic Claude)
Prompt unificado genera:

Hook

Descripción general

Desarrollo por escenas

CTA

Visuales, música y encuadres

3. Editor tipo Notion
Basado en Tiptap

Permite visualizar y modificar el contenido generado

Convierte el documento editable de vuelta a JSON estructurado

4. Slides Generator
Duplica template fijo de Google Slides

Reemplaza placeholders como {{HOOK}}, {{SCENE_1_SCRIPT}}, {{CTA}}, etc.

Nombra el storyboard automáticamente (ej: STB-[Cliente]-[Fecha])

Devuelve link editable al deck

⚙️ Technical Stack
Frontend
Next.js 15 (App Router)

Tailwind CSS + shadcn/ui

Tiptap (para editor enriquecido tipo Notion)

React Hook Form + Zod

Backend
Node.js

Anthropic API (Claude)

Google Slides + Drive API

Infraestructura
Vercel (hosting)

Railway (funciones servidoras opcionales)

Supabase (potencial futura persistencia)

📁 Repository Structure
bash
Copy
Edit
winclap-storyboard-generator/
├── src/
│   ├── app/
│   │   ├── form/               # Brief input form
│   │   ├── review/             # Editor enriquecido para control humano
│   │   ├── result/             # Visualización del link final
│   │   └── api/
│   │       ├── generate-content/ # Generación IA (Claude)
│   │       ├── generate-slides/  # Generación de deck en Slides
│   │       └── auth/           # NextAuth (Google OAuth)
│   ├── lib/
│   │   ├── anthropicService.ts # Interfaz con Claude
│   │   ├── googleApi.ts        # Lógica de duplicación y reemplazo
│   │   └── utils/              # createPrompt, helpers, mappers
│   ├── components/
│   │   ├── ui/                 # Componentes UI reutilizables
│   │   └── editor/             # Componente Tiptap personalizado
│   └── types/                  # Interfaces y tipos
└── README.md
📦 Prompt IA Actualizado
(sin cambios; sigue generando respuesta estructurada en JSON exacto con info para storyboard de TikTok)

🧪 MVP Scope
Autenticación habilitada

Sin historial ni versionado

Editor enriquecido tipo Notion con validación

IA → revisión humana → Google Slides

Reemplazos con fallback si campos están vacíos

Logs e intentos por lotes para batchUpdate de Slides

