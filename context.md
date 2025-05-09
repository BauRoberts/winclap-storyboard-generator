# 🪄 Winclap Storyboard Generator

## 📌 Descripción General

Winclap Storyboard Generator es una herramienta interna tipo SaaS desarrollada para Content Partner Analysts que permite generar storyboards profesionales para creadores y clientes. La plataforma utiliza IA (Claude de Anthropic) para asistir en la creación de contenido y automatiza el proceso de generación de presentaciones a través de la API de Google Slides.

## 🎯 Objetivo del Proyecto

La plataforma surge de la necesidad de acelerar y profesionalizar el armado de storyboards creativos que anteriormente se construían manualmente. El proceso original requería transformar briefings, momentos de inspiración (MOM) y referencias visuales en decks de Google Slides siguiendo un template fijo.

El objetivo es automatizar este proceso, permitiendo que los analistas generen propuestas creativas basadas en inputs flexibles con ayuda de IA, revisen con control humano, y publiquen directamente en Google Slides.

## 💻 Stack Tecnológico

### Frontend
- **Next.js 15** (usando App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS + shadcn/ui** para la interfaz de usuario
- **Tiptap** para el editor de texto avanzado (con extensiones)
- **React Hook Form + Zod** para validación de formularios
- **Framer Motion** para animaciones
- **Lucide React** para iconografía

### Backend
- **Node.js**
- **Anthropic API** (Claude 3 Opus) para generación de contenido
- **Google Slides + Drive API** para la creación de presentaciones
- **NextAuth** para autenticación con Google OAuth

### Infraestructura
- **Vercel** para hosting
- **Next.js API Routes** para endpoints

## 🔑 Características Principales

### 1. Editor Tipo Notion
- Editor de texto avanzado basado en Tiptap
- Interfaz minimalista centrada en el contenido
- Slash commands para acceso rápido a headings, listas, templates
- Floating toolbar para formato de texto
- Markdown shortcuts
- Soporte para templates personalizados

### 2. Procesamiento con IA
- Reorganización inteligente de texto libre a formato estructurado
- Generación de contenido de storyboard completo
- Validación automática de campos requeridos

### 3. Integración con Google Slides
- Duplicación de template desde Google Slides
- Reemplazo automático de placeholders
- Validación de campos requeridos antes de generar
- Manejo de errores y reintentos

### 4. Gestión de Datos
- Dashboard para visualizar clientes y storyboards
- Tablas interactivas con filtrado y búsqueda
- Ordenación por diferentes campos
- Acciones contextuales para cada elemento

### 5. Diseño UX/UI Mejorado
- Layout tipo Notion con sidebar mejorada
- Topbar con breadcrumbs y acciones rápidas
- Botones flotantes para acciones principales
- Responsive design
- Dark mode ready

## 👥 Flujo de Usuario

1. **Login**: Autenticación con Google OAuth (NextAuth)
2. **Dashboard**: Acceso a clientes, storyboards y editor
3. **Editor de Briefing**: El analista escribe o pega contenido en formato libre
4. **Reorganización con IA**: Procesamiento del texto para estructurarlo según formato de storyboard
5. **Edición Manual**: Revisión y edición del contenido reorganizado
6. **Generación de Slides**: Creación automática en Google Slides
7. **Visualización del Resultado**: Acceso al documento editable
8. **Gestión**: Administración de clientes y storyboards existentes

## 📝 Estructura de Datos del Storyboard

El storyboard se estructura con los siguientes campos principales:

- **Información General**: Objetivo, tono, propuestas de valor
- **Moodboard**: Locaciones, iluminación, elementos principales, estética
- **Idea y Campaña**: Nombre de la idea, hook, descripción, CTA
- **Escenas** (4): Script, elementos visuales, sonido, encuadre para cada escena

## 🔄 Flujo de Procesamiento con IA

1. **Entrada**: Texto libre con información sobre el brief, cliente, objetivo, etc.
2. **Procesamiento con Claude**: Análisis y extracción de información relevante
3. **Estructuración**: Organización en formato de storyboard (JSON)
4. **Visualización**: Presentación en editor para revisión
5. **Generación**: Creación del documento de Google Slides con contenido

## 🔐 Seguridad y Autenticación

- Autenticación mediante Google OAuth 2.0
- Scopes específicos para acceso a Drive y Presentations
- Middleware para protección de rutas
- Manejo de tokens y refresh tokens

## 📱 Diseño Responsive

- Layout adaptable a diferentes tamaños de pantalla
- Sidebar colapsable en dispositivos móviles
- Controles de UI adaptados para diferentes dispositivos

## 🚀 Mejoras Recientes

- **Eliminación del formulario estructurado**: Reemplazado por editor de texto libre
- **Nueva página /editor**: Entrada principal simplificada
- **Floating toolbar**: Opciones de formato al seleccionar texto
- **Slash commands**: Acceso rápido a templates y elementos
- **Reorganización con IA**: Mejora en el procesamiento de texto libre
- **UX mejorado**: Layout y controles optimizados
- **Tablas de datos**: Interfaz mejorada para gestión

## 🔮 Consideraciones Futuras

- Drag handles para bloques
- Colores de fondo por sección
- Historial de versiones
- Templates precargados
- Persistencia de borradores
- Colaboración en tiempo real
- Estadísticas de uso por cliente
- Integración con otras plataformas de Winclap

## 📚 Prompt de IA para Reorganización

```
Analiza este texto y ordénalo según la estructura de storyboard.
Identifica y estructura:
- Cliente y objetivo
- Target audience  
- Hook principal
- Desarrollo de escenas
- CTA

Mantén un formato markdown legible para un editor de texto.
```

## 🏗️ Estructura de Directorios

- **/src/app**: Rutas y páginas de la aplicación (App Router)
  - **/api**: Endpoints de API
  - **/dashboard**: Páginas y rutas protegidas
- **/src/components**: Componentes React
  - **/editor**: Editor de texto y componentes relacionados
  - **/sidebar**: Navegación lateral
  - **/topbar**: Barra superior
  - **/ui**: Componentes de UI (shadcn)
- **/src/lib**: Utilidades y servicios
  - **anthropicService.ts**: Integración con Claude
  - **googleApi.ts**: Integración con Google Slides/Drive
- **/src/types**: Definiciones de TypeScript

## ⚙️ Instrucciones para Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 🔐 Variables de Entorno Requeridas

- `GOOGLE_CLIENT_ID` - ID de cliente OAuth de Google
- `GOOGLE_CLIENT_SECRET` - Secret de cliente OAuth de Google
- `ANTHROPIC_API_KEY` - Clave API de Anthropic para Claude
- `TEMPLATE_ID` - ID del template de Google Slides a utilizar
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `NEXTAUTH_URL` - URL base para NextAuth


bautistaroberts@Bautistas-MacBook-Pro winclap-storyboard-generator % tree -I "node_modules|.next|.git|public|.vscode|.DS_Store" -L 3
.
├── commands.md
├── components.json
├── context.md
├── credentials.json
├── DEV.md
├── eslint.config.mjs
├── last-task.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── scripts
│   └── seed_data.sql
├── seed-script.js
├── src
│   ├── app
│   │   ├── (dashboard)
│   │   ├── api
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components
│   │   ├── editor
│   │   ├── ErrorState.tsx
│   │   ├── forms
│   │   ├── LoadingState.tsx
│   │   ├── navbar.tsx
│   │   ├── sidebar
│   │   ├── topbar
│   │   └── ui
│   ├── hooks
│   │   └── useSupabase.ts
│   ├── lib
│   │   ├── anthropicService.ts
│   │   ├── constants.ts
│   │   ├── googleApi.ts
│   │   ├── supabase.ts
│   │   ├── supabaseServer.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   ├── services
│   │   ├── clientService.ts
│   │   ├── creatorService.ts
│   │   ├── storyboardService.ts
│   │   └── templateService.ts
│   └── types
│       ├── next-auth.d.ts
│       └── types.ts
├── tailwind.config.js
└── tsconfig.json

16 directories, 39 files
bautistaroberts@Bautistas-MacBook-Pro winclap-storyboard-generator % 