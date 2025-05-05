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
winclap-storyboard-generator/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── editor/          # Página de editor tipo Notion
│   │   │   ├── result/          # Visualización del link final
│   │   │   ├── clients/         # Gestión de clientes
│   │   │   ├── storyboards/     # Listado de storyboards
│   │   │   └── layout.tsx       # Layout con sidebar para páginas autenticadas
│   │   ├── api/
│   │   │   ├── reorganize-content/ # API para estructurar texto
│   │   │   ├── generate-slides/    # Generación de deck en Slides
│   │   │   └── auth/              # NextAuth (Google OAuth)
│   │   ├── globals.css          # Estilos globales + editor
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── anthropicService.ts  # Interfaz con Claude
│   │   ├── googleApi.ts         # Lógica de duplicación y reemplazo
│   │   └── utils/               # createPrompt, helpers, mappers
│   ├── components/
│   │   ├── ui/                  # Componentes UI reutilizables
│   │   ├── sidebar/
│   │   │   └── sidebar.tsx      # Componente de navegación lateral
│   │   ├── editor/
│   │   │   ├── editor.tsx       # Componente principal Tiptap
│   │   │   ├── EditorTopbar.tsx # Barra superior estilo Notion
│   │   │   ├── FloatingButtons.tsx # Botones de acción flotantes
│   │   │   ├── FloatingToolbar.tsx # Toolbar flotante para formato
│   │   │   └── tiptap/
│   │   │       ├── slash-commands.ts   # Comandos de barra diagonal
│   │   │       └── CommandsList.tsx    # UI para comando
│   │   └── navbar.tsx           # Navegación global (legacy)
│   └── types/                   # Interfaces y tipos
└── README.md
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