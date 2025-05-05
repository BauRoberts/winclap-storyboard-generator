// src/components/editor/FloatingButtons.tsx
'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
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
  isReorganizing: boolean;
  isGenerating: boolean;
  charactersCount: number;
  disabled?: {
    reorganize?: boolean;
    generate?: boolean;
  };
}

export default function FloatingButtons({
  onReorganize,
  onGenerate,
  isReorganizing,
  isGenerating,
  charactersCount,
  disabled = {}
}: FloatingButtonsProps) {
  // Estado para mostrar info sobre caracteres
  const [showCharCount, setShowCharCount] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3">
      {/* Contador de caracteres */}
      {showCharCount && (
        <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full opacity-80 transform transition-all duration-200 ease-in-out">
          {charactersCount} caracteres
        </div>
      )}
      
      {/* Botón para reorganizar */}
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

      {/* Botón para generar storyboard */}
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