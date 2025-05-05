'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Commands from './tiptap/slash-commands';
import { FloatingToolbar } from './tiptap/FloatingToolbar';

interface AIContent {
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

interface EditorJSON {
  type: string;
  content?: Array<{
    type: string;
    attrs?: Record<string, any>;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: Record<string, any>;
    }>;
  }>;
}

interface RichEditorProps {
  initialContent: AIContent;
  onChange: (json: AIContent, text?: string) => void;
}

interface DocContent {
  type: string;
  attrs?: Record<string, any>;
  content?: Array<{
    type: string;
    text?: string;
    attrs?: Record<string, any>;
  }>;
}

interface DocStructure {
  type: string;
  content: DocContent[];
}

export default function RichEditor({ initialContent, onChange }: RichEditorProps) {
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
    content: `<p></p>`, // Asegurar que el editor siempre tiene contenido editable
    editorProps: {
      attributes: {
        class: 'prose prose-base sm:prose lg:prose-lg dark:prose-invert focus:outline-none w-full min-h-[600px] p-8 notion-like',
        contenteditable: 'true', // Asegurar que todo es editable
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON() as EditorJSON;
      const text = editor.getText();
      onChange?.(parseEditorContent(json), text);
    },
  });

  // Cargar contenido inicial SOLO una vez cuando se monta el editor
  useEffect(() => {
    if (editor && initialContent && Object.keys(initialContent).some(key => initialContent[key])) {
      const doc = formatAsDoc(initialContent);
      editor.commands.setContent(doc);
    }
  }, [editor]);

  return (
    <div className="relative w-full">
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
}

// Resto del código permanece igual...
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
        `Objetivo: ${data.objective}`,
        `Tono: ${data.tone}`,
        `Propuesta de Valor 1: ${data.valueProp1}`,
        `Propuesta de Valor 2: ${data.valueProp2}`
      ]
    },
    {
      heading: '🎬 Storyboard',
      level: 2,
      content: [
        `Hook: ${data.hook}`,
        `Descripción: ${data.description}`,
        `CTA: ${data.cta}`
      ]
    },
    {
      heading: 'Escena 1: Hook',
      level: 3,
      content: [
        `Script: ${data.scene1Script}`,
        `Visual: ${data.scene1Visual}`,
        `Sonido: ${data.scene1Sound}`
      ]
    },
    {
      heading: 'Escena 2: Desarrollo',
      level: 3,
      content: [
        `Script: ${data.scene2Script}`,
        `Visual: ${data.scene2Visual}`,
        `Sonido: ${data.scene2Sound}`
      ]
    },
    {
      heading: 'Escena 3: Desarrollo',
      level: 3,
      content: [
        `Script: ${data.scene3Script}`,
        `Visual: ${data.scene3Visual}`,
        `Sonido: ${data.scene3Sound}`
      ]
    },
    {
      heading: 'Escena 4: CTA',
      level: 3,
      content: [
        `Script: ${data.scene4Script}`,
        `Visual: ${data.scene4Visual}`,
        `Sonido: ${data.scene4Sound}`
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