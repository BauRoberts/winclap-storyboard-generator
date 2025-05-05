'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  onChange: (value: string) => void;
  color?: 'blue' | 'green' | 'purple' | 'pink';
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
};

export default function PillSelector({
  label,
  value,
  options,
  onChange,
  color = 'blue',
}: PillSelectorProps) {
  const selected = options.find(opt => opt.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={cn(
          'inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer font-medium transition-colors hover:bg-opacity-80 w-fit',
          colorClasses[color],
        )}>
          {selected ? selected.name : `Seleccionar ${label}`}
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[180px] bg-white border border-gray-200 shadow-lg">
        {options.map(option => (
          <DropdownMenuItem
            key={option.id}
            className="text-sm py-1.5 cursor-pointer hover:bg-gray-100"
            onClick={() => onChange(option.id)}
          >
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
