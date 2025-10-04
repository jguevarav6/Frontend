import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ItemsService, Item } from '../data-access/items.service';
import { loadItems, loadItemsSuccess, loadItemsFailure } from './items.actions';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as ItemsActions from './items.actions';

@Injectable()
export class ItemsEffects {
  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadItems),
      mergeMap((action: any) =>
        this.itemsSvc.getItemsWithTotal({ page: action.page, limit: action.limit }).pipe(
          map((payload: { items: Item[]; total: number | null }) =>
            loadItemsSuccess({ items: payload.items, append: action.append, total: typeof payload.total === 'number' ? payload.total : undefined })
          ),
          catchError((error: any) => of(loadItemsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private itemsSvc: ItemsService) {}
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
          // mark start, then success, then refresh the list from local storage
          return [ItemsActions.createItemStart(), ItemsActions.createItemSuccess({ item: created }), loadItemsSuccess({ items: local })];
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
            return [ItemsActions.updateItemStart(), ItemsActions.updateItemSuccess({ item: updated }), loadItemsSuccess({ items: local })];
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
          if (ok) {
            return [ItemsActions.deleteItemStart(), ItemsActions.deleteItemSuccess({ id: action.id }), loadItemsSuccess({ items: local })];
          }
          return [ItemsActions.deleteItemFailure({ error: 'Not removed' })];
        } catch (e) {
          return [ItemsActions.deleteItemFailure({ error: e })];
        }
      })
    )
  );

  constructor(private actions$: Actions, private itemsSvc: ItemsService) {}
}
