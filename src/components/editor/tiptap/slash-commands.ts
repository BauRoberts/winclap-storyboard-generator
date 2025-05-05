import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import CommandsList from './CommandsList';
import type { Editor, Range } from '@tiptap/core';

interface CommandProps {
  editor: Editor;
  range: Range;
}

interface SuggestionProps extends CommandProps {
  query: string;
  clientRect?: () => DOMRect | null;
}

const Command = Extension.create({
  name: 'slash-command',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const items = [
  {
    title: 'Heading 1',
    description: 'Título principal',
    searchTerms: ['h1', 'titulo'],
    icon: '📝',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Subtítulo',
    searchTerms: ['h2', 'subtitulo'],
    icon: '📋',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Encabezado menor',
    searchTerms: ['h3', 'encabezado'],
    icon: '📌',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Lista con viñetas',
    searchTerms: ['lista', 'bullet', 'viñetas'],
    icon: '•',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Lista numerada',
    searchTerms: ['lista', 'numbered', 'numerada'],
    icon: '1.',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
  },
  {
    title: 'Quote',
    description: 'Cita',
    searchTerms: ['quote', 'cita', 'bloque'],
    icon: '"',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: 'Code',
    description: 'Bloque de código',
    searchTerms: ['code', 'codigo', 'bloque'],
    icon: '</>',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock()
        .run();
    },
  },
  {
    title: 'Divider',
    description: 'Línea divisoria',
    searchTerms: ['divider', 'separador', 'linea'],
    icon: '─',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run();
    },
  },
  {
    title: 'Cliente',
    description: 'Plantilla para Cliente',
    searchTerms: ['cliente', 'template'],
    icon: '👤',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent('Cliente: ')
        .run();
    },
  },
  {
    title: 'Objetivo',
    description: 'Plantilla para Objetivo',
    searchTerms: ['objetivo', 'goal', 'template'],
    icon: '🎯',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent('Objetivo: ')
        .run();
    },
  },
  {
    title: 'Target',
    description: 'Plantilla para Target',
    searchTerms: ['target', 'audiencia', 'template'],
    icon: '👥',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent('Target: ')
        .run();
    },
  },
  {
    title: 'Hook',
    description: 'Plantilla para Hook',
    searchTerms: ['hook', 'gancho', 'template'],
    icon: '🪝',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent('Hook: ')
        .run();
    },
  },
];

export const Commands = Command.configure({
  suggestion: {
    items: ({ query }: { query: string }) => {
      return items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.searchTerms.some(term => term.toLowerCase().includes(query.toLowerCase()))
      );
    },
    render: () => {
      let component: any = null;
      let popup: any = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(CommandsList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props: any) {
          if (component) {
            component.updateProps(props);
          }

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  },
});

export default Commands;