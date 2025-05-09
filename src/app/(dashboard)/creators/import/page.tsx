'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Upload, File, Check, AlertTriangle, X } from 'lucide-react';
import { importCreatorsFromCSV } from '@/services/creatorService';
import { Progress } from '@/components/ui/progress';
import Papa from 'papaparse';

export default function ImportCreatorsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    errors: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Verificar que sea un CSV
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('El archivo debe ser un CSV válido');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  // Manejar importación
  const handleImport = async () => {
    if (!selectedFile) return;
    
    try {
      setIsImporting(true);
      setProgress(0);
      
      // Parsear CSV
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Validar datos
            if (results.data.length === 0) {
              setError('El archivo no contiene datos');
              setIsImporting(false);
              return;
            }
            
            // Verificar que tenga las columnas requeridas
            const requiredColumns = ['First Name', 'Last Name', 'Email Creator'];
            const missingColumns = requiredColumns.filter(
              col => !results.meta.fields?.includes(col)
            );
            
            if (missingColumns.length > 0) {
              setError(`Faltan columnas requeridas: ${missingColumns.join(', ')}`);
              setIsImporting(false);
              return;
            }
            
            // Simulación de progreso
           let currentProgress = 0;
           const progressInterval = setInterval(() => {
             currentProgress += 5;
             if (currentProgress >= 90) {
               clearInterval(progressInterval);
             }
             setProgress(currentProgress);
           }, 200);
           
           // Importar creadores
           const importResult = await importCreatorsFromCSV(results.data);
           
           // Finalizar progreso
           clearInterval(progressInterval);
           setProgress(100);
           setResult(importResult);
           
           // Esperar unos segundos antes de redireccionar
           setTimeout(() => {
             router.push('/creators');
             router.refresh();
           }, 3000);
         } catch (err) {
           setError(`Error al importar: ${err instanceof Error ? err.message : String(err)}`);
           setProgress(0);
         } finally {
           setIsImporting(false);
         }
       },
       error: (err) => {
         setError(`Error al parsear el CSV: ${err.message}`);
         setIsImporting(false);
       }
     });
   } catch (err) {
     setError(`Error al procesar el archivo: ${err instanceof Error ? err.message : String(err)}`);
     setIsImporting(false);
   }
 };

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
       <h1 className="text-2xl font-bold">Importar creadores</h1>
     </div>
     
     <Card className="mb-6 max-w-2xl mx-auto">
       <CardHeader>
         <CardTitle>Importación desde CSV</CardTitle>
         <CardDescription>
           Sube un archivo CSV con la información de los creadores para importarlos al sistema.
         </CardDescription>
       </CardHeader>
       <CardContent>
         {!result ? (
           <>
             <div 
               className={`
                 border-2 border-dashed rounded-lg p-10 text-center mb-6
                 ${isImporting ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'}
                 ${error ? 'border-red-300 bg-red-50' : ''}
                 transition-colors
               `}
               onClick={() => !isImporting && fileInputRef.current?.click()}
             >
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept=".csv"
                 onChange={handleFileChange}
                 disabled={isImporting}
               />
               
               {isImporting ? (
                 <div className="flex flex-col items-center">
                   <Upload className="h-10 w-10 text-blue-500 mb-4 animate-pulse" />
                   <h3 className="text-lg font-medium mb-2">Importando creadores...</h3>
                   <p className="text-gray-500 mb-4">
                     Por favor, espera mientras se procesan los datos.
                   </p>
                   <Progress value={progress} className="w-full max-w-xs" />
                   <p className="text-sm text-gray-500 mt-2">{progress}%</p>
                 </div>
               ) : selectedFile ? (
                 <div className="flex flex-col items-center">
                   <File className="h-10 w-10 text-blue-500 mb-4" />
                   <h3 className="text-lg font-medium mb-2">Archivo seleccionado</h3>
                   <p className="text-gray-500 mb-1">{selectedFile.name}</p>
                   <p className="text-sm text-gray-400">
                     {(selectedFile.size / 1024).toFixed(2)} KB
                   </p>
                   
                   {error && (
                     <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                       <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                       <p className="text-sm">{error}</p>
                     </div>
                   )}
                   
                   <div className="flex gap-2 mt-4">
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedFile(null);
                         setError(null);
                         if (fileInputRef.current) {
                           fileInputRef.current.value = '';
                         }
                       }}
                     >
                       <X className="h-4 w-4 mr-1" />
                       Cambiar
                     </Button>
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                   <Upload className="h-10 w-10 text-gray-400 mb-4" />
                   <h3 className="text-lg font-medium mb-2">Selecciona un archivo CSV</h3>
                   <p className="text-gray-500 mb-1">Arrastra y suelta o haz clic para explorar</p>
                   <p className="text-sm text-gray-400">
                     Solo archivos CSV con las columnas requeridas
                   </p>
                   
                   {error && (
                     <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                       <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                       <p className="text-sm">{error}</p>
                     </div>
                   )}
                 </div>
               )}
             </div>
             
             <div className="flex justify-between">
               <Button 
                 variant="outline"
                 onClick={() => router.push('/creators')}
               >
                 Cancelar
               </Button>
               
               <Button 
                 onClick={handleImport} 
                 disabled={!selectedFile || isImporting}
               >
                 <Upload className="mr-2 h-4 w-4" />
                 {isImporting ? 'Importando...' : 'Importar creadores'}
               </Button>
             </div>
           </>
         ) : (
           <div className="flex flex-col items-center py-6">
             {result.errors > 0 ? (
               <div className="flex flex-col items-center">
                 <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                   <AlertTriangle className="h-8 w-8 text-yellow-600" />
                 </div>
                 <h3 className="text-lg font-medium mb-2">Importación completada con advertencias</h3>
                 <p className="text-gray-500 mb-4 text-center">
                   Se importaron {result.success} creadores correctamente.
                   <br />
                   Hubo problemas con {result.errors} registros.
                 </p>
               </div>
             ) : (
               <div className="flex flex-col items-center">
                 <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                   <Check className="h-8 w-8 text-green-600" />
                 </div>
                 <h3 className="text-lg font-medium mb-2">Importación completada</h3>
                 <p className="text-gray-500 mb-4 text-center">
                   Se importaron {result.success} creadores correctamente.
                 </p>
               </div>
             )}
             
             <p className="text-sm text-gray-400 mb-4">
               Serás redirigido a la lista de creadores en unos segundos...
             </p>
             
             <Button onClick={() => router.push('/creators')}>
               Ver creadores
             </Button>
           </div>
         )}
       </CardContent>
     </Card>
     
     <Card className="max-w-2xl mx-auto">
       <CardHeader>
         <CardTitle>Formato esperado</CardTitle>
         <CardDescription>
           El archivo CSV debe contener las siguientes columnas:
         </CardDescription>
       </CardHeader>
       <CardContent>
         <div className="space-y-2">
           <p className="font-medium">Columnas requeridas:</p>
           <ul className="list-disc pl-5 space-y-1">
             <li>First Name</li>
             <li>Last Name</li>
             <li>Email Creator</li>
           </ul>
           
           <p className="font-medium mt-4">Columnas opcionales:</p>
           <ul className="list-disc pl-5 space-y-1 grid grid-cols-1 md:grid-cols-2">
             <li>Email Representante</li>
             <li>Email Agencia</li>
             <li>Email Brkaway</li>
             <li>Email Facturacion/Tipalti</li>
             <li>Nombre Agencia</li>
             <li>Country</li>
             <li>Type of business</li>
             <li>Status</li>
             <li>Mail OB Enviado?</li>
             <li>Alta en Tipalti</li>
             <li>Se Logueo en Tipalti</li>
             <li>Tipo de Contrato</li>
             <li>Firmó contrato?</li>
             <li>Portfolio Brkaway</li>
             <li>WPP Link</li>
             <li>Responsable</li>
             <li>Otro Mail</li>
             <li>Hora de envio Mail OB</li>
           </ul>
         </div>
       </CardContent>
     </Card>
   </div>
 );
}