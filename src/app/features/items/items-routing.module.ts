import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemsListComponent } from './pages/items-list/items-list.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { ItemFormComponent } from './pages/item-form/item-form.component';
import { DeclaracionComponent } from './pages/declaracion/declaracion.component';
import { JustificacionComponent } from './pages/justificacion/justificacion.component';

const routes: Routes = [
  { path: '', component: ItemsListComponent },     // /items
  { path: 'new', component: ItemFormComponent },   // /items/new
  { path: 'declaracion', component: DeclaracionComponent }, // /items/declaracion
  { path: 'justificacion', component: JustificacionComponent }, // /items/justificacion
  { path: ':id', component: ItemDetailComponent }, // /items/123
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // ← forChild (NO forRoot)
  exports: [RouterModule],
})
export class ItemsRoutingModule {}
