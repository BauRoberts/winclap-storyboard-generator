//src/components/editor/PillSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  name: string;
}

interface PillSelectorProps {
  label: string;
  value: string;
  options: Option[];
  onChange?: (value: string) => void;
  color?: 'blue' | 'green' | 'purple' | 'pink';
  isLoading?: boolean;
  onAddNew?: () => void;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  default: 'text-gray-500',
};

export default function PillSelector({
  value,
  options,
  onChange = () => {},
  color = 'blue',
  isLoading = false,
  onAddNew,
}: PillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(opt => opt.id === value);
  const styleClass = selected ? colorClasses[color] : colorClasses.default;

  const handleSelect = (optionId: string) => {
    if (typeof onChange === 'function') {
      try {
        onChange(optionId);
      } catch (e) {
        console.error('Error calling onChange:', e);
      }
    }
    
    setIsOpen(false);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-colors',
          isLoading ? 'opacity-50 cursor-not-allowed' : '',
          selected ? `${styleClass} bg-opacity-90` : styleClass
        )}
      >
        {isLoading ? (
          'Cargando...'
        ) : (
          <>
            {selected ? selected.name : `Empty`}
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && !isLoading && (
        <div className="absolute z-50 mt-1 min-w-[180px] bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
          {options.map(option => (
            <div
              key={option.id}
              className="text-xs py-1.5 px-2 cursor-pointer hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.id);
              }}
            >
              {option.name}
            </div>
          ))}
          
          {onAddNew && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <div
                className="text-xs py-1.5 px-2 cursor-pointer hover:bg-gray-100 text-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onAddNew();
                }}
              >
                + Crear nuevo
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}