//src/app/(dashboard)/creators/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowUpDown,
  User,
  Filter,
  Download,
  Upload,
  CalendarDays,
  Mail
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getCreators } from '@/services/creatorService';
import { Skeleton } from '@/components/ui/skeleton';

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_representative?: string;
  email_agency?: string;
  agency_name?: string;
  country?: string;
  status?: string;
  platform?: string;
  category?: string;
  contract_signed?: boolean;
  responsible?: string;
  onboarding_mail_sent?: boolean;
  content_count?: number;
  [key: string]: string | number | boolean | undefined;
}

export default function CreatorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: [] as string[],
    country: [] as string[],
    platform: [] as string[],
    contract_signed: null as boolean | null,
    onboarding_mail_sent: null as boolean | null,
  });
  
  // Valores únicos para filtros
  const [filterValues, setFilterValues] = useState({
    status: [] as string[],
    country: [] as string[],
    platform: [] as string[],
    responsible: [] as string[],
  });

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setIsLoading(true);
        const data = await getCreators();
        setCreators(data);
        
        // Extraer valores únicos para filtros
        const uniqueStatus = [...new Set(data.map(c => c.status).filter(Boolean))];
        const uniqueCountry = [...new Set(data.map(c => c.country).filter(Boolean))];
        const uniquePlatform = [...new Set(data.map(c => c.platform).filter(Boolean))];
        const uniqueResponsible = [...new Set(data.map(c => c.responsible).filter(Boolean))];
        
        setFilterValues({
          status: uniqueStatus as string[],
          country: uniqueCountry as string[],
          platform: uniquePlatform as string[],
          responsible: uniqueResponsible as string[],
        });
      } catch (error) {
        console.error('Error loading creators:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCreators();
  }, []);

  // Aplicar filtros
  const filteredCreators = creators.filter(creator => {
    // Búsqueda por texto
    const matchesSearch = 
      (creator.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       creator.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       creator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       creator.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por status
    const matchesStatus = filters.status.length === 0 || 
      (creator.status && filters.status.includes(creator.status));
    
    // Filtro por país
    const matchesCountry = filters.country.length === 0 || 
      (creator.country && filters.country.includes(creator.country));
    
    // Filtro por plataforma
    const matchesPlatform = filters.platform.length === 0 || 
      (creator.platform && filters.platform.includes(creator.platform));
    
    // Filtro por contrato firmado
    const matchesContract = filters.contract_signed === null || 
      creator.contract_signed === filters.contract_signed;
    
    // Filtro por mail de onboarding enviado
    const matchesOnboarding = filters.onboarding_mail_sent === null || 
      creator.onboarding_mail_sent === filters.onboarding_mail_sent;
    
    return matchesSearch && matchesStatus && matchesCountry && 
           matchesPlatform && matchesContract && matchesOnboarding;
  });

  // Ordenar creadores
  const sortedCreators = [...filteredCreators].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    const valueA = a[key];
    const valueB = b[key];
    
    if (valueA === undefined) return direction === 'asc' ? 1 : -1;
    if (valueB === undefined) return direction === 'asc' ? -1 : 1;
    
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
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

  // Actualizar filtros
  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      return {
        ...prev,
        [type]: currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value],
      };
    });
  };

  // Toggle boolean filters
  const toggleBooleanFilter = (type: 'contract_signed' | 'onboarding_mail_sent', value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: [],
      country: [],
      platform: [],
      contract_signed: null,
      onboarding_mail_sent: null,
    });
    setSearchTerm('');
  };

  // Formatear nombre completo
  const getFullName = (creator: Creator): string => {
    return `${creator.first_name || ''} ${creator.last_name || ''}`.trim();
  };

  // Navegar al perfil del creador
  const navigateToCreator = (id: string) => {
    router.push(`/creators/${id}`);
  };

  // Renderizar badge de estado
  const renderStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    const statusStyles: Record<string, string> = {
      'Activo': 'bg-green-50 text-green-700',
      'Pendiente': 'bg-yellow-50 text-yellow-700',
      'Inactivo': 'bg-gray-50 text-gray-700',
      'Contratado': 'bg-blue-50 text-blue-700',
      'En negociación': 'bg-purple-50 text-purple-700',
    };
    
    const style = statusStyles[status] || 'bg-gray-50 text-gray-700';
    
    return (
      <Badge variant="outline" className={style}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Creadores</h1>
          <p className="text-gray-500">Gestiona los creadores del Creative Studio</p>
        </div>
        <div className="flex gap-2 self-end">
          <Button onClick={() => router.push('/creators/import')} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={() => router.push('/creators/export')} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => router.push('/creators/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Creador
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email o agencia..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {Object.values(filters).some(f => 
                    (Array.isArray(f) && f.length > 0) || 
                    (typeof f === 'boolean')
                  ) && (
                    <Badge variant="secondary" className="ml-2">
                      Activos
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[500px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Filtra la lista de creadores por diferentes criterios
                  </SheetDescription>
                </SheetHeader>
                
                <div className="grid gap-6 py-4">
                  {/* Estado */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Estado</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filterValues.status.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`status-${status}`} 
                            checked={filters.status.includes(status)}
                            onCheckedChange={() => toggleFilter('status', status)}
                          />
                          <Label htmlFor={`status-${status}`}>{status}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* País */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">País</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filterValues.country.map(country => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`country-${country}`} 
                            checked={filters.country.includes(country)}
                            onCheckedChange={() => toggleFilter('country', country)}
                          />
                          <Label htmlFor={`country-${country}`}>{country}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Plataforma */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Plataforma</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filterValues.platform.map(platform => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`platform-${platform}`} 
                            checked={filters.platform.includes(platform)}
                            onCheckedChange={() => toggleFilter('platform', platform)}
                          />
                          <Label htmlFor={`platform-${platform}`}>{platform}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Contrato firmado */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Contrato firmado</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="contract-signed-yes" 
                          checked={filters.contract_signed === true}
                          onCheckedChange={() => toggleBooleanFilter('contract_signed', true)}
                        />
                        <Label htmlFor="contract-signed-yes">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="contract-signed-no" 
                          checked={filters.contract_signed === false}
                          onCheckedChange={() => toggleBooleanFilter('contract_signed', false)}
                        />
                        <Label htmlFor="contract-signed-no">No</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mail de onboarding enviado */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Mail de onboarding enviado</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="onboarding-mail-yes" 
                          checked={filters.onboarding_mail_sent === true}
                          onCheckedChange={() => toggleBooleanFilter('onboarding_mail_sent', true)}
                        />
                        <Label htmlFor="onboarding-mail-yes">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="onboarding-mail-no" 
                          checked={filters.onboarding_mail_sent === false}
                          onCheckedChange={() => toggleBooleanFilter('onboarding_mail_sent', false)}
                        />
                        <Label htmlFor="onboarding-mail-no">No</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={resetFilters}>
                      Reiniciar filtros
                    </Button>
                    <SheetTrigger asChild>
                      <Button>Aplicar filtros</Button>
                    </SheetTrigger>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('first_name')}>
                  Por nombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('country')}>
                  Por país
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('status')}>
                  Por estado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('agency_name')}>
                  Por agencia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('responsible')}>
                  Por responsable
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('content_count')}>
                  Por cantidad de contenido
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Info de resultados */}
          <div className="mt-4 text-sm text-gray-500">
            Mostrando {sortedCreators.length} de {creators.length} creadores
            {Object.values(filters).some(f => 
              (Array.isArray(f) && f.length > 0) || 
              (typeof f === 'boolean' && f !== null)
            ) && " (filtrados)"}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Creador</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Agencia</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-center">Contenidos</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-[180px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-[50px] mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : sortedCreators.length > 0 ? (
              sortedCreators.map((creator) => (
                <TableRow 
                  key={creator.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigateToCreator(creator.id.toString())}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarFallback>
                          {getFullName(creator).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{getFullName(creator)}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {creator.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(creator.status)}
                  </TableCell>
                  <TableCell>
                    {creator.agency_name || 'Independiente'}
                  </TableCell>
                  <TableCell>
                    {creator.country || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${creator.platform === 'YouTube' ? 'bg-red-50 text-red-700' : ''}
                        ${creator.platform === 'Instagram' ? 'bg-purple-50 text-purple-700' : ''}
                        ${creator.platform === 'TikTok' ? 'bg-blue-50 text-blue-700' : ''}
                        ${creator.platform === 'Twitch' ? 'bg-indigo-50 text-indigo-700' : ''}
                      `}
                    >
                      {creator.platform || 'Sin plataforma'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {creator.responsible || '-'}
                  </TableCell>
                  <TableCell className="text-center">{creator.content_count || 0}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigateToCreator(creator.id.toString())}>
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/creators/${creator.id}/edit`)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/creators/${creator.id}/storyboards/new`)}>
                          Crear storyboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No se encontraron creadores
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}