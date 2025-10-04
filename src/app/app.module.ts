import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent
    ,ConfirmComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    // Provide HttpClientModule at the root so HTTP services are singletons
    HttpClientModule,
    AppRoutingModule,
  StoreModule.forRoot({ items: itemsReducer }, { metaReducers: [persistItemsMetaReducer] as MetaReducer<any>[] }),
    EffectsModule.forRoot([ItemsEffects, ItemsCrudEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
