'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Clock, Share2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import PillSelector from './PillSelector';
import MultiPillSelector from './MultiPillSelector';

interface Option {
  id: string;
  name: string;
}

interface EditorTopbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  client: string;
  onClientChange: (newClient: string) => void;
  platform: string[];
  onPlatformChange: (platforms: string[]) => void;
  template: string;
  onTemplateChange: (template: string) => void;
  assetCount: string;
  onAssetCountChange: (count: string) => void;
}

const mockClients: Option[] = [
  { id: 'cliente1', name: 'Coca Cola' },
  { id: 'cliente2', name: 'Pepsi' },
  { id: 'cliente3', name: 'Nike' },
  { id: 'cliente4', name: 'Adidas' },
  { id: 'cliente5', name: 'Samsung' },
];

const mockPlatforms: Option[] = [
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'meta', name: 'Meta' },
];

const mockTemplates: Option[] = [
  { id: 'templateA', name: 'Gancho → Producto → CTA' },
  { id: 'templateB', name: 'Problema → Solución' },
  { id: 'templateC', name: 'Testimonio → Producto → CTA' },
];

export default function EditorTopbar({
  title = 'Sin título',
  onTitleChange,
  client,
  onClientChange,
  platform,
  onPlatformChange,
  template,
  onTemplateChange,
  assetCount,
  onAssetCountChange,
}: EditorTopbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = useCallback(() => {
    if (titleValue.trim() === '') {
      setTitleValue('Sin título');
    }
    setIsEditing(false);
    onTitleChange(titleValue);
  }, [titleValue, onTitleChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && titleRef.current && !titleRef.current.contains(event.target as Node)) {
        handleTitleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, titleValue, handleTitleBlur]);

  return (
    <div className="editor-topbar pb-4 relative">
      <div className="fixed top-0 inset-x-0 bg-white z-10" style={{ left: '232px' }}>
        <div className="flex justify-between items-center py-3 px-6 border-b border-gray-100">
          <div className="flex items-center text-xs text-gray-400">
            <span className="hover:text-gray-500 transition-colors cursor-pointer">Tasks</span>
            <span className="mx-1">/</span>
            <span className="hover:text-gray-500 transition-colors cursor-pointer">Storyboards</span>
            <span className="mx-1">/</span>
            <span className="text-gray-500">{titleValue}</span>
          </div>

          <div className="flex items-center text-gray-500 space-x-2">
            <div className="flex items-center mr-2 text-xs text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>Editado hace 2 min</span>
            </div>

            <div className="px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer flex items-center text-sm text-gray-600 gap-1.5">
              <Share2 className="h-3.5 w-3.5 opacity-70" />
              <span>Compartir</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-gray-100 rounded-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-1 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem className="text-xs py-1.5 hover:bg-gray-100">Exportar</DropdownMenuItem>
                <DropdownMenuItem className="text-xs py-1.5 hover:bg-gray-100">Duplicar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs py-1.5 text-red-500 hover:bg-gray-100">Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="pt-14"></div>

      <div className="flex flex-col mt-8 max-w-3xl mx-auto px-4">
        <div ref={titleRef} className="mb-4">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className="text-[1.5rem] font-medium outline-none border-b border-blue-400 pb-0.5 px-0 w-[300px] bg-transparent"
              placeholder="Sin título"
            />
          ) : (
            <h1 className="text-[1.5rem] font-medium text-gray-800 cursor-text outline-none" onClick={handleTitleClick}>
              {titleValue}
            </h1>
          )}
        </div>

        {/* Nuevos Selectores */}
        <div className="flex flex-col gap-4 mt-4">
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 font-medium">Cliente</span>
    <PillSelector
      label="Cliente"
      value={client}
      options={mockClients}
      onChange={onClientChange}
      color="blue"
    />
  </div>

  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 font-medium">Plataformas</span>
    <MultiPillSelector
      label="Plataformas"
      values={platform}
      options={mockPlatforms}
      onChange={onPlatformChange}
      color="green"
    />
  </div>

  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 font-medium">Template</span>
    <PillSelector
      label="Template"
      value={template}
      options={mockTemplates}
      onChange={onTemplateChange}
      color="purple"
    />
  </div>

  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 font-medium">Cantidad de Assets</span>
    <PillSelector
      label="Assets"
      value={assetCount}
      options={[{ id: '1', name: '1' }, { id: '2', name: '2' }, { id: '3', name: '3' }, { id: '4', name: '4' }]}
      onChange={onAssetCountChange}
      color="pink"
    />
  </div>
</div>

      </div>
    </div>
  );
}
