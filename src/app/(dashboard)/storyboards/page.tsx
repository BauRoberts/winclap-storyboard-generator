// src/app/(dashboard)/storyboards/page.tsx
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
  Search, 
  MoreHorizontal, 
  ArrowUpDown,
  ExternalLink,
  Wand2
} from 'lucide-react';
import Link from 'next/link';

// Definir interfaz para storyboard
interface Storyboard {
  id: string;
  title: string;
  client: string;
  createdBy: string;
  status: string;
  createdAt: string;
  slidesUrl: string;
  [key: string]: string | number; // Índice de firma para permitir acceso dinámico
}

// Datos de muestra para los storyboards
const mockStoryboards: Storyboard[] = [
  { 
    id: '1', 
    title: 'Campaña Verano 2025', 
    client: 'Coca Cola', 
    createdBy: 'Juan Pérez', 
    status: 'Aprobado',
    createdAt: '2025-04-15',
    slidesUrl: 'https://docs.google.com/presentation/d/abc123'
  },
  { 
    id: '2', 
    title: 'Lanzamiento Nuevo Producto', 
    client: 'Pepsi', 
    createdBy: 'María López', 
    status: 'En revisión',
    createdAt: '2025-04-20',
    slidesUrl: 'https://docs.google.com/presentation/d/def456'
  },
  { 
    id: '3', 
    title: 'Campaña Redes Sociales', 
    client: 'Nike', 
    createdBy: 'Carlos Rodríguez', 
    status: 'Planificación',
    createdAt: '2025-04-25',
    slidesUrl: 'https://docs.google.com/presentation/d/ghi789'
  },
  { 
    id: '4', 
    title: 'Promoción Fin de Año', 
    client: 'Adidas', 
    createdBy: 'Laura García', 
    status: 'Aprobado',
    createdAt: '2025-04-30',
    slidesUrl: 'https://docs.google.com/presentation/d/jkl012'
  },
  { 
    id: '5', 
    title: 'Evento Tecnológico', 
    client: 'Samsung', 
    createdBy: 'Martín Gómez', 
    status: 'Creación',
    createdAt: '2025-05-01',
    slidesUrl: 'https://docs.google.com/presentation/d/mno345'
  },
];

export default function StoryboardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [storyboards, _setStoryboards] = useState<Storyboard[]>(mockStoryboards);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // Filtrar storyboards según el término de búsqueda
  const filteredStoryboards = storyboards.filter(storyboard => 
    storyboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    storyboard.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    storyboard.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    storyboard.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar storyboards
  const sortedStoryboards = [...filteredStoryboards].sort((a, b) => {
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

  // Obtener color según estado
  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'en revisión':
        return 'bg-amber-100 text-amber-800';
      case 'planificación':
        return 'bg-blue-100 text-blue-800';
      case 'creación':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Storyboards</h1>
          <p className="text-gray-500">Gestiona tus storyboards para diferentes clientes</p>
        </div>
        <Link href="/editor">
          <Button>
            <Wand2 className="mr-2 h-4 w-4" />
            Nuevo Storyboard
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar storyboards..."
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
            <DropdownMenuItem onClick={() => handleSort('title')}>
              Por título
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('client')}>
              Por cliente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('status')}>
              Por estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('createdAt')}>
              Por fecha de creación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Creado por</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStoryboards.map((storyboard) => (
              <TableRow key={storyboard.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">{storyboard.title}</TableCell>
                <TableCell>{storyboard.client}</TableCell>
                <TableCell>{storyboard.createdBy}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storyboard.status)}`}>
                    {storyboard.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(storyboard.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(storyboard.slidesUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/editor?id=${storyboard.id}`}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(storyboard.slidesUrl, '_blank')}>
                          Ver en Google Slides
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}