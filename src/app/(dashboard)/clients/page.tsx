// src/app/(dashboard)/clients/page.tsx
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
  Building2
} from 'lucide-react';

// Definir interface para cliente
interface Client {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  briefsCount: number;
  lastActivity: string;
  [key: string]: string | number; // Índice de firma para permitir acceso dinámico
}

// Datos de muestra para los clientes
const mockClients: Client[] = [
  { 
    id: '1', 
    name: 'Coca Cola', 
    industry: 'Bebidas', 
    contactPerson: 'Juan Pérez', 
    email: 'juan@cocacola.com',
    briefsCount: 5,
    lastActivity: '2025-04-30'
  },
  { 
    id: '2', 
    name: 'Pepsi', 
    industry: 'Bebidas', 
    contactPerson: 'María López', 
    email: 'maria@pepsi.com',
    briefsCount: 3,
    lastActivity: '2025-05-01'
  },
  { 
    id: '3', 
    name: 'Nike', 
    industry: 'Indumentaria', 
    contactPerson: 'Carlos Rodríguez', 
    email: 'carlos@nike.com',
    briefsCount: 8,
    lastActivity: '2025-04-28'
  },
  { 
    id: '4', 
    name: 'Adidas', 
    industry: 'Indumentaria', 
    contactPerson: 'Laura García', 
    email: 'laura@adidas.com',
    briefsCount: 2,
    lastActivity: '2025-05-03'
  },
  { 
    id: '5', 
    name: 'Samsung', 
    industry: 'Tecnología', 
    contactPerson: 'Martín Gómez', 
    email: 'martin@samsung.com',
    briefsCount: 6,
    lastActivity: '2025-04-25'
  },
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // Filtrar clientes según el término de búsqueda
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar clientes
  const sortedClients = [...filteredClients].sort((a, b) => {
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
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-500">Gestiona tus clientes y sus briefs</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
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
            <DropdownMenuItem onClick={() => handleSort('industry')}>
              Por industria
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('briefsCount')}>
              Por cantidad de briefs
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
              <TableHead>Industria</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-center">Briefs</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client) => (
              <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                    {client.name}
                  </div>
                </TableCell>
                <TableCell>{client.industry}</TableCell>
                <TableCell>
                  <div>
                    <div>{client.contactPerson}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{client.briefsCount}</TableCell>
                <TableCell>{formatDate(client.lastActivity)}</TableCell>
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