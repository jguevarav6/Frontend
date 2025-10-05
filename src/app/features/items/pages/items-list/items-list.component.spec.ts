import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsListComponent } from './items-list.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, ReplaySubject } from 'rxjs';
import { ItemsService } from '../../data-access/items.service';
import { ToastService } from '../../../../core/toast.service';
import { ConfirmService } from '../../../../core/confirm.service';
import { 
  selectAllItems, 
  selectItemsLoading, 
  selectItemsFilterQuery,
  selectItemsSelectedIds,
  selectItemsTotal
} from '../../state/items.selectors';
import { 
  loadItems, 
  setFilter, 
  deleteItems,
  createItem,
  updateItem,
  deleteItem
} from '../../state/items.actions';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ItemsListComponent', () => {
  let component: ItemsListComponent;
  let fixture: ComponentFixture<ItemsListComponent>;
  let store: MockStore;
  let actions$: ReplaySubject<any>;
  let itemsService: jasmine.SpyObj<ItemsService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let confirmService: jasmine.SpyObj<ConfirmService>;

  const mockItems = [
    { id: 1, title: 'Item 1', body: 'Body 1', userId: 1 },
    { id: 2, title: 'Item 2', body: 'Body 2', userId: 1 },
    { id: 3, title: 'Item 3', body: 'Body 3', userId: 1 }
  ];

  const initialState = {
    items: {
      items: mockItems,
      loading: false,
      error: null,
      selectedIds: [],
      total: 100,
      filters: { query: '' }
    }
  };

  beforeEach(async () => {
    const itemsServiceSpy = jasmine.createSpyObj('ItemsService', ['getLocalItems']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    const confirmServiceSpy = jasmine.createSpyObj('ConfirmService', ['confirmAsync']);
    
    actions$ = new ReplaySubject(1);

    await TestBed.configureTestingModule({
      declarations: [ ItemsListComponent ],
      providers: [
        provideMockStore({ initialState }),
        provideMockActions(() => actions$),
        { provide: ItemsService, useValue: itemsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ConfirmService, useValue: confirmServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    itemsService = TestBed.inject(ItemsService) as jasmine.SpyObj<ItemsService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    confirmService = TestBed.inject(ConfirmService) as jasmine.SpyObj<ConfirmService>;

    store.overrideSelector(selectAllItems, mockItems);
    store.overrideSelector(selectItemsLoading, false);
    store.overrideSelector(selectItemsSelectedIds, []);
    store.overrideSelector(selectItemsTotal, 100);
    store.overrideSelector(selectItemsFilterQuery, '');

    fixture = TestBed.createComponent(ItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe cargar items al inicializar', () => {
      spyOn(store, 'dispatch');
      component.ngOnInit();
      expect(store.dispatch).toHaveBeenCalledWith(loadItems({ page: 1, limit: 10 }));
    });

    it('debe suscribirse a los observables del store', (done) => {
      component.items$.subscribe(items => {
        expect(items).toEqual(mockItems);
        done();
      });
    });
  });

  describe('Búsqueda', () => {
    it('debe actualizar query y despachar setFilter', () => {
      spyOn(store, 'dispatch');
      component.onQueryChange('test');
      
      expect(component.query).toBe('test');
      expect(store.dispatch).toHaveBeenCalledWith(setFilter({ query: 'test' }));
    });

    it('debe filtrar items basándose en título', (done) => {
      store.overrideSelector(selectItemsFilterQuery, 'Item 2');
      store.refreshState();
      
      component.filteredItems$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].title).toBe('Item 2');
        done();
      });
    });

    it('debe filtrar items basándose en ID', (done) => {
      store.overrideSelector(selectItemsFilterQuery, '3');
      store.refreshState();
      
      component.filteredItems$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].id).toBe(3);
        done();
      });
    });
  });

  describe('CRUD', () => {
    it('debe crear un item local', () => {
      spyOn(store, 'dispatch');
      component.createLocalItem('Nuevo', 'Body');
      
      expect(store.dispatch).toHaveBeenCalledWith(
        createItem({ payload: { title: 'Nuevo', body: 'Body' } })
      );
    });

    it('debe actualizar un item', () => {
      spyOn(store, 'dispatch');
      component.editLocalItem(1, { title: 'Actualizado' });
      
      expect(store.dispatch).toHaveBeenCalledWith(
        updateItem({ id: 1, changes: { title: 'Actualizado' } })
      );
    });

    it('debe eliminar un item con confirmación', async () => {
      confirmService.confirmAsync.and.returnValue(Promise.resolve(true));
      spyOn(store, 'dispatch');
      
      await component.requestDelete(1);
      
      expect(confirmService.confirmAsync).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(deleteItem({ id: 1 }));
    });

    it('NO debe eliminar si se cancela la confirmación', async () => {
      confirmService.confirmAsync.and.returnValue(Promise.resolve(false));
      spyOn(store, 'dispatch');
      
      await component.requestDelete(1);
      
      expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({
        type: '[Items] Delete Item'
      }));
    });
  });

  describe('Eliminación masiva', () => {
    it('debe eliminar items seleccionados con confirmación', async () => {
      confirmService.confirmAsync.and.returnValue(Promise.resolve(true));
      spyOn(store, 'dispatch');
      
      await component.deleteSelected([1, 2, 3]);
      
      expect(confirmService.confirmAsync).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(deleteItems({ ids: [1, 2, 3] }));
    });

    it('NO debe eliminar si el array está vacío', async () => {
      spyOn(store, 'dispatch');
      
      await component.deleteSelected([]);
      
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Paginación', () => {
    it('debe cargar más items cuando hasMore es true', () => {
      spyOn(store, 'dispatch');
      component.hasMore = true;
      component.page = 1;
      
      component.loadMore();
      
      expect(store.dispatch).toHaveBeenCalledWith(
        loadItems({ page: 2, limit: 10, append: true })
      );
    });

    it('NO debe cargar si hasMore es false', () => {
      spyOn(store, 'dispatch');
      component.hasMore = false;
      
      component.loadMore();
      
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Exportación CSV', () => {
    it('debe generar CSV con headers correctos', () => {
      spyOn(document, 'createElement').and.callThrough();
      component.exportToCSV(mockItems);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('NO debe exportar si no hay items', () => {
      spyOn(document, 'createElement');
      component.exportToCSV([]);
      
      expect(document.createElement).not.toHaveBeenCalled();
    });
  });

  describe('Edición inline', () => {
    it('debe iniciar edición inline', () => {
      const item = mockItems[0];
      component.startInlineEdit(item);
      
      expect(component.editingId).toBe(1);
      expect(component.editModel.title).toBe('Item 1');
    });

    it('debe guardar cambios de edición inline', () => {
      spyOn(store, 'dispatch');
      component.editingId = 1;
      component.editModel = { title: 'Editado', body: 'Body editado' };
      
      component.saveInlineEdit();
      
      expect(store.dispatch).toHaveBeenCalledWith(
        updateItem({ id: 1, changes: { title: 'Editado', body: 'Body editado' } })
      );
      expect(component.editingId).toBeNull();
    });

    it('debe cancelar edición inline', () => {
      component.editingId = 1;
      component.editModel = { title: 'Test' };
      
      component.cancelInlineEdit();
      
      expect(component.editingId).toBeNull();
      expect(component.editModel.title).toBe('');
    });
  });

  describe('TrackBy', () => {
    it('debe usar trackById para optimizar renderizado', () => {
      const item = mockItems[0];
      const result = component.trackById(0, item);
      
      expect(result).toBe(item.id);
    });
  });

  describe('Logo fallback', () => {
    it('debe manejar error de carga de logo', () => {
      expect(component.logoLoadError).toBeFalse();
      
      component.onLogoError();
      
      expect(component.logoLoadError).toBeTrue();
    });
  });
})
