import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemsRoutingModule } from './items-routing.module';
import { ItemsComponent } from './items.component';
import { ItemsListComponent } from './pages/items-list/items-list.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component';
import { DocumentsTableComponent } from './components/documents-table/documents-table.component';
import { TaxesPaidComponent } from './components/taxes-paid/taxes-paid.component';
import { FormsModule } from '@angular/forms';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { ItemFormComponent } from './pages/item-form/item-form.component';
import { DeclaracionComponent } from './pages/declaracion/declaracion.component';
import { JustificacionComponent } from './pages/justificacion/justificacion.component';

@NgModule({
  declarations: [
    ItemsComponent,
    ItemsListComponent,
    ItemDetailComponent
    ,SidebarComponent,
    DashboardMainComponent,
    DocumentsTableComponent,
    TaxesPaidComponent
    ,ItemFormComponent
    ,DeclaracionComponent
    ,JustificacionComponent
  ],
  imports: [
    CommonModule,
    ItemsRoutingModule,
    FormsModule,
  ]
})
export class ItemsModule { }
