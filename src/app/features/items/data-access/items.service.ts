// src/app/features/items/data-access/items.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Interfaz que representa la estructura mínima de un "Item" (post)
 * que retorna la API (id, título y cuerpo).
 */
export interface Item {
  id: number;
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  /** 
 * Lee del LocalStorage la lista guardada (si existe), si no existe devuelve [].
 */
  private readLocalItems(): Item[]{
    try {
      const raw = localStorage.getItem('items_local');
      return raw ? JSON.parse(raw) as Item []: [];

    }catch{
      return [];
    }
  }

  /**
 * Guarda en LocalStorage la lista completa.
 */
private saveLocalItems(items:Item[]) {
  localStorage.setItem('items_local', JSON.stringify(items));
}

/**
 * createItem - crea un item localmente y lo persiste.
 * Devuelve el item creado.
 */


// Usar la variable del environment para la URL base de la API, de modo que
createItem( payload: Partial<Item>): Item {
  const current = this.readLocalItems();
  //Generar un id nuevo (simplemente +1 del mayor id actual)
  const maxId= current.length ? Math.max(...current.map(i=>i.id)):0;
  const newItem: Item = {
    id: maxId +1,
    title: payload.title || '',
    body: payload.body || ''
  };
  const updated = [...current, newItem];
  this.saveLocalItems(updated);
  return newItem;
}


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








  // pueda cambiarse según el build (dev/prod) y sea más fácil mockear en
  // pruebas.
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

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
