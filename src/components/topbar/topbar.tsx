// src/components/topbar/topbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Share2, 
  MoreHorizontal,
  ChevronRight,
  Star,
  Home
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePageTitle } from '@/context/PageTitleContext';

function capitalize(text: string) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isUUID(segment: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(segment);
}

export default function Topbar() {
  const pathname = usePathname();
  const { title } = usePageTitle();

  const segments = pathname.split('/').filter(Boolean);

  const pathMap: Record<string, string> = {
    'editor': 'Editor',
    'storyboards': 'Storyboards',
    'clients': 'Clients',
    'settings': 'Settings',
    'help': 'Help',
    'content-assistant': 'Content Assistant',
    'creators': 'Creators'
  };

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center space-x-1">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900">
          <Home className="h-4 w-4" />
        </Link>

        {segments.map((segment, index) => (
          <div key={segment} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link 
              href={`/${segments.slice(0, index + 1).join('/')}`}
              className={`flex items-center px-2 py-1 text-sm ${
                index === segments.length - 1 
                  ? 'font-medium text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isUUID(segment) ? title || 'Detalle' : (pathMap[segment] || capitalize(segment))}
            </Link>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
          <Star className="h-4 w-4 mr-1" />
          <span>Favorite</span>
        </Button>

        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
          <Share2 className="h-4 w-4 mr-1" />
          <span>Share</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
