// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AIContent, emptyAIContent } from "@/types/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte una string de camelCase a snake_case
 * Ejemplo: "sceneName" -> "scene_name"
 */
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convierte una string de snake_case a camelCase
 * Ejemplo: "scene_name" -> "sceneName"
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convierte un objeto con claves en camelCase a un objeto con claves en snake_case
 */
export function convertObjectKeysToSnakeCase<T extends object>(obj: T): Record<string, any> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    result[camelToSnakeCase(key)] = value;
    return result;
  }, {} as Record<string, any>);
}

/**
 * Convierte un objeto con claves en snake_case a un objeto con claves en camelCase
 */
export function convertObjectKeysToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.entries(obj).reduce((result, [key, value]) => {
    // Si el valor es null o undefined, simplemente pasar el valor
    if (value === null || value === undefined) {
      result[snakeToCamelCase(key)] = value;
      return result;
    }
    
    // Si el valor es un objeto (pero no un array o Date), convertir recursivamente
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeToCamelCase(key)] = convertObjectKeysToCamelCase(value);
    } else {
      result[snakeToCamelCase(key)] = value;
    }
    
    return result;
  }, {} as Record<string, any>);
}

/**
 * Crea un objeto AIContent a partir de texto plano
 * Esta función es útil para convertir texto sin formato a la estructura esperada por el editor
 */
export function createAIContentFromText(text: string): AIContent {
  if (!text || text.trim() === '') {
    return emptyAIContent;
  }
  
  // Crear un objeto básico con el texto en los campos más importantes
  return {
    ...emptyAIContent,
    description: text,
    objective: "Extraído del texto original",
    hook: text.split('\n')[0].substring(0, 50) // Primera línea como hook
  };
}