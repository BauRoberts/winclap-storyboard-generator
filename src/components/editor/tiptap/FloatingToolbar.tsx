import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Code, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface FloatingToolbarProps {
  editor: Editor;
}

export const FloatingToolbar = ({ editor }: FloatingToolbarProps) => {
  const setLink = () => {
    const url = window.prompt('Ingresa la URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg shadow-sm border border-gray-200 bg-white">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        tooltip="Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      
      <div className="w-px h-5 bg-gray-200 mx-1" />
      
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        tooltip="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      
      <div className="w-px h-5 bg-gray-200 mx-1" />
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        tooltip="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        tooltip="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        tooltip="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  tooltip: string;
}

const ToolbarButton = ({ children, onClick, isActive, tooltip }: ToolbarButtonProps) => {
  return (
    <button
      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-100 text-black' : 'text-gray-600'
      }`}
      onClick={onClick}
      title={tooltip}
      type="button"
    >
      {children}
    </button>
  );
};