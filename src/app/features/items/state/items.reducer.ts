import { createReducer, on } from '@ngrx/store';
import { loadItems, loadItemsSuccess, loadItemsFailure, selectItem, clearSelectedItem,
  createItemStart, createItemSuccess, createItemFailure,
  updateItemStart, updateItemSuccess, updateItemFailure,
  deleteItemStart, deleteItemSuccess, deleteItemFailure } from './items.actions';
import { Item } from '../data-access/items.service';

export interface ItemsState {
  items: Item[];
  loading: boolean;
  error: any | null;
  selectedId: number | null;
  total: number | null;
}

export const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
  selectedId: null,
  total: null,
};

export const itemsReducer = createReducer(
  initialState,
  on(loadItems, (state) => ({ ...state, loading: true, error: null })),
  on(loadItemsSuccess, (state, { items, append, total }) => ({
    ...state,
    loading: false,
    items: append ? [...state.items, ...items] : items,
    total: typeof total === 'number' ? total : state.total,
  })),
  on(loadItemsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(createItemStart, (state) => ({ ...state, loading: true })),
  on(createItemSuccess, (state) => ({ ...state, loading: false })),
  on(createItemFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(updateItemStart, (state) => ({ ...state, loading: true })),
  on(updateItemSuccess, (state) => ({ ...state, loading: false })),
  on(updateItemFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(deleteItemStart, (state) => ({ ...state, loading: true })),
  on(deleteItemSuccess, (state) => ({ ...state, loading: false })),
  on(deleteItemFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(selectItem, (state, { id }) => ({ ...state, selectedId: id })),
  on(clearSelectedItem, (state) => ({ ...state, selectedId: null }))
);
