// ✅ /src/components/editor/editor.tsx — Tiptap como editor tipo Notion
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

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
  [key: string]: string; // Para cualquier otra propiedad que pueda tener
}

interface EditorJSON {
  type: string;
  content?: Array<{
    type: string;
    content?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

interface RichEditorProps {
  initialContent: AIContent;
  onChange: (json: AIContent) => void;
}

export default function RichEditor({ initialContent, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribí aquí el contenido generado...'
      }),
    ],
    content: formatAsDoc(initialContent),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] border border-gray-200 rounded-md p-4 bg-white',
      },
    },
    onUpdate({ editor }) {
      onChange?.(parseEditorContent(editor.getJSON() as EditorJSON));
    },
  });

  return <EditorContent editor={editor} />;
}

function formatAsDoc(data: AIContent) {
  return {
    type: 'doc',
    content: [
      ...toParagraph(`🎯 Objetivo: ${data.objective}`),
      ...toParagraph(`🧠 Tono: ${data.tone}`),
      ...toParagraph(`💡 Value Prop 1: ${data.valueProp1}`),
      ...toParagraph(`💡 Value Prop 2: ${data.valueProp2}`),
      ...toParagraph(`📢 Hook: ${data.hook}`),
      ...toParagraph(`📝 Descripción: ${data.description}`),
      ...toParagraph(`📣 CTA: ${data.cta}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 Escena 1:`),
      ...toParagraph(`Script: ${data.scene1Script}`),
      ...toParagraph(`Visual: ${data.scene1Visual}`),
      ...toParagraph(`Sonido: ${data.scene1Sound}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 Escena 2:`),
      ...toParagraph(`Script: ${data.scene2Script}`),
      ...toParagraph(`Visual: ${data.scene2Visual}`),
      ...toParagraph(`Sonido: ${data.scene2Sound}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 Escena 3:`),
      ...toParagraph(`Script: ${data.scene3Script}`),
      ...toParagraph(`Visual: ${data.scene3Visual}`),
      ...toParagraph(`Sonido: ${data.scene3Sound}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 Escena 4 (CTA):`),
      ...toParagraph(`Script: ${data.scene4Script}`),
      ...toParagraph(`Visual: ${data.scene4Visual}`),
      ...toParagraph(`Sonido: ${data.scene4Sound}`),
    ]
  };
}

function toParagraph(text: string) {
  return text ? [{ type: 'paragraph', content: [{ type: 'text', text }] }] : [];
}

function parseEditorContent(doc: EditorJSON): AIContent {
    const lines = doc.content?.flatMap((block) => {
      return block.content?.map((c) => c.text) || [];
    }).filter(Boolean) || []; 

  const obj: Record<string, string> = {};
  lines.forEach((line) => {
    const match = line.match(/^(.+?):\s*(.+)$/);
    if (match) {
      const key = match[1].toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
      obj[key] = match[2];
    }
  });

  return {
    objective: obj['objetivo'] || '',
    tone: obj['tono'] || '',
    valueProp1: obj['valueprop1'] || '',
    valueProp2: obj['valueprop2'] || '',
    hook: obj['hook'] || '',
    description: obj['descripción'] || '',
    cta: obj['cta'] || '',
    scene1Script: obj['script'] || '',
    scene1Visual: obj['visual'] || '',
    scene1Sound: obj['sonido'] || '',
    scene2Script: obj['script1'] || '',
    scene2Visual: obj['visual1'] || '',
    scene2Sound: obj['sonido1'] || '',
    scene3Script: obj['script2'] || '',
    scene3Visual: obj['visual2'] || '',
    scene3Sound: obj['sonido2'] || '',
    scene4Script: obj['script3'] || '',
    scene4Visual: obj['visual3'] || '',
    scene4Sound: obj['sonido3'] || ''
  };
}