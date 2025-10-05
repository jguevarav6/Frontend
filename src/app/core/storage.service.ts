import { Injectable } from '@angular/core';

/**
 * Servicio utilitario para operaciones de localStorage
 * Elimina duplicación de código en toda la aplicación
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  /**
   * Obtiene y parsea un valor de localStorage de forma segura
   * @param key - Clave del localStorage
   * @param defaultValue - Valor por defecto si no existe o hay error
   * @returns El valor parseado o el valor por defecto
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Guarda un valor en localStorage serializándolo a JSON
   * @param key - Clave del localStorage
   * @param value - Valor a guardar (será convertido a JSON)
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al guardar en localStorage [${key}]:`, error);
    }
  }

  /**
   * Elimina un item del localStorage
   * @param key - Clave a eliminar
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Verifica si existe una clave en localStorage
   * @param key - Clave a verificar
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
