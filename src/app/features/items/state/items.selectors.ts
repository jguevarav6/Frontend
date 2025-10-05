import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ItemsState } from './items.reducer';

export const selectItemsFeature = createFeatureSelector<ItemsState>('items');

export const selectAllItems = createSelector(selectItemsFeature, (state) => state.items);
export const selectItemsLoading = createSelector(selectItemsFeature, (state) => state.loading);
export const selectItemsError = createSelector(selectItemsFeature, (state) => state.error);
export const selectSelectedItemId = createSelector(selectItemsFeature, (state) => state.selectedId);
export const selectSelectedItem = createSelector(
  selectAllItems,
  selectSelectedItemId,
  (items, id) => items.find((i) => i.id === id) || null
);

export const selectItemsTotal = createSelector(selectItemsFeature, (state) => state.total);
export const selectItemsFilterQuery = createSelector(selectItemsFeature, (state) => (state.filters && state.filters.query) || '');
export const selectItemsSelectedIds = createSelector(selectItemsFeature, (state) => state.selectedIds || [] as number[]);
export const selectShowOnlyFavorites = createSelector(selectItemsFeature, (state) => state.showOnlyFavorites || false);
export const selectSortBy = createSelector(selectItemsFeature, (state) => state.sortBy || { field: 'id', direction: 'asc' });

// Selector combinado: filtrado por búsqueda + favoritos + ordenamiento
export const selectFilteredItems = createSelector(
  selectAllItems,
  selectItemsFilterQuery,
  selectShowOnlyFavorites,
  selectSortBy,
  (items, query, showOnlyFavorites, sortBy) => {
    // Si no hay items, devolver array vacío
    if (!items || !Array.isArray(items)) {
      return [];
    }

    let filtered = [...items];

    // Filtrar por búsqueda
    if (query && query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.body.toLowerCase().includes(q) ||
          String(it.id).includes(q)
      );
    }

    // Filtrar por favoritos
    if (showOnlyFavorites) {
      filtered = filtered.filter(it => it.isFavorite);
    }

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      const sortField = sortBy?.field || 'id';
      const sortDirection = sortBy?.direction || 'asc';
      
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.id - b.id;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
);
