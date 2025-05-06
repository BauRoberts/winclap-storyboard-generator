'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowUpDown,
  User
} from 'lucide-react';

// Definir interface para creador
interface Creator {
  id: string;
  name: string;
  category: string;
  platform: string;
  email: string;
  contentCount: number;
  lastActivity: string;
  followers: string;
  [key: string]: string | number; // Índice de firma para permitir acceso dinámico
}

// Datos de muestra para los creadores
const mockCreators: Creator[] = [
  { 
    id: '1', 
    name: 'Marcos Galperin', 
    category: 'Tech', 
    platform: 'YouTube', 
    email: 'marcos@creator.com',
    contentCount: 12,
    lastActivity: '2025-05-01',
    followers: '1.2M'
  },
  { 
    id: '2', 
    name: 'Laura Mendez', 
    category: 'Lifestyle', 
    platform: 'Instagram', 
    email: 'laura@creator.com',
    contentCount: 8,
    lastActivity: '2025-05-03',
    followers: '850K'
  },
  { 
    id: '3', 
    name: 'Carlos Ramos', 
    category: 'Gaming', 
    platform: 'Twitch', 
    email: 'carlos@creator.com',
    contentCount: 15,
    lastActivity: '2025-04-29',
    followers: '2.5M'
  },
  { 
    id: '4', 
    name: 'Martina Torres', 
    category: 'Fitness', 
    platform: 'TikTok', 
    email: 'martina@creator.com',
    contentCount: 7,
    lastActivity: '2025-05-02',
    followers: '3.1M'
  },
  { 
    id: '5', 
    name: 'Diego Alvarez', 
    category: 'Cocina', 
    platform: 'YouTube', 
    email: 'diego@creator.com',
    contentCount: 9,
    lastActivity: '2025-04-27',
    followers: '950K'
  },
];

export default function CreatorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [creators, _setCreators] = useState<Creator[]>(mockCreators);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // Filtrar creadores según el término de búsqueda
  const filteredCreators = creators.filter(creator => 
    creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar creadores
  const sortedCreators = [...filteredCreators].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    
    if (a[key] < b[key]) {
      return direction === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Función para cambiar la ordenación
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Creadores</h1>
          <p className="text-gray-500">Gestiona tus creadores de contenido</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Creador
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar creadores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort('name')}>
              Por nombre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('category')}>
              Por categoría
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('platform')}>
              Por plataforma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('contentCount')}>
              Por cantidad de contenido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('followers')}>
              Por seguidores
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('lastActivity')}>
              Por última actividad
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead className="text-center">Contenidos</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCreators.map((creator) => (
              <TableRow key={creator.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    {creator.name}
                  </div>
                </TableCell>
                <TableCell>{creator.category}</TableCell>
                <TableCell>{creator.platform}</TableCell>
                <TableCell className="text-center">{creator.contentCount}</TableCell>
                <TableCell>{creator.followers}</TableCell>
                <TableCell>{formatDate(creator.lastActivity)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}