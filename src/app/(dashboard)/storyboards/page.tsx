'use client';

import { useState, useEffect } from 'react';
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
import { getStoryboards, deleteStoryboard, StoryboardWithRelations } from '@/services/storyboardService';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function StoryboardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [storyboards, setStoryboards] = useState<StoryboardWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  
  const [selectedStoryboard, setSelectedStoryboard] = useState<StoryboardWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Cargar storyboards
  const loadStoryboards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getStoryboards();
      setStoryboards(data);
    } catch (err) {
      console.error('Error loading storyboards:', err);
      setError('Error al cargar los storyboards. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoryboards();
  }, []);

  // Filtrar storyboards según el término de búsqueda
  const filteredStoryboards = storyboards.filter(storyboard => 
    storyboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (storyboard.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (storyboard.creator?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (storyboard.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar storyboards
  const sortedStoryboards = [...filteredStoryboards].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    
    // Manejar campos anidados como client.name
    let aValue: any = a;
    let bValue: any = b;
    
    const keys = key.split('.');
    for (const k of keys) {
      aValue = aValue?.[k];
      bValue = bValue?.[k];
    }
    
    // Convertir valores a string para comparación
    aValue = aValue?.toString() || '';
    bValue = bValue?.toString() || '';
    
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
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
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  // Obtener color según estado
  const getStatusColor = (status?: string): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'aprobado':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'en revisión':
      case 'review':
        return 'bg-amber-100 text-amber-800';
      case 'planificación':
      case 'not_started':
        return 'bg-blue-100 text-blue-800';
      case 'creación':
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Manejar eliminación de storyboard
  const handleDeleteStoryboard = async () => {
    if (!selectedStoryboard?.id) return;
    
    try {
      await deleteStoryboard(selectedStoryboard.id);
      await loadStoryboards();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting storyboard:', err);
      setError('Error al eliminar el storyboard. Por favor, intenta nuevamente.');
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={loadStoryboards} />;

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
            <DropdownMenuItem onClick={() => handleSort('client.name')}>
              Por cliente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('status')}>
              Por estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('created_at')}>
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
              <TableHead>Creador</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStoryboards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No se encontraron storyboards
                </TableCell>
              </TableRow>
            ) : (
              sortedStoryboards.map((storyboard) => (
                <TableRow key={storyboard.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{storyboard.title}</TableCell>
                  <TableCell>{storyboard.client?.name || '-'}</TableCell>
                  <TableCell>{storyboard.creator?.name || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storyboard.status)}`}>
                      {storyboard.status || 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(storyboard.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {storyboard.slides_url && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => storyboard.slides_url && window.open(storyboard.slides_url, '_blank')}
                          title="Ver en Google Slides"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
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
                          {storyboard.slides_url && (
                            <DropdownMenuItem onClick={() => storyboard.slides_url && window.open(storyboard.slides_url, '_blank')}>
                              Ver en Google Slides
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            // Lógica para duplicar (será implementada más adelante)
                            alert('Funcionalidad en desarrollo');
                          }}>
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedStoryboard(storyboard);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el storyboard "{selectedStoryboard?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteStoryboard}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}