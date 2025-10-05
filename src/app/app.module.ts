import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastComponent } from './core/toast.component';
import { ConfirmComponent } from './core/confirm.component';
import { LoadingComponent } from './core/loading.component';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { itemsReducer } from './features/items/state/items.reducer';
import { persistItemsMetaReducer } from './core/local-storage.metareducer';
import { ItemsEffects, ItemsCrudEffects } from './features/items/state/items.effects';
import { authReducer } from './core/auth/auth.reducer';
import { AuthEffects } from './core/auth/auth.effects';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent
    ,ConfirmComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    // Provide HttpClientModule at the root so HTTP services are singletons
    HttpClientModule,
    AppRoutingModule,
  StoreModule.forRoot({ 
      items: itemsReducer,
      auth: authReducer 
    }, { metaReducers: [persistItemsMetaReducer] as MetaReducer<any>[] }),
    EffectsModule.forRoot([ItemsEffects, ItemsCrudEffects, AuthEffects]),
    // PrimeNG Modules
    TableModule,
    PaginatorModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    DropdownModule,
    TagModule,
    CardModule,
    ToolbarModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
