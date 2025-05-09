// src/components/forms/CreatorForm.tsx
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Creator, createCreator, updateCreator } from '@/services/creatorService';
import { Loader2 } from 'lucide-react';

interface CreatorFormProps {
  creator?: Creator;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatorForm({ creator, onSuccess, onCancel }: CreatorFormProps) {
  const [formData, setFormData] = useState<Partial<Creator>>({
    name: creator?.name || '',
    category: creator?.category || '',
    platform: creator?.platform || '',
    email: creator?.email || '',
    followers: creator?.followers || '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Creator, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof Creator]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Creator, string>> = {};
    
    if (typeof formData.name === 'string' && !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      if (creator?.id) {
        await updateCreator(creator.id, formData as Creator);
      } else {
        await createCreator(formData as Creator);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving creator:', error);
      setErrors({ name: 'Error al guardar. Por favor, intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
        <Input 
          id="name"
          name="name"
          value={typeof formData.name === 'string' ? formData.name : ''}
          onChange={handleChange}
          disabled={isSubmitting}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Input 
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="platform">Plataforma</Label>
        <Input 
          id="platform"
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="followers">Seguidores</Label>
        <Input 
          id="followers"
          name="followers"
          value={typeof formData.followers === 'boolean' ? '' : formData.followers}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            creator?.id ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  );
}