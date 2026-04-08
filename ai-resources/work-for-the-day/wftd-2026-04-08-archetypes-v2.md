# Work for the Day — 2026-04-08 (v2)
# Flujo rediseñado: Arquetipos como entidades propias

## Cambio de enfoque respecto a la versión anterior

El flujo anterior trataba el arquetipo como un **campo de texto libre** en el deck.
El nuevo flujo trata los arquetipos como **entidades gestionadas desde la Decks Library**:

| Antes | Ahora |
|---|---|
| Campo de texto libre en `SaveDeckModal` | Arquetipos se crean/editan en la Decks Library |
| Datalist con sugerencias | `<select>` desplegable con los arquetipos existentes |
| Edición inline en deck-cards | Gestión centralizada en un modal dedicado |

---

## Nuevo flujo de usuario

```
DECKS LIBRARY (vista Advanced)
  └─ Botón "New Archetype" → Modal de creación de arquetipo
       └─ Introduce nombre + (opcional) descripción → Guarda

DECK BUILDER (guardar un deck)
  └─ Modal Save Deck
       └─ Desplegable "Assign to archetype"
            ├─ Opción vacía: "— No archetype —"
            └─ Opciones: lista de arquetipos creados
```

---

## Modelo de datos

Los arquetipos pasan a ser **entidades persistidas** independientes de los decks.
Se almacenan en localStorage separado de los decks.

```typescript
// En deck.model.ts
export interface Archetype {
  id: string;            // UUID
  name: string;          // Nombre del arquetipo (único por usuario)
  description?: string;  // Descripción opcional
  createdAt: Date;
}
```

`Deck.archetype?: string` se mantiene como **nombre** del arquetipo (string), no como ID,
para mantener compatibilidad con `groupDecksByArchetype()` ya implementado.

---

## Plan de acción por pasos

---

### ✅ PASO 1 — Añadir `Archetype` al modelo y al `StorageService`
**Prioridad: Alta — bloqueante** | **COMPLETADO 2026-04-08**

- Añadir `interface Archetype` a `deck.model.ts` y exportarla.
- Añadir en `StorageService`:
  - `private readonly ARCHETYPES_KEY_BASE = 'deckbuilder.archetypes'`
  - `private archetypesCache$ = new BehaviorSubject<Archetype[]>([])`
  - `public readonly archetypes$ = this.archetypesCache$.asObservable()`
  - `saveArchetype(archetype: Archetype): boolean`
  - `deleteArchetype(id: string): boolean`
  - Carga inicial en `loadDecksFromStorage` (o método paralelo)

---

### ✅ PASO 2 — Crear `CreateArchetypeModalComponent` (molecule)
**Prioridad: Alta — depende del Paso 1** | **COMPLETADO 2026-04-08**

```
src/app/shared/components/molecules/create-archetype-modal/
  create-archetype-modal.component.ts
  create-archetype-modal.component.html
  create-archetype-modal.component.scss
```

Modal simple con:
- Input nombre (requerido, único, max 60 chars)
- Input descripción (opcional, max 120 chars)
- Validación: no duplicados
- `@Input() isVisible`, `@Input() existingNames: string[]`
- `@Output() saved: EventEmitter<{ name: string; description?: string }>`
- `@Output() cancelled: EventEmitter<void>`

---

### ✅ PASO 3 — Integrar "New Archetype" en `DecksLibraryComponent`
**Prioridad: Alta — depende del Paso 2** | **COMPLETADO 2026-04-08**

- Añadir botón "New Archetype" en el header de la vista Advanced (junto a "Create New Deck").
- Abrir `CreateArchetypeModalComponent` al pulsarlo.
- En `onArchetypeSaved`: llamar a `storageService.saveArchetype(...)`.
- Suscribirse a `storageService.archetypes$` para tener la lista actualizada.
- Los `archetypeGroups` siguen calculándose con `groupDecksByArchetype(decks)`.

---

### ✅ PASO 4 — Rediseñar el campo archetype en `SaveDeckModalComponent`
**Prioridad: Alta — depende del Paso 1** | **COMPLETADO 2026-04-08**

- Eliminar el `<input type="text">` + `<datalist>` del arquetipo.
- Sustituir por un `<select>` con:
  - Primera opción: `— No archetype —` (valor vacío)
  - Resto: un `<option>` por cada `Archetype` de la lista
- `@Input() availableArchetypes: Archetype[]` (en lugar de `existingArchetypes: string[]`)
- El valor seleccionado emite el **nombre** del arquetipo (para mantener compatibilidad con `Deck.archetype`).

---

### ✅ PASO 5 — Actualizar `DeckBuilderComponent`
**Prioridad: Alta — depende del Paso 4** | **COMPLETADO 2026-04-08**

- Suscribirse a `storageService.archetypes$` para obtener `availableArchetypes`.
- Pasar `[availableArchetypes]` al `app-save-deck-modal`.
- Eliminar el getter `existingArchetypes` basado en los decks (ya no se necesita).

---

### ✅ PASO 6 — Limpiar implementación anterior
**Prioridad: Media** | **COMPLETADO 2026-04-08**

- Eliminar los campos `@Input() existingArchetypes: string[]` de `SaveDeckModal`.
- Eliminar la edición inline de arquetipo de las `deck-card` de la vista Simple
  (ya no tiene sentido — la gestión es centralizada desde la vista Advanced).
- Eliminar el input libre de arquetipo y el datalist del HTML del save modal.
- Mantener `onUpdateDeckArchetype` y el caso `update-archetype` en el modal de versiones
  (el lápiz del modal de versiones sigue siendo útil para reasignar).

---

## Archivos que se crearán / modificarán

| Operación | Archivo |
|---|---|
| **Modificar** | `core/models/deck.model.ts` — añadir `Archetype` |
| **Modificar** | `core/services/storage.service.ts` — persistencia de arquetipos |
| **Crear** | `shared/molecules/create-archetype-modal/` (3 ficheros) |
| **Modificar** | `shared/shared.module.ts` — registrar el nuevo modal |
| **Modificar** | `decks-library.component.ts` — suscripción a archetypes$, modal state |
| **Modificar** | `decks-library.component.html` — botón + modal en vista Advanced |
| **Modificar** | `shared/molecules/save-deck-modal/save-deck-modal.component.ts` — `availableArchetypes`, select |
| **Modificar** | `shared/molecules/save-deck-modal/save-deck-modal.component.html` — select en lugar de input+datalist |
| **Modificar** | `deck-builder.component.ts` — suscripción archetypes$, pasar al modal |
| **Modificar** | `deck-builder.component.html` — [availableArchetypes] |
| **Limpiar** | `decks-library.component.html` — eliminar edición inline de deck-cards |
| **Limpiar** | `decks-library.component.scss` — eliminar estilos de edición inline |
| **Limpiar** | `decks-library.component.ts` — eliminar métodos de edición inline |
