# 📝 DOCUMENTACIÓN DEL CÓDIGO - Sistema de Gestión de Impuestos

## 🎯 Resumen Ejecutivo

Este documento describe la arquitectura, componentes principales y flujo de datos del sistema.

---

## 📂 ESTRUCTURA DE ARCHIVOS PRINCIPALES

### 1. **items.service.ts** - Servicio de Datos
**Ubicación**: `src/app/features/items/data-access/`

**Responsabilidades**:
- Consumo de API REST (JSONPlaceholder)
- Operaciones CRUD en localStorage (crear, leer, actualizar, eliminar)
- Sincronización entre datos de API y localStorage

**Métodos Clave**:
```typescript
// CRUD localStorage
createItem(payload): Item         // Crea item nuevo con ID autogenerado
updateItem(id, changes): Item     // Actualiza item existente
deleteItem(id): boolean           // Elimina item por ID
getLocalItems(): Item[]           // Obtiene todos los items locales

// API REST
getItems(opts): Observable        // Obtiene items con paginación
getItemsWithTotal(opts): Observable  // Obtiene items + total de registros
syncItemsToLocal(items, append)   // Sincroniza API con localStorage
```

---

### 2. **items.actions.ts** - Acciones NGRX
**Ubicación**: `src/app/features/items/state/`

**Responsabilidades**:
- Define todas las acciones posibles en el sistema
- 20+ acciones para CRUD, filtros, favoritos, ordenamiento

**Grupos de Acciones**:
```typescript
// Carga de datos
loadItems, loadItemsSuccess, loadItemsFailure
refreshFromAPI

// CRUD
createItem, createItemSuccess, createItemFailure
updateItem, updateItemSuccess, updateItemFailure
deleteItem, deleteItemSuccess, deleteItemFailure
deleteItems, deleteItemsSuccess

// UI e Interacción
toggleSelectItem, clearSelection
toggleFavorite, setShowOnlyFavorites
setSortBy, setFilter
```

---

### 3. **items.effects.ts** - Efectos Secundarios NGRX
**Ubicación**: `src/app/features/items/state/`

**Responsabilidades**:
- Manejo de operaciones asíncronas (llamadas API)
- Sincronización automática entre API y localStorage
- Persistencia de favoritos

**Efectos Principales**:

#### `loadItems$`
Carga items combinando API + localStorage.
1. Obtiene items de la API según página/límite
2. Lee items de localStorage
3. Combina ambos eliminando duplicados
4. Prioriza items locales (creados manualmente)
5. Sincroniza resultado final a localStorage

#### `refreshFromAPI$`
Recarga forzada desde API manteniendo cambios locales.

#### `create$`, `update$`, `delete$`
Ejecutan operaciones CRUD y actualizan el store inmediatamente.

#### `toggleFavorite$`
Persiste cambios de favoritos en localStorage.

---

### 4. **items.reducer.ts** - Reducer de Estado
**Ubicación**: `src/app/features/items/state/`

**Responsabilidades**:
- Define el estado global de items
- Maneja transiciones de estado puras (sin side-effects)

**Estado Global**:
```typescript
interface ItemsState {
  items: Item[];              // Lista de items
  loading: boolean;           // Estado de carga
  error: any | null;          // Errores
  selectedId: number | null;  // Item seleccionado (detalle)
  selectedIds: number[];      // Items seleccionados (checkbox)
  total: number | null;       // Total de registros en API
  filters: { query: string }; // Texto de búsqueda
  showOnlyFavorites: boolean; // Filtro de favoritos activo
  sortBy: {                   // Ordenamiento actual
    field: 'id' | 'title' | 'date';
    direction: 'asc' | 'desc';
  };
}
```

---

### 5. **items.selectors.ts** - Selectores Memoizados
**Ubicación**: `src/app/features/items/state/`

**Responsabilidades**:
- Deriva estado computado del store
- Optimiza rendimiento con memoización

**Selectores Principales**:
```typescript
selectAllItems              // Todos los items
selectItemsLoading          // Estado de carga
selectFilteredItems         // Items filtrados + ordenados
selectShowOnlyFavorites     // Estado del filtro de favoritos
selectSortBy                // Configuración de ordenamiento
selectItemsSelectedIds      // IDs seleccionados para acciones masivas
```

#### `selectFilteredItems` - Selector Complejo
Combina 4 selectores para generar lista final:
1. Toma todos los items
2. Aplica filtro de búsqueda (título, body, ID)
3. Aplica filtro de favoritos (si está activo)
4. Ordena según configuración actual
5. Devuelve lista procesada

---

### 6. **items-list.component.ts** - Componente Principal
**Ubicación**: `src/app/features/items/pages/items-list/`

**Responsabilidades**:
- Presenta listado de items con todas las funcionalidades
- Gestiona búsqueda, filtros, ordenamiento
- Maneja selección múltiple y acciones masivas
- Exportación a PDF y CSV

**Funcionalidades Clave**:

#### Paginación
```typescript
loadMore()  // Carga siguiente página (append mode)
hasMore     // Calcula si hay más items disponibles
```

#### Búsqueda y Filtros
```typescript
onQueryChange(value)           // Actualiza búsqueda en el store
toggleShowOnlyFavorites()      // Activa/desactiva filtro de favoritos
onSortChange(field, direction) // Cambia ordenamiento
```

#### Selección Múltiple
```typescript
toggleSelect(id)       // Selecciona/deselecciona item individual
selectAll()            // Selecciona todos los items visibles
deselectAll()          // Limpia selección
deleteSelected()       // Elimina items seleccionados con confirmación
```

#### Exportación
```typescript
exportToCSV()  // Genera archivo CSV con items filtrados
exportToPDF()  // Genera PDF con jsPDF + autotable
```

**Control de Notificaciones**:
- Anti-spam: 500ms entre notificaciones
- Evita flood de mensajes al eliminar múltiples items

---

### 7. **local-storage.metareducer.ts** - Persistencia Automática
**Ubicación**: `src/app/core/`

**Responsabilidades**:
- Persiste automáticamente el estado NGRX en localStorage
- Hidrata el estado al iniciar la aplicación

**Funcionamiento**:
1. Intercepta cada acción del store
2. Después de cada cambio, guarda estado en `app_items_state_v1`
3. Al iniciar, lee localStorage y restaura estado anterior

---

## 🔄 FLUJO DE DATOS COMPLETO

### Ejemplo: Usuario crea un item en Justificación

```
1. Usuario completa formulario → clic en "Guardar"
   ↓
2. Component dispatch: createItem({ payload: { title, body } })
   ↓
3. EFFECT (create$):
   - Llama a itemsService.createItem()
   - Servicio genera ID, guarda en localStorage
   - Dispatch: createItemSuccess({ item })
   ↓
4. REDUCER:
   - Escucha createItemSuccess
   - Agrega item a state.items[]
   ↓
5. METAREDUCER:
   - Auto-guarda estado en localStorage (app_items_state_v1)
   ↓
6. SELECTOR (selectAllItems):
   - Detecta cambio, recomputa lista
   ↓
7. COMPONENT (items-list):
   - Observable se actualiza automáticamente
   - Template re-renderiza mostrando nuevo item
```

### Ejemplo: Usuario refresca API

```
1. Usuario clic en "Refrescar API"
   ↓
2. Component dispatch: refreshFromAPI()
   ↓
3. EFFECT (refreshFromAPI$):
   - Llama a API: GET /posts?_limit=10
   - Lee localStorage: getLocalItems()
   - Combina: [...localItems, ...itemsNoEnLocal]
   - Sincroniza: syncItemsToLocal(combined)
   - Dispatch: loadItemsSuccess({ items: combined })
   ↓
4. Toast notification: "✓ Datos recargados"
   ↓
5. UI se actualiza con items combinados
```

---

## 🎨 COMPONENTES UI

### Sidebar (sidebar.component.ts)
- Menú lateral colapsable (280px ↔ 80px)
- Navegación entre páginas
- Responsive: se oculta en mobile

### Dashboard Main (dashboard-main.component.ts)
- 3 tarjetas informativas
- Card CTA "Nueva Declaración"
- Grid responsive (1 col mobile, 3 cols desktop)

### Taxes Paid (taxes-paid.component.ts)
- Barras de progreso animadas
- 3 tipos de impuestos: Renta (68%), IVA (44%), ICA (12%)
- Gradientes de color

### Page Layout (page-layout.component.ts)
- Wrapper con sidebar + content + footer
- Controla estado de colapso del sidebar
- Footer responsive que se expande al colapsar sidebar

---

## 🛡️ SERVICIOS CORE

### ToastService (toast.service.ts)
Notificaciones toast globales.
```typescript
show(message, type)  // Muestra notificación
hide(id)             // Oculta notificación específica
```

### ConfirmService (confirm.service.ts)
Diálogos de confirmación modales.
```typescript
confirm(config)      // Muestra modal, devuelve Observable<boolean>
```

**Uso**:
```typescript
this.confirmService.confirm({
  title: '¿Eliminar item?',
  message: 'Esta acción no se puede deshacer',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar'
}).subscribe(confirmed => {
  if (confirmed) {
    // Ejecutar eliminación
  }
});
```

---

## 🔑 CONCEPTOS CLAVE

### 1. **Sincronización Dual**
El sistema mantiene consistencia entre:
- **localStorage** (`items_local`): Items creados manualmente + CRUD
- **API REST**: Items de JSONPlaceholder
- **NGRX Store**: Estado en memoria durante sesión

**Prioridad**: Items locales > Items API (los locales nunca se pierden)

### 2. **Arquitectura Reactiva**
- Todo es Observable (RxJS)
- Cambios se propagan automáticamente
- No hay `this.items = data`, solo `this.items$ = store.select()`

### 3. **Separation of Concerns**
```
data-access/   → Lógica de negocio (HTTP, localStorage)
state/         → Gestión de estado (NGRX)
pages/         → Componentes smart (conectan con store)
components/    → Componentes dump (solo presentación)
```

### 4. **Type Safety**
Todo tipado con TypeScript:
- Interfaces para Item, ItemsState, Actions
- No uso de `any` (excepto en casos específicos de jsPDF)

---

## 📊 DEPENDENCIAS CLAVE

- **@ngrx/store**: Store global Redux
- **@ngrx/effects**: Side effects (llamadas API)
- **RxJS**: Observables y operadores reactivos
- **jsPDF**: Generación de PDFs
- **HttpClient**: Consumo de API REST

---

## 🐛 DEBUGGING

### Ver estado en tiempo real
1. Abrir DevTools → Application → Local Storage
2. Ver `items_local` y `app_items_state_v1`

### Ver actions en consola
La aplicación incluye logs en efectos:
```
[ItemsEffects] loadItems$ - Loading...
[ItemsEffects] loadItems$ SUCCESS - 10 items
[ItemsService] syncItemsToLocal - synced 80 items
```

### NGRX DevTools
Si tienes la extensión Redux DevTools:
- Time-travel debugging
- Ver historial de actions
- Inspeccionar estado

---

**Documento generado**: Octubre 2025  
**Versión del sistema**: 1.0.0  
**Para más información**: Ver README.md y DEPENDENCIAS.txt
