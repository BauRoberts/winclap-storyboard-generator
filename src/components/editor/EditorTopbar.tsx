// src/components/editor/EditorTopbar.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Clock, Share2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface EditorTopbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  client: string;
  onClientChange: (newClient: string) => void;
}

const mockClients = [
  { id: 'cliente1', name: 'Coca Cola' },
  { id: 'cliente2', name: 'Pepsi' },
  { id: 'cliente3', name: 'Nike' },
  { id: 'cliente4', name: 'Adidas' },
  { id: 'cliente5', name: 'Samsung' },
];

export default function EditorTopbar({ 
  title = 'Sin título', 
  onTitleChange,
  client = '',
  onClientChange
}: EditorTopbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Estado para los dropdowns
  const [clientOpen, setClientOpen] = useState(false);
  const [phaseOpen, setPhaseOpen] = useState(false);

  // Lógica para edición del título
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

  // Efecto para eventos de click fuera del título
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && 
          titleRef.current && 
          !titleRef.current.contains(event.target as Node)) {
        handleTitleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, titleValue, handleTitleBlur]);

  // Funciones para seleccionar cliente
  const handleClientSelect = (id: string) => {
    onClientChange(id);
    setClientOpen(false);
  };

  // Simular selección de fase
  const handlePhaseSelect = (_phase: string) => {
    setPhaseOpen(false);
    // Aquí irías la lógica para cambiar la fase
  };

  return (
    <div className="editor-topbar pt-40 pb-4">

      {/* Ruta de breadcrumbs - Estilo Notion (ahora al principio) */}
      <div className="flex items-left text-xs text-gray-400 mb-3">
        <span className="hover:text-gray-500 transition-colors cursor-pointer">Tasks</span>
        <span className="mx-1">/</span>
        <span className="hover:text-gray-500 transition-colors cursor-pointer">Storyboards</span>
        <span className="mx-1">/</span>
        <span className="text-gray-500">{titleValue}</span>
      </div>
      
      <div className="flex flex-col">
        {/* Título editable */}
        <div ref={titleRef} className="mb-3">
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
            <h1 
              className="text-[1.5rem] font-medium text-gray-800 cursor-text outline-none" 
              onClick={handleTitleClick}
            >
              {titleValue}
            </h1>
          )}
        </div>

        {/* Selectores organizados verticalmente con más espacio */}
        <div className="flex flex-col space-y-3 mb-4">
          {/* Selector de cliente */}
          <DropdownMenu open={clientOpen} onOpenChange={setClientOpen}>
            <DropdownMenuTrigger asChild>
              <div className="inline-flex items-center cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-600 w-fit">
                {client ? 
                  mockClients.find(c => c.id === client)?.name : 
                  'Seleccionar cliente'
                }
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] bg-white border border-gray-200 shadow-lg">
              {mockClients.map(client => (
                <DropdownMenuItem 
                  key={client.id}
                  className="py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => handleClientSelect(client.id)}
                >
                  {client.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Selector de fase */}
          <DropdownMenu open={phaseOpen} onOpenChange={setPhaseOpen}>
            <DropdownMenuTrigger asChild>
              <div className="inline-flex items-center cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-600 w-fit">
                Planificación
                <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={() => handlePhaseSelect('planning')} className="py-1.5 text-sm hover:bg-gray-100">
                Planificación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePhaseSelect('creation')} className="py-1.5 text-sm hover:bg-gray-100">
                Creación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePhaseSelect('review')} className="py-1.5 text-sm hover:bg-gray-100">
                Revisión
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePhaseSelect('approved')} className="py-1.5 text-sm hover:bg-gray-100">
                Aprobado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Acciones a la derecha - Flotantes en la esquina */}
      <div className="absolute top-10 right-6 flex items-center text-gray-500 space-x-2">
        {/* Timestamp */}
        <div className="flex items-center mr-2 text-xs text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          <span>Editado hace 2 min</span>
        </div>

        {/* Botón de compartir */}
        <div className="px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer flex items-center text-sm text-gray-600 gap-1.5">
          <Share2 className="h-3.5 w-3.5 opacity-70" />
          <span>Compartir</span>
        </div>

        {/* Menú de opciones */}
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
  );
}