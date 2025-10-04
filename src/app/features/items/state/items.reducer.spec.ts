import { itemsReducer, initialState } from './items.reducer';
import * as ItemsActions from './items.actions';
import { Item } from '../data-access/items.service';

describe('itemsReducer', () => {
  it('should set loading true on loadItems and false on loadItemsSuccess', () => {
    const s1 = itemsReducer(initialState, ItemsActions.loadItems({ page: 1, limit: 10 }));
    expect(s1.loading).toBeTrue();
    const items: Item[] = [{ id: 1, title: 'a', body: 'b' }];
    const s2 = itemsReducer(s1, ItemsActions.loadItemsSuccess({ items }));
    expect(s2.loading).toBeFalse();
    expect(s2.items.length).toBe(1);
  });
});
