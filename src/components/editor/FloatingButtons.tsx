// src/components/editor/FloatingButtons.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Save, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingButtonsProps {
  onReorganize: () => Promise<void>;
  onSave?: () => Promise<void>;
  isReorganizing: boolean;
  isSaving?: boolean;
  charactersCount: number;
  disabled?: {
    reorganize?: boolean;
    save?: boolean;
  };
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  // Nueva prop para controlar si mostrar el botón guardar
  showSaveButton?: boolean;
}

export default function FloatingButtons({
  onReorganize,
  onSave,
  isReorganizing,
  isSaving = false,
  charactersCount,
  disabled = {},
  autoSaveStatus = 'idle',
  lastSaved = null,
  // Por defecto, no mostramos el botón de guardar ya que tenemos autoguardado
  showSaveButton = false
}: FloatingButtonsProps) {
  // Estado para mostrar info sobre caracteres
  const [showCharCount, setShowCharCount] = useState(false);
  
  // Renderizar el indicador de autoguardado
  const renderAutoSaveStatus = () => {
    if (autoSaveStatus === 'idle') return null;
    
    let icon = null;
    let message = '';
    let className = '';
    
    switch (autoSaveStatus) {
      case 'saving':
        icon = <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
        message = 'Guardando...';
        className = 'text-gray-500';
        break;
      case 'saved':
        icon = <Check className="h-3 w-3 mr-1" />;
        message = 'Guardado';
        className = 'text-green-500';
        break;
      case 'error':
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        message = 'Error al guardar';
        className = 'text-red-500';
        break;
    }
    
    return (
      <div className={`absolute -top-8 right-0 text-xs py-1.5 px-3 flex items-center bg-white shadow-md rounded-md z-50 ${className}`}>
        {icon}
        {message}
        {lastSaved && autoSaveStatus === 'saved' && (
          <span className="ml-1 text-gray-400">
            {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    );
  };
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3">
      {/* Contador de caracteres */}
      {showCharCount && (
        <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full opacity-80 transform transition-all duration-200 ease-in-out">
          {charactersCount} caracteres
        </div>
      )}
      
      {/* Botón para guardar (solo se muestra si showSaveButton es true) */}
      {showSaveButton && onSave && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  onClick={onSave}
                  disabled={isSaving || disabled.save}
                  className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-transform hover:scale-105"
                  size="default"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
                {renderAutoSaveStatus()}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Guardar manualmente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Botón para reorganizar */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onReorganize}
              disabled={isReorganizing || disabled.reorganize}
              className="bg-black text-white hover:bg-gray-800 shadow-lg transition-transform hover:scale-105"
              size="default"
              onMouseOver={() => setShowCharCount(true)}
              onMouseLeave={() => setShowCharCount(false)}
            >
              {isReorganizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reorganizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Reorganizar con IA
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Estructurar tu texto y preparar para slides</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}