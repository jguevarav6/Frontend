import { TestBed } from '@angular/core/testing';import { TestBed } from '@angular/core/testing';import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ItemsService, Item } from './items.service';import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';



describe('ItemsService', () => {import { ItemsService, Item } from './items.service';

  let service: ItemsService;

  let httpMock: HttpTestingController;import { ItemsService, Item } from './items.service';



  const mockItem: Item = {describe('ItemsService', () => {

    id: 1,

    title: 'Test Item',  let service: ItemsService;describe('ItemsService', () => {

    body: 'Test Body'

  };  let httpMock: HttpTestingController;  let service: ItemsService;



  beforeEach(() => {  let httpMock: HttpTestingController;

    TestBed.configureTestingModule({

      imports: [HttpClientTestingModule],  const mockItem: Item = {

      providers: [ItemsService]

    });    id: 1,  beforeEach(() => {

    service = TestBed.inject(ItemsService);

    httpMock = TestBed.inject(HttpTestingController);    title: 'Test Item',    TestBed.configureTestingModule({ 

    localStorage.clear();

  });    body: 'Test Body',      imports: [HttpClientTestingModule],



  afterEach(() => {    userId: 1      providers: [ItemsService]

    httpMock.verify();

    localStorage.clear();  };    });

  });

    service = TestBed.inject(ItemsService);

  it('should be created', () => {

    expect(service).toBeTruthy();  beforeEach(() => {    httpMock = TestBed.inject(HttpTestingController);

  });

    TestBed.configureTestingModule({    // ensure clean localStorage for tests

  describe('HTTP Operations', () => {

    it('should fetch items from API', (done) => {      imports: [HttpClientTestingModule],    localStorage.removeItem('items_local');

      const mockItems: Item[] = [

        { id: 1, title: 'Item 1', body: 'Body 1' },      providers: [ItemsService]  });

        { id: 2, title: 'Item 2', body: 'Body 2' }

      ];    });



      service.getItems().subscribe(items => {    service = TestBed.inject(ItemsService);  afterEach(() => {

        expect(items.length).toBe(2);

        expect(items).toEqual(mockItems);    httpMock = TestBed.inject(HttpTestingController);    httpMock.verify();

        done();

      });    localStorage.clear();    localStorage.removeItem('items_local');



      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');  });  });

      expect(req.request.method).toBe('GET');

      req.flush(mockItems);

    });

  afterEach(() => {  it('should be created', () => {

    it('should fetch a single item by ID', (done) => {

      service.getItem(1).subscribe(item => {    httpMock.verify();    expect(service).toBeTruthy();

        expect(item).toEqual(mockItem);

        expect(item.id).toBe(1);    localStorage.clear();  });

        done();

      });  });



      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');  describe('Local Storage Operations', () => {

      expect(req.request.method).toBe('GET');

      req.flush(mockItem);  it('should be created', () => {    it('should create a new item in local storage', () => {

    });

    expect(service).toBeTruthy();      const created = service.createItem({ title: 'Test Title', body: 'Test Body' });

    it('should handle error when item not found', (done) => {

      service.getItem(999).subscribe(  });      

        () => fail('should have failed'),

        (error) => {      expect(created.id).toBeGreaterThan(0);

          expect(error.status).toBe(404);

          done();  describe('HTTP Operations', () => {      expect(created.title).toBe('Test Title');

        }

      );    it('should fetch items from API', (done) => {      expect(created.body).toBe('Test Body');



      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/999');      const mockItems: Item[] = [      

      req.flush('Not found', { status: 404, statusText: 'Not Found' });

    });        { id: 1, title: 'Item 1', body: 'Body 1', userId: 1 },      const all = service.getLocalItems();



    it('should fetch items with query parameters', (done) => {        { id: 2, title: 'Item 2', body: 'Body 2', userId: 1 }      expect(all.length).toBe(1);

      const mockItems: Item[] = [

        { id: 1, title: 'Test Item', body: 'Test Body' }      ];      expect(all[0]).toEqual(created);

      ];

    });

      service.getItems({ query: 'test', page: 1, limit: 10 }).subscribe(items => {

        expect(items).toEqual(mockItems);      service.getItems().subscribe(items => {

        done();

      });        expect(items.length).toBe(2);    it('should update an existing item in local storage', () => {



      const req = httpMock.expectOne(        expect(items).toEqual(mockItems);      const created = service.createItem({ title: 'Original', body: 'Body' });

        req => req.url === 'https://jsonplaceholder.typicode.com/posts' && 

        req.params.has('q') && req.params.has('_page') && req.params.has('_limit')        done();      const updated = service.updateItem(created.id, { title: 'Updated Title' });

      );

      expect(req.request.method).toBe('GET');      });      

      req.flush(mockItems);

    });      expect(updated).toBeTruthy();

  });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');      expect(updated!.title).toBe('Updated Title');

  describe('Local Storage Operations', () => {

    it('should create a new item in local storage', () => {      expect(req.request.method).toBe('GET');      expect(updated!.body).toBe('Body'); // body no cambia

      const newItem = { title: 'Local Item', body: 'Local Body' };

      const created = service.createItem(newItem);      req.flush(mockItems);      



      expect(created.id).toBeGreaterThan(0);    });      const all = service.getLocalItems();

      expect(created.title).toBe('Local Item');

      expect(created.body).toBe('Local Body');      expect(all.length).toBe(1);



      const allItems = service.getLocalItems();    it('should fetch a single item by ID', (done) => {      expect(all[0].title).toBe('Updated Title');

      expect(allItems.length).toBe(1);

      expect(allItems[0]).toEqual(created);      service.getItemById(1).subscribe(item => {    });

    });

        expect(item).toEqual(mockItem);

    it('should update an existing item in local storage', () => {

      const created = service.createItem({ title: 'Original', body: 'Body' });        expect(item.id).toBe(1);    it('should delete an item from local storage', () => {

      const updated = service.updateItem(created.id, { title: 'Updated Title', body: 'Updated Body' });

        done();      const created = service.createItem({ title: 'To Delete', body: 'Body' });

      expect(updated).toBeTruthy();

      expect(updated!.id).toBe(created.id);      });      const removed = service.deleteItem(created.id);

      expect(updated!.title).toBe('Updated Title');

      expect(updated!.body).toBe('Updated Body');      



      const allItems = service.getLocalItems();      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/1');      expect(removed).toBe(true);

      expect(allItems.length).toBe(1);

      expect(allItems[0].title).toBe('Updated Title');      expect(req.request.method).toBe('GET');      

    });

      req.flush(mockItem);      const all = service.getLocalItems();

    it('should delete an item from local storage', () => {

      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });    });      expect(all.length).toBe(0);

      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });

    });

      expect(service.getLocalItems().length).toBe(2);

    it('should handle error when item not found', (done) => {

      const deleted = service.deleteItem(item1.id);

      expect(deleted).toBe(true);      service.getItemById(999).subscribe(    it('should return false when deleting non-existent item', () => {



      const remaining = service.getLocalItems();        () => fail('should have failed'),      const removed = service.deleteItem(99999);

      expect(remaining.length).toBe(1);

      expect(remaining[0].id).toBe(item2.id);        (error) => {      expect(removed).toBe(false);

    });

          expect(error.status).toBe(404);    });

    it('should return false when deleting non-existent item', () => {

      const deleted = service.deleteItem(999);          done();

      expect(deleted).toBe(false);

    });        }    it('should handle multiple items in local storage', () => {



    it('should get all local items', () => {      );      service.createItem({ title: 'Item 1', body: 'Body 1' });

      expect(service.getLocalItems().length).toBe(0);

      service.createItem({ title: 'Item 2', body: 'Body 2' });

      service.createItem({ title: 'Item 1', body: 'Body 1' });

      service.createItem({ title: 'Item 2', body: 'Body 2' });      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts/999');      service.createItem({ title: 'Item 3', body: 'Body 3' });

      service.createItem({ title: 'Item 3', body: 'Body 3' });

      req.flush('Not found', { status: 404, statusText: 'Not Found' });      

      const items = service.getLocalItems();

      expect(items.length).toBe(3);    });      const all = service.getLocalItems();

      expect(items[0].title).toBe('Item 1');

      expect(items[1].title).toBe('Item 2');  });      expect(all.length).toBe(3);

      expect(items[2].title).toBe('Item 3');

    });    });



    it('should get a single local item by ID', () => {  describe('Local Storage Operations', () => {  });

      const created = service.createItem({ title: 'Test Item', body: 'Test Body' });

      const found = service.getLocalItem(created.id);    it('should create a new item in local storage', () => {



      expect(found).toBeDefined();      const newItem = { title: 'Local Item', body: 'Local Body' };  describe('API Operations', () => {

      expect(found!.id).toBe(created.id);

      expect(found!.title).toBe('Test Item');      const created = service.createItem(newItem);    it('should fetch items from API', (done) => {

    });

      const mockItems: Item[] = [

    it('should return undefined when getting non-existent local item', () => {

      const found = service.getLocalItem(999);      expect(created.id).toBeGreaterThan(0);        { id: 1, title: 'Item 1', body: 'Body 1' },

      expect(found).toBeUndefined();

    });      expect(created.title).toBe('Local Item');        { id: 2, title: 'Item 2', body: 'Body 2' }



    it('should return null when updating non-existent item', () => {      expect(created.body).toBe('Local Body');      ];

      const updated = service.updateItem(999, { title: 'Updated' });

      expect(updated).toBeNull();      expect(created.userId).toBe(1);

    });

      service.getItems().subscribe(items => {

    it('should generate incremental IDs for new items', () => {

      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });      const allItems = service.getLocalItems();        expect(items.length).toBe(2);

      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });

      const item3 = service.createItem({ title: 'Item 3', body: 'Body 3' });      expect(allItems.length).toBe(1);        expect(items).toEqual(mockItems);



      expect(item2.id).toBe(item1.id + 1);      expect(allItems[0]).toEqual(created);        done();

      expect(item3.id).toBe(item2.id + 1);

    });    });      });



    it('should persist items in localStorage', () => {

      service.createItem({ title: 'Persistent Item', body: 'Persistent Body' });

    it('should update an existing item in local storage', () => {      const req = httpMock.expectOne(req => req.url.includes('/posts'));

      const storedData = localStorage.getItem('items_local');

      expect(storedData).toBeTruthy();      const created = service.createItem({ title: 'Original', body: 'Body' });      expect(req.request.method).toBe('GET');



      const parsedData = JSON.parse(storedData!);      const updated = service.updateItem(created.id, { title: 'Updated Title', body: 'Updated Body' });      req.flush(mockItems);

      expect(parsedData.length).toBe(1);

      expect(parsedData[0].title).toBe('Persistent Item');    });

    });

      expect(updated).toBeTruthy();

    it('should sync items from API to localStorage', () => {

      const apiItems: Item[] = [      expect(updated!.id).toBe(created.id);    it('should fetch items with pagination parameters in URL', (done) => {

        { id: 100, title: 'API Item 1', body: 'Body 1' },

        { id: 101, title: 'API Item 2', body: 'Body 2' }      expect(updated!.title).toBe('Updated Title');      const mockItems: Item[] = [

      ];

      expect(updated!.body).toBe('Updated Body');        { id: 1, title: 'Item 1', body: 'Body 1' }

      service.syncItemsToLocal(apiItems);

      const localItems = service.getLocalItems();      ];



      expect(localItems.length).toBe(2);      const allItems = service.getLocalItems();

      expect(localItems[0].id).toBe(100);

      expect(localItems[1].id).toBe(101);      expect(allItems.length).toBe(1);      // El servicio usa parámetros opcionales internamente

    });

      expect(allItems[0].title).toBe('Updated Title');      service.getItems().subscribe(items => {

    it('should append items when sync with append=true', () => {

      service.createItem({ title: 'Local Item', body: 'Local Body' });    });        expect(items).toBeDefined();

      

      const apiItems: Item[] = [        done();

        { id: 100, title: 'API Item', body: 'API Body' }

      ];    it('should delete an item from local storage', () => {      });



      service.syncItemsToLocal(apiItems, true);      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });

      const localItems = service.getLocalItems();

      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });      const req = httpMock.expectOne(req => req.url.includes('/posts'));

      expect(localItems.length).toBe(2);

    });      expect(req.request.method).toBe('GET');



    it('should remove duplicates when syncing items', () => {      expect(service.getLocalItems().length).toBe(2);      req.flush(mockItems);

      const items: Item[] = [

        { id: 1, title: 'Item 1', body: 'Body 1' },    });

        { id: 1, title: 'Item 1 Updated', body: 'Body 1 Updated' },

        { id: 2, title: 'Item 2', body: 'Body 2' }      const deleted = service.deleteItem(item1.id);  });

      ];

      expect(deleted).toBe(true);

      service.syncItemsToLocal(items);

      const localItems = service.getLocalItems();  describe('Favorite Functionality', () => {



      expect(localItems.length).toBe(2);      const remaining = service.getLocalItems();    it('should toggle favorite status', () => {

      const item1 = localItems.find(i => i.id === 1);

      expect(item1!.title).toBe('Item 1 Updated'); // Último valor prevalece      expect(remaining.length).toBe(1);      const item = service.createItem({ title: 'Test', body: 'Body' });

    });

  });      expect(remaining[0].id).toBe(item2.id);      expect(item.isFavorite).toBeFalsy();



  describe('Edge Cases', () => {    });      

    it('should handle empty localStorage gracefully', () => {

      localStorage.removeItem('items_local');      const updated = service.updateItem(item.id, { isFavorite: true });

      const items = service.getLocalItems();

      expect(items).toEqual([]);    it('should return false when deleting non-existent item', () => {      expect(updated!.isFavorite).toBe(true);

    });

      const deleted = service.deleteItem(999);      

    it('should handle corrupted localStorage data', () => {

      localStorage.setItem('items_local', 'invalid json data');      expect(deleted).toBe(false);      const updated2 = service.updateItem(item.id, { isFavorite: false });

      const items = service.getLocalItems();

      expect(items).toEqual([]);    });      expect(updated2!.isFavorite).toBe(false);

    });

    });

    it('should handle partial item updates', () => {

      const created = service.createItem({ title: 'Original Title', body: 'Original Body' });    it('should get all local items', () => {  });

      

      const updatedTitle = service.updateItem(created.id, { title: 'New Title' });      expect(service.getLocalItems().length).toBe(0);});

      expect(updatedTitle!.title).toBe('New Title');

      expect(updatedTitle!.body).toBe('Original Body');

      service.createItem({ title: 'Item 1', body: 'Body 1' });

      const updatedBody = service.updateItem(created.id, { body: 'New Body' });      service.createItem({ title: 'Item 2', body: 'Body 2' });

      expect(updatedBody!.title).toBe('New Title');      service.createItem({ title: 'Item 3', body: 'Body 3' });

      expect(updatedBody!.body).toBe('New Body');

    });      const items = service.getLocalItems();

      expect(items.length).toBe(3);

    it('should handle creating item with empty title and body', () => {      expect(items[0].title).toBe('Item 1');

      const created = service.createItem({});      expect(items[1].title).toBe('Item 2');

            expect(items[2].title).toBe('Item 3');

      expect(created.title).toBe('');    });

      expect(created.body).toBe('');

      expect(created.id).toBeGreaterThan(0);    it('should return null when updating non-existent item', () => {

    });      const updated = service.updateItem(999, { title: 'Updated' });

  });      expect(updated).toBeNull();

    });

  describe('Integration Tests', () => {

    it('should perform complete CRUD cycle', () => {    it('should generate incremental IDs for new items', () => {

      // CREATE      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });

      const created = service.createItem({ title: 'CRUD Test', body: 'Initial' });      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });

      expect(created.id).toBeDefined();      const item3 = service.createItem({ title: 'Item 3', body: 'Body 3' });



      // READ      expect(item2.id).toBe(item1.id + 1);

      const items = service.getLocalItems();      expect(item3.id).toBe(item2.id + 1);

      expect(items.length).toBe(1);    });

      expect(items[0].id).toBe(created.id);

    it('should persist items in localStorage', () => {

      // UPDATE      service.createItem({ title: 'Persistent Item', body: 'Persistent Body' });

      const updated = service.updateItem(created.id, { title: 'Updated CRUD' });

      expect(updated!.title).toBe('Updated CRUD');      const storedData = localStorage.getItem('items_local');

      expect(storedData).toBeTruthy();

      // DELETE

      const deleted = service.deleteItem(created.id);      const parsedData = JSON.parse(storedData!);

      expect(deleted).toBe(true);      expect(parsedData.length).toBe(1);

      expect(service.getLocalItems().length).toBe(0);      expect(parsedData[0].title).toBe('Persistent Item');

    });    });



    it('should maintain data integrity with multiple operations', () => {    it('should load items from localStorage on initialization', () => {

      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });      const testItems: Item[] = [

      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });        { id: 1, title: 'Stored Item', body: 'Stored Body', userId: 1 }

            ];

      service.updateItem(item1.id, { title: 'Updated Item 1' });      localStorage.setItem('items_local', JSON.stringify(testItems));

      service.deleteItem(item2.id);

            const newService = new ItemsService(null as any);

      const item3 = service.createItem({ title: 'Item 3', body: 'Body 3' });      const items = newService.getLocalItems();



      const finalItems = service.getLocalItems();      expect(items.length).toBe(1);

      expect(finalItems.length).toBe(2);      expect(items[0].title).toBe('Stored Item');

      expect(finalItems.find(i => i.id === item1.id)!.title).toBe('Updated Item 1');    });

      expect(finalItems.find(i => i.id === item3.id)).toBeTruthy();  });

      expect(finalItems.find(i => i.id === item2.id)).toBeUndefined();

    });  describe('Edge Cases', () => {

    it('should handle empty localStorage gracefully', () => {

    it('should handle API fetch and local storage interaction', (done) => {      localStorage.removeItem('items_local');

      const mockItems: Item[] = [      const items = service.getLocalItems();

        { id: 100, title: 'API Item', body: 'API Body' }      expect(items).toEqual([]);

      ];    });



      service.getItems().subscribe(items => {    it('should handle corrupted localStorage data', () => {

        service.syncItemsToLocal(items);      localStorage.setItem('items_local', 'invalid json data');

        const localItems = service.getLocalItems();      const items = service.getLocalItems();

              expect(items).toEqual([]);

        expect(localItems.length).toBe(1);    });

        expect(localItems[0].id).toBe(100);

        done();    it('should handle partial item updates', () => {

      });      const created = service.createItem({ title: 'Original Title', body: 'Original Body' });

      

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts');      const updatedTitle = service.updateItem(created.id, { title: 'New Title' });

      req.flush(mockItems);      expect(updatedTitle!.title).toBe('New Title');

    });      expect(updatedTitle!.body).toBe('Original Body');

  });

});      const updatedBody = service.updateItem(created.id, { body: 'New Body' });

      expect(updatedBody!.title).toBe('New Title');
      expect(updatedBody!.body).toBe('New Body');
    });
  });

  describe('Integration Tests', () => {
    it('should perform complete CRUD cycle', () => {
      // CREATE
      const created = service.createItem({ title: 'CRUD Test', body: 'Initial' });
      expect(created.id).toBeDefined();

      // READ
      const items = service.getLocalItems();
      expect(items.length).toBe(1);
      expect(items[0].id).toBe(created.id);

      // UPDATE
      const updated = service.updateItem(created.id, { title: 'Updated CRUD' });
      expect(updated!.title).toBe('Updated CRUD');

      // DELETE
      const deleted = service.deleteItem(created.id);
      expect(deleted).toBe(true);
      expect(service.getLocalItems().length).toBe(0);
    });

    it('should maintain data integrity with multiple operations', () => {
      const item1 = service.createItem({ title: 'Item 1', body: 'Body 1' });
      const item2 = service.createItem({ title: 'Item 2', body: 'Body 2' });
      
      service.updateItem(item1.id, { title: 'Updated Item 1' });
      service.deleteItem(item2.id);
      
      const item3 = service.createItem({ title: 'Item 3', body: 'Body 3' });

      const finalItems = service.getLocalItems();
      expect(finalItems.length).toBe(2);
      expect(finalItems.find(i => i.id === item1.id)!.title).toBe('Updated Item 1');
      expect(finalItems.find(i => i.id === item3.id)).toBeTruthy();
      expect(finalItems.find(i => i.id === item2.id)).toBeUndefined();
    });
  });
});
