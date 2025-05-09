'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MoreHorizontal, 
  Plus,
  Table as TableIcon,
  LayoutGrid,
  BarChart,
  ChevronDown,
  Filter,
  User,
  Image,
  Layout,
  Clock,
  ExternalLink,
  FilePlus,
  Edit,
  Copy,
  Trash
} from 'lucide-react';
import Link from 'next/link';
import { getStoryboards, deleteStoryboard, StoryboardWithRelations } from '@/services/storyboardService';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

// Definir interfaces para el estado
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface ActiveFilters {
  status?: string;
  client_id?: string;
  [key: string]: string | undefined;
}

export default function NotionStyleStoryboardsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [storyboards, setStoryboards] = useState<StoryboardWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [selectedStoryboard, setSelectedStoryboard] = useState<StoryboardWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

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

  // Filtrar storyboards según el término de búsqueda y filtros activos
  const filteredStoryboards = useMemo(() => {
    return storyboards.filter(storyboard => {
      // Filtrar por término de búsqueda
      const matchesSearch = 
        storyboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (storyboard.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (storyboard.creator?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (storyboard.status || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Aplicar filtros activos
      let matchesFilters = true;
      
      // Ejemplo: filtrar por estado
      if (activeFilters.status && storyboard.status !== activeFilters.status) {
        matchesFilters = false;
      }
      
      // Ejemplo: filtrar por cliente
      if (activeFilters.client_id && storyboard.client_id !== activeFilters.client_id) {
        matchesFilters = false;
      }
      
      return matchesSearch && matchesFilters;
    });
  }, [storyboards, searchTerm, activeFilters]);

  // Ordenar storyboards
  const sortedStoryboards = useMemo(() => {
    return [...filteredStoryboards].sort((a, b) => {
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
  }, [filteredStoryboards, sortConfig]);

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
      case 'draft':
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

  // Renderizar plataformas como etiquetas
  const renderPlatforms = (platforms?: string[]): React.ReactNode => {
    if (!platforms || platforms.length === 0) return '-';
    
    return (
      <div className="flex flex-wrap gap-1">
        {platforms.map((platform: string, index: number) => (
          <span 
            key={index} 
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {platform}
          </span>
        ))}
      </div>
    );
  };

  // Renderizar assets como indicador visual
  const renderAssets = (assets?: string): React.ReactNode => {
    if (!assets) return '-';
    
    return (
      <div className="flex items-center">
        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
        <span className="text-sm text-gray-600">Disponible</span>
      </div>
    );
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error || ""} retry={loadStoryboards} />;

  return (
    <div className="container mx-auto p-4 max-w-full">
      {/* Header estilo Notion */}
      <div className="mb-8 mt-4">
        <div className="flex items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            {editMode ? (
              <Input 
                className="text-3xl font-bold border-none h-auto p-0 focus-visible:ring-0" 
                defaultValue="Storyboards" 
                onBlur={() => setEditMode(false)}
                autoFocus
              />
            ) : (
              <span 
                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" 
                onClick={() => setEditMode(true)}
              >
                Storyboards
              </span>
            )}
          </h1>
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setEditMode(true)}>
            <Edit className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
        <p className="text-gray-500 mb-4">
          Todos los storyboards de tus clientes
        </p>
      </div>

      {/* Tabs estilo Notion */}
      <Tabs defaultValue="table" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span>Tabla</span>
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Tablero</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Gráfico</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilterMenuOpen(!filterMenuOpen)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar storyboards..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Link href="/editor">
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead 
                    className="py-3 px-4 font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      <FilePlus className="h-4 w-4 text-gray-400" />
                      Título
                    </div>
                  </TableHead>
                  <TableHead 
                    className="py-3 px-4 font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('client.name')}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      Cliente
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-gray-400" />
                      Assets
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4 text-gray-400" />
                      Plataforma
                    </div>
                  </TableHead>
                  <TableHead 
                    className="py-3 px-4 font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Estado
                    </div>
                  </TableHead>
                  <TableHead 
                    className="py-3 px-4 font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Creado
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStoryboards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron storyboards
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStoryboards.map((storyboard) => (
                    <TableRow key={storyboard.id} className="group border-gray-100 hover:bg-gray-50 border-t">
                      <TableCell className="py-3 px-4 font-medium">
                        <Link href={`/editor?id=${storyboard.id}`} className="hover:underline">
                          {storyboard.title || 'Storyboard sin título'}
                        </Link>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-gray-700">
                        {storyboard.client?.name || '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {renderAssets(storyboard.assets ?? undefined)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {renderPlatforms(storyboard.platforms ?? undefined)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(storyboard.status)}`}>
                          {storyboard.status || 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-gray-700">
                        {formatDate(storyboard.created_at)}
                      </TableCell>
                      <TableCell className="py-3 px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              className="flex items-center gap-2"
                              onClick={() => window.location.href = `/editor?id=${storyboard.id}`}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            {storyboard.slides_url && (
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => storyboard.slides_url && window.open(storyboard.slides_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Ver en Google Slides</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="flex items-center gap-2"
                              onClick={() => {
                                // Lógica para duplicar (será implementada más adelante)
                                alert('Funcionalidad en desarrollo');
                              }}
                            >
                              <Copy className="h-4 w-4" />
                              <span>Duplicar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600"
                              onClick={() => {
                                setSelectedStoryboard(storyboard);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={7} className="py-2 px-4 border-t">
                    <Link 
                      href="/editor" 
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors py-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nuevo storyboard</span>
                    </Link>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Draft</h3>
              <div className="space-y-3">
                {sortedStoryboards
                  .filter(sb => !sb.status || sb.status.toLowerCase() === 'draft')
                  .map(storyboard => (
                    <div key={storyboard.id} className="border rounded-md p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/editor?id=${storyboard.id}`} className="font-medium hover:underline">
                        {storyboard.title || 'Storyboard sin título'}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {storyboard.client?.name || '-'}
                      </div>
                    </div>
                  ))
                }
              </div>
              <button className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 py-1">
                <Plus className="h-3 w-3" />
                <span>Nuevo storyboard</span>
              </button>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-4">In Progress</h3>
              <div className="space-y-3">
                {sortedStoryboards
                  .filter(sb => sb.status && sb.status.toLowerCase() === 'in_progress')
                  .map(storyboard => (
                    <div key={storyboard.id} className="border rounded-md p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/editor?id=${storyboard.id}`} className="font-medium hover:underline">
                        {storyboard.title || 'Storyboard sin título'}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {storyboard.client?.name || '-'}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Completed</h3>
              <div className="space-y-3">
                {sortedStoryboards
                  .filter(sb => sb.status && ['aprobado', 'done'].includes(sb.status.toLowerCase()))
                  .map(storyboard => (
                    <div key={storyboard.id} className="border rounded-md p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/editor?id=${storyboard.id}`} className="font-medium hover:underline">
                        {storyboard.title || 'Storyboard sin título'}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {storyboard.client?.name || '-'}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chart">
          <div className="flex justify-center items-center h-64 border rounded-md">
            <p className="text-gray-500">Vista de gráfico en desarrollo</p>
          </div>
        </TabsContent>
      </Tabs>

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