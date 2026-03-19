# API Card Data Structure - BT18-082: Lucemon: Chaos Mode

**Fecha:** 19 de Marzo de 2026  
**API Endpoint:** https://digimoncard.io/api-public/search  
**Método de búsqueda:** `?name=Lucemon:%20Chaos%20Mode&series=Digimon%20Card%20Game`

---

## Información Completa de la Carta

### Datos Básicos

```json
{
  "name": "Lucemon: Chaos Mode",
  "type": "Digimon",
  "id": "BT18-082",
  "level": 5,
  "play_cost": 13,
  "evolution_cost": 8,
  "evolution_color": null,
  "evolution_level": null,
  "xros_req": "[Digivolve] [Lucemon]: Cost 6",
  "color": "Purple",
  "color2": "Yellow",
  "digi_type": "Demon Lord",
  "digi_type2": "Seven Great Demon Lords",
  "digi_type3": null,
  "digi_type4": null,
  "form": null,
  "dp": 13000,
  "attribute": "Virus",
  "rarity": "SR",
  "stage": null,
  "artist": null,
  "main_effect": "[On Play] [When Digivolving] Your opponent may delete 1 of their Digimon or Tamers. If this effect didn't delete, ＜Recovery +1 (Deck)＞ (Place the top card of your deck on top of your security stack.) and trash the top card of your opponent's security stack.\r\n[All Turns] [Once Per Turn] When this Digimon would leave the battle area, by trashing the bottom card of your security stack, it doesn't leave.",
  "source_effect": "",
  "link_requirements": "",
  "link_dp": null,
  "alt_effect": "[Digivolve] [Lucemon]: Cost 6",
  "series": "Digimon Card Game",
  "pretty_url": "lucemon-chaos-mode-bt18-082",
  "date_added": "2025-11-25 10:12:18",
  "tcgplayer_name": "Lucemon: Chaos Mode",
  "tcgplayer_id": 586948,
  "set_name": [
    "BT-18: Booster Elemental Successor",
    "BT18-19: Special Booster Ver.2.0",
    "Special Booster Ver.2.0 Lucky Pack"
  ]
}
```

---

## Análisis por Campo

### 1. Identificación de la Carta

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `id` | `"BT18-082"` | `string` | Identificador único de la carta (Set-Número) |
| `name` | `"Lucemon: Chaos Mode"` | `string` | Nombre de la carta |
| `cardnumber` | **No presente** | - | No incluido en este endpoint |
| `parallel_id` | **No presente** | - | No incluido (sin versión paralela) |

**Nota:** El campo `cardnumber` no aparece en la respuesta, pero `id` sirve como identificador principal.

### 2. Tipo y Clasificación

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `type` | `"Digimon"` | `string` | Tipo de carta (Digimon/Tamer/Option/Digi-Egg) |
| `level` | `5` | `number` | Nivel del Digimon |
| `form` | `null` | `null` | Forma del Digimon (no especificada) |
| `stage` | `null` | `null` | Etapa del Digimon (no especificada) |
| `attribute` | `"Virus"` | `string` | Atributo del Digimon |
| `digi_type` | `"Demon Lord"` | `string` | Tipo principal del Digimon |
| `digi_type2` | `"Seven Great Demon Lords"` | `string` | Tipo secundario/rasgo |
| `digi_type3` | `null` | `null` | Tipo terciario (no aplicable) |
| `digi_type4` | `null` | `null` | Tipo cuaternario (no aplicable) |

### 3. Colores

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `color` | `"Purple"` | `string` | Color principal de la carta |
| `color2` | `"Yellow"` | `string` | Color secundario (carta multi-color) |

**Importante:** Esta carta es **Purple/Yellow** (dual-color). El campo `color2` indica que tiene dos colores.

### 4. Costes y Estadísticas

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `play_cost` | `13` | `number` | Coste de memoria para jugar desde la mano |
| `evolution_cost` | `8` | `number` | Coste genérico de digievolución |
| `evolution_color` | `null` | `null` | Color requerido para digivolucion (no especificado) |
| `evolution_level` | `null` | `null` | Nivel requerido para digivolucion (no especificado) |
| `xros_req` | `"[Digivolve] [Lucemon]: Cost 6"` | `string` | Requisito especial de digievolución |
| `dp` | `13000` | `number` | Puntos de combate (DP) |

**Nota:** `xros_req` indica un requisito alternativo de digievolución: desde cualquier [Lucemon] con coste reducido a 6 de memoria.

### 5. Efectos

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `main_effect` | Ver texto completo abajo | `string` | Efecto principal de la carta |
| `source_effect` | `""` | `string` | Efecto heredado (vacío) |
| `alt_effect` | `"[Digivolve] [Lucemon]: Cost 6"` | `string` | Texto alternativo de digievolución |
| `link_requirements` | `""` | `string` | Requisitos de DNA/Jogress (no aplicable) |
| `link_dp` | `null` | `null` | DP de DNA/Jogress (no aplicable) |

#### Texto completo del `main_effect`:
```
[On Play] [When Digivolving] Your opponent may delete 1 of their Digimon or Tamers. 
If this effect didn't delete, ＜Recovery +1 (Deck)＞ (Place the top card of your deck 
on top of your security stack.) and trash the top card of your opponent's security stack.

[All Turns] [Once Per Turn] When this Digimon would leave the battle area, by trashing 
the bottom card of your security stack, it doesn't leave.
```

**Análisis del efecto:**
- **Trigger 1:** Al jugar o digivoluir → Oponente elige entre: sacrificar algo O sufrir recovery +1 y perder 1 security
- **Trigger 2:** Protección continua → Una vez por turno, puede pagar 1 security inferior para evitar salir del área de batalla

### 6. Rareza y Coleccionabilidad

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `rarity` | `"SR"` | `string` | Rareza: Super Rare |
| `artist` | `null` | `null` | Artista (no especificado en API) |

### 7. Sets y Disponibilidad

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `set_name` | Array de 3 elementos | `string[]` | Sets donde aparece la carta |

**Sets donde aparece:**
1. `"BT-18: Booster Elemental Successor"` (Set principal)
2. `"BT18-19: Special Booster Ver.2.0"`
3. `"Special Booster Ver.2.0 Lucky Pack"`

### 8. Metadatos de API

| Campo | Valor | Tipo | Descripción |
|-------|-------|------|-------------|
| `series` | `"Digimon Card Game"` | `string` | Serie del TCG |
| `pretty_url` | `"lucemon-chaos-mode-bt18-082"` | `string` | URL amigable para web |
| `date_added` | `"2025-11-25 10:12:18"` | `string` | Fecha de adición a la base de datos |
| `tcgplayer_name` | `"Lucemon: Chaos Mode"` | `string` | Nombre en TCGPlayer |
| `tcgplayer_id` | `586948` | `number` | ID en TCGPlayer para pricing |

---

## Campos Ausentes o No Utilizados

Campos que **NO** aparecen en esta respuesta de API:
- `image_url` - URL directa de la imagen
- `cardnumber` - Número de carta alternativo
- `parallel_id` - ID de versión paralela

Campos presentes pero con valor `null`:
- `evolution_color`
- `evolution_level`
- `digi_type3`
- `digi_type4`
- `form`
- `stage`
- `artist`
- `link_dp`

Campos presentes pero vacíos (`""`):
- `source_effect` - Esta carta no tiene efecto heredado
- `link_requirements` - No es carta DNA/Jogress

---

## Mapeo al Modelo de Card en la Aplicación

Basándose en el código del servicio (`card.service.ts`), esta carta se mapearía a:

```typescript
{
  id: "BT18-082",
  name: "Lucemon: Chaos Mode",
  type: CardType.Digimon,
  color: [Color.Purple, Color.Yellow],  // Dual-color
  cost: 13,
  digivolutionCost: 8,
  level: 5,
  dp: 13000,
  form: undefined,
  attribute: "Virus",
  rarity: Rarity.SuperRare,
  set: "BT-18: Booster Elemental Successor",
  cardNumber: "082",  // Extraído de "BT18-082"
  imageUrl: "https://images.digimoncard.io/images/cards/BT18-082.jpg",  // Construida
  effect: "[On Play] [When Digivolving] Your opponent may delete 1 of their...",
  inheritedEffect: "",
  securityEffect: "",
  keywords: ["On Play", "When Digivolving", "Recovery", "All Turns", "Once Per Turn"]
}
```

---

## Observaciones Técnicas

### Inconsistencias de la API
1. **`form` y `stage` siempre null:** Aunque es un Digimon de nivel 5, no especifica "Ultimate" en `form` o `stage`
2. **`artist` no disponible:** El campo existe pero está `null`
3. **`image_url` ausente:** A diferencia de lo documentado, el campo `image_url` no aparece en la respuesta
4. **`xros_req` usado para digievolución especial:** No es realmente un "Xros", pero usa ese campo

### Campos Multi-valor
- **Colores:** `color` + `color2` (dual-color cards)
- **Tipos:** `digi_type` + `digi_type2` + `digi_type3` + `digi_type4` (hasta 4 tipos)
- **Sets:** Array `set_name[]` (puede aparecer en múltiples sets)

### Construcción de URL de Imagen
Como `image_url` no está presente, se debe construir manualmente:
```
https://images.digimoncard.io/images/cards/{ID}.jpg
→ https://images.digimoncard.io/images/cards/BT18-082.jpg
```

---

## Campos Útiles para Features Futuras

### Para Filtros Avanzados
- `digi_type` + `digi_type2`: Filtrar por razgos (ej: "Seven Great Demon Lords")
- `color2`: Detectar cartas multi-color
- `xros_req`: Identificar requisitos especiales de digievolución

### Para Deck Building
- `xros_req`: Validar cadenas de digievolución válidas
- `level`: Organizar curva de nivel
- `attribute`: Sinergia de atributos

### Para Pricing/Marketplace
- `tcgplayer_id`: Integración con TCGPlayer para precios
- `rarity`: Ordenar por rareza
- `set_name[]`: Filtrar por sets específicos

### Para Búsqueda de Texto
- `main_effect`: Buscar por keywords ("Recovery", "Delete", etc.)
- `source_effect`: Filtrar cartas con efectos heredados útiles
- `name`: Búsqueda por nombre de Digimon

---

## Conclusiones

### Datos Completos Proporcionados
✅ Información de juego completa (costes, DP, efectos)  
✅ Múltiples tipos y colores  
✅ Múltiples sets de procedencia  
✅ Integración con TCGPlayer  

### Datos Incompletos o Ausentes
❌ URL de imagen no incluida (debe construirse manualmente)  
❌ Artista no disponible  
❌ Campos `form` y `stage` siempre null  
❌ Fecha de lanzamiento real de la carta no incluida  

### Recomendaciones para el Código
1. **Siempre validar `color2`** para detectar cartas multi-color
2. **Construir `imageUrl`** manualmente: `${IMAGE_BASE_URL}/${id}.jpg`
3. **Extraer `cardNumber`** del campo `id` (split por `-`)
4. **Combinar `digi_type` + `digi_type2`** en array de tipos
5. **Usar `xros_req` o `alt_effect`** para mostrar texto de digievolución alternativa
6. **Parsear `main_effect`** para extraer keywords automáticamente
