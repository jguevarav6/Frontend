import { Component, OnInit } from '@angular/core';
import { ItemsService, Item } from '../../data-access/items.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../../core/toast.service';
import { ConfirmService } from '../../../../core/confirm.service';
import { loadItems, loadItemsSuccess, createItem, updateItem, deleteItem } from '../../state/items.actions';
import { selectAllItems, selectItemsLoading, selectItemsTotal } from '../../state/items.selectors';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit {
  // Items provistos por el store (NgRx)
  items$: Observable<Item[]>;

  // Stream para la consulta (filtro) usado en el filtrado del lado cliente.
  // querySubject emite el texto actual del buscador; 'query' es la variable
  // vinculada al input para mostrar el texto en la UI.
  private querySubject = new BehaviorSubject<string>('');
  query = ''; // valor mostrado en el input

  // Stream derivado que aplica el filtro de búsqueda a la lista actual.
  filteredItems$: Observable<Item[]>;

  // Flags de estado para la UI
  loading = false; // carga inicial
  error: string | null = null; // mensaje de error a mostrar

  // Variables de paginación
  page = 1; // página actual
  limit = 10; // elementos por página
  hasMore = true; // indica si hay más páginas
  loadingMore = false; // estado mientras carga "cargar más"
  // Eliminamos el subject local y usamos el store + ItemsService para mantener
  // la lista sincronizada con LocalStorage cuando el usuario crea/edita/elimina.

  // ItemsService: servicio que encapsula llamadas a la API
  // estado para manejar error de carga del logo
  logoLoadError = false;
  // Inline edit state
  editingId: number | null = null;
  editModel: Partial<Item> = { title: '', body: '' };
  constructor(private itemsSvc: ItemsService, private store: Store, private toast: ToastService, private confirmService: ConfirmService) {
    // enlazamos items$ al selector del store
  // Aseguramos el tipo explícito para que TypeScript infiera Observable<Item[]>
  this.items$ = this.store.select(selectAllItems) as Observable<Item[]>;
    this.filteredItems$ = combineLatest([this.items$, this.querySubject.asObservable()]).pipe(
      map(([items, q]) => {
        const term = (q || '').toLowerCase().trim();
        if (!term) return items;
        return items.filter((it) => it.title.toLowerCase().includes(term) || String(it.id).includes(term));
      })
    );
    // sincronizamos la bandera local de loading
  (this.store.select(selectItemsLoading) as Observable<boolean>).subscribe((v) => (this.loading = v));

  // combinamos items$ y total para calcular hasMore de forma reactiva
  combineLatest([this.items$, this.store.select(selectItemsTotal) as Observable<number | null>]).subscribe(
    ([items, total]) => {
      if (typeof total === 'number') {
        this.hasMore = items.length < total;
      } else {
        // si no hay total disponible, mantenemos hasMore true para permitir seguir cargando
        this.hasMore = true;
      }
    }
  );
  }

  // Ciclo de vida: al inicializar el componente, solicitamos la primera página
  ngOnInit(): void {
    // solicitamos la primera página a través del store (efectos harán la llamada)
    this.store.dispatch(loadItems({ page: 1, limit: this.limit }));
  }

  // Obtiene datos del servicio y publica los resultados en itemsSubject.
  // Esto mantiene la plantilla reactiva (lee desde items$ / filteredItems$)
  // sin cambiar la lógica de paginación existente.
  /**
   * fetch
   * Solicita una página de items al servicio y actualiza el stream interno.
   * @param page número de página
   * @param append si true agrega los resultados a la lista existente (paginación)
   */
  fetch(page = 1, append = false) {
    // Use store-driven loading flags (effects/reducer will update loading).
    this.error = null;

  // solicitamos la página al store; ItemsEffects realizará la llamada y
  // actualizará el estado. Aquí sólo disparamos la acción.
  this.store.dispatch(loadItems({ page, limit: this.limit, append }));
  this.page = page;
  }

  /**
   * loadMore
   * Método llamado por el botón "Cargar más" para solicitar la siguiente página.
   */
  loadMore() {
    if (!this.hasMore) return;
    this.fetch(this.page + 1, true);
  }

  // Método invocado desde la plantilla cuando cambia el buscador.
  // Actualiza el BehaviorSubject que usa filteredItems$.
  onQueryChange(value: string) {
    this.query = value;
    this.querySubject.next(value);
  }

  /**
   * Función trackBy para ngFor que mejora el rendimiento al renderizar.
   * Usar trackBy evita re-crear elementos del DOM cuando la colección
   * cambia, siempre que los items mantengan los mismos ids.
   */
  trackById(index: number, item: Item) {
    return item.id;
  }
  /**
 * Crear un item (llama al servicio que guarda en LocalStorage),
 * y después actualiza el stream interno itemsSubject para que la lista se refresque.
 */
  createLocalItem(title: string, body: string) {
    this.store.dispatch(createItem({ payload: { title, body } }));
  }

  // Si la imagen del logo falla en cargar, activamos el fallback
  onLogoError() {
    this.logoLoadError = true;
  }

/**
 * Eliminar item local (llama al servicio) y actualiza la lista visible.
 */
removeLocalItem(id: number) {
    this.confirmService.confirmAsync({ message: '¿Eliminar este elemento?' }).then((confirmed: boolean) => {
      if (confirmed) this.store.dispatch(deleteItem({ id }));
    });
}

/**
 * Editar item local: actualiza y reemplaza en el stream.
 */
editLocalItem(id: number, changes: Partial<Item>) {
  this.store.dispatch(updateItem({ id, changes }));
}
  // Start an inline edit for an item
  startInlineEdit(item: Item) {
    this.editingId = item.id;
    this.editModel = { title: item.title, body: item.body };
    setTimeout(() => {
      const el = document.getElementById('edit-title-' + item.id) as HTMLInputElement | null;
      if (el) el.focus();
    }, 0);
  }

  saveInlineEdit() {
    if (!this.editingId) return;
    this.editLocalItem(this.editingId, { title: this.editModel.title || '', body: this.editModel.body || '' });
    this.cancelInlineEdit();
  }

  cancelInlineEdit() {
    this.editingId = null;
    this.editModel = { title: '', body: '' };
  }
}
