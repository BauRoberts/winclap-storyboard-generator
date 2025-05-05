// src/components/sidebar/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  RefreshCw, 
  BarChart3, 
  FolderPlus, 
  Users, 
  Library, 
  FileText,
  MessageSquareQuote,
  Settings,
  HelpCircle,
  Search,
  MoreHorizontal,
  Building2,
  ChevronRight,
  PlusCircle,
  LogOut
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

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const navigation = [
    { 
      name: 'Quick Create', 
      href: '/editor', 
      icon: PlusCircle,
      className: 'bg-white text-black border-none mb-4' 
    },
  
    { name: 'Storyboards', href: '/storyboards', icon: RefreshCw },
    { name: 'Clients', href: '/clients', icon: Building2 },


  ];
  
  const documentNav = [


    { name: 'Content Assistant', href: '/content-assistant', icon: MessageSquareQuote },
  ];

  const bottomNav = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Get Help', href: '/help', icon: HelpCircle },
    { name: 'Search', href: '#', icon: Search },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Header con logo */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <div className="flex items-center gap-1">
          <Building2 className="h-5 w-5" />
          <span className="font-semibold">Winclap Inc.</span>
        </div>
      </div>

      {/* Quick Create Button */}
      <div className="p-2">
        <Button 
          className="bg-white text-black border-none w-full" 
          asChild
          size="default"
        >
          <Link href="/editor">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Quick Create</span>
          </Link>
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {navigation.slice(1).map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`
                  flex items-center rounded-lg px-3 py-2 text-sm font-medium
                  transition-colors
                  ${isActive(item.href) 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Documents Section */}
        <div className="mt-8">
          <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Documents
          </h3>
          <ul className="space-y-1">
            {documentNav.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center rounded-lg px-3 py-2 text-sm font-medium
                    transition-colors
                    ${isActive(item.href) 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <MoreHorizontal className="h-4 w-4" />
            <span>More</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </div>
          <div className="mt-1">
            {bottomNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-lg px-3 py-2 pl-9 text-sm font-medium
                  transition-colors
                  ${isActive(item.href) 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="p-3 border-t border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documentation..."
            className="w-full pl-8"
          />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 px-2 py-1.5"
            >
              <div className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center">
                {session?.user?.name?.charAt(0) || 'W'}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{session?.user?.name || 'Usuario'}</span>
                <span className="text-xs text-gray-500">{session?.user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Ayuda</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}