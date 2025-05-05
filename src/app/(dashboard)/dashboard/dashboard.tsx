// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Archive
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">Resumen de actividad de Winclap Storyboard Generator</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Storyboards Generados</CardTitle>
            <CardDescription className="text-2xl font-bold">24</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-green-500 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clientes Activos</CardTitle>
            <CardDescription className="text-2xl font-bold">8</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-green-500 text-xs">
              <Users className="h-3 w-3 mr-1" />
              <span>2 nuevos este mes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tiempo Promedio</CardTitle>
            <CardDescription className="text-2xl font-bold">5.2 min</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-green-500 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              <span>-18% más rápido</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimos storyboards generados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Archive className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Cliente {i} - Storyboard de Campaña</p>
                      <p className="text-sm text-gray-500">Hace {i} días</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Rendimiento del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="relative pt-1">
                  <p className="text-xs font-medium mb-1 flex justify-between">
                    <span>Cumplimiento</span>
                    <span>92%</span>
                  </p>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: "92%" }} 
                      className="rounded shadow-none flex flex-col whitespace-nowrap justify-center bg-green-500" 
                    />
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <p className="text-xs font-medium mb-1 flex justify-between">
                    <span>Satisfacción</span>
                    <span>88%</span>
                  </p>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: "88%" }} 
                      className="rounded shadow-none flex flex-col whitespace-nowrap justify-center bg-blue-500" 
                    />
                  </div>
                </div>
                
                <div className="relative pt-1">
                  <p className="text-xs font-medium mb-1 flex justify-between">
                    <span>Eficiencia</span>
                    <span>78%</span>
                  </p>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: "78%" }} 
                      className="rounded shadow-none flex flex-col whitespace-nowrap justify-center bg-purple-500" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}