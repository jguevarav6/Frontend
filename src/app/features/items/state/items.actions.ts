import { createAction, props } from '@ngrx/store';
import { Item } from '../data-access/items.service';

export const loadItems = createAction(
	'[Items] Load Items',
	props<{ page?: number; limit?: number; append?: boolean; forceRefresh?: boolean }>()
);
export const loadItemsSuccess = createAction(
	'[Items] Load Items Success',
	props<{ items: Item[]; append?: boolean; total?: number }>()
);
export const loadItemsFailure = createAction('[Items] Load Items Failure', props<{ error: any }>());

export const refreshFromAPI = createAction('[Items] Refresh From API');

export const selectItem = createAction('[Items] Select Item', props<{ id: number }>());
export const clearSelectedItem = createAction('[Items] Clear Selected Item');
export const setFilter = createAction('[Items] Set Filter', props<{ query: string }>());

// CRUD actions (local simulated persistence)
export const createItem = createAction('[Items] Create Item', props<{ payload: Partial<Item> }>());
export const createItemSuccess = createAction('[Items] Create Item Success', props<{ item: Item }>());
export const createItemFailure = createAction('[Items] Create Item Failure', props<{ error: any }>());

export const updateItem = createAction('[Items] Update Item', props<{ id: number; changes: Partial<Item> }>());
export const updateItemSuccess = createAction('[Items] Update Item Success', props<{ item: Item }>());
export const updateItemFailure = createAction('[Items] Update Item Failure', props<{ error: any }>());

export const deleteItem = createAction('[Items] Delete Item', props<{ id: number }>());
export const deleteItemSuccess = createAction('[Items] Delete Item Success', props<{ id: number }>());
export const deleteItemFailure = createAction('[Items] Delete Item Failure', props<{ error: any }>());

// Bulk selection / actions
export const toggleSelectItem = createAction('[Items] Toggle Select Item', props<{ id: number }>());
export const clearSelection = createAction('[Items] Clear Selection');

// Bulk delete
export const deleteItems = createAction('[Items] Delete Items', props<{ ids: number[] }>());
export const deleteItemsSuccess = createAction('[Items] Delete Items Success', props<{ ids: number[] }>());
export const deleteItemsFailure = createAction('[Items] Delete Items Failure', props<{ error: any }>());

// Optional: actions to mark loading explicitly for CRUD flows (handled in effects)
export const createItemStart = createAction('[Items] Create Item Start');
export const updateItemStart = createAction('[Items] Update Item Start');
export const deleteItemStart = createAction('[Items] Delete Item Start');

// Favoritos/Destacados
export const toggleFavorite = createAction('[Items] Toggle Favorite', props<{ id: number }>());
export const setShowOnlyFavorites = createAction('[Items] Set Show Only Favorites', props<{ showOnlyFavorites: boolean }>());

// Ordenamiento
export type SortField = 'id' | 'title' | 'date';
export type SortDirection = 'asc' | 'desc';
export const setSortBy = createAction('[Items] Set Sort By', props<{ field: SortField; direction: SortDirection }>());
