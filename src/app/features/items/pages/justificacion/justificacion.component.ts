import { Component, OnInit } from '@angular/core';
import { ItemsService, Item } from '../../data-access/items.service';
import { selectAllItems } from '../../state/items.selectors';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
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
  loading = false;
  total = 0;

  constructor(
    private itemsService: ItemsService,
    private router: Router,
    private toast: ToastService,
    private store: Store,
    private actions$: Actions,
    private confirm: ConfirmService
  ) {
    // NO subscribirse aquí a los eventos para evitar notificaciones duplicadas
    // Las notificaciones ya se manejan en items-list.component
  }

  ngOnInit(): void {
    // Suscribirse a los items del store (se actualizará automáticamente cuando se refresque desde API)
    this.items$ = this.store.select(selectAllItems) as Observable<Item[]>;
    
    // Observar el total actual
    this.store.select(selectAllItems).subscribe((arr) => (this.total = (arr || []).length));
    
    // Observar el estado de carga
    this.store.select((state: any) => state.items?.loading).subscribe((v: any) => (this.loading = !!v));
  }

  startNew() {
    this.editingId = null;
    this.model = { title: '', body: '' };
    // focus the title input for faster entry
    setTimeout(() => {
      const el = document.querySelector('input[name="title"]') as HTMLInputElement | null;
      if (el) el.focus();
    }, 50);
  }

  save() {
    if (!this.model.title) {
      this.toast.show('Por favor ingresa un título.', 'error');
      // focus title
      setTimeout(() => {
        const el = document.querySelector('input[name="title"]') as HTMLInputElement | null;
        if (el) el.focus();
      }, 50);
      return;
    }

    // Check duplicates (case-insensitive) using current store snapshot
    this.store.select(selectAllItems).pipe(take(1)).subscribe((items) => {
      const titleLower = (this.model.title || '').toLowerCase().trim();
      const duplicate = (items || []).some(it => it.title.toLowerCase().trim() === titleLower && it.id !== this.editingId);
      if (duplicate) {
        this.toast.show('Ya existe un registro con ese título.', 'error');
        return;
      }

      if (this.editingId) {
        this.store.dispatch(ItemsActions.updateItem({ id: this.editingId, changes: { title: this.model.title || '', body: this.model.body || '' } }));
        this.toast.show('Actualizando registro…', 'info');
      } else {
        this.store.dispatch(ItemsActions.createItem({ payload: { title: this.model.title || '', body: this.model.body || '' } }));
        this.toast.show('Creando registro…', 'info');
      }

      // la lista se refresca por efecto que despacha loadItemsSuccess; limpiamos el formulario
      this.startNew();
      // small UX: scroll to list
      setTimeout(() => {
        const el = document.querySelector('section ul') as HTMLElement | null;
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }

  edit(item: Item) {
    this.editingId = item.id;
    this.model = { title: item.title, body: item.body };
    // bring the form into view
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  remove(id: number) {
    this.confirm.confirmAsync({ 
      title: 'Eliminar Registro',
      message: '¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    }).then((ok: boolean) => {
      if (ok) {
        this.store.dispatch(ItemsActions.deleteItem({ id }));
        this.toast.show('Registro eliminado', 'success');
      }
    });
  }

  exportToCSV() {
    // take a snapshot of items from the store
    this.store.select(selectAllItems).pipe(take(1)).subscribe((items) => {
      const header = ['id', 'title', 'body'];
      const rows = (items || []).map(i => [i.id, `"${(i.title||'').replace(/"/g,'""')}"`, `"${(i.body||'').replace(/"/g,'""')}"`]);
      const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'justificacion_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

}
