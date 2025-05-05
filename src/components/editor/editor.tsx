'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

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
    content?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

interface RichEditorProps {
  initialContent: AIContent;
  onChange: (json: AIContent, text?: string) => void;
}

export default function RichEditor({ initialContent, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe o pega tu briefing aquí...\n\nPor ejemplo:\n- Cliente: Nike\n- Objetivo: Aumentar descargas de la app\n- Target: Jóvenes 18-24 años\n- Mensaje: Encuentra las zapatillas perfectas en segundos'
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] border border-gray-200 rounded-md p-4 bg-white',
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON() as EditorJSON;
      const text = editor.getText();
      onChange?.(parseEditorContent(json), text);
    },
  });

  // Actualizar el contenido del editor cuando initialContent cambie
  useEffect(() => {
    if (editor && initialContent && Object.keys(initialContent).some(key => initialContent[key])) {
      editor.commands.setContent(formatAsDoc(initialContent));
    }
  }, [editor, initialContent]);

  return <EditorContent editor={editor} />;
}

// Formato del contenido reorganizado
function formatAsDoc(data: AIContent) {
  return {
    type: 'doc',
    content: [
      ...toParagraph(`📋 OBJETIVO: ${data.objective}`),
      ...toParagraph(`🎯 TONO: ${data.tone}`),
      ...toParagraph(`💡 PROPUESTA DE VALOR 1: ${data.valueProp1}`),
      ...toParagraph(`💡 PROPUESTA DE VALOR 2: ${data.valueProp2}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 STORYBOARD`),
      ...toParagraph(''),
      ...toParagraph(`🪝 HOOK: ${data.hook}`),
      ...toParagraph(`📝 DESCRIPCIÓN: ${data.description}`),
      ...toParagraph(`📣 CTA: ${data.cta}`),
      ...toParagraph(''),
      ...toParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━'),
      ...toParagraph(''),
      ...toParagraph(`🎬 ESCENA 1 (Hook)`),
      ...toParagraph(`Script: ${data.scene1Script}`),
      ...toParagraph(`Visual: ${data.scene1Visual}`),
      ...toParagraph(`Sonido: ${data.scene1Sound}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 ESCENA 2 (Desarrollo)`),
      ...toParagraph(`Script: ${data.scene2Script}`),
      ...toParagraph(`Visual: ${data.scene2Visual}`),
      ...toParagraph(`Sonido: ${data.scene2Sound}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 ESCENA 3 (Desarrollo)`),
      ...toParagraph(`Script: ${data.scene3Script}`),
      ...toParagraph(`Visual: ${data.scene3Visual}`),
      ...toParagraph(`Sonido: ${data.scene3Sound}`),
      ...toParagraph(''),
      ...toParagraph(`🎬 ESCENA 4 (CTA)`),
      ...toParagraph(`Script: ${data.scene4Script}`),
      ...toParagraph(`Visual: ${data.scene4Visual}`),
      ...toParagraph(`Sonido: ${data.scene4Sound}`),
    ]
  };
}

function toParagraph(text: string) {
  return text ? [{ type: 'paragraph', content: [{ type: 'text', text }] }] : [];
}

// Parser simplificado para no interferir con el flujo libre
function parseEditorContent(doc: EditorJSON): AIContent {
  const text = doc.content?.flatMap((block) => {
    return block.content?.map((c) => c.text) || [];
  }).join('\n') || '';

  // Inicia con un objeto vacío que cumple con la interfaz
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

  // Solo intenta parsear si el texto tiene formato estructurado
  if (text.includes('OBJETIVO:') || text.includes('TONO:')) {
    // Parseo estructurado
    const lines = text.split('\n');
    lines.forEach(line => {
      const scriptMatch = line.match(/Script:\s*(.+)/i);
      const objectiveMatch = line.match(/OBJETIVO:\s*(.+)/i);
      const toneMatch = line.match(/TONO:\s*(.+)/i);
      const prop1Match = line.match(/PROPUESTA DE VALOR 1:\s*(.+)/i);
      const prop2Match = line.match(/PROPUESTA DE VALOR 2:\s*(.+)/i);
      const hookMatch = line.match(/HOOK:\s*(.+)/i);
      const descMatch = line.match(/DESCRIPCIÓN:\s*(.+)/i);
      const ctaMatch = line.match(/CTA:\s*(.+)/i);

      if (objectiveMatch) result.objective = objectiveMatch[1];
      if (toneMatch) result.tone = toneMatch[1];
      if (prop1Match) result.valueProp1 = prop1Match[1];
      if (prop2Match) result.valueProp2 = prop2Match[1];
      if (hookMatch) result.hook = hookMatch[1];
      if (descMatch) result.description = descMatch[1];
      if (ctaMatch) result.cta = ctaMatch[1];

      // Aquí deberíamos identificar a qué escena pertenece cada match
      // pero para simplificar, asumimos que aparecen en orden
      if (scriptMatch) {
        if (!result.scene1Script) result.scene1Script = scriptMatch[1];
        else if (!result.scene2Script) result.scene2Script = scriptMatch[1];
        else if (!result.scene3Script) result.scene3Script = scriptMatch[1];
        else if (!result.scene4Script) result.scene4Script = scriptMatch[1];
      }
      // Mismo patrón para visual y sound...
    });
  }

  return result;
}