// src/components/ui/StatusPill.tsx
import React from 'react';
import { Clock, Check, RefreshCcw, FileText, AlertCircle } from 'lucide-react';

interface StatusPillProps {
  status?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  // Si no hay estado, mostramos "Draft" por defecto
  const normalizedStatus = !status ? 'draft' : status.toLowerCase();
  
  // Configuración según el estado
  const config = getStatusConfig(normalizedStatus);
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <span className="w-2 h-2 rounded-full bg-black opacity-80"></span>
      <span>{config.label}</span>
      {config.icon}
    </div>
  );
};

function getStatusConfig(status: string) {
  switch(status) {
    case 'aprobado':
    case 'done':
      return {
        label: 'Aprobado',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: <Check className="h-3 w-3" />
      };
    case 'en revisión':
    case 'review':
      return {
        label: 'En Revisión',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        icon: <RefreshCcw className="h-3 w-3" />
      };
    case 'planificación':
    case 'draft':
    case 'not_started':
      return {
        label: 'Planificación',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: <FileText className="h-3 w-3" />
      };
    case 'creación':
    case 'in_progress':
      return {
        label: 'En Creación',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        icon: <Clock className="h-3 w-3" />
      };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: <AlertCircle className="h-3 w-3" />
      };
  }
}