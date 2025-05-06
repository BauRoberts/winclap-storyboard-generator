// src/components/sidebar/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  MessageSquareQuote,
  Settings,
  HelpCircle,
  Search,
  MoreHorizontal,
  Building2,
  ChevronRight,
  PlusCircle,
  LogOut,
  ChevronLeft,
  Menu,
  UserCircle,
  Users,
  Home,
  Calendar,
  FileImage
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    
    // Set initial state
    checkSize();
    
    // Add event listener
    window.addEventListener('resize', checkSize);
    
    // Cleanup
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

  // Sidebar width animation
  const sidebarVariants = {
    expanded: { width: '15rem' },
    collapsed: { width: '3rem' }
  };

  // Text animation
  const textVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { 
      opacity: 0, 
      display: 'none',
      transition: {
        display: { delay: 0.2 }
      }
    }
  };

  // Icon rotation animation
  const iconVariants = {
    expanded: { rotate: 0 },
    collapsed: { rotate: 180 }
  };

  // Define the type for navigation items
  interface NavItemProps {
    item: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    };
    className?: string;
  }

  // Render a navigation item with proper tooltip when collapsed
  const NavItem = ({ item, className = '' }: NavItemProps) => (
    <li key={item.name}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
          <Link
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium
                transition-colors ${className}
                ${isActive(item.href) 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${!isExpanded ? 'justify-center px-1 py-3' : ''}
              `}
            >                              
              <item.icon className={`${isExpanded ? 'h-3 w-3 mr-2' : 'h-3 w-3'}`} />
              <motion.span 
                variants={textVariants}
                initial={isExpanded ? "expanded" : "collapsed"}
                animate={isExpanded ? "expanded" : "collapsed"}
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
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header with logo, company name, and collapse button */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-3">
        {/* Left side: Logo and company name */}
        <div className="flex items-center">
          <Building2 className={`${isExpanded ? 'h-5 w-5' : 'h-0 w-0'}`} />
          <motion.span 
            className="font-semibold ml-1.5"
            variants={textVariants}
            initial={isExpanded ? "expanded" : "collapsed"}
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            Winclap Studio
          </motion.span>
        </div>
        
        {/* Right side: Collapse button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-full p-0.5 hover:bg-gray-100 ${!isExpanded ? 'absolute left-3' : ''}`}
          variants={iconVariants}
          initial={isExpanded ? "expanded" : "collapsed"}
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Create New Storyboard Button - Black Button */}
      <div className="px-2 pt-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className={`w-full bg-black hover:bg-gray-800 text-white ${!isExpanded ? 'justify-center p-2' : 'justify-start'}`}
                asChild
                variant="default"
                size={isExpanded ? "default" : "icon"}
              >
                <Link href="/editor" className="flex items-center">
                  <PlusCircle className="h-5 w-5" />
                  <motion.span 
                    className="ml-2"
                    variants={textVariants}
                    initial={isExpanded ? "expanded" : "collapsed"}
                    animate={isExpanded ? "expanded" : "collapsed"}
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

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 flex flex-col">
        {/* Top sections */}
        <div className="flex-grow">
          {/* Inicio Section */}
          <div className="mt-4">
            <motion.h3 
              className="mb-1 px-3 text-xs font-medium text-gray-400"
              variants={textVariants}
              initial={isExpanded ? "expanded" : "collapsed"}
              animate={isExpanded ? "expanded" : "collapsed"}
            >
              Inicio
            </motion.h3>
            <ul className="space-y-0.5">
              {inicioNav.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>

          {/* Clientes Section */}
          <div className="mt-6">
            <ul className="space-y-0.5">
              {clientesNav.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>

          {/* Creadores Section */}
          <div className="mt-6">
            <ul className="space-y-0.5">
              {creadoresNav.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </div>

        {/* Configuración Section - Now at the bottom before profile */}
        <div className="mb-4">
          <ul className="space-y-0.5">
            {configNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </ul>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-100 px-2 py-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`
                  ${isExpanded ? 'w-full justify-start' : 'w-full justify-center'}
                  px-2 py-1.5 h-auto
                `}
                asChild
              >
                <Link href="/profile">
                  <div className="h-5 w-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
                    B
                  </div>
                  <motion.span 
                    className="ml-2 text-sm font-medium text-gray-700 truncate"
                    variants={textVariants}
                    initial={isExpanded ? "expanded" : "collapsed"}
                    animate={isExpanded ? "expanded" : "collapsed"}
                  >
                    Invite members
                  </motion.span>
                </Link>
              </Button>
            </TooltipTrigger>
            {!isExpanded && (
              <TooltipContent side="right">
                Invite members
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}