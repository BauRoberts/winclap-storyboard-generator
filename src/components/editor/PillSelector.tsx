'use client';

import React, { useState } from 'react';
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
  onChange?: (value: string) => void; // Hacer onChange opcional con ?
  color?: 'blue' | 'green' | 'purple' | 'pink';
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
  onChange = () => {}, // Asignar un valor por defecto
  color = 'blue',
}: PillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(opt => opt.id === value);
  const styleClass = selected ? colorClasses[color] : colorClasses.default;

  const handleSelect = (optionId: string) => {
    console.log(`PillSelector - Selected option: ${optionId}`);
    
    // Verificar explícitamente si onChange es una función
    if (typeof onChange === 'function') {
      try {
        onChange(optionId);
      } catch (e) {
        console.error('Error calling onChange:', e);
      }
    } else {
      console.warn('onChange is not a function:', onChange);
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center px-2 py-1 rounded text-xs cursor-pointer transition-colors',
          selected ? `${styleClass} bg-opacity-90` : styleClass
        )}
      >
        {selected ? selected.name : `Empty`}
        <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 min-w-[180px] bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
          {options.map(option => (
            <div
              key={option.id}
              className="text-xs py-1.5 px-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option.id)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}