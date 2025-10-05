import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemsService, Item } from './items.service';
import { StorageService } from '../../../core/storage.service';

describe('ItemsService', () => {
  let service: ItemsService;
  let httpMock: HttpTestingController;
  let storageService: StorageService;

  const mockItem: Item = {
    id: 1,
    title: 'Test Item',
    body: 'Test Body'
  };

  const mockItems: Item[] = [
    { id: 1, title: 'Item 1', body: 'Body 1' },
    { id: 2, title: 'Item 2', body: 'Body 2' },
    { id: 3, title: 'Item 3', body: 'Body 3' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ItemsService, StorageService]
    });

    service = TestBed.inject(ItemsService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);
    
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Operations - API', () => {
    it('should fetch items from API', (done) => {
      service.getItems().subscribe(items => {
        expect(items.length).toBe(3);
        expect(items).toEqual(mockItems);
        done();
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');
      expect(req.request.method).toBe('GET');
      req.flush(mockItems);
    });

    it('should fetch a single item by ID from API', (done) => {
      service.getItem(1).subscribe(item => {
        expect(item).toEqual(mockItem);
        expect(item.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockItem);
    });

    it('should fetch items with query parameters', (done) => {
      service.getItems({ query: 'test', page: 1, limit: 10 }).subscribe(items => {
        expect(items).toEqual(mockItems);
        done();
      });

      const req = httpMock.expectOne(
        req => req.url === 'https://jsonplaceholder.typicode.com/posts' && 
        req.params.has('q') && 
        req.params.has('_page') && 
        req.params.has('_limit')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('q')).toBe('test');
      expect(req.request.params.get('_page')).toBe('1');
      expect(req.request.params.get('_limit')).toBe('10');
      req.flush(mockItems);
    });

    it('should handle error when item not found', (done) => {
      service.getItem(999).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/999');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should fetch items with total count', (done) => {
      service.getItemsWithTotal({ page: 1, limit: 10 }).subscribe(response => {
        expect(response.items.length).toBe(3);
        expect(response.total).toBe(100);
        done();
      });

      const req = httpMock.expectOne(
        req => req.url === 'https://jsonplaceholder.typicode.com/posts'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockItems, { headers: { 'X-Total-Count': '100' } });
    });
  });

  describe('Local Storage Operations - CRUD', () => {
    it('should create a new item in local storage', () => {
      const newItem = { title: 'Local Item', body: 'Local Body' };
      const created = service.createItem(newItem);

      expect(created.id).toBeGreaterThan(0);
      expect(created.title).toBe('Local Item');
      expect(created.body).toBe('Local Body');

      const allItems = service.getLocalItems();
      expect(allItems.length).toBe(1);
      expect(allItems[0]).toEqual(created);
    });

    it('should generate incremental IDs for new items', () => {
      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });
      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });
      const item3 = service.createItem({ title: 'Item 3', body: 'Body 3' });

      expect(item1.id).toBe(1);
      expect(item2.id).toBe(2);
      expect(item3.id).toBe(3);

      const allItems = service.getLocalItems();
      expect(allItems.length).toBe(3);
    });

    it('should update an existing item in local storage', () => {
      const created = service.createItem({ title: 'Original', body: 'Original Body' });
      const updated = service.updateItem(created.id, { title: 'Updated Title' });

      expect(updated).toBeTruthy();
      expect(updated!.id).toBe(created.id);
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.body).toBe('Original Body');

      const fromStorage = service.getLocalItem(created.id);
      expect(fromStorage!.title).toBe('Updated Title');
    });

    it('should return null when updating non-existent item', () => {
      const updated = service.updateItem(999, { title: 'Test' });
      expect(updated).toBeNull();
    });

    it('should delete an item from local storage', () => {
      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });
      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });

      const deleted = service.deleteItem(item1.id);
      expect(deleted).toBe(true);

      const allItems = service.getLocalItems();
      expect(allItems.length).toBe(1);
      expect(allItems[0].id).toBe(item2.id);
    });

    it('should return false when deleting non-existent item', () => {
      const deleted = service.deleteItem(999);
      expect(deleted).toBe(false);
    });

    it('should get local item by ID', () => {
      const created = service.createItem({ title: 'Test', body: 'Test Body' });
      const found = service.getLocalItem(created.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(created.id);
      expect(found!.title).toBe('Test');
    });

    it('should return undefined when getting non-existent local item', () => {
      const found = service.getLocalItem(999);
      expect(found).toBeUndefined();
    });

    it('should get all local items', () => {
      service.createItem({ title: 'Item 1', body: 'Body 1' });
      service.createItem({ title: 'Item 2', body: 'Body 2' });
      service.createItem({ title: 'Item 3', body: 'Body 3' });

      const allItems = service.getLocalItems();
      expect(allItems.length).toBe(3);
    });

    it('should return empty array when no local items exist', () => {
      const allItems = service.getLocalItems();
      expect(allItems).toEqual([]);
    });
  });

  describe('Sync Operations', () => {
    it('should sync API items to local storage (replace mode)', () => {
      service.createItem({ title: 'Local Item', body: 'Local Body' });

      service.syncItemsToLocal(mockItems, false);

      const allItems = service.getLocalItems();
      expect(allItems.length).toBe(3);
      expect(allItems[0].title).toBe('Item 1');
    });

    it('should sync API items to local storage (append mode)', () => {
      service.createItem({ title: 'Local Item', body: 'Local Body' });

      service.syncItemsToLocal(mockItems, true);

      const allItems = service.getLocalItems();
      // Nota: elimina duplicados por ID, el item local tiene ID 1 igual que mockItems[0]
      expect(allItems.length).toBe(3);
      // Verifica que hay items de ambas fuentes
      expect(allItems.some(i => i.id === 2)).toBe(true);
      expect(allItems.some(i => i.id === 3)).toBe(true);
    });

    it('should remove duplicates when syncing', () => {
      const duplicateItems: Item[] = [
        { id: 1, title: 'Item 1', body: 'Body 1' },
        { id: 1, title: 'Item 1 Updated', body: 'Body 1' },
        { id: 2, title: 'Item 2', body: 'Body 2' }
      ];

      service.syncItemsToLocal(duplicateItems, false);

      const allItems = service.getLocalItems();
      expect(allItems.length).toBe(2);
      expect(allItems.find(i => i.id === 1)!.title).toBe('Item 1 Updated');
    });

    it('should handle sync errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage error');
      spyOn(console, 'error');

      expect(() => {
        service.syncItemsToLocal(mockItems);
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist items across service instances', () => {
      service.createItem({ title: 'Persistent Item', body: 'Persistent Body' });

      const newService = TestBed.inject(ItemsService);
      const items = newService.getLocalItems();

      expect(items.length).toBe(1);
      expect(items[0].title).toBe('Persistent Item');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('items_local', 'invalid json {[}');

      const items = service.getLocalItems();
      expect(items).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title and body when creating item', () => {
      const created = service.createItem({});
      
      expect(created.title).toBe('');
      expect(created.body).toBe('');
      expect(created.id).toBeGreaterThan(0);
    });

    it('should update item with favorite flag', () => {
      const created = service.createItem({ title: 'Test', body: 'Test' });
      const updated = service.updateItem(created.id, { isFavorite: true });

      expect(updated!.isFavorite).toBe(true);
    });

    it('should handle multiple updates to same item', () => {
      const created = service.createItem({ title: 'Original', body: 'Original' });
      
      service.updateItem(created.id, { title: 'Update 1' });
      service.updateItem(created.id, { body: 'Update 2' });
      const final = service.updateItem(created.id, { title: 'Final Title' });

      expect(final!.title).toBe('Final Title');
      expect(final!.body).toBe('Update 2');
    });
  });
});
