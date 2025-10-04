# Entrega: Prueba Técnica - Frontend (Angular)

## Título sugerido
Entrega: Prueba Técnica Frontend - Implementación Angular 12

## Descripción
Este Pull Request incluye la implementación completa de la prueba técnica solicitada.

Resumen:
- Listado de items consumidos desde JSONPlaceholder.
- Manejo de estado con NgRx (acciones, effects, reducers, selectors).
- CRUD simulado usando LocalStorage y efectos para mantener el store sincronizado.
- Confirmación accesible antes de eliminar (modal con focus trap y manejo de teclado).
- Notificaciones globales (toasts) y spinner global con debounce.
- Persistencia de la slice `items` en LocalStorage.
- Tests unitarios añadidos y suite ejecutada (ChromeHeadless) — todos los tests pasan.

Instrucciones para el revisor
1. Clonar el repo y cambiar a la rama `final/submission`.
2. Ejecutar `npm install`.
3. Levantar la app: `npm run start -- --port 4300`.
4. Ejecutar tests: `npm test -- --no-watch --browsers ChromeHeadless`.

Notas:
- La funcionalidad CRUD está simulada en LocalStorage para cumplir con los requerimientos de la prueba.
- Archivos y puntos de interés: `src/app/features/items/state`, `src/app/features/items/data-access/items.service.ts`, `src/app/core`.

Recomiendo revisar `CHANGES.md` para un resumen más detallado.
