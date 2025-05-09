# 🪄 Winclap Storyboard Generator Platform

Una herramienta interna para que los Content Partner Analysts generen storyboards completos para creadores y clientes de forma asistida por IA y automatización vía Google Slides API.

## 🎯 Project Context

La plataforma surge de la necesidad de acelerar y profesionalizar el armado de storyboards creativos que hoy se construyen manualmente a partir de briefings internos, momentos de inspiración (MOM), y referencias visuales. Actualmente, todo ese input es transformado en un deck de Slides que sigue un template fijo.

El objetivo es automatizar ese proceso, generando propuestas creativas en base a inputs flexibles con ayuda de IA, revisarlas con control humano, y poblar directamente los campos del storyboard en Google Slides.

## 👥 User Flow Overview (Actualizado)

1. **Login**: Autenticación con NextAuth (Google OAuth)
2. **Navegación del dashboard**: Acceso a clientes, storyboards y al editor
3. **Editor de briefing libre**: El analista escribe o pega contenido no estructurado en un editor Tiptap mejorado
4. **Reorganización con IA**: Botón que procesa el texto libre y lo estructura según el formato necesario
5. **Edición manual**: El contenido reestructurado es totalmente editable en el editor
6. **Generación de Slides**: Al confirmar, se envía el contenido a /api/generate-slides
7. **Visualización del resultado**: Se muestra el link editable a Google Slides
8. **Gestión de clientes y storyboards**: Interfaces tabulares para administrar todos los recursos

## 💡 Core Features

### 1. Editor de Texto Avanzado
- **Basado en Tiptap**: Editor tipo Notion con capacidades avanzadas
- **Entrada libre**: Acepta cualquier formato de texto
- **Slash Commands**: Acceso rápido a headings, listas, templates específicos
- **Floating Toolbar**: Opciones de formato al seleccionar texto (Bold, Italic, Link, etc.)
- **Markdown Shortcuts**: #, ##, -, >, para formateo rápido
- **Templates personalizados**: Cliente, Objetivo, Target, Hook via comandos
- **Fully editable**: Todo el contenido es editable, incluyendo el generado por IA

### 2. IA Processing
- **Reorganización inteligente**: Convierte texto libre a formato estructurado
- **API /api/reorganize-content**: Nueva endpoint que procesa con Claude
- **Generación de contenido**: Mantiene la capacidad de generar storyboards completos
- **Validación de campos**: Verifica campos requeridos antes de generar slides

### 3. UI/UX Mejorado
- **Layout tipo Notion**: Interfaz limpia y minimalista centrada en el contenido
- **Sidebar mejorada**: Navegación intuitiva entre diferentes secciones
- **Topbar estilo Notion**: Título editable, selección de cliente y fase
- **Botones flotantes**: Acciones principales siempre accesibles
- **Responsive design**: Adaptado para diferentes tamaños de pantalla
- **Dark mode ready**: Variables CSS preparadas para tema oscuro

### 4. Gestión de Clientes y Storyboards
- **Tablas interactivas**: Visualización y administración de datos en tablas
- **Filtros y búsqueda**: Capacidad de encontrar rápidamente la información
- **Ordenación**: Posibilidad de ordenar por diferentes campos
- **Acciones contextuales**: Menús de acciones para cada elemento

### 5. Slides Generator
- Duplica template fijo de Google Slides
- Extrae automáticamente información como cliente
- Reemplaza placeholders dinámicamente
- Valida campos requeridos antes de generar
- Manejo inteligente de errores y reintentos

## ⚙️ Technical Stack

### Frontend
- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Tiptap + extensiones (BubbleMenu, Commands, Typography, Link, TextAlign)
- React Hook Form + Zod
- Tippy.js para tooltips y menús
- Lucide React para iconos

### Backend
- Node.js
- Anthropic API (Claude)
- Google Slides + Drive API

### Infraestructura
- Vercel (hosting)
- Next.js API routes

## 📁 Repository Structure (Actualizada)

```
bautistaroberts@Bautistas-MacBook-Pro winclap-storyboard-generator % tree -I "node_modules|.next|.git|public|.vscode|.DS_Store" -L 3
.
├── commands.md
├── components.json
├── context.md
├── credentials.json
├── eslint.config.mjs
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
│   │   ├── SupabaseTest.tsx
│   │   ├── topbar
│   │   └── ui
│   ├── hooks
│   │   └── useSupabase.ts
│   ├── lib
│   │   ├── anthropicService.ts
│   │   ├── constants.ts
│   │   ├── googleApi.ts
│   │   ├── supabase.ts
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

16 directories, 37 files
bautistaroberts@Bautistas-MacBook-Pro winclap-storyboard-generator % 
```

## 📦 Prompt IA Actualizado

### Nuevo prompt para reorganización:
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

## 🧪 MVP Scope

- [x] Autenticación Google OAuth
- [x] Editor de texto libre tipo Notion
- [x] Slash commands con templates
- [x] Floating toolbar para formato
- [x] Reorganización de texto con IA
- [x] Edición completa del contenido
- [x] Generación de Google Slides
- [x] Validación de campos requeridos
- [x] UI/UX optimizado para productividad
- [x] Sidebar mejorada para navegación
- [x] Gestión de clientes
- [x] Listado de storyboards

## 🔄 Recent Changes

1. **Eliminación del formulario estructurado**: Reemplazado por editor de texto libre
2. **Nueva página /editor**: Entrada principal simplificada
3. **Floating toolbar**: Opciones de formato al seleccionar
4. **Slash commands**: Acceso rápido a elementos comunes
5. **Reorganización con IA**: Procesa texto libre a estructura
6. **Validación dinámica**: Extrae cliente y valida campos automáticamente
7. **UX mejorado**: Layout full-width y controles accesibles
8. **Sidebar renovada**: Navegación lateral para todas las secciones
9. **Editor tipo Notion**: Interfaz minimalista centrada en el contenido
10. **Topbar estilo Notion**: Título editable y selección de propiedades
11. **Botones flotantes**: Reemplazo de la barra inferior fija
12. **Tablas de datos**: Gestión de clientes y storyboards

## 🚀 Future Considerations

- Drag handles para bloques
- Colores de fondo por sección
- Historial de versiones
- Templates precargados
- Persistencia de borradores
- Colaboración en tiempo real
- Estadísticas de uso por cliente
- Integración con otras plataformas de Winclap

Version 2

# 🪄 Resumen del Proyecto Winclap Storyboard Generator

## Contexto Actual

Hemos desarrollado una plataforma interna para que los Content Partner Analysts de Winclap puedan generar storyboards completos para creadores y clientes de forma asistida por IA y automatización con Google Slides API.

## Evolución del Proyecto

### Fase 1: Diseño y Estructura de Base de Datos
- Diseño del esquema en Supabase con entidades clave: Users, Clients, Creators, Storyboards, Templates
- Implementación de relaciones, índices y políticas RLS
- Integración de NextAuth con Google OAuth

### Fase 2: Implementación Backend y Autenticación
- Configuración de Next.js 15 con App Router
- Creación de servicios para gestión de datos
- Implementación de autenticación completa con manejo de sesiones

### Fase 3: Editor TipTap y Sistema de Guardado
- Integración del editor TipTap con extensiones avanzadas
- Implementación de autoguardado estilo Notion
- Desarrollo de la sincronización entre frontend y base de datos

### Fase 4: Mejora del Flujo de Usuario y Reorganización con IA
- **Problema identificado**: La vista dual (original/reorganizado) era confusa y generaba problemas de persistencia
- **Solución implementada**: Nuevo flujo lineal con modal para reorganización

#### Cambios clave en la última fase:
1. **Nuevo flujo modal para reorganización con IA**:
   - Usuario escribe texto libre en el editor principal
   - Al hacer clic en "Reorganizar con IA", se abre un modal con el contenido estructurado
   - El usuario puede editar este contenido en el modal
   - Al hacer clic en "Generar Slides", se crean las diapositivas con Google Slides API

2. **Mejoras técnicas implementadas**:
   - Creación del componente `AIReorganizationModal` para mostrar y editar el contenido reorganizado
   - Implementación de funciones de conversión entre camelCase (frontend) y snake_case (base de datos)
   - Corrección de problemas de tipado en TypeScript
   - Solución de problemas de persistencia en la base de datos

3. **Solución de problemas de integración**:
   - Corrección de errores en la conversión de formatos para la base de datos
   - Mejora del manejo de estados en el editor
   - Simplificación del flujo de usuario para evitar confusiones

## Componentes Técnicos Clave

1. **Frontend:**
   - Next.js 15 con App Router
   - TipTap para editor avanzado tipo Notion
   - Tailwind CSS + shadcn/ui para componentes
   - Modal para reorganización de contenido

2. **Backend:**
   - API routes de Next.js
   - Integración con Supabase para persistencia
   - Servicios de Claude (Anthropic) para procesamiento de IA
   - Google Slides API para generación de presentaciones

3. **Flujo de datos:**
   - Entrada de texto libre en editor TipTap
   - Procesamiento con Claude para estructuración
   - Conversión de formatos para persistencia en base de datos
   - Generación de presentaciones con Google Slides API

## Estado Actual y Beneficios

- **Persistencia de datos:** Se guardan correctamente tanto el contenido original como el reorganizado
- **Conversión de formatos:** Funcionamiento correcto de la transformación entre camelCase y snake_case
- **Flujo completo:** Proceso completo desde texto libre hasta slides generadas
- **UI/UX mejorada:** Flujo más intuitivo y menos propenso a errores
- **Base de datos:** Datos guardados correctamente en las tablas storyboards y storyboard_ai_content

## Próximos Pasos Potenciales

- Implementación de historial de versiones para los storyboards
- Creación de plantillas predefinidas para diferentes tipos de contenido
- Mejoras en feedback visual durante los procesos de generación
- Dashboard con estadísticas de uso por cliente
- Colaboración en tiempo real para trabajo en equipo



---------------------

🪄 Winclap Storyboard Generator - Descripción Actualizada
Contexto del Proyecto
El Winclap Storyboard Generator es una plataforma interna desarrollada para Content Partner Analysts de Winclap, que permite generar storyboards completos para creadores y clientes con asistencia de IA (Claude de Anthropic) y automatización a través de Google Slides API.
Evolución y Estado Actual
La plataforma ha evolucionado desde un enfoque inicial con formularios estructurados hacia un editor de texto estilo Notion con reorganización inteligente de contenido, manteniendo la potencia de generación automática de storyboards.
Fases de Desarrollo Completadas

Base de Datos y Autenticación

Implementación de esquema en Supabase con entidades clave
Integración de NextAuth con Google OAuth para autenticación segura


Editor TipTap y Flujo de Usuario

Implementación del editor con extensiones avanzadas (slash commands, tipografía, etc.)
Mejora de la UX con sistema de autoguardado estilo Notion


Reorganización con IA y Generación de Slides

Nuevo flujo modal para reorganización de contenido con Claude
Integración con Google Slides API para creación automática de presentaciones



Tecnologías Implementadas
Frontend

Next.js 15 con App Router
TipTap como editor avanzado tipo Notion
Tailwind CSS con shadcn/ui para componentes
React Hook Form + Zod para validación

Backend

API routes de Next.js
Anthropic API (Claude) para IA
Google Slides API para presentaciones

Flujo de Datos

Usuario ingresa texto libre en el editor TipTap
Al reorganizar, Claude procesa y estructura el contenido
El contenido procesado se guarda en Supabase
Al generar, se crea una presentación en Google Slides

Características Clave

Editor Avanzado Tipo Notion

Slash commands para acceder rápidamente a plantillas y formatos
Barra flotante de formato al seleccionar texto
Soporte para markdown y atajos de teclado


Procesamiento IA para Mejorar Briefings

Conversión de texto libre a formato estructurado para storyboards
Inferencia inteligente de datos faltantes
Validación automática de campos requeridos


Gestión de Datos

Clientes y creadores de contenido organizados en tablas
Histórico de storyboards con vistas de detalle
Interfaz de búsqueda y filtrado


UI/UX Optimizada

Diseño limpio estilo Notion con modo oscuro
Navegación intuitiva con sidebar colapsable
Vistas responsivas para desktop y mobile



Mejoras Recientes

Flujo Modal de Reorganización

Reemplazo del sistema de vista dual por un modal más intuitivo
Mejor persistencia de datos entre el contenido original y reorganizado
Reducción de problemas de sincronización de estados


Integración Mejorada con Supabase

Funciones de conversión entre camelCase (frontend) y snake_case (base de datos)
Corrección de problemas de tipado en TypeScript
Manejo optimizado de estados en el editor


Navegación y Experiencia de Usuario

Implementación de breadcrumbs para mejorar la navegación
Sistema de notificaciones para acciones importantes
Mejoras en la página de resultados con opciones de compartir



Esta plataforma representa un flujo de trabajo optimizado para la creación de storyboards, desde la entrada de texto libre hasta la generación de presentaciones profesionales, con asistencia de IA en cada paso del proceso.