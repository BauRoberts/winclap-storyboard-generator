// src/components/ui/PlatformLogo.tsx
import React from 'react';
import { Instagram, Youtube, Twitter, Linkedin, Facebook, Globe } from 'lucide-react';

// Mapa de plataformas a sus respectivos iconos/logos
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4 text-pink-600" />,
  youtube: <Youtube className="h-4 w-4 text-red-600" />,
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  twitter: <Twitter className="h-4 w-4 text-blue-400" />,
  x: <Twitter className="h-4 w-4 text-black" />,
  linkedin: <Linkedin className="h-4 w-4 text-blue-700" />,
  facebook: <Facebook className="h-4 w-4 text-blue-600" />,
  web: <Globe className="h-4 w-4 text-gray-600" />,
};

interface PlatformLogoProps {
  platform: string;
  className?: string;
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({ platform, className = '' }) => {
  const normalizedPlatform = platform.toLowerCase().trim();
  const icon = PLATFORM_ICONS[normalizedPlatform] || <Globe className="h-4 w-4 text-gray-600" />;
  
  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-gray-100 p-1.5 ${className}`} title={platform}>
      {icon}
    </div>
  );
};

interface PlatformDisplayProps {
  platforms?: string[] | null;
}

export const PlatformDisplay: React.FC<PlatformDisplayProps> = ({ platforms }) => {
  if (!platforms || platforms.length === 0) return <span className="text-gray-400">-</span>;
  
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform, index) => (
        <PlatformLogo key={index} platform={platform} />
      ))}
    </div>
  );
};