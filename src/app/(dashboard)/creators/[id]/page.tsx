//src/app/(dashboard)/creators/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Mail,
  Edit,
  ChevronLeft,
  Play,
  Users,
  FileText,
  Activity,
  Link,
  Check,
  X,
  Send,
  Phone,
  Building,
  Globe,
  Briefcase,
  FileSignature,
  MoreHorizontal,
  User,  // Añadir esta importación
  Plus   // Añadir esta importación
} from 'lucide-react';
import { 
  getCreatorById, 
  getCreatorActivities, 
  getCreatorStoryboards 
} from '@/services/creatorService';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Creator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_representative?: string;
  email_agency?: string;
  email_billing?: string;
  agency_name?: string;
  country?: string;
  business_type?: string;
  status?: string;
  platform?: string;
  category?: string;
  onboarding_mail_sent?: boolean;
  onboarding_mail_time?: string;
  tipalti_status?: string;
  tipalti_login?: boolean;
  contract_type?: string;
  contract_signed?: boolean;
  portfolio_url?: string;
  whatsapp_link?: string;
  responsible?: string;
  additional_email?: string;
  content_count?: number;
  created_at?: string;
}

interface Activity {
  id: string;
  storyboard_id?: string;
  storyboard_title?: string;
  activity_type: string;
  description: string;
  status?: string;
  created_at: string;
}

interface Storyboard {
  id: string;
  title: string;
  status: string;
  created_at: string;
  slides_url?: string;
  client_name?: string;
}

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loadCreatorData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar datos del creador
        const creatorData = await getCreatorById(creatorId);
        setCreator(creatorData);
        
        // Cargar actividades del creador
        try {
            const activitiesData = await getCreatorActivities(creatorId);
            setActivities(activitiesData);
          } catch (error) {
            console.error('Error loading creator activities:', error);
            setActivities([]);
          }
        
          try {
            const storyboardsData = await getCreatorStoryboards(creatorId);
            setStoryboards(storyboardsData);
          } catch (error) {
            console.error('Error loading creator storyboards:', error);
            setStoryboards([]);
          }
      } catch (error) {
        console.error('Error loading creator data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCreatorData();
  }, [creatorId]);

  // Obtener nombre completo
  const getFullName = () => {
    if (!creator) return '';
    return `${creator.first_name || ''} ${creator.last_name || ''}`.trim();
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    
    return new Intl.DateTimeFormat('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Renderizar icono de estado booleano
  const renderBooleanStatus = (value?: boolean) => {
    if (value === undefined || value === null) return '-';
    
    return value ? 
      <Check className="h-5 w-5 text-green-600" /> : 
      <X className="h-5 w-5 text-red-600" />;
  };

  // Renderizar badge de estado
  const renderStatusBadge = (status?: string) => {
    if (!status) return '-';
    
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

  // Renderizar icono de actividad
  const renderActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'storyboard_created': <FileText className="h-5 w-5 text-blue-600" />,
      'contract_signed': <FileSignature className="h-5 w-5 text-green-600" />,
      'onboarding': <Send className="h-5 w-5 text-purple-600" />,
      'status_change': <Activity className="h-5 w-5 text-yellow-600" />,
      'content_published': <Play className="h-5 w-5 text-red-600" />
    };
    
    return icons[type] || <Activity className="h-5 w-5 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-[200px]" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-8 w-[150px]" />
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-5 w-[100px]" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1 lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-[120px] mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Creador no encontrado</h1>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No se encontró el creador solicitado.</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/creators')}
            >
              Volver a creadores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/creators')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{getFullName()}</h1>
        
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/creators/${creatorId}/storyboards/new`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Nuevo Storyboard
          </Button>
          
          <Button
            onClick={() => router.push(`/creators/${creatorId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-xl">
                    {getFullName().substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold">{getFullName()}</h2>
                
                <div className="flex items-center text-gray-500 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{creator.email}</span>
                </div>
                
                <div className="mt-2">
                  {renderStatusBadge(creator.status)}
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div>
                    <p className="text-gray-500 text-sm">Contenidos</p>
                    <p className="font-semibold">{creator.content_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">País</p>
                    <p className="font-semibold">{creator.country || '-'}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="w-full text-left">
                  <h3 className="text-sm font-medium mb-2">Enlaces rápidos</h3>
                  
                  {creator.portfolio_url && (
                    <a 
                      href={creator.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline mb-2"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Ver portfolio
                    </a>
                  )}
                  
                  {creator.whatsapp_link && (
                    <a 
                      href={creator.whatsapp_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:underline"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contactar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="storyboards">Storyboards</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información general</CardTitle>
                  <CardDescription>
                    Datos generales del creador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{creator.email}</p>
                      </div>
                    </div>
                    
                    {creator.email_representative && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email Representante</p>
                          <p>{creator.email_representative}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.email_agency && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email Agencia</p>
                          <p>{creator.email_agency}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.email_billing && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email Facturación</p>
                          <p>{creator.email_billing}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.agency_name && (
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Agencia</p>
                          <p>{creator.agency_name}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.country && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">País</p>
                          <p>{creator.country}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.platform && (
                      <div className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Plataforma</p>
                          <p>{creator.platform}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.business_type && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Tipo de negocio</p>
                          <p>{creator.business_type}</p>
                        </div>
                      </div>
                    )}
                    
                    {creator.responsible && (
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Responsable</p>
                          <p>{creator.responsible}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha de registro</p>
                        <p>{formatDate(creator.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estado contractual</CardTitle>
                  <CardDescription>
                    Información sobre el contrato y onboarding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Onboarding</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Mail enviado</span>
                          <div>{renderBooleanStatus(creator.onboarding_mail_sent)}</div>
                        </div>
                        
                        {creator.onboarding_mail_time && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Fecha de envío</span>
                            <span>{formatDate(creator.onboarding_mail_time)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status Tipalti</span>
                          <span>{creator.tipalti_status || '-'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Login en Tipalti</span>
                          <div>{renderBooleanStatus(creator.tipalti_login)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Contrato</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tipo de contrato</span>
                          <span>{creator.contract_type || '-'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Contrato firmado</span>
                          <div>{renderBooleanStatus(creator.contract_signed)}</div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Estado</span>
                          <div>{renderStatusBadge(creator.status)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storyboards">
              <Card>
                <CardHeader>
                  <CardTitle>Storyboards</CardTitle>
                  <CardDescription>
                    Storyboards creados para este creador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {storyboards.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storyboards.map((storyboard) => (
                          <TableRow key={storyboard.id}>
                            <TableCell className="font-medium">
                              {storyboard.title}
                            </TableCell>
                            <TableCell>
                              {storyboard.client_name || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`
                                  ${storyboard.status === 'published' ? 'bg-green-50 text-green-700' : ''}
                                  ${storyboard.status === 'draft' ? 'bg-yellow-50 text-yellow-700' : ''}
                                  ${storyboard.status === 'rejected' ? 'bg-red-50 text-red-700' : ''}
                                  ${storyboard.status === 'pending' ? 'bg-blue-50 text-blue-700' : ''}
                                `}
                              >
                                {storyboard.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(storyboard.created_at)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/storyboards/${storyboard.id}`)}>
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/storyboards/${storyboard.id}/edit`)}>
                                    Editar
                                  </DropdownMenuItem>
                                  {storyboard.slides_url && (
                                    <DropdownMenuItem onClick={() => window.open(storyboard.slides_url, '_blank')}>
                                      Ver presentación
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay storyboards para este creador</p>
                      <Button 
                        className="mt-4"
                        onClick={() => router.push(`/creators/${creatorId}/storyboards/new`)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear storyboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de actividad</CardTitle>
                  <CardDescription>
                    Registro de actividades para este creador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-8">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                          <div className="mt-1">
                            {renderActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <h4 className="font-medium">
                                {activity.description}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(activity.created_at)}
                              </p>
                            </div>
                            
                            {activity.storyboard_id && (
                              <p className="text-sm text-gray-600 mt-1">
                                Storyboard: {activity.storyboard_title || activity.storyboard_id}
                              </p>
                            )}
                            
                            {activity.status && (
                              <div className="mt-2">
                                {renderStatusBadge(activity.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No hay actividades registradas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}