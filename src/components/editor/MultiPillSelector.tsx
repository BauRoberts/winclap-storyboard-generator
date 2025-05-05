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
  onChange: (values: string[]) => void;
  color?: 'blue' | 'green' | 'purple' | 'pink';
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
};

export default function MultiPillSelector({
  label,
  values,
  options,
  onChange,
  color = 'green',
}: MultiPillSelectorProps) {
  const selectedOptions = options.filter(opt => values.includes(opt.id));
  const toggleValue = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter(v => v !== id));
    } else {
      onChange([...values, id]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 flex-wrap cursor-pointer">
          {selectedOptions.length === 0 ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              {label}
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
            </span>
          ) : (
            selectedOptions.map(opt => (
              <span
                key={opt.id}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mr-1 mb-1 transition-colors hover:opacity-80',
                  colorClasses[color]
                )}
              >
                {opt.name}
                <X
                  className="h-3.5 w-3.5 ml-2 cursor-pointer"
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
      <DropdownMenuContent className="min-w-[180px] bg-white border border-gray-200 shadow-lg">
        {options.map(option => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => toggleValue(option.id)}
            className="text-sm py-1.5 hover:bg-gray-100"
          >
            {values.includes(option.id) ? '✅ ' : ''}{option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
