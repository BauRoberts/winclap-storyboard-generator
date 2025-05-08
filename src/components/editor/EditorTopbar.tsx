'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import PillSelector from './PillSelector';
import MultiPillSelector from './MultiPillSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClientForm } from '@/components/forms/ClientForm';
import { getClients } from '@/services/clientService';
import { getCreators } from '@/services/creatorService';

interface Option {
  id: string;
  name: string;
}

interface EditorTopbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  client: string;
  onClientChange: (newClient: string) => void;
  assets: string;
  onAssetsChange: (assets: string) => void;
  platform: string[];
  onPlatformChange: (platforms: string[]) => void;
  status: string;
  onStatusChange: (status: string) => void;
  creator: string;
  onCreatorChange: (creator: string) => void;
}

const mockAssets: Option[] = [
  { id: '1', name: '1' }, 
  { id: '2', name: '2' }, 
  { id: '3', name: '3' }, 
  { id: '4', name: '4' },
  { id: '5', name: '5' },
];

const mockPlatforms: Option[] = [
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'meta', name: 'Meta' },
];

const mockStatus: Option[] = [
  { id: 'not_started', name: 'Not started' },
  { id: 'in_progress', name: 'In progress' },
  { id: 'review', name: 'In review' },
  { id: 'done', name: 'Done' },
];

export default function EditorTopbar({
  title = 'Sin título',
  onTitleChange,
  client,
  onClientChange,
  assets,
  onAssetsChange,
  platform,
  onPlatformChange,
  status,
  onStatusChange,
  creator,
  onCreatorChange,
}: EditorTopbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Estados para los datos
  const [clients, setClients] = useState<Option[]>([]);
  const [creators, setCreators] = useState<Option[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  
  // Estados para los diálogos
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  // Cargar clientes
  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const data = await getClients();
      setClients(data.map(client => ({ id: client.id!, name: client.name })));
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Cargar creadores
  const loadCreators = async () => {
    setIsLoadingCreators(true);
    try {
      const data = await getCreators();
      setCreators(data.map(creator => ({ id: creator.id!, name: creator.name })));
    } catch (error) {
      console.error('Error loading creators:', error);
    } finally {
      setIsLoadingCreators(false);
    }
  };

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    loadClients();
    loadCreators();
  }, []);

  // Handlers para PillSelector con verificación
  const handleClientChangeWrapper = (newClient: string) => {
    if (typeof onClientChange === 'function') {
      onClientChange(newClient);
    } else {
      console.warn('onClientChange is not a function');
    }
  };

  const handleClientAdded = () => {
    loadClients();
    setIsClientDialogOpen(false);
  };

  const handleAssetsChangeWrapper = (newAssets: string) => {
    if (typeof onAssetsChange === 'function') {
      onAssetsChange(newAssets);
    } else {
      console.warn('onAssetsChange is not a function');
    }
  };

  const handleStatusChangeWrapper = (newStatus: string) => {
    if (typeof onStatusChange === 'function') {
      onStatusChange(newStatus);
    } else {
      console.warn('onStatusChange is not a function');
    }
  };

  const handleCreatorChangeWrapper = (newCreator: string) => {
    if (typeof onCreatorChange === 'function') {
      onCreatorChange(newCreator);
    } else {
      console.warn('onCreatorChange is not a function');
    }
  };

  // Handler para MultiPillSelector
  const handlePlatformChangeWrapper = (newPlatform: string[]) => {
    if (typeof onPlatformChange === 'function') {
      onPlatformChange(newPlatform);
    } else {
      console.warn('onPlatformChange is not a function');
    }
  };

  // Título editable
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
    if (typeof onTitleChange === 'function') {
      onTitleChange(titleValue);
    }
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
    <div className="editor-topbar py-6 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Título editable */}
        <div ref={titleRef} className="mb-8">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className="text-3xl font-bold outline-none border-b border-blue-400 pb-0.5 px-0 w-full bg-transparent"
              placeholder="Sin título"
            />
          ) : (
            <h1 
              className="text-3xl font-bold text-gray-800 cursor-text outline-none" 
              onClick={handleTitleClick}
            >
              {titleValue}
            </h1>
          )}
        </div>

        {/* Propiedades estilo Notion */}
        <div className="space-y-5">
          {/* Cliente */}
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Cliente
            </div>
            <div className="flex-1">
              <PillSelector
                label="Cliente"
                value={client}
                options={clients}
                onChange={handleClientChangeWrapper}
                color="blue"
                isLoading={isLoadingClients}
                onAddNew={() => setIsClientDialogOpen(true)}
              />
            </div>
          </div>

          {/* Assets */}
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Assets
            </div>
            <div className="flex-1">
              <PillSelector
                label="Assets"
                value={assets}
                options={mockAssets}
                onChange={handleAssetsChangeWrapper}
                color="pink"
              />
            </div>
          </div>

          {/* Plataforma */}
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 4L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Plataforma
            </div>
            <div className="flex-1">
              <MultiPillSelector
                label="Plataformas"
                values={platform}
                options={mockPlatforms}
                onChange={handlePlatformChangeWrapper}
                color="green"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Estado
            </div>
            <div className="flex-1">
              <PillSelector
                label="Estado"
                value={status}
                options={mockStatus}
                onChange={handleStatusChangeWrapper}
                color="purple"
              />
            </div>
          </div>

          {/* Creador */}
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Creador
            </div>
            <div className="flex-1">
              <PillSelector
                label="Creador"
                value={creator}
                options={creators}
                onChange={handleCreatorChangeWrapper}
                color="blue"
                isLoading={isLoadingCreators}
              />
            </div>
          </div>  
        </div>

        {/* Comments section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-gray-700 font-medium mb-3">Comments</h2>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              B
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client Form Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Completa los detalles del cliente a continuación.
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            onSuccess={handleClientAdded} 
            onCancel={() => setIsClientDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}