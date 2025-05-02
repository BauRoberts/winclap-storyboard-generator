///Users/bautistaroberts/winclap-storyboard-generator/src/app/(dashboard)/form/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Wand2, AlertCircle, ArrowRight } from 'lucide-react';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Esquema de validación con todos los campos requeridos
const formSchema = z.object({
  cliente: z.string().min(2, { message: 'El nombre del cliente es requerido' }),
  objetivo: z.string().min(10, { message: 'El objetivo debe tener al menos 10 caracteres' }),
  target: z.string().min(5, { message: 'La descripción del target es requerida' }),
  mensaje: z.string().min(10, { message: 'El mensaje clave es requerido' }),
  plataforma: z.string(), // Sin default para evitar errores de tipo
  mom: z.string().min(20, { message: 'El MOM debe tener al menos 20 caracteres' }),
  creador: z.string().min(2, { message: 'El nombre del creador es requerido' }),
  referencias: z.string().optional().or(z.literal('')),
});

// Tipo del formulario
type FormValues = z.infer<typeof formSchema>;

export default function BriefingForm() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('cliente');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Inicialización simplificada del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      objetivo: '',
      target: '',
      mensaje: '',
      plataforma: 'tiktok',
      mom: '',
      creador: '',
      referencias: '',
    },
  });

  // Verificar estado de autenticación
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setError(null);
    console.log('➡️ Enviando formulario con:', values);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
  
      const result = await response.json();
  
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error generando contenido con IA');
      }
  
      localStorage.setItem('aiContent', JSON.stringify(result.aiContent));
      localStorage.setItem('briefData', JSON.stringify(values));
      router.push('/review');
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  }
  


  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">🪄</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Winclap Storyboard Generator</h1>
        <p className="text-gray-500">Completa el briefing para generar un storyboard profesional</p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

{Object.keys(form.formState.errors).length > 0 && (
  <pre className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-md overflow-x-auto">
    {JSON.stringify(form.formState.errors, null, 2)}
  </pre>
)}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="cliente" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Información del Cliente
              </TabsTrigger>
              <TabsTrigger value="campaign" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Detalles de Campaña
              </TabsTrigger>
              <TabsTrigger value="creative" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Contenido Creativo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cliente" className="mt-0">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                  <CardDescription>
                    Datos básicos del cliente y la campaña
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Nike" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="creador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creador Asignado</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del creador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plataforma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plataforma</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una plataforma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('campaign')}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="campaign" className="mt-0">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Detalles de Campaña</CardTitle>
                  <CardDescription>
                    Objetivos y público objetivo de la campaña
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="objetivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivo de la campaña</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Aumentar descargas de la app" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Jóvenes de 18-24 años interesados en fitness" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mensaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje clave</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ej: Nuestra app te ayuda a encontrar las zapatillas perfectas en segundos" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('cliente')}
                    className="border-gray-200"
                  >
                    Atrás
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('creative')}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="creative" className="mt-0">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Contenido Creativo</CardTitle>
                  <CardDescription>
                    Detalles creativos y referencias para el storyboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOM (Momento de Inspiración)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe el momento, sensación o idea central que quieres transmitir" 
                            {...field} 
                            rows={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Este texto ayudará a definir el tono y estilo del storyboard
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="referencias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencias (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="URLs o descripciones de videos o imágenes de referencia" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Incluye enlaces a videos o imágenes que sirvan como inspiración
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('campaign')}
                    className="border-gray-200"
                  >
                    Atrás
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generar Storyboard
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}