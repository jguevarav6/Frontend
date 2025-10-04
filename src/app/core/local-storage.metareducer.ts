import { ActionReducer, INIT, UPDATE } from '@ngrx/store';

const STORAGE_KEY = 'app_items_state_v1';

export function persistItemsMetaReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return (state, action) => {
    // On init/update attempt to rehydrate
    if (action.type === INIT || action.type === UPDATE) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // merge saved items slice into state
          return reducer({ ...state, items: { ...state?.items, ...parsed } }, action);
        }
      } catch (e) {
        // ignore
      }
    }

    const nextState = reducer(state, action);

    try {
      if (nextState && nextState.items) {
        const toSave = {
          items: nextState.items.items,
          total: nextState.items.total,
          selectedId: nextState.items.selectedId,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch (e) {
      // ignore write errors
    }

    return nextState;
  };
}
