import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ItemsService, Item } from '../data-access/items.service';
import { loadItems, loadItemsSuccess, loadItemsFailure } from './items.actions';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as ItemsActions from './items.actions';
import { ToastService } from '../../../core/toast.service';

@Injectable()
export class ItemsEffects {
  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadItems),
      mergeMap((action: any) => {
        console.log('[ItemsEffects] loadItems$ - Loading from API and MERGING with localStorage, page=', action.page);
        
        return this.itemsSvc.getItemsWithTotal({ page: action.page, limit: action.limit }).pipe(
          map((payload: { items: Item[]; total: number | null }) => {
            console.log('[ItemsEffects] loadItems$ SUCCESS - got', payload.items.length, 'items from API');
            
            // OBTENER items locales (creados manualmente en Justificación)
            const localItems = this.itemsSvc.getLocalItems();
            console.log('[ItemsEffects] loadItems$ - Found', localItems.length, 'items in localStorage');
            
            // COMBINAR items de API con items locales, eliminando duplicados por ID
            const apiItems = payload.items || [];
            const combined = [...localItems];
            
            // Agregar items de API que no existan en localStorage
            apiItems.forEach(apiItem => {
              if (!combined.find(local => local.id === apiItem.id)) {
                combined.push(apiItem);
              }
            });
            
            console.log('[ItemsEffects] loadItems$ - Combined total:', combined.length, 'items (local + API)');
            
            // Sincronizar el resultado combinado a localStorage para mantener consistencia
            this.itemsSvc.syncItemsToLocal(combined, false);
            
            return loadItemsSuccess({ 
              items: combined, 
              append: action.append, 
              total: combined.length // Usar el total combinado
            });
          }),
          catchError((error: any) => {
            console.error('[ItemsEffects] loadItems$ ERROR:', error);
            // Si falla la API, al menos cargar desde localStorage
            const localItems = this.itemsSvc.getLocalItems();
            if (localItems.length > 0) {
              console.log('[ItemsEffects] loadItems$ ERROR - Fallback to localStorage:', localItems.length, 'items');
              return of(loadItemsSuccess({ items: localItems, append: false, total: localItems.length }));
            }
            return of(loadItemsFailure({ error }));
          })
        );
      })
    )
  );

  refreshFromAPI$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.refreshFromAPI),
      tap(() => console.log('[ItemsEffects] refreshFromAPI$ triggered')),
      mergeMap(() => {
        console.log('[ItemsEffects] refreshFromAPI$ - Loading from API and MERGING with localStorage');
        return this.itemsSvc.getItemsWithTotal({ page: 1, limit: 10 }).pipe(
          map((payload: { items: Item[]; total: number | null }) => {
            console.log('[ItemsEffects] refreshFromAPI$ - got', payload.items.length, 'items from API');
            
            // OBTENER items locales
            const localItems = this.itemsSvc.getLocalItems();
            console.log('[ItemsEffects] refreshFromAPI$ - Found', localItems.length, 'items in localStorage');
            
            // COMBINAR
            const apiItems = payload.items || [];
            const combined = [...localItems];
            apiItems.forEach(apiItem => {
              if (!combined.find(local => local.id === apiItem.id)) {
                combined.push(apiItem);
              }
            });
            
            console.log('[ItemsEffects] refreshFromAPI$ - Combined:', combined.length, 'items');
            this.itemsSvc.syncItemsToLocal(combined, false);
            this.toast.show('✓ Datos recargados desde la API correctamente', 'success');
            
            return loadItemsSuccess({ 
              items: combined, 
              append: false, 
              total: combined.length
            });
          }),
          catchError((error: any) => {
            this.toast.show('✗ Error al recargar datos desde la API', 'error');
            // Fallback a localStorage
            const localItems = this.itemsSvc.getLocalItems();
            if (localItems.length > 0) {
              return of(loadItemsSuccess({ items: localItems, append: false, total: localItems.length }));
            }
            return of(loadItemsFailure({ error }));
          })
        );
      })
    )
  );

  constructor(private actions$: Actions, private itemsSvc: ItemsService, private toast: ToastService) {}
}


// CRUD effects
@Injectable()
export class ItemsCrudEffects {
  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.createItem),
      mergeMap((action) => {
        try {
          const created = this.itemsSvc.createItem(action.payload);
          const local = this.itemsSvc.getLocalItems();
          // mark start, then success, then refresh the list from local storage with correct total
          return [
            ItemsActions.createItemStart(), 
            ItemsActions.createItemSuccess({ item: created }), 
            loadItemsSuccess({ items: local, append: false, total: local.length })
          ];
        } catch (e) {
          return [ItemsActions.createItemFailure({ error: e })];
        }
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.updateItem),
      mergeMap((action) => {
        try {
          const updated = this.itemsSvc.updateItem(action.id, action.changes);
          const local = this.itemsSvc.getLocalItems();
          if (updated) {
            return [
              ItemsActions.updateItemStart(), 
              ItemsActions.updateItemSuccess({ item: updated }), 
              loadItemsSuccess({ items: local, append: false, total: local.length })
            ];
          }
          return [ItemsActions.updateItemFailure({ error: 'Not found' })];
        } catch (e) {
          return [ItemsActions.updateItemFailure({ error: e })];
        }
      })
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.deleteItem),
      mergeMap((action) => {
        try {
          const ok = this.itemsSvc.deleteItem(action.id);
          const local = this.itemsSvc.getLocalItems();
          console.log('[ItemsEffects] delete$ action.id=', action.id, 'ok=', ok, 'local.length=', (local || []).length);
          if (ok) {
            return [
              ItemsActions.deleteItemStart(), 
              ItemsActions.deleteItemSuccess({ id: action.id }), 
              loadItemsSuccess({ items: local, append: false, total: local.length })
            ];
          }
          console.log('[ItemsEffects] delete failed for id=', action.id);
          return [ItemsActions.deleteItemFailure({ error: 'Not removed' })];
        } catch (e) {
          return [ItemsActions.deleteItemFailure({ error: e })];
        }
      })
    )
  );

  deleteBulk$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.deleteItems),
      mergeMap((action) => {
        try {
          const ids: number[] = action.ids;
          const failed: number[] = [];
          ids.forEach((id) => {
            const ok = this.itemsSvc.deleteItem(id);
            if (!ok) failed.push(id);
          });
          const local = this.itemsSvc.getLocalItems();
          if (failed.length === 0) {
            return [ItemsActions.deleteItemStart(), ItemsActions.deleteItemsSuccess({ ids }), loadItemsSuccess({ items: local })];
          }
          return [ItemsActions.deleteItemsFailure({ error: { failed } })];
        } catch (e) {
          return [ItemsActions.deleteItemsFailure({ error: e })];
        }
      })
    )
  );

  // Persistir cambio de favorito en localStorage
  toggleFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.toggleFavorite),
      tap(({ id }) => {
        const item = this.itemsSvc.getLocalItems().find(i => i.id === id);
        if (item) {
          this.itemsSvc.updateItem(id, { isFavorite: !item.isFavorite });
        }
      })
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private itemsSvc: ItemsService) {}
}
