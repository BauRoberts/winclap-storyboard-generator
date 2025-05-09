// src/components/editor/editor.tsx
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Commands from './tiptap/slash-commands';
import { FloatingToolbar } from './tiptap/FloatingToolbar';

// Definir claramente la interfaz AIContent
export interface AIContent {
  objective: string;
  tone: string;
  valueProp1: string;
  valueProp2: string;
  hook: string;
  description: string;
  cta: string;
  scene1Script: string;
  scene1Visual: string;
  scene1Sound: string;
  scene2Script: string;
  scene2Visual: string;
  scene2Sound: string;
  scene3Script: string;
  scene3Visual: string;
  scene3Sound: string;
  scene4Script: string;
  scene4Visual: string;
  scene4Sound: string;
  [key: string]: string;
}

// Definir la interfaz para EditorJSON
interface EditorJSON {
  type: string;
  content?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: Record<string, unknown>;
    }>;
  }>;
}

// Definir explícitamente las props que recibe RichEditor
interface RichEditorProps {
  initialContent: AIContent | string;
  onChange: (json: AIContent, text: string, html: string) => void; // Modificado para incluir HTML
}

interface DocContent {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<{
    type: string;
    text?: string;
    attrs?: Record<string, unknown>;
  }>;
}

interface DocStructure {
  type: string;
  content: DocContent[];
}

const RichEditor: React.FC<RichEditorProps> = ({ initialContent, onChange }) => {
  // Usar un estado local para controlar cuándo se inicializa el contenido
  const [isInitialized, setIsInitialized] = useState(false);
  const isUpdating = useRef(false);
  const initialContentRef = useRef(initialContent);
  const editorInstanceRef = useRef<any>(null);

  // Guardar el contenido inicial en un ref para comparar cambios
  useEffect(() => {
    initialContentRef.current = initialContent;
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Commands,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Título sin texto...';
          }
          return 'Empieza escribiendo o pega tu briefing aquí...\n\nPresiona "/" para comandos rápidos';
        },
      }),
      CharacterCount,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Typography,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `<p></p>`, // Contenido inicial vacío
    editorProps: {
      attributes: {
        class: 'prose prose-base sm:prose lg:prose-lg focus:outline-none max-w-none min-h-[calc(100vh-150px)] text-sm',
        contenteditable: 'true',
      },
    },
    onUpdate({ editor }) {
      if (isUpdating.current) return;
      
      const json = editor.getJSON() as EditorJSON;
      const text = editor.getText();
      const html = editor.getHTML(); // Obtener HTML para preservar estilos
      
      if (onChange && isInitialized) {
        onChange(parseEditorContent(json), text, html);
      }
    },
    // Esto resuelve el error de SSR
    immediatelyRender: false
  });

  // Guardar la referencia del editor
  useEffect(() => {
    if (editor) {
      editorInstanceRef.current = editor;
    }
  }, [editor]);
  
  // Inicializar contenido solo una vez cuando el editor está listo
  useEffect(() => {
    if (editor && !isInitialized) {
      console.log("Editor inicializando con contenido: ", 
        typeof initialContentRef.current === 'string' 
        ? (initialContentRef.current as string).substring(0, 50) + "..." 
        : "objeto AIContent");
        
      isUpdating.current = true;
      
      // Determinar si el contenido inicial es un string o un objeto AIContent
      if (typeof initialContentRef.current === 'string') {
        const strContent = initialContentRef.current as string;
        if (strContent && strContent.trim() !== '') {
          // Verificar si parece ser HTML
          if (strContent.trim().startsWith('<') && strContent.includes('</')) {
            // Es HTML, usarlo directamente
            editor.commands.setContent(strContent);
          } else {
            // Es texto plano, envolverlo en párrafo
            editor.commands.setContent(`<p>${strContent}</p>`);
          }
        }
      } else {
        // Es un objeto AIContent
        const content = initialContentRef.current as AIContent;
        const hasContent = Object.values(content).some(val => 
          val && typeof val === 'string' && val.trim() !== ''
        );
        
        if (hasContent) {
          const doc = formatAsDoc(content);
          editor.commands.setContent(doc);
        }
      }
      
      // Marcar como inicializado y permitir actualizaciones
      setTimeout(() => {
        isUpdating.current = false;
        setIsInitialized(true);
      }, 100);
    }
  }, [editor, isInitialized]);

  return (
    <div className="notion-like-editor mt-6">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="z-50"
        >
          <FloatingToolbar editor={editor} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

// Exportar el componente como default
export default RichEditor;

// Funciones auxiliares
function formatAsDoc(data: AIContent): DocStructure {
  const sections = [
    {
      heading: 'Briefing Storyboard',
      level: 1,
      content: []
    },
    {
      heading: '📋 Información General',
      level: 2,
      content: [
        `Objetivo: ${data.objective || ''}`,
        `Tono: ${data.tone || ''}`,
        `Propuesta de Valor 1: ${data.valueProp1 || ''}`,
        `Propuesta de Valor 2: ${data.valueProp2 || ''}`
      ]
    },
    {
      heading: '🎬 Storyboard',
      level: 2,
      content: [
        `Hook: ${data.hook || ''}`,
        `Descripción: ${data.description || ''}`,
        `CTA: ${data.cta || ''}`
      ]
    },
    {
      heading: 'Escena 1: Hook',
      level: 3,
      content: [
        `Script: ${data.scene1Script || ''}`,
        `Visual: ${data.scene1Visual || ''}`,
        `Sonido: ${data.scene1Sound || ''}`
      ]
    },
    {
      heading: 'Escena 2: Desarrollo',
      level: 3,
      content: [
        `Script: ${data.scene2Script || ''}`,
        `Visual: ${data.scene2Visual || ''}`,
        `Sonido: ${data.scene2Sound || ''}`
      ]
    },
    {
      heading: 'Escena 3: Desarrollo',
      level: 3,
      content: [
        `Script: ${data.scene3Script || ''}`,
        `Visual: ${data.scene3Visual || ''}`,
        `Sonido: ${data.scene3Sound || ''}`
      ]
    },
    {
      heading: 'Escena 4: CTA',
      level: 3,
      content: [
        `Script: ${data.scene4Script || ''}`,
        `Visual: ${data.scene4Visual || ''}`,
        `Sonido: ${data.scene4Sound || ''}`
      ]
    }
  ];

  const content: DocContent[] = [];
  
  sections.forEach(section => {
    // Añadir heading
    content.push({
      type: 'heading',
      attrs: { level: section.level },
      content: [{ type: 'text', text: section.heading }]
    });
    
    // Añadir contenido
    section.content.forEach(text => {
      if (text) {
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: text }]
        });
      }
    });
  });

  return {
    type: 'doc',
    content: content
  };
}

function parseEditorContent(doc: EditorJSON): AIContent {
  const text = doc.content?.flatMap((block) => {
    return block.content?.map((c) => c.text) || [];
  }).join('\n') || '';

  const result: AIContent = {
    objective: '',
    tone: '',
    valueProp1: '',
    valueProp2: '',
    hook: '',
    description: '',
    cta: '',
    scene1Script: '',
    scene1Visual: '',
    scene1Sound: '',
    scene2Script: '',
    scene2Visual: '',
    scene2Sound: '',
    scene3Script: '',
    scene3Visual: '',
    scene3Sound: '',
    scene4Script: '',
    scene4Visual: '',
    scene4Sound: '',
  };

  // Parseo mejorado para headings y estructura
  const lines = text.split('\n');
  let currentScene = '';
  
  lines.forEach(line => {
    // Detectar encabezados
    if (line.includes('Escena 1')) currentScene = 'scene1';
    else if (line.includes('Escena 2')) currentScene = 'scene2';
    else if (line.includes('Escena 3')) currentScene = 'scene3';
    else if (line.includes('Escena 4')) currentScene = 'scene4';
    
    // Parsear contenido
    const objectiveMatch = line.match(/Objetivo:\s*(.+)/i);
    const toneMatch = line.match(/Tono:\s*(.+)/i);
    const hookMatch = line.match(/Hook:\s*(.+)/i);
    const descMatch = line.match(/Descripción:\s*(.+)/i);
    const ctaMatch = line.match(/CTA:\s*(.+)/i);
    const scriptMatch = line.match(/Script:\s*(.+)/i);
    const visualMatch = line.match(/Visual:\s*(.+)/i);
    const soundMatch = line.match(/Sonido:\s*(.+)/i);

    if (objectiveMatch) result.objective = objectiveMatch[1];
    if (toneMatch) result.tone = toneMatch[1];
    if (hookMatch) result.hook = hookMatch[1];
    if (descMatch) result.description = descMatch[1];
    if (ctaMatch) result.cta = ctaMatch[1];

    if (scriptMatch && currentScene) {
      result[`${currentScene}Script`] = scriptMatch[1];
    }
    if (visualMatch && currentScene) {
      result[`${currentScene}Visual`] = visualMatch[1];
    }
    if (soundMatch && currentScene) {
      result[`${currentScene}Sound`] = soundMatch[1];
    }
  });

  return result;
}