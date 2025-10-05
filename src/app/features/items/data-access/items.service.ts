// src/app/features/items/data-access/items.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../core/storage.service';

/**
 * Interfaz que representa un Item (post de API o registro local)
 */
export interface Item {
  id: number;
  title: string;
  body: string;
  isFavorite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly STORAGE_KEY = 'items_local';

  /** 
   * Lee del LocalStorage la lista guardada (si existe), si no existe devuelve [].
   */
  private readLocalItems(): Item[] {
    return this.storage.getItem<Item[]>(this.STORAGE_KEY, []) || [];
  }

  /**
   * Guarda en LocalStorage la lista completa.
   */
  private saveLocalItems(items: Item[]) {
    this.storage.setItem(this.STORAGE_KEY, items);
  }

  /**
   * createItem - crea un item localmente y lo persiste.
   * Devuelve el item creado.
   */
  // Usar la variable del environment para la URL base de la API, de modo que
  createItem(payload: Partial<Item>): Item {
    const current = this.readLocalItems();
    // Generar un id nuevo (simplemente +1 del mayor id actual)
    const maxId = current.length ? Math.max(...current.map(i => i.id)) : 0;
    const newItem: Item = {
      id: maxId + 1,
      title: payload.title || '',
      body: payload.body || ''
    };
    const updated = [...current, newItem];
    this.saveLocalItems(updated);
    return newItem;
  }

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) { }

  updateItem(id: number, changes: Partial<Item>): Item | null {
  const current = this.readLocalItems();
  let updated: Item | null = null;
  const next = current.map(it => {
    if (it.id === id) {
      updated = { ...it, ...changes };
      return updated;
    }
    return it;
  });
  if (updated) this.saveLocalItems(next);
  return updated;
}
  deleteItem(id: number):boolean {
    const current = this.readLocalItems();
    const next = current.filter(it => it.id !==id);
    const removed = next.length !== current.length;
    if(removed){ this.saveLocalItems(next);}
    return removed;

  }

  /**
   * getLocalItems
   * Devuelve el arreglo de items almacenados en LocalStorage (sincrónico).
   */
  getLocalItems(): Item[] {
    return this.readLocalItems();
  }

  /**
   * getLocalItem
   * Busca un item local por id y lo devuelve o undefined si no existe.
   */
  getLocalItem(id: number): Item | undefined {
    return this.readLocalItems().find(i => i.id === id);
  }

  /**
   * syncItemsToLocal
   * Sincroniza items de la API con localStorage eliminando duplicados
   */
  syncItemsToLocal(items: Item[], append: boolean = false): void {
    try {
      const current = append ? this.readLocalItems() : [];
      const merged = append ? [...current, ...items] : items;
      
      const unique = merged.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as { [key: number]: Item });
      
      const uniqueItems = Object.values(unique);
      this.saveLocalItems(uniqueItems);
    } catch (e) {
      console.error('[ItemsService] Error en syncItemsToLocal:', e);
    }
  }

  // API REST - URL base configurable por entorno
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * getItems
   * Obtiene un arreglo de items desde la API pública.
   * Opcionalmente acepta:
   * - query: texto de búsqueda (se añade como parámetro 'q')
   * - page: número de página (se añade como '_page')
   * - limit: tamaño de página (se añade como '_limit')
   *
   * Devuelve un Observable con la lista de items. La paginación se
   * apoya en los parámetros que expone jsonplaceholder.
   */
  getItems(opts?: { query?: string; page?: number; limit?: number }): Observable<Item[]> {
    let params = new HttpParams();
    if (opts?.query) params = params.set('q', opts.query);
    if (opts?.page)  params = params.set('_page', String(opts.page));
    if (opts?.limit) params = params.set('_limit', String(opts.limit));

    return this.http.get<Item[]>(`${this.baseUrl}/posts`, { params });
  }

  /**
   * getItemsWithTotal
   * Similar a getItems pero devuelve el total (X-Total-Count) cuando el API lo provee.
   */
  getItemsWithTotal(opts?: { query?: string; page?: number; limit?: number }): Observable<{ items: Item[]; total: number | null }> {
    let params = new HttpParams();
    if (opts?.query) params = params.set('q', opts.query);
    if (opts?.page) params = params.set('_page', String(opts.page));
    if (opts?.limit) params = params.set('_limit', String(opts.limit));

    return this.http
      .get<Item[]>(`${this.baseUrl}/posts`, { params, observe: 'response' })
      .pipe(
        map((resp: any) => {
          const items: Item[] = resp.body || [];
          const totalHeader = resp.headers ? resp.headers.get('X-Total-Count') || resp.headers.get('x-total-count') : null;
          const total = totalHeader ? parseInt(totalHeader, 10) : null;
          return { items, total };
        })
      );
  }

  /**
   * getItem
   * Obtiene el detalle de un item por su id.
   * @param id Identificador numérico del item
   * @returns Observable<Item>
   */
  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/posts/${id}`);
  }
}
