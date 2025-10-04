# Cambios principales (Entrega - Prueba Técnica Frontend)

Fecha: 2025-10-04

Resumen breve
- Implementación completa de la prueba técnica solicitada en Angular 12.
- Listado de ítems consumidos desde JSONPlaceholder (API pública).
- Estado global con NgRx (acciones, efectos, reducer, selectors).
- CRUD simulado (salvado en LocalStorage) enlazado a NgRx (create/update/delete via effects).
- Paginación con lectura de `X-Total-Count` y carga incremental (append).
- Buscador local en la lista y filtros básicos (search por título/id).
- Vista de detalle de item (ruta `/items/:id`).
- Confirmación accesible antes de eliminar (modal con focus-trap y manejo de teclado).
- Toastr global para notificaciones (éxito/errores).
- Spinner global ligado al store con debounce para evitar parpadeos.
- Persistencia de la slice `items` en LocalStorage (meta-reducer).
- Reemplazo de prompts por edición inline en la lista.
- Tests unitarios añadidos y suite ejecutada: todos los tests pasan en headless.

Archivos clave (no exhaustivo)
- `src/app/features/items/data-access/items.service.ts` — API + LocalStorage helpers
- `src/app/features/items/state/*` — acciones, effects, reducer, selectors
- `src/app/core/confirm.*` — modal de confirmación (service + component)
- `src/app/core/focus-trap.ts` — utilitario pequeño para trap de foco
- `src/app/core/loading.component.ts` — spinner con debounce
- `src/app/core/toast.*` — toasts globales
- `src/app/features/items/pages/*` — `items-list`, `item-detail`, `justificacion`, `declaracion`
- Tests: `src/app/features/items/state/items.reducer.spec.ts`, `src/app/core/confirm.service.spec.ts`, y ajustes a specs existentes.

Estado de la entrega
- `ng build` -> OK (advertencias de budget no bloqueantes).
- `npm test` -> OK (tests unitarios pasan en ChromeHeadless).

Instrucciones rápidas para revisar localmente
1. Instalar dependencias:
   ```powershell
   npm install
   ```
2. Levantar servidor de desarrollo (puerto alternativo 4300 si 4200 está ocupado):
   ```powershell
   npm run start -- --port 4300
   ```
3. Ejecutar tests unitarios (Karma):
   ```powershell
   npm test -- --no-watch --browsers ChromeHeadless
   ```

Notas finales
- Los items que el candidato crea/edita/elimina se almacenan en `localStorage` bajo la clave `items_local`.
- Para producción habría que reemplazar la persistencia local por una API real y mejorar la estrategia de carga/paginación.
