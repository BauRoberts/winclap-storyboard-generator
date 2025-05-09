// src/components/ui/AssetCounter.tsx
import React from 'react';
import { Image, FileCode, FileText, Film } from 'lucide-react';

interface AssetCounterProps {
  assets?: string | string[] | Record<string, number> | null;
  className?: string;
}

export const AssetCounter: React.FC<AssetCounterProps> = ({ assets, className = '' }) => {
  // Si no hay assets, mostramos un guión
  if (!assets) return <span className="text-gray-400">-</span>;
  
  // Procesamos diferentes formatos de entrada para extraer un número
  let count = 0;
  let assetTypes: Record<string, number> = {};
  
  if (typeof assets === 'string') {
    // Si es una cadena, intentamos analizar si es un número o un JSON
    try {
      // Intentamos parsearlo como JSON
      const parsed = JSON.parse(assets);
      if (Array.isArray(parsed)) {
        count = parsed.length;
        
        // Contamos por tipo
        parsed.forEach(asset => {
          const type = getAssetType(asset);
          assetTypes[type] = (assetTypes[type] || 0) + 1;
        });
      } else if (typeof parsed === 'object') {
        // Si es un objeto, sumamos los valores
        Object.values(parsed).forEach(val => {
          if (typeof val === 'number') count += val;
        });
        assetTypes = parsed;
      }
    } catch (e) {
      // Si no es un JSON, verificamos si es "Disponible"
      if (assets === 'Disponible' || assets.toLowerCase() === 'disponible') {
        count = 1;
        assetTypes = { 'generic': 1 };
      }
    }
  } else if (Array.isArray(assets)) {
    count = assets.length;
    
    // Contamos por tipo
    assets.forEach(asset => {
      const type = getAssetType(asset);
      assetTypes[type] = (assetTypes[type] || 0) + 1;
    });
  } else if (typeof assets === 'object') {
    // Si es un objeto, sumamos los valores
    Object.values(assets).forEach(val => {
      if (typeof val === 'number') count += val;
    });
    assetTypes = assets;
  }
  
  // Si no hay assets, mostramos un guión
  if (count === 0) return <span className="text-gray-400">-</span>;
  
  // Decidimos qué icono mostrar según los tipos de assets
  const icon = getIconForAssets(assetTypes);
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700">
        {icon}
      </div>
      <span className="font-medium">{count}</span>
    </div>
  );
};

// Determina el tipo de un asset basado en su extensión o metadata
function getAssetType(asset: any): string {
  if (typeof asset === 'string') {
    const ext = asset.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return 'image';
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
      return 'video';
    } else if (['doc', 'docx', 'pdf', 'txt'].includes(ext || '')) {
      return 'document';
    } else {
      return 'generic';
    }
  }
  return 'generic';
}

// Devuelve el icono adecuado según los tipos de assets
function getIconForAssets(types: Record<string, number>): React.ReactNode {
  if (types.image && types.image > 0) {
    return <Image className="h-4 w-4" />;
  } else if (types.video && types.video > 0) {
    return <Film className="h-4 w-4" />;
  } else if (types.document && types.document > 0) {
    return <FileText className="h-4 w-4" />;
  } else {
    return <FileCode className="h-4 w-4" />;
  }
}