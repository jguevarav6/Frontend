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
