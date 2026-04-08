# Work for the Day — 2026-04-08 (addendum)
# Flujo: Crear y asignar arquetipos a los decks

## Contexto y problema

El campo `archetype?: string` existe en la interfaz `Deck` desde el inicio, pero **nunca se asigna**. El flujo de guardado (`SaveDeckModalComponent` → `onSaveConfirm` en `DeckBuilderComponent`) emite solo `{ name, placeholderCardId }` — el arquetipo se ignora completamente.

Esto significa que todos los decks existentes caen en el grupo `Unclassified` en la vista Advanced Decklist, haciendo que la funcionalidad que hemos construido sea inútil hasta que se resuelva.

### Dónde se origina el problema

```
DeckBuilderComponent.onSaveConfirm(data: SaveDeckData)
  └─ data viene de SaveDeckModalComponent
       └─ SaveDeckData = { name: string, placeholderCardId: string }
            └─ archetype: AUSENTE
```

### Segundo problema: editar el arquetipo de un deck ya guardado

No existe ningún punto en la UI desde el que se pueda editar el `archetype` de un deck existente. Hay dos momentos lógicos:
1. **Al guardar** por primera vez desde el deck builder.
2. **Desde la decks library**, directamente sobre la deck-card (renombrar arquetipo o reasignarlo).

---

## Plan de acción por pasos

---

### ✅ PASO 1 — Extender `SaveDeckData` y `SaveDeckModalComponent`
**Prioridad: Alta — entrada de datos en creación** | **COMPLETADO 2026-04-08**

Añadir el campo `archetype` al contrato de datos del modal de guardado.

**`save-deck-modal.component.ts`:**
```typescript
// Antes
export interface SaveDeckData {
  name: string;
  placeholderCardId: string;
}

// Después
export interface SaveDeckData {
  name: string;
  placeholderCardId: string;
  archetype: string;   // Vacío string si no se especifica
}
```

Añadir en el componente:
```typescript
archetype: string = '';
```

Y emitirlo en `onConfirm()`:
```typescript
this.save.emit({ name: trimmed, placeholderCardId: this.selectedCardId, archetype: this.archetype.trim() });
```

**`save-deck-modal.component.html`:**
- Añadir un campo de texto para `archetype` entre el campo de nombre y la selección de imagen.
- Input con `placeholder="e.g. Agumon, Garurumon, BK Agumon..."` y `maxlength="60"`.
- Debajo del input, mostrar un datalist con los arquetipos ya existentes en los decks guardados (autocompletado).
- El campo es **opcional** (no bloquea el guardado).

**`@Input() existingArchetypes: string[] = []`** — el deck builder lo alimenta con los arquetipos ya existentes para el datalist.

---

### ✅ PASO 2 — Conectar el arquetipo en `DeckBuilderComponent.onSaveConfirm`
**Prioridad: Alta — depende del Paso 1** | **COMPLETADO 2026-04-08**

En `deck-builder.component.ts`, método `onSaveConfirm`:

```typescript
const deck: Deck = {
  ...
  archetype: data.archetype || undefined,   // ← añadir esta línea
  ...
};
```

También pasar los arquetipos existentes al modal:

```typescript
get existingArchetypes(): string[] {
  return [...new Set(
    this.savedDecks
      .map(d => d.archetype)
      .filter((a): a is string => !!a)
  )];
}
```

Y en el template del deck builder:
```html
<app-save-deck-modal
  ...
  [existingArchetypes]="existingArchetypes"
  ...>
</app-save-deck-modal>
```

---

### ✅ PASO 3 — Editar el arquetipo desde `ArchetypeVersionsModalComponent`
**Prioridad: Media — permite corregir decks ya guardados** | **COMPLETADO 2026-04-08**

Dentro del modal de versiones (ya construido), añadir la posibilidad de editar el `archetype` de cada deck inline.

**Flujo UX:**
- Junto al nombre del deck en cada `version-row`, añadir un pequeño botón de edición (icono `edit-2` de Lucide).
- Al pulsarlo, el nombre del deck se convierte en un input editable **solo para el arquetipo** (no el nombre del deck).
- Al confirmar (Enter o blur), emite `deckAction` con `action: 'update-archetype'`.

**Cambios en `archetype-versions-modal.component.ts`:**
```typescript
export type DeckActionType = 'load' | 'copy' | 'export' | 'delete' | 'update-archetype';

export interface DeckAction {
  action: DeckActionType;
  deck: Deck;
  newArchetype?: string;   // Solo para 'update-archetype'
}
```

Añadir estado:
```typescript
editingArchetypeId: string | null = null;
editingArchetypeValue: string = '';
```

Métodos:
```typescript
onEditArchetype(deck: Deck): void { ... }
onArchetypeChange(value: string): void { ... }
onArchetypeSave(deck: Deck): void { ... }
onArchetypeCancel(): void { ... }
```

---

### ✅ PASO 4 — Manejar `update-archetype` en `DecksLibraryComponent`
**Prioridad: Media — depende del Paso 3** | **COMPLETADO 2026-04-08**

En `decks-library.component.ts`, el método `onDeckAction` ya tiene un switch. Añadir el caso nuevo:

```typescript
case 'update-archetype':
  this.onUpdateDeckArchetype(event.deck, event.newArchetype ?? '');
  break;
```

Nuevo método:
```typescript
onUpdateDeckArchetype(deck: Deck, newArchetype: string): void {
  const updated: Deck = {
    ...deck,
    archetype: newArchetype.trim() || undefined,
    updatedAt: new Date()
  };
  this.storageService.saveDeck(updated);
  // archetypeGroups se recalcula automáticamente via decks$ subscription
}
```

También hay que asegurarse de que `StorageService.saveDeck` hace un **upsert** (actualiza si ya existe el id). Verificar que esto ya funciona así.

---

### ✅ PASO 5 — Editar el arquetipo desde la deck-card en la vista Simple
**Prioridad: Baja — mejora de UX en vista no-advanced** | **COMPLETADO 2026-04-08**

Añadir en cada `deck-card` de la vista Simple (en `decks-library.component.html`) un campo de arquetipo editable o al menos visible:

- Mostrar debajo del título el arquetipo actual como un badge pequeño si existe.
- El badge es clickable → abre un pequeño popover/inline-input para editarlo.
- Al guardar, llama a `onUpdateDeckArchetype`.

Esto puede implementarse como un `InlineEditComponent` atom reutilizable o directamente en la vista como estado local.

---

## Archivos que se crearán / modificarán

| Operación | Archivo |
|---|---|
| **Modificar** | `shared/molecules/save-deck-modal/save-deck-modal.component.ts` — extender `SaveDeckData`, añadir campo `archetype` + `@Input() existingArchetypes` |
| **Modificar** | `shared/molecules/save-deck-modal/save-deck-modal.component.html` — campo archetype + datalist autocompletado |
| **Modificar** | `pages/deck-builder/deck-builder.component.ts` — pasar `archetype` al objeto `Deck`, getter `existingArchetypes` |
| **Modificar** | `pages/deck-builder/deck-builder.component.html` — pasar `[existingArchetypes]` al modal |
| **Modificar** | `shared/molecules/archetype-versions-modal/archetype-versions-modal.component.ts` — nuevo `DeckActionType`, lógica de edición inline |
| **Modificar** | `shared/molecules/archetype-versions-modal/archetype-versions-modal.component.html` — UI de edición inline del arquetipo |
| **Modificar** | `shared/molecules/archetype-versions-modal/archetype-versions-modal.component.scss` — estilos del input inline |
| **Modificar** | `pages/decks-library/decks-library.component.ts` — caso `update-archetype` en switch + método `onUpdateDeckArchetype` |
| **Modificar** | `pages/decks-library/decks-library.component.html` — (Paso 5) badge de arquetipo en deck-card |
| **Verificar** | `core/services/storage.service.ts` — confirmar que `saveDeck` hace upsert por id |

---

## Orden de ejecución recomendado

```
PASO 1 → PASO 2 → PASO 3 → PASO 4 → PASO 5
```

Los pasos 1 y 2 desbloquean el flujo principal (guardar con arquetipo desde el deck builder).
Los pasos 3 y 4 cubren la edición retroactiva desde la library.
El paso 5 es una mejora progresiva de la vista Simple.

---

## Notas de diseño

- El campo arquetipo es **siempre opcional**. Un deck sin arquetipo cae en `Unclassified` en la vista Advanced — comportamiento ya implementado.
- El datalist de autocompletado en el modal de guardado mejora mucho la UX: sugiere los arquetipos que ya existen para que el usuario no cree duplicados por error tipográfico ("Agumon" vs "agumon").
- La edición inline del arquetipo en el modal de versiones debe ser no-intrusiva: el texto normal se convierte en input solo al pulsar el icono de edición, y vuelve a texto al confirmar o cancelar.
- No se debe bloquear el guardado si no se especifica arquetipo (campo opcional).
