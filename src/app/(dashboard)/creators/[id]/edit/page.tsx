///Users/bautistaroberts/winclap-storyboard-generator/src/app/(dashboard)/creators/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Save, X } from 'lucide-react';
import { 
  getCreatorById,
  createCreator,
  updateCreator
} from '@/services/creatorService';
import { Skeleton } from '@/components/ui/skeleton';

// Schema de validación
const creatorFormSchema = z.object({
  first_name: z.string().min(1, { message: 'El nombre es requerido' }),
  last_name: z.string().min(1, { message: 'El apellido es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  email_representative: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  email_agency: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  email_brkaway: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  email_billing: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  additional_email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  agency_name: z.string().optional(),
  country: z.string().optional(),
  business_type: z.string().optional(),
  status: z.string().optional(),
  platform: z.string().optional(),
  category: z.string().optional(),
  onboarding_mail_sent: z.boolean().optional(),
  tipalti_status: z.string().optional(),
  tipalti_login: z.boolean().optional(),
  contract_type: z.string().optional(),
  contract_signed: z.boolean().optional(),
  portfolio_url: z.string().url({ message: 'URL inválida' }).optional().or(z.literal('')),
  whatsapp_link: z.string().url({ message: 'URL inválida' }).optional().or(z.literal('')),
  responsible: z.string().optional(),
});

type CreatorFormValues = z.infer<typeof creatorFormSchema>;

export default function CreatorFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditMode = params?.id !== undefined;
  const creatorId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  // Configurar formulario
  const form = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      email_representative: '',
      email_agency: '',
      email_brkaway: '',
      email_billing: '',
      additional_email: '',
      agency_name: '',
      country: '',
      business_type: '',
      status: 'Pendiente',
      platform: '',
      category: '',
      onboarding_mail_sent: false,
      tipalti_status: '',
      tipalti_login: false,
      contract_type: '',
      contract_signed: false,
      portfolio_url: '',
      whatsapp_link: '',
      responsible: '',
    },
  });

  // Cargar datos del creador en modo edición
  useEffect(() => {
    const loadCreator = async () => {
      if (!isEditMode) return;
      
      try {
        setIsLoading(true);
        const creatorData = await getCreatorById(creatorId);
        
        if (creatorData) {
          // Actualizar valores del formulario
          Object.keys(form.getValues()).forEach((key) => {
            if (key in creatorData) {
              form.setValue(
                key as keyof CreatorFormValues,
                typeof creatorData[key] === 'number' ? String(creatorData[key]) : creatorData[key]
              );
            }
          });
        }
      } catch (error) {
        console.error('Error loading creator:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCreator();
  }, [creatorId, form, isEditMode]);

  // Manejar envío del formulario
  const onSubmit = async (values: CreatorFormValues) => {
    try {
      setIsSaving(true);
      
      if (isEditMode) {
        await updateCreator(creatorId, values);
      } else {
        await createCreator(values);
      }
      
      router.push('/creators');
      router.refresh();
    } catch (error) {
      console.error('Error saving creator:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Estados para selects
  const statusOptions = ['Pendiente', 'Activo', 'Inactivo', 'Contratado', 'En negociación'];
  const platformOptions = ['YouTube', 'Instagram', 'TikTok', 'Twitch', 'Otras'];
  const categoryOptions = ['Tech', 'Lifestyle', 'Gaming', 'Fitness', 'Cocina', 'Moda', 'Viajes', 'Entretenimiento'];
  const countryOptions = ['Argentina', 'México', 'Colombia', 'Chile', 'Perú', 'España', 'Estados Unidos', 'Otro'];
  const businessTypeOptions = ['Persona física', 'Empresa', 'Autónomo', 'Freelancer'];
  const contractTypeOptions = ['Exclusivo', 'No exclusivo', 'Por proyecto', 'Freelance'];
 const tipaltiStatusOptions = ['Pendiente', 'Enviado', 'Completado', 'Rechazado'];
 const responsibleOptions = ['María González', 'Juan Pérez', 'Ana Rodríguez', 'Carlos López', 'Sofía Martínez'];

 if (isLoading) {
   return (
     <div className="container mx-auto py-8 px-4">
       <div className="flex items-center gap-2 mb-6">
         <Button variant="ghost" size="icon">
           <ChevronLeft className="h-5 w-5" />
         </Button>
         <Skeleton className="h-8 w-[200px]" />
       </div>
       
       <Card className="mb-6">
         <CardContent className="p-6">
           <Skeleton className="h-6 w-[150px] mb-4" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {Array(8).fill(0).map((_, i) => (
               <Skeleton key={i} className="h-10 w-full" />
             ))}
           </div>
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
         onClick={() => router.back()}
       >
         <ChevronLeft className="h-5 w-5" />
       </Button>
       <h1 className="text-2xl font-bold">
         {isEditMode ? 'Editar creador' : 'Nuevo creador'}
       </h1>
     </div>
     
     <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)}>
         <Tabs defaultValue="general" className="w-full">
           <TabsList className="mb-6 w-full grid grid-cols-1 md:grid-cols-4">
             <TabsTrigger value="general">Información general</TabsTrigger>
             <TabsTrigger value="contact">Contacto</TabsTrigger>
             <TabsTrigger value="contract">Contrato</TabsTrigger>
             <TabsTrigger value="platform">Plataforma</TabsTrigger>
           </TabsList>
           
           <div className="space-y-6 mb-8">
             <TabsContent value="general">
               <Card>
                 <CardHeader>
                   <CardTitle>Información general</CardTitle>
                   <CardDescription>
                     Datos básicos del creador
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="first_name"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Nombre</FormLabel>
                           <FormControl>
                             <Input placeholder="Nombre" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     
                     <FormField
                       control={form.control}
                       name="last_name"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Apellido</FormLabel>
                           <FormControl>
                             <Input placeholder="Apellido" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   
                   <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="email@ejemplo.com" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="country"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>País</FormLabel>
                           <Select 
                             onValueChange={field.onChange} 
                             value={field.value || ''}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecciona un país" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {countryOptions.map(option => (
                                 <SelectItem key={option} value={option}>
                                   {option}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     
                     <FormField
                       control={form.control}
                       name="business_type"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Tipo de negocio</FormLabel>
                           <Select 
                             onValueChange={field.onChange} 
                             value={field.value || ''}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecciona un tipo" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {businessTypeOptions.map(option => (
                                 <SelectItem key={option} value={option}>
                                   {option}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   
                   <FormField
                     control={form.control}
                     name="status"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Estado</FormLabel>
                         <Select 
                           onValueChange={field.onChange} 
                           value={field.value || ''}
                           defaultValue="Pendiente"
                         >
                           <FormControl>
                             <SelectTrigger>
                               <SelectValue placeholder="Selecciona un estado" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             {statusOptions.map(option => (
                               <SelectItem key={option} value={option}>
                                 {option}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="responsible"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Responsable</FormLabel>
                         <Select 
                           onValueChange={field.onChange} 
                           value={field.value || ''}
                         >
                           <FormControl>
                             <SelectTrigger>
                               <SelectValue placeholder="Selecciona un responsable" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             {responsibleOptions.map(option => (
                               <SelectItem key={option} value={option}>
                                 {option}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </CardContent>
               </Card>
             </TabsContent>
             
             <TabsContent value="contact">
               <Card>
                 <CardHeader>
                   <CardTitle>Información de contacto</CardTitle>
                   <CardDescription>
                     Datos de contacto del creador y agencia
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <FormField
                     control={form.control}
                     name="agency_name"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Nombre de agencia</FormLabel>
                         <FormControl>
                           <Input placeholder="Nombre de la agencia" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="email_representative"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email del representante</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="representante@ejemplo.com" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="email_agency"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email de la agencia</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="agencia@ejemplo.com" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="email_brkaway"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email Brkaway</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="brkaway@ejemplo.com" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="email_billing"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email de facturación</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="facturacion@ejemplo.com" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="additional_email"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Email adicional</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="adicional@ejemplo.com" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   
                   <FormField
                     control={form.control}
                     name="whatsapp_link"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Link de WhatsApp</FormLabel>
                         <FormControl>
                           <Input placeholder="https://wa.me/..." {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </CardContent>
               </Card>
             </TabsContent>
             
             <TabsContent value="contract">
               <Card>
                 <CardHeader>
                   <CardTitle>Información de contrato</CardTitle>
                   <CardDescription>
                     Datos relacionados con el contrato y onboarding
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="contract_type"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Tipo de contrato</FormLabel>
                           <Select 
                             onValueChange={field.onChange} 
                             value={field.value || ''}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecciona un tipo" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {contractTypeOptions.map(option => (
                                 <SelectItem key={option} value={option}>
                                   {option}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     
                     <FormField
                       control={form.control}
                       name="contract_signed"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                             />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                             <FormLabel>Contrato firmado</FormLabel>
                             <FormDescription>
                               Marcar si el creador ha firmado el contrato
                             </FormDescription>
                           </div>
                         </FormItem>
                       )}
                     />
                   </div>
                   
                   <Separator />
                   
                   <h3 className="font-medium">Onboarding</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="onboarding_mail_sent"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                           <FormControl>
                             <Checkbox
                               checked={field.value}
                               onCheckedChange={field.onChange}
                             />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                             <FormLabel>Mail de onboarding enviado</FormLabel>
                             <FormDescription>
                               Marcar si se ha enviado el mail de onboarding
                             </FormDescription>
                           </div>
                         </FormItem>
                       )}
                     />
                     
                     <FormField
                       control={form.control}
                       name="tipalti_status"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Estado en Tipalti</FormLabel>
                           <Select 
                             onValueChange={field.onChange} 
                             value={field.value || ''}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecciona un estado" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {tipaltiStatusOptions.map(option => (
                                 <SelectItem key={option} value={option}>
                                   {option}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   
                   <FormField
                     control={form.control}
                     name="tipalti_login"
                     render={({ field }) => (
                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                         <FormControl>
                           <Checkbox
                             checked={field.value}
                             onCheckedChange={field.onChange}
                           />
                         </FormControl>
                         <div className="space-y-1 leading-none">
                           <FormLabel>Login en Tipalti</FormLabel>
                           <FormDescription>
                             Marcar si el creador ha iniciado sesión en Tipalti
                           </FormDescription>
                         </div>
                       </FormItem>
                     )}
                   />
                 </CardContent>
               </Card>
             </TabsContent>
             
             <TabsContent value="platform">
               <Card>
                 <CardHeader>
                   <CardTitle>Información de plataforma</CardTitle>
                   <CardDescription>
                     Detalles sobre la plataforma y portafolio del creador
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="platform"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Plataforma principal</FormLabel>
                           <Select 
                             onValueChange={field.onChange} 
                             value={field.value || ''}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecciona una plataforma" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {platformOptions.map(option => (
                                 <SelectItem key={option} value={option}>
                                   {option}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     
                     <FormField
                       control={form.control}
                       name="category"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Categoría</FormLabel>
                           <Select 
                             onValueChange={field.onChange} 
                             value={field.value || ''}
                           >
                             <FormControl>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecciona una categoría" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {categoryOptions.map(option => (
                                 <SelectItem key={option} value={option}>
                                   {option}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                   
                   <FormField
                     control={form.control}
                     name="portfolio_url"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>URL de portafolio</FormLabel>
                         <FormControl>
                           <Input placeholder="https://..." {...field} />
                         </FormControl>
                         <FormDescription>
                           URL del portafolio o canal principal del creador
                         </FormDescription>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </CardContent>
               </Card>
             </TabsContent>
           </div>
           
           <div className="flex justify-between mt-8">
             <Button 
               type="button" 
               variant="outline"
               onClick={() => router.back()}
             >
               <X className="mr-2 h-4 w-4" />
               Cancelar
             </Button>
             <Button type="submit" disabled={isSaving}>
               <Save className="mr-2 h-4 w-4" />
               {isSaving ? 'Guardando...' : 'Guardar creador'}
             </Button>
           </div>
         </Tabs>
       </form>
     </Form>
   </div>
 );
}