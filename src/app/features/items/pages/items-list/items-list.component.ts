import { Component, OnInit } from '@angular/core';
import { ItemsService, Item } from '../../data-access/items.service';
import { combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { ToastService } from '../../../../core/toast.service';
import { ConfirmService } from '../../../../core/confirm.service';
import { ExportService } from '../../../../core/export.service';

import {
  loadItems, loadItemsSuccess, createItem, updateItem, deleteItem, setFilter,
  deleteItemSuccess, deleteItemsSuccess, deleteItems,
  toggleSelectItem, clearSelection, refreshFromAPI,
  createItemSuccess, updateItemSuccess,
  toggleFavorite, setShowOnlyFavorites, setSortBy,
  SortField, SortDirection
} from '../../state/items.actions';

import {
  selectAllItems, selectItemsLoading, selectItemsTotal,
  selectItemsFilterQuery, selectItemsSelectedIds,
  selectFilteredItems, selectShowOnlyFavorites, selectSortBy
} from '../../state/items.selectors';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit {
  // Data
  items$: Observable<Item[]>;
  filteredItems$: Observable<Item[]>;
  selectedIds$: Observable<number[]>;
  showOnlyFavorites$: Observable<boolean>;
  sortBy$: Observable<{ field: SortField; direction: SortDirection }>;

  // UI state
  query = '';
  loading = false;
  error: string | null = null;
  hasMore = true;
  page = 1;
  limit = 10;

  // Inline edit
  editingId: number | null = null;
  editModel: Partial<Item> = { title: '', body: '' };

  // Inline per-item confirmation (no native alert)
  pendingDeleteId: number | null = null;
  private waitingForConfirm = false;
  private confirmTimeoutHandle: any = null;

  // Logo fallback
  logoLoadError = false;

  // Control de notificaciones para evitar spam
  private lastNotificationTime = 0;
  private notificationCooldown = 500; // ms entre notificaciones

  // Prevenir múltiples eliminaciones simultáneas
  private isDeleting = false;
  private deletingIds = new Set<number>();

  constructor(
    private itemsSvc: ItemsService,
    private store: Store,
    private toast: ToastService,
    private confirmService: ConfirmService,
    private actions$: Actions,
    private exportService: ExportService
  ) {
    this.items$ = this.store.select(selectAllItems) as Observable<Item[]>;
    // Usar el selector combinado que incluye filtrado, favoritos y ordenamiento
    this.filteredItems$ = this.store.select(selectFilteredItems) as Observable<Item[]>;
    this.showOnlyFavorites$ = this.store.select(selectShowOnlyFavorites) as Observable<boolean>;
    this.sortBy$ = this.store.select(selectSortBy);

    (this.store.select(selectItemsLoading) as Observable<boolean>)
      .subscribe((v) => (this.loading = v));

    // ELIMINADO: Notificaciones duplicadas que causaban el problema
    // Las notificaciones ahora se muestran solo en los métodos requestDelete y deleteSelected

    this.selectedIds$ = this.store.select(selectItemsSelectedIds) as Observable<number[]>;

    combineLatest([this.items$, this.store.select(selectItemsTotal) as Observable<number | null>])
      .subscribe(([items, total]) => {
        const itemCount = items?.length || 0;
        // Si hay un total explícito de la API, usarlo
        if (typeof total === 'number' && total > 0) {
          this.hasMore = itemCount < total;
        } else {
          // Sin total conocido, permitir cargar hasta que la API devuelva menos items que el límite
          this.hasMore = itemCount > 0 && itemCount % this.limit === 0;
        }
      });

    // Escuchar cuando se crea un item desde Justificación para sincronizar
    this.actions$.pipe(ofType(createItemSuccess))
      .subscribe(() => {
        // Cargar items desde localStorage para sincronizar con Justificación
        const localItems = this.itemsSvc.getLocalItems();
        this.store.dispatch(loadItemsSuccess({ items: localItems, append: false, total: localItems.length }));
      });
  }

  ngOnInit(): void {
    // PRIMERO cargar desde localStorage para mostrar items creados en Justificación
    const localItems = this.itemsSvc.getLocalItems();
    if (localItems && localItems.length > 0) {
      this.store.dispatch(loadItemsSuccess({ items: localItems, append: false, total: localItems.length }));
    }
    // LUEGO cargar desde API para obtener items adicionales
    this.store.dispatch(loadItems({ page: 1, limit: this.limit }));
    this.store.select(selectItemsFilterQuery).subscribe((q) => (this.query = q || ''));
  }

  fetch(page = 1, append = false) {
    this.error = null;
    this.store.dispatch(loadItems({ page, limit: this.limit, append }));
    this.page = page;
  }

  loadMore() {
    if (!this.hasMore || this.loading) return;
    this.fetch(this.page + 1, true);
  }

  onQueryChange(value: string) {
    this.query = value;
    this.store.dispatch(setFilter({ query: value }));
  }

  trackById(index: number, item: Item) {
    return item.id;
  }

  createLocalItem(title: string, body: string) {
    this.store.dispatch(createItem({ payload: { title, body } }));
  }

  onLogoError() {
    this.logoLoadError = true;
  }

  // ========= Método para evitar spam de notificaciones =========
  private showThrottledNotification(message: string, type: 'success' | 'error' | 'info') {
    const now = Date.now();
    if (now - this.lastNotificationTime > this.notificationCooldown) {
      this.toast.show(message, type);
      this.lastNotificationTime = now;
    }
  }

  // ========= Confirm helper compatible con RxJS 6/7 =========
  private confirmAsyncCompat(message: string): Promise<boolean> {
    const svc: any = this.confirmService as any;

    // Si existe confirmAsync (promesa), úsala
    if (typeof svc.confirmAsync === 'function') {
      try {
        // Race with timeout but DO NOT use native alert; timeout resolves to false so caller can show inline UI
        const svcPromise: Promise<boolean> = svc.confirmAsync({ message }).then((r: any) => !!r).catch(() => false);
        const timeoutPromise: Promise<boolean> = new Promise((resolve) => setTimeout(() => resolve(false), 1200));
        return Promise.race([svcPromise, timeoutPromise]);
      } catch (e) {
        return Promise.resolve(false);
      }
    }

    // Si existe confirm() que devuelve Observable<boolean>, conviértelo a Promise sin firstValueFrom
    if (typeof svc.confirm === 'function') {
      try {
        const obs: any = svc.confirm({ message });
        const svcPromise: Promise<boolean> = new Promise<boolean>((resolve) => {
          obs.pipe(take(1)).subscribe({ next: (v: any) => resolve(!!v), error: () => resolve(false) });
        });
        const timeoutPromise: Promise<boolean> = new Promise((resolve) => setTimeout(() => resolve(false), 1200));
        return Promise.race([svcPromise, timeoutPromise]);
      } catch (e) {
        return Promise.resolve(false);
      }
    }

    // Fallback (sin confirm service)
    // Use native window.confirm as a last-resort fallback so the delete button actually works
    try {
      const result = window.confirm(message);
      return Promise.resolve(!!result);
    } catch (e) {
      return Promise.resolve(false);
    }
    }

  // ========= Eliminar un item con confirmación inline si el modal no responde =========
  async requestDelete(id: number) {
    // Prevenir eliminaciones simultáneas del mismo elemento
    if (this.deletingIds.has(id)) {
      return;
    }

    try {
      
      const ok = await this.confirmService.confirmAsync({ 
        title: 'Eliminar Elemento',
        message: '¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer.',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar'
      });
      
      
      if (ok) {
        this.deletingIds.add(id);
        this.store.dispatch(deleteItem({ id }));
        
        // Mostrar notificación después de dispatch
        setTimeout(() => {
          this.toast.show('✓ Elemento eliminado correctamente', 'success');
        }, 100);
        
        // Limpiar el flag después de 2 segundos
        setTimeout(() => this.deletingIds.delete(id), 2000);
      }
    } catch (error) {
      this.deletingIds.delete(id);
      this.toast.show('Error al confirmar eliminación', 'error');
    }
  }

  confirmPendingDelete() {
    if (!this.pendingDeleteId) return;
    this.store.dispatch(deleteItem({ id: this.pendingDeleteId }));
    this.pendingDeleteId = null;
  }

  cancelPendingDelete() {
    this.pendingDeleteId = null;
  }


  editLocalItem(id: number, changes: Partial<Item>) {
    this.store.dispatch(updateItem({ id, changes }));
  }

  toggleSelect(id: number) {
    this.store.dispatch(toggleSelectItem({ id }));
  }

  isSelected(id: number): Observable<boolean> {
    return this.selectedIds$.pipe(
      map(ids => ids.includes(id))
    );
  }

  selectAll() {
    combineLatest([this.filteredItems$, this.selectedIds$]).pipe(take(1)).subscribe(([items, selectedIds]) => {
      const allSelected = items.every(item => selectedIds.includes(item.id));
      
      if (allSelected) {
        // Si todos están seleccionados, deseleccionar todos
        this.store.dispatch(clearSelection());
      } else {
        // Seleccionar todos los que no están seleccionados
        items.forEach(item => {
          if (!selectedIds.includes(item.id)) {
            this.store.dispatch(toggleSelectItem({ id: item.id }));
          }
        });
      }
    });
  }

  clearAllSelection() {
    this.store.dispatch(clearSelection());
  }

  // ========= Eliminar varios =========
  async deleteSelected(ids: number[]) {
    if (!ids || ids.length === 0) {
      return;
    }

    // Prevenir múltiples eliminaciones simultáneas
    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;

    try {
      
      const ok = await this.confirmService.confirmAsync({
        title: 'Eliminar Elementos',
        message: `¿Está seguro que desea eliminar ${ids.length} elementos seleccionados? Esta acción no se puede deshacer.`,
        confirmText: 'Sí, eliminar todos',
        cancelText: 'Cancelar'
      });
      
      
      if (ok) {
        this.store.dispatch(deleteItems({ ids }));
        
        // Mostrar notificación después de dispatch
        setTimeout(() => {
          this.toast.show(`✓ ${ids.length} elementos eliminados correctamente`, 'success');
        }, 100);
        
        // La selección se limpiará automáticamente en el reducer cuando se ejecute deleteItemsSuccess
      } else {
        // Usuario canceló - NO limpiar la selección
      }
    } catch (error) {
      this.toast.show('Error al eliminar elementos', 'error');
    } finally {
      // IMPORTANTE: Resetear flag SIEMPRE, incluso si se cancela
      this.isDeleting = false;
    }
  }

  // ========= Export CSV =========
  exportToCSV(items: Item[]) {
    this.selectedIds$.pipe(take(1)).subscribe(selectedIds => {
      let itemsToExport: Item[] = [];
      
      if (selectedIds && selectedIds.length > 0) {
        itemsToExport = items.filter(item => selectedIds.includes(item.id));
      } else {
        itemsToExport = items;
      }
      
      if (!itemsToExport || itemsToExport.length === 0) {
        this.toast.show('No hay elementos para exportar', 'info');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = selectedIds && selectedIds.length > 0 
        ? `items_seleccionados_${selectedIds.length}_${timestamp}`
        : `items_export_${timestamp}`;

      this.exportService.exportToCSV(itemsToExport, filename);
      
      const message = selectedIds && selectedIds.length > 0
        ? `✓ ${selectedIds.length} elementos seleccionados exportados a CSV`
        : `✓ ${itemsToExport.length} elementos exportados a CSV`;
      this.toast.show(message, 'success');
    });
  }

  // ========= Inline edit =========
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
    this.editLocalItem(this.editingId, {
      title: this.editModel.title || '',
      body: this.editModel.body || '',
    });
    this.cancelInlineEdit();
  }

  cancelInlineEdit() {
    this.editingId = null;
    this.editModel = { title: '', body: '' };
  }

  // ========= Refresh from API =========
  async refreshFromAPI() {
    this.page = 1;
    this.store.dispatch(refreshFromAPI());
    this.showThrottledNotification('✔️ Datos actualizados desde la API', 'success');
  }

  // ========= Favoritos/Destacados =========
  toggleFavorite(id: number) {
    this.store.dispatch(toggleFavorite({ id }));
  }

  toggleShowOnlyFavorites() {
    this.showOnlyFavorites$.pipe(take(1)).subscribe(current => {
      this.store.dispatch(setShowOnlyFavorites({ showOnlyFavorites: !current }));
    });
  }

  // ========= Ordenamiento =========
  setSortBy(field: SortField, direction: SortDirection) {
    this.store.dispatch(setSortBy({ field, direction }));
  }

  // ========= Exportación PDF =========
  exportToPDF(items: Item[]) {
    this.selectedIds$.pipe(take(1)).subscribe(selectedIds => {
      let itemsToExport = items;
      if (selectedIds.length > 0) {
        itemsToExport = items.filter(item => selectedIds.includes(item.id));
      }

      if (itemsToExport.length === 0) {
        this.toast.show('⚠️ No hay elementos para exportar', 'info');
        return;
      }

      this.exportService.exportToPDF(itemsToExport, `items_export_${Date.now()}`)
        .then(() => {
          this.toast.show(`✓ PDF exportado: ${itemsToExport.length} elementos`, 'success');
        })
        .catch(error => {
          this.toast.show('❌ Error al exportar PDF', 'error');
        });
    });
  }

  // ========= Helpers para UI =========
  isItemDeleting(id: number): boolean {
    return this.deletingIds.has(id);
  }

  isAnyDeleting(): boolean {
    return this.isDeleting || this.deletingIds.size > 0;
  }
}
