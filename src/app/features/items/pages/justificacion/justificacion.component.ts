import { Component, OnInit } from '@angular/core';
import { ItemsService, Item } from '../../data-access/items.service';
import { selectAllItems } from '../../state/items.selectors';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/toast.service';
import { ConfirmService } from '../../../../core/confirm.service';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import * as ItemsActions from '../../state/items.actions';

@Component({
  selector: 'app-justificacion',
  templateUrl: './justificacion.component.html',
  styleUrls: ['./justificacion.component.scss']
})
export class JustificacionComponent implements OnInit {
  items$: Observable<Item[]> = of([] as Item[]);
  model: Partial<Item> = { title: '', body: '' };
  editingId: number | null = null;

  constructor(
    private itemsService: ItemsService,
    private router: Router,
    private toast: ToastService,
    private store: Store,
  private actions$: Actions,
  private confirm: ConfirmService
  ) {
    // mostrar toasts cuando las acciones CRUD finalicen
    this.actions$.pipe(ofType(ItemsActions.createItemSuccess)).subscribe(() => this.toast.show('Registro creado', 'success'));
    this.actions$.pipe(ofType(ItemsActions.updateItemSuccess)).subscribe(() => this.toast.show('Registro actualizado', 'success'));
    this.actions$.pipe(ofType(ItemsActions.deleteItemSuccess)).subscribe(() => this.toast.show('Registro eliminado', 'info'));
  }

  ngOnInit(): void {
    // subscribe to items from the store and load initial page
    this.items$ = this.store.select(selectAllItems) as Observable<Item[]>;
    this.store.dispatch(ItemsActions.loadItems({ page: 1, limit: 10 }));
  }

  startNew() {
    this.editingId = null;
    this.model = { title: '', body: '' };
  }

  save() {
    if (!this.model.title) {
      return alert('Por favor ingresa un título.');
    }

    if (this.editingId) {
      this.store.dispatch(ItemsActions.updateItem({ id: this.editingId, changes: { title: this.model.title || '', body: this.model.body || '' } }));
    } else {
      this.store.dispatch(ItemsActions.createItem({ payload: { title: this.model.title || '', body: this.model.body || '' } }));
    }
    // la lista se refresca por efecto que despacha loadItemsSuccess; limpiamos el formulario
    this.startNew();
  }

  edit(item: Item) {
    this.editingId = item.id;
    this.model = { title: item.title, body: item.body };
    // bring the form into view
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  remove(id: number) {
    this.confirm.confirmAsync({ message: '¿Eliminar este registro?' }).then((ok: boolean) => {
      if (ok) this.store.dispatch(ItemsActions.deleteItem({ id }));
    });
  }

}
