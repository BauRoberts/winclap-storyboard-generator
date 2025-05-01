# Winclap Storyboard Generator

Una herramienta interna para que los Content Partner Analysts generen storyboards completos para creadores y clientes de forma asistida por IA y automatización vía Google Slides API.

## 🎯 Descripción del Proyecto

La plataforma surge de la necesidad de acelerar y profesionalizar el armado de storyboards creativos que hoy se construyen manualmente a partir de briefings internos, momentos de inspiración (MOM), y referencias visuales. Actualmente, todo ese input es transformado en un deck de Slides que sigue un template fijo.

El objetivo es poder automatizar el llenado de ese template, generando propuestas creativas en base a inputs estructurados con ayuda de IA, y poblando los campos del storyboard directamente en Google Slides.

## 👥 Flujo de Usuario

1. **Login** (temporalmente deshabilitado): en el futuro se requerirá login para usar la herramienta.
2. **Carga de briefing estructurado**: el analista completa un form web con info del cliente, plataforma, objetivo, MOM y referencias.
3. **Generación asistida por IA**: un prompt IA genera el contenido del storyboard completo (hook, desarrollo por escenas, CTA, guion, visuales, sonido).
4. **Google Slides autogenerado**: el sistema duplica el template fijo y reemplaza los placeholders con los valores generados.
5. **Link al storyboard**: el link editable al deck generado es devuelto al usuario para su revisión, edición y envío.

## 💡 Características Principales

1. **Brief Input Form**
   * Cliente
   * Objetivo de campaña
   * Plataforma/formato
   * MOM (texto libre)
   * Creador asignado
   * Referencias visuales

2. **Generación de Contenido basada en IA**
   * Prompt unificado que produce:
     * Hook
     * Descripción general
     * Desarrollo por 3 actos
     * CTA
     * Guiones
     * Visuales sugeridos
     * Música
     * Encuadres

3. **Generador de Slides**
   * Duplica template fijo de Google Slides
   * Reemplaza placeholders como `{{HOOK}}`, `{{SCENE_1_SCRIPT}}`, `{{CTA}}`, etc.
   * Nombra el storyboard automáticamente (ej: `STB-[Cliente]-[Fecha]`)
   * Devuelve link editable

## ⚙️ Stack Tecnológico

**Frontend**
* Next.js 14/15 (App Router)
* Tailwind CSS + shadcn/ui
* TypeScript

**Backend**
* Node.js + Anthropic API (Claude)
* Google Slides API
* Supabase (si se requiere persistencia futura)

**Infraestructura**
* Vercel (hosting)
* Railway (opcional para funciones servidoras)
* Google Drive API (almacenamiento de output)

## 🚀 Instalación y Configuración

1. Clona el repositorio
```bash
git clone https://github.com/tu-usuario/winclap-storyboard-generator.git
cd winclap-storyboard-generator
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
Crea un archivo `.env.local` con las siguientes variables:
```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
NEXTAUTH_SECRET=tu-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=tu-api-key
TEMPLATE_ID=ID-de-tu-template-de-Google-Slides
```

4. Inicia el servidor de desarrollo
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Scope del MVP

* Sin login
* Sin versionado
* Sin historial
* Solo uso de template fijo
* Solo 1 prompt IA unificado
* Slides autogenerado en carpeta por defecto