// MultiPillSelector.tsx
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  name: string;
}

interface MultiPillSelectorProps {
  label: string;
  values: string[];
  options: Option[];
  onChange?: (values: string[]) => void; // Haciendo onChange opcional
  color?: 'blue' | 'green' | 'purple' | 'pink';
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  default: 'text-gray-500',
};

export default function MultiPillSelector({
  values,
  options,
  onChange = () => {}, // Valor por defecto como función vacía
  color = 'green',
}: MultiPillSelectorProps) {
  const selectedOptions = options.filter(opt => values.includes(opt.id));
  
  const toggleValue = (id: string) => {
    // Verificar que onChange existe antes de llamarlo
    if (typeof onChange === 'function') {
      if (values.includes(id)) {
        onChange(values.filter(v => v !== id));
      } else {
        onChange([...values, id]);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 flex-wrap cursor-pointer">
          {selectedOptions.length === 0 ? (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs text-gray-500 transition-colors">
              Empty
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </span>
          ) : (
            selectedOptions.map(opt => (
              <span
                key={opt.id}
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-1 mb-1 transition-colors',
                  colorClasses[color]
                )}
              >
                {opt.name}
                <X
                  className="h-3 w-3 ml-1.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(opt.id);
                  }}
                />
              </span>
            ))
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="min-w-[180px] bg-white border border-gray-200 shadow-lg">
        {options.map(option => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => toggleValue(option.id)}
            className="text-xs py-1.5 hover:bg-gray-100"
          >
            {values.includes(option.id) ? '✓ ' : ''}{option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}