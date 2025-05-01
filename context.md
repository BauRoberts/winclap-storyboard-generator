# 🪄 Winclap Storyboard Generator Platform

Una herramienta interna para que los Content Partner Analysts generen storyboards completos para creadores y clientes de forma asistida por IA y automatización vía Google Slides API.

## 🎯 Project Context

La plataforma surge de la necesidad de acelerar y profesionalizar el armado de storyboards creativos que hoy se construyen manualmente a partir de briefings internos, momentos de inspiración (MOM), y referencias visuales. Actualmente, todo ese input es transformado en un deck de Slides que sigue un template fijo.

El objetivo es poder automatizar el llenado de ese template, generando propuestas creativas en base a inputs estructurados con ayuda de IA, y poblando los campos del storyboard directamente en Google Slides.

## 👥 User Flow Overview

1. **Login (temporalmente deshabilitado)**: en el futuro se requerirá login para usar la herramienta.
2. **Carga de briefing estructurado**: el analista completa un form web con info del cliente, plataforma, objetivo, MOM y referencias.
3. **Generación asistida por IA**: un prompt IA genera el contenido del storyboard completo (hook, desarrollo por escenas, CTA, guion, visuales, sonido).
4. **Google Slides autogenerado**: el sistema duplica el template fijo y reemplaza los placeholders con los valores generados.
5. **Link al storyboard**: el link editable al deck generado es devuelto al usuario para su revisión, edición y envío.

## 💡 Core Features

### 1. Brief Input Form
* Cliente
* Objetivo de campaña
* Target
* Mensaje clave
* Plataforma/formato
* MOM (texto libre)
* Creador asignado
* Referencias visuales

### 2. AI-Driven Content Generation
* Prompt unificado que produce:
   * Hook
   * Descripción general
   * Desarrollo por escenas
   * CTA
   * Guiones
   * Visuales sugeridos
   * Música
   * Encuadres

### 3. Slides Generator
* Duplica template fijo de Google Slides
* Reemplaza placeholders como `{{HOOK}}`, `{{SCENE_1_SCRIPT}}`, `{{CTA}}`, etc.
* Nombra el storyboard automáticamente (ej: `STB-[Cliente]-[Fecha]`)
* Devuelve link editable

## ⚙️ Technical Stack

### Frontend
* Next.js 15 (App Router)
* Tailwind CSS + shadcn/ui
* TypeScript

### Backend
* Node.js + Anthropic API (Claude)
* Google Slides API
* Supabase (si se requiere persistencia futura)

### Infraestructura
* Vercel (hosting)
* Railway (opcional para funciones servidoras)
* Google Drive API (almacenamiento de output)

## 📁 Repository Structure

```
winclap-storyboard-generator/
├── src/
│   ├── app/
│   │   ├── form/               # Brief input form
│   │   ├── result/             # Slide generated view
│   │   └── api/
│   │       ├── auth/           # Autenticación NextAuth
│   │       └── generate/       # API para generación de contenido
│   ├── lib/
│   │   ├── anthropicService.ts # Servicio de IA Claude (Anthropic)
│   │   ├── googleApi.ts        # Slides API helpers
│   │   └── utils/              # Formatters, mappers, etc
│   ├── components/
│   │   ├── ui/                 # Form UI blocks
│   │   └── storyboard-controls # Controles específicos para storyboard
│   └── types/                  # Storyboard types y TypeScript interfaces
├── .env.local                  # Variables de entorno locales
├── .env.example                # Template de variables de entorno
├── .gitignore                  # Configurado para Next.js, credenciales Google, etc.
└── README.md                   # Documentación del proyecto
```

## 📦 Prompt IA Actualizado

```
Necesito que actúes como un experto en marketing digital especializado en la creación de contenido para TikTok.

Aquí está el brief de un cliente para el que debemos generar un storyboard completo:

CLIENTE: ${briefData.cliente}
OBJETIVO: ${briefData.objetivo}
TARGET: ${briefData.target}
MENSAJE CLAVE: ${briefData.mensaje}

Por favor, genera un storyboard completo y estructurado para un video de TikTok, considerando las mejores prácticas de la plataforma: videos cortos, dinámicos, con gancho inicial fuerte y call to action claro.

Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura exacta, sin texto introductorio ni explicaciones adicionales:

{
  "objective": "objetivo refinado de la campaña",
  "tone": "tono de comunicación adecuado para TikTok y el target",
  "valueProp1": "primera propuesta de valor concisa y persuasiva",
  "valueProp2": "segunda propuesta de valor complementaria",
  "dos": "3-4 mejores prácticas a seguir en la producción",
  "donts": "3-4 prácticas a evitar en la producción",
  "locations": "locaciones sugeridas específicas para el video",
  "lighting": "tipo de iluminación recomendada (natural, estudio, etc.)",
  "mainElements": "elementos visuales clave que deben aparecer",
  "look": "estilo visual y estético recomendado",
  "ideaName": "nombre creativo y memorable para la idea",
  "hook": "frase o acción de gancho inicial (5-10 palabras)",
  "description": "descripción general del concepto (30-50 palabras)",
  "cta": "llamado a la acción específico y directo (5-10 palabras)",
  "scene1Script": "guión textual para la primera escena/hook (15-25 palabras)",
  "scene1Sound": "música o efectos de sonido específicos para primera escena",
  "scene1Visual": "descripción visual detallada de la primera escena",
  "scene1Framing": "tipo de encuadre para la primera escena (ej: primer plano, plano general)",
  "scene1Angle": "ángulo de cámara para la primera escena",
  "scene2Script": "guión textual para la segunda escena (15-25 palabras)",
  "scene2Sound": "música o efectos de sonido para segunda escena",
  "scene2Visual": "descripción visual detallada de la segunda escena",
  "scene3Script": "guión textual para la tercera escena (15-25 palabras)",
  "scene3Sound": "música o efectos de sonido para tercera escena",
  "scene3Visual": "descripción visual detallada de la tercera escena",
  "scene4Script": "guión textual para el call to action final (10-20 palabras)",
  "scene4Sound": "música o efectos de sonido para call to action",
  "scene4Visual": "descripción visual detallada del call to action"
}

Asegúrate de que todo el contenido sea creativo, específico para la marca y target indicados, y optimizado para TikTok.
```

## 🧪 MVP Scope
* Sin login (autenticación OAuth implementada pero temporalmente deshabilitada)
* Sin versionado
* Sin historial
* Solo uso de template fijo
* Servicio de IA: Anthropic Claude
* Slides autogenerado en Google Drive
* Manejo de errores y fallbacks en reemplazos de placeholders

## 🚀 Actualizaciones Recientes
* Corrección en la integración con Google Slides API para manejar correctamente el reemplazo de placeholders
* Implementación de Anthropic API (Claude) para generación de contenido en lugar de OpenAI
* Mejora en el manejo de errores con logs detallados
* Estructura de repositorio Git con archivos de configuración
* Soporte para lotes más pequeños en caso de error en batchUpdate de Google Slides