import { createReducer, on } from '@ngrx/store';
import { loadItems, loadItemsSuccess, loadItemsFailure, selectItem, clearSelectedItem,
  createItemStart, createItemSuccess, createItemFailure,
  updateItemStart, updateItemSuccess, updateItemFailure,
  deleteItemStart, deleteItemSuccess, deleteItemFailure,
  toggleSelectItem, clearSelection, deleteItemsSuccess,
  toggleFavorite, setShowOnlyFavorites, setSortBy, SortField, SortDirection } from './items.actions';
import { setFilter } from './items.actions';
import { Item } from '../data-access/items.service';

export interface ItemsState {
  items: Item[];
  loading: boolean;
  error: any | null;
  selectedId: number | null;
  selectedIds?: number[];
  total: number | null;
  filters?: {
    query?: string;
  };
  showOnlyFavorites: boolean;
  sortBy: {
    field: SortField;
    direction: SortDirection;
  };
}

export const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
  selectedId: null,
  selectedIds: [],
  total: null,
  filters: { query: '' },
  showOnlyFavorites: false,
  sortBy: {
    field: 'id',
    direction: 'asc'
  }
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
  on(deleteItemSuccess, (state, { id }) => ({ 
    ...state, 
    loading: false,
    items: state.items.filter(it => it.id !== id),
    selectedIds: (state.selectedIds || []).filter(selectedId => selectedId !== id)
  })),
  on(deleteItemFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(selectItem, (state, { id }) => ({ ...state, selectedId: id })),
  on(clearSelectedItem, (state) => ({ ...state, selectedId: null }))
  ,
  on(setFilter, (state, { query }) => ({ ...state, filters: { ...(state.filters || {}), query } }))
  ,
  on(toggleSelectItem, (state, { id }) => {
    const set = new Set(state.selectedIds || []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    return { ...state, selectedIds: Array.from(set) };
  }),
  on(clearSelection, (state) => ({ ...state, selectedIds: [] })),
  on(deleteItemsSuccess, (state, { ids }) => ({ 
    ...state, 
    loading: false,
    items: state.items.filter(it => !ids.includes(it.id)), 
    selectedIds: [] 
  })),
  
  // Favoritos
  on(toggleFavorite, (state, { id }) => ({
    ...state,
    items: state.items.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    )
  })),
  on(setShowOnlyFavorites, (state, { showOnlyFavorites }) => ({ ...state, showOnlyFavorites })),
  
  // Ordenamiento
  on(setSortBy, (state, { field, direction }) => ({
    ...state,
    sortBy: { field, direction }
  }))
);
