'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Settings,
  Building2,
  PlusCircle,
  ChevronLeft,
  Users,
  FileImage,
  LogOut,
  LucideIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Define tipos para las categorías de iconos
type IconType = 'navigation' | 'newButton' | 'collapse' | 'logout';

// =====================================
// AJUSTA ESTOS VALORES PARA LOS ICONOS:
// =====================================
const ICON_SIZES = {
  // Tamaños para la barra expandida
  expanded: {
    navigation: 22,    // Iconos de navegación normal (antes 16)
    newButton: 20,     // Botón de New Storyboard (antes 20)
    collapse: 18,      // Botón de colapsar (antes 16)
    logout: 18         // Botón de cerrar sesión (antes 16)
  },
  // Tamaños para la barra colapsada
  collapsed: {
    navigation: 18,    // Iconos de navegación normal (antes 22)
    newButton: 24,     // Botón de New Storyboard (antes 24)
    collapse: 22,      // Botón de colapsar (antes 22)
    logout: 22         // Botón de cerrar sesión (antes 22)
  }
};

// Estilos inline para asegurar prioridad
const getIconStyle = (isExpanded: boolean, type: IconType) => {
  const size = isExpanded 
    ? ICON_SIZES.expanded[type] 
    : ICON_SIZES.collapsed[type];
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`
  };
};

interface CustomIconProps {
  Icon: LucideIcon;
  isExpanded: boolean;
  type?: IconType;
  className?: string;
  extraClass?: string;
}

// Estilos CSS para aplicar directamente como un componente
const CustomIcon = ({ 
  Icon, 
  isExpanded, 
  type = 'navigation', 
  className = '', 
  extraClass = '' 
}: CustomIconProps) => (
  <div 
    style={getIconStyle(isExpanded, type)} 
    className={`flex items-center justify-center ${extraClass}`}
  >
    <Icon 
      className={`${className} icon-override`} 
      size={isExpanded ? ICON_SIZES.expanded[type] : ICON_SIZES.collapsed[type]} 
    />
  </div>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { data: _session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [_isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Aplicar estilos directamente a los SVG cuando se monta el componente y cuando cambia el estado de expansión
    const applySvgStyles = () => {
      const svgElements = document.querySelectorAll('.icon-override');
      svgElements.forEach(svg => {
        svg.setAttribute('stroke-width', '1.75');
      });
    };

    applySvgStyles();
    
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsExpanded(false);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [isExpanded]);

  interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
  }

  const inicioNav: NavItem[] = [
    { name: 'Storyboards', href: '/storyboards', icon: RefreshCw },
    { name: 'Inspiration Board', href: '/inspiration', icon: FileImage },
  ];

  const clientesNav: NavItem[] = [
    { name: 'Clientes', href: '/clients', icon: Building2 },
  ];

  const creadoresNav: NavItem[] = [
    { name: 'Creadores', href: '/creators', icon: Users },
  ];

  const configNav: NavItem[] = [
    { name: 'Configuración', href: '/config', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  const sidebarVariants = {
    expanded: { width: '15rem' },
    collapsed: { width: '3rem' }
  };

  const textVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: {
      opacity: 0,
      display: 'none',
      transition: { display: { delay: 0.2 } }
    }
  };

  const iconVariants = {
    expanded: { rotate: 0 },
    collapsed: { rotate: 180 }
  };

  interface NavItemProps {
    item: NavItem;
    className?: string;
  }

  const NavItem = ({ item, className = '' }: NavItemProps) => (
    <li key={item.name}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium transition-colors ${className}
                ${isActive(item.href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                ${!isExpanded ? 'justify-center px-1 py-3' : ''}
              `}
            >
              <CustomIcon
                Icon={item.icon}
                isExpanded={isExpanded}
                type="navigation"
                className={isExpanded ? 'mr-2' : ''}
              />
              <motion.span
                variants={textVariants}
                initial={isExpanded ? 'expanded' : 'collapsed'}
                animate={isExpanded ? 'expanded' : 'collapsed'}
              >
                {item.name}
              </motion.span>
            </Link>
          </TooltipTrigger>
          {!isExpanded && (
            <TooltipContent side="right">
              {item.name}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </li>
  );

  return (
    <motion.div
      className="flex h-screen flex-col border-r border-gray-200 bg-white overflow-hidden"
      variants={sidebarVariants}
      initial={isExpanded ? 'expanded' : 'collapsed'}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header with Logo - Mejorado para centrar */}
      <div className="flex h-14 items-center border-b border-gray-200 px-3 relative">
        {isExpanded ? (
          <div className="w-full flex justify-center items-center">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Winclap Logo"
                width={140}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="w-0 opacity-0"></div>
        )}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-full p-0.5 hover:bg-gray-100 absolute ${isExpanded ? 'right-3' : 'left-3'}`}
          variants={iconVariants}
          initial={isExpanded ? 'expanded' : 'collapsed'}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.3 }}
        >
          <div 
            style={getIconStyle(isExpanded, 'collapse')} 
            className="flex items-center justify-center"
          >
            <ChevronLeft 
              className="icon-override" 
              size={isExpanded ? ICON_SIZES.expanded.collapse : ICON_SIZES.collapsed.collapse} 
            />
          </div>
        </motion.button>
      </div>

      {/* Create New Button - ICONOS MÁS GRANDES */}
      <div className="px-2 pt-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
            <Button
                className={`w-full bg-black hover:bg-gray-800 text-white ${!isExpanded ? 'justify-center p-2' : 'justify-start'}`}
                asChild
                variant="default"
                size={isExpanded ? 'default' : 'icon'}
              >
                <Link href="/editor?new=true" className="flex items-center">
                  <div 
                    style={getIconStyle(isExpanded, 'newButton')} 
                    className="flex items-center justify-center"
                  >
                    <PlusCircle 
                      className="icon-override" 
                      size={isExpanded ? ICON_SIZES.expanded.newButton : ICON_SIZES.collapsed.newButton} 
                    />
                  </div>
                  <motion.span
                    className="ml-2"
                    variants={textVariants}
                    initial={isExpanded ? 'expanded' : 'collapsed'}
                    animate={isExpanded ? 'expanded' : 'collapsed'}
                  >
                    New Storyboard
                  </motion.span>
                </Link>
              </Button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right">
                New storyboard
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 flex flex-col">
        <div className="flex-grow">
          {/* Inicio */}
          <div className="mt-4">
            <motion.h3
              className="mb-1 px-3 text-xs font-medium text-gray-400"
              variants={textVariants}
              initial={isExpanded ? 'expanded' : 'collapsed'}
              animate={isExpanded ? 'expanded' : 'collapsed'}
            >
              Inicio
            </motion.h3>
            <ul className="space-y-0.5">
              {inicioNav.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>

          {/* Clientes */}
          <div className="mt-6">
            <ul className="space-y-0.5">
              {clientesNav.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>

          {/* Creadores */}
          <div className="mt-6">
            <ul className="space-y-0.5">
              {creadoresNav.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </div>

        {/* Config */}
        <div className="mb-4">
          <ul className="space-y-0.5">
            {configNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout button - ICONO MÁS GRANDE */}
      <div className="border-t border-gray-100 px-2 py-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`
                  flex items-center text-sm font-medium w-full px-3 py-2 text-red-600 hover:bg-gray-50
                  ${!isExpanded ? 'justify-center px-1 py-3' : ''}
                `}
              >
                <div 
                  style={getIconStyle(isExpanded, 'logout')} 
                  className="flex items-center justify-center"
                >
                  <LogOut 
                    className={`${isExpanded ? 'mr-2' : ''} icon-override`} 
                    size={isExpanded ? ICON_SIZES.expanded.logout : ICON_SIZES.collapsed.logout} 
                  />
                </div>
                <motion.span
                  className="ml-2"
                  variants={textVariants}
                  initial={isExpanded ? 'expanded' : 'collapsed'}
                  animate={isExpanded ? 'expanded' : 'collapsed'}
                >
                  Cerrar sesión
                </motion.span>
              </button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right">
                Cerrar sesión
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Estilos CSS internos para forzar el grosor de los iconos */}
      <style jsx global>{`
        .icon-override {
          stroke-width: 1.75px !important;
        }
      `}</style>
    </motion.div>
  );
}