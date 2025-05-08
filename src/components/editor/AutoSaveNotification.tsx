'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveNotificationProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
}

/**
 * Componente que muestra una notificación sutil del estado de autoguardado
 */
const AutoSaveNotification: React.FC<AutoSaveNotificationProps> = ({ 
  status, 
  lastSaved 
}) => {
  // Estado para controlar la animación de desaparición
  const [visible, setVisible] = useState(status !== 'idle');
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Efecto para manejar la visibilidad basado en el estado
  useEffect(() => {
    const timeout = hideTimeout;
  
    if (timeout) {
      clearTimeout(timeout);
      setHideTimeout(null);
    }
  
    if (status !== 'idle') {
      setVisible(true);
  
      if (status === 'saved') {
        const t = setTimeout(() => {
          setVisible(false);
        }, 3000);
        setHideTimeout(t);
      }
    } else {
      const t = setTimeout(() => {
        setVisible(false);
      }, 300);
      setHideTimeout(t);
    }
  
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [status, hideTimeout]); 
  

  // No renderizar nada si estamos en estado 'idle' y no visible
  if (status === 'idle' && !visible) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed bottom-24 right-6 py-1.5 px-3 rounded-lg shadow-sm z-[100] text-xs font-medium",
        "transition-all duration-300 transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        status === 'saving' ? "bg-white text-gray-700 border border-gray-200" : 
        status === 'saved' ? "bg-green-50 text-green-700 border border-green-200" : 
        status === 'error' ? "bg-red-50 text-red-700 border border-red-200" : ""
      )}
    >
      <div className="flex items-center space-x-2">
        {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'saved' && <Check className="h-3 w-3" />}
        {status === 'error' && <AlertCircle className="h-3 w-3" />}
        
        <span>
          {status === 'saving' ? 'Guardando...' : 
           status === 'saved' ? 'Guardado' : 
           status === 'error' ? 'Error al guardar' : ''}
        </span>
        
        {lastSaved && status === 'saved' && (
          <span className="text-gray-500 text-xs ml-1">
            {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default AutoSaveNotification;