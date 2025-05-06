'use client';

import Link from 'next/link';
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
  LogOut
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: _session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [_isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsExpanded(false);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const inicioNav = [
    { name: 'Storyboards', href: '/storyboards', icon: RefreshCw },
    { name: 'Inspiration Board', href: '/inspiration', icon: FileImage },
  ];

  const clientesNav = [
    { name: 'Clientes', href: '/clients', icon: Building2 },
  ];

  const creadoresNav = [
    { name: 'Creadores', href: '/creators', icon: Users },
  ];

  const configNav = [
    { name: 'Configuración', href: '/settings', icon: Settings },
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
    item: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    };
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
              <item.icon className={`${isExpanded ? 'h-4 w-4 mr-2' : 'h-4 w-4'}`} />
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
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-3">
        <div className="flex items-center">
          <Building2 className={`${isExpanded ? 'h-5 w-5' : 'h-0 w-0'}`} />
          <motion.span
            className="font-semibold ml-1.5"
            variants={textVariants}
            initial={isExpanded ? 'expanded' : 'collapsed'}
            animate={isExpanded ? 'expanded' : 'collapsed'}
          >
            Winclap Studio
          </motion.span>
        </div>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-full p-0.5 hover:bg-gray-100 ${!isExpanded ? 'absolute left-3' : ''}`}
          variants={iconVariants}
          initial={isExpanded ? 'expanded' : 'collapsed'}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Create New Button */}
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
                <Link href="/editor" className="flex items-center">
                  <PlusCircle className="h-5 w-5" />
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

      {/* Logout button */}
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
                <LogOut className={`${isExpanded ? 'h-4 w-4 mr-2' : 'h-4 w-4'}`} />
                <motion.span
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
    </motion.div>
  );
}
