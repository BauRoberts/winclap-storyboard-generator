// src/components/ui/CreatorAvatar.tsx
import React from 'react';

interface CreatorAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CreatorAvatar: React.FC<CreatorAvatarProps> = ({ 
  name, 
  imageUrl, 
  size = 'md',
  className = ''
}) => {
  // Si no hay nombre o imagen, mostramos un placeholder
  if (!name && !imageUrl) return <span className="text-gray-400">-</span>;
  
  // Obtenemos las iniciales del nombre
  const initials = name
    ? name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';
  
  // Determinamos el tamaño
  const sizeMap = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  const sizeClass = sizeMap[size];
  
  // Determinamos el color de fondo basado en el nombre (para consistencia)
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];
  
  // Generamos un índice basado en el nombre para elegir un color consistente
  const colorIndex = name
    ? name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;
  
  const bgColor = colors[colorIndex];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || 'Creator'}
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClass} rounded-full ${bgColor} text-white flex items-center justify-center font-medium`}>
          {initials}
        </div>
      )}
      {name && <span className="text-sm truncate">{name}</span>}
    </div>
  );
};