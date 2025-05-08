// src/components/editor/FloatingButtons.tsx
'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Loader2, Save, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingButtonsProps {
  onReorganize: () => Promise<void>;
  onGenerate: () => Promise<void>;
  onSave?: () => Promise<void>;
  isReorganizing: boolean;
  isGenerating: boolean;
  isSaving?: boolean;
  charactersCount: number;
  disabled?: {
    reorganize?: boolean;
    generate?: boolean;
    save?: boolean;
  };
  viewMode?: 'single' | 'dual';
  // Nuevas props para autoguardado
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
}

export default function FloatingButtons({
  onReorganize,
  onGenerate,
  onSave,
  isReorganizing,
  isGenerating,
  isSaving = false,
  charactersCount,
  disabled = {},
  viewMode = 'single',
  autoSaveStatus = 'idle',
  lastSaved = null
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
      
      {/* Botón para guardar - visible en ambos modos */}
      {onSave && (
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
              <p>Guardar sin generar Slides</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Botón para reorganizar - solo visible en modo single */}
      {viewMode === 'single' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onReorganize}
                disabled={isReorganizing || disabled.reorganize}
                className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg transition-transform hover:scale-105"
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
              <p>Ordena tu texto con IA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Botón para generar storyboard - visible en ambos modos */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onGenerate}
              disabled={isGenerating || disabled.generate}
              className="bg-black text-white hover:bg-gray-800 shadow-lg transition-transform hover:scale-105"
              size="default"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generar Storyboard
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Genera el storyboard en Google Slides</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}