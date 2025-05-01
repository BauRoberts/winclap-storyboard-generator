// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    objetivo: '',
    target: '',
    mensaje: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <p className="text-center p-8">Cargando...</p>;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-8">Winclap Storyboard Generator</h1>
        <p className="mb-6">Inicia sesión para generar storyboards</p>
        <button
          onClick={() => signIn('google')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Iniciar sesión con Google
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Winclap Storyboard Generator</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cliente">
            Cliente
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="cliente"
            name="cliente"
            type="text"
            placeholder="Ej: Nike"
            value={formData.cliente}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="objetivo">
            Objetivo de la campaña
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="objetivo"
            name="objetivo"
            type="text"
            placeholder="Ej: Aumentar descargas de la app"
            value={formData.objetivo}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="target">
            Target
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="target"
            name="target"
            type="text"
            placeholder="Ej: Jóvenes de 18-24 años interesados en fitness"
            value={formData.target}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mensaje">
            Mensaje clave
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="mensaje"
            name="mensaje"
            placeholder="Ej: Nuestra app te ayuda a encontrar las zapatillas perfectas en segundos"
            value={formData.mensaje}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
        
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar Storyboard con IA'}
          </button>
        </div>
      </form>
      
      {result && (
        <div className="bg-gray-100 p-6 rounded-lg">
          {result.error ? (
            <p className="text-red-600">Error: {result.error}</p>
          ) : (
            <>
              <p className="text-green-600 text-lg font-semibold mb-4">¡Storyboard generado con éxito!</p>
              <p className="mb-4">El storyboard ha sido creado basado en tu brief y mejorado con IA.</p>
              <div className="flex justify-center">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                >
                  Ver storyboard en Google Slides
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}