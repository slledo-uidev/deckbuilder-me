# me-decbuilder-proyect - Documento Funcional

> **Proyecto:** me-decbuilder (Deck Builder para Digimon TCG)  
> **Fecha de análisis:** 16/03/2026  
> **Analista:** @lledo  
> **Aplicación analizada:** https://digimoncard.app/ (8,095 cartas, sincronizado con DigimonCardGame.Fandom)

---

## 1. Descripción General

### 1.1 Resumen Ejecutivo
me-decbuilder es una aplicación web diseñada para permitir a jugadores del Digimon Trading Card Game crear, gestionar y optimizar mazos de cartas de manera intuitiva y eficiente. La herramienta proporciona funcionalidades de búsqueda, filtrado, construcción de mazos y análisis de sinergias para mejorar la experiencia de deckbuilding.

### 1.2 Problema a Resolver
Los jugadores de Digimon TCG necesitan una herramienta especializada para:
- Explorar el amplio catálogo de cartas disponibles
- Construir mazos respetando las reglas del formato (límites de copias, restricciones, etc.)
- Analizar la composición y curva de costes de sus mazos
- Guardar y gestionar múltiples mazos simultáneamente
- Compartir sus creaciones con la comunidad

### 1.3 Propuesta de Solución
Una aplicación web responsive que integra:
- Base de datos completa de **8,095+ cartas** sincronizadas diariamente desde DigimonCardGame.Fandom
- Constructor visual de mazos con **tres zonas**: Digi-Eggs (5), Main Deck (50) y Side Deck
- Sistema de filtrado avanzado por **7 colores** (Red, Blue, Yellow, Green, Black, Purple, White), costes, tipos, sets, rareza, keywords y variantes de ilustración
- Validación automática de reglas del juego (**5 copias máximo por nombre**)
- Análisis estadístico de mazos con gráficos (curva de costes por nivel Lv.2-7+, distribución por colores y tipos)
- **Collection Tracker** para gestionar cartas poseídas con variantes (P1/P2/P3)
- **Community Decks** con tier lists de arquetipos (rankings S-D) y mazos compartidos
- Sistema de persistencia dual: **LocalStorage** (offline) + **Firebase** (sincronización entre dispositivos)
- Capacidad de exportar/importar mazos en formato texto estándar

### 1.4 Usuarios Objetivo
- **Usuario primario:** Jugadores competitivos y casuales de Digimon TCG que buscan optimizar sus mazos
- **Usuarios secundarios:** 
  - Nuevos jugadores aprendiendo el juego y explorando opciones de cartas
  - Creadores de contenido que necesitan compartir listas de mazos
  - Organizadores de torneos para validar mazos

---

## 2. Objetivos del Proyecto

### 2.1 Objetivos Principales
1. Proporcionar una herramienta completa y fácil de usar para construir mazos de Digimon TCG
2. Mantener una base de datos actualizada con todas las cartas oficiales
3. Validar automáticamente mazos según las reglas del formato (BT/EX Standard, etc.)
4. Ofrecer análisis visual de la composición del mazo

### 2.2 Objetivos Secundarios
- Implementar sistema de búsqueda semántica por texto de carta
- Permitir importación/exportación de listas en formatos estándar
- Añadir sistema de favoritos y etiquetas para organizar mazos
- Integrar precios de mercado (opcional, via API externa)
- Crear sistema de "recomendaciones" basado en sinergias de cartas

### 2.3 Métricas de Éxito
| Métrica | Objetivo | Forma de medición |
|---------|----------|-------------------|
| Tiempo de construcción de mazo | < 10 minutos para usuario experimentado | Analytics de sesión |
| Tasa de retención | > 60% usuarios que vuelven en 7 días | Analytics de usuarios |
| Mazos creados | 100+ mazos en primer mes | Base de datos |
| Validación sin errores | > 95% mazos cumplen reglas al guardar | Log de validaciones |

---

## 3. Features Principales

### Feature 1: Búsqueda y Exploración de Cartas
**Prioridad:** Alta  
**Descripción:** Sistema completo de búsqueda con múltiples filtros que permite explorar **8,095+ cartas**. Filtros disponibles: nombre (autocompletado), **7 colores** (Red, Blue, Yellow, Green, Black, Purple, White), tipo (Digimon/Tamer/Option/Digi-Egg), coste (0-15+), nivel de digievolución (Lv.2-7+), set/colección, rareza (Common-Secret Rare), keywords, texto de efecto, y **variantes de ilustración** (P1/P2/P3). Vista de galería con imágenes WebP optimizadas y lazy loading.  
**Componentes UI involucrados:** SearchBar, FilterPanel, CardGrid, CardList, CardDetailModal, VariantSelector

### Feature 2: Constructor de Mazos
**Prioridad:** Alta  
**Descripción:** Interfaz principal de construcción donde se añaden cartas al mazo. Incluye **tres áreas diferenciadas**: Digi-Eggs (5 cartas), Main Deck (50 cartas) y Side Deck (sin límite fijo). Validación en tiempo real del número de cartas y límites por nombre (**máximo 5 copias por nombre**). Contadores visuales por nivel (Lv.2, Lv.3, Lv.4, Lv.5, Lv.6, Lv.7+) y tipo (TM=Tamers, OP=Options). Drag & drop para añadir/quitar cartas. Selector de **7 colores de mazo** con deckbox SVG visual.  
**Componentes UI involucrados:** DeckBuilder, CardZone (x3), DeckList, CardCounter, LevelCounter, TypeCounter, ValidationIndicator, DeckColorSelector

### Feature 3: Gestión de Mazos
**Prioridad:** Alta  
**Descripción:** Sistema para guardar, cargar, renombrar, duplicar y eliminar mazos. Vista de lista de mazos guardados con información resumida (nombre, colores principales, última modificación). Funcionalidad de exportar a formato texto.  
**Componentes UI involucrados:** DeckManager, DeckCard, SaveDeckModal, ExportModal

### Feature 4: Análisis de Mazo
**Prioridad:** Media  
**Descripción:** Panel con estadísticas visuales del mazo: curva de costes (gráfico de barras), distribución por colores (gráfico circular), distribución por tipo de carta (Digimon/Tamer/Option), nivel promedio de digievolución. Identifica posibles problemas (ej: curva muy alta, falta Digi-Eggs).  
**Componentes UI involucrados:** StatsPanel, CostCurveChart, ColorDistributionChart, TypeBreakdown

### Feature 5: Validación de Reglas
**Prioridad:** Alta  
**Descripción:** Sistema que verifica automáticamente las reglas oficiales del Digimon TCG: límite de 50 cartas en Main Deck (error si ≠50), límite de 5 Digi-Eggs (warning si <5, error si >5), **máximo 5 copias por nombre de carta** (error si >5), coherencia de colores entre Digi-Eggs y Main Deck (advertencia opcional). Side Deck sin límite específico documentado. Muestra errores y warnings en tiempo real (<100ms de latencia).  
**Componentes UI involucrados:** ValidationPanel, ErrorMessage, WarningMessage, RuleIndicator

### Feature 6: Sistema de Filtros Avanzados
**Prioridad:** Media  
**Descripción:** Panel lateral con múltiples opciones de filtrado: colores (multi-selección), rangos de coste, tipo de carta, nivel de digievolución, sets, rareza, efectos clave (keywords), texto libre en descripción. Filtros combinables con lógica AND/OR.  
**Componentes UI involucrados:** FilterSidebar, ColorFilter, CostRangeSlider, SetCheckboxes, KeywordChips

### Feature 7: Vista Detallada de Carta
**Prioridad:** Media  
**Descripción:** Modal o panel lateral que muestra imagen ampliada de la carta, todos sus stats, efecto completo, información de set, número de colección, rareza. Botón para añadir al mazo actual. Opción de ver cartas relacionadas (misma línea evolutiva).  
**Componentes UI involucrados:** CardDetailModal, CardImage, CardStats, CardEffect, RelatedCards

### Feature 8: Importación de Mazos
**Prioridad:** Baja  
**Descripción:** Función para pegar lista de mazo en formato texto (ej: "4x BT1-085 Greymon") y que la aplicación reconozca las cartas automáticamente y construya el mazo. Soporta formato TCGOne estándar con secciones separadas para Digi-Eggs, Main Deck y Side Deck.  
**Componentes UI involucrados:** ImportModal, TextArea, ParseButton

### Feature 9: Collection Tracker
**Prioridad:** Media  
**Descripción:** Sistema para gestionar colección personal de cartas físicas. Permite marcar cartas como poseídas, indicar cantidad de copias, y seleccionar variantes de ilustración (P1/P2/P3/etc.). Vista de galería filtrable mostrando progreso de colección por set (ej: "35/112 cartas - 31%"). Indicadores visuales en el Card Grid para identificar cartas ya poseídas al construir mazos.  
**Componentes UI involucrados:** CollectionManager, CollectionGrid, CardOwnershipToggle, VariantSelector, SetProgressBar, CollectionStats

### Feature 10: Community Decks
**Prioridad:** Media  
**Descripción:** Galería de mazos compartidos por la comunidad con sistema de búsqueda por tags, arquetipos y colores. Cada mazo muestra: nombre, autor, colores principales, fecha de publicación, número de vistas/likes. Posibilidad de importar mazos de la comunidad directamente al constructor. Filtros por formato (Standard, Unlimited), tier ranking, y popularidad.  
**Componentes UI involucrados:** CommunityDeckGallery, DeckCard, DeckDetailView, TagFilter, ImportFromCommunityButton, LikeButton

### Feature 11: Tier Lists de Arquetipos
**Prioridad:** Baja  
**Descripción:** Sistema de rankings de meta-game con **190+ arquetipos** clasificados en tiers S, A, B, C, D (mantenido por la comunidad, ej: #Naethaen). Vista visual con cartas representativas de cada arquetipo. Arquetipos tier S incluyen: Medusamon, Aegisdramon, Dukemon (X Antibody), Dark Masters, Titamon. Permite filtrar mazos de la comunidad por tier ranking para encontrar decks competitivos.  
**Componentes UI involucrados:** TierListView, ArchetypeCard, TierFilter, ArchetypeDetailModal, MetaStatsChart

### Feature 12: Statistics del Meta
**Prioridad:** Baja  
**Descripción:** Panel de estadísticas globales del meta-game: cartas más utilizadas (top 50), arquetipos más populares, distribución de colores en mazos competitivos, curva de costes promedio por arquetipo. Gráficos interactivos con datos actualizados. Ayuda a jugadores a entender el estado actual del meta y tomar decisiones informadas al construir mazos.  
**Componentes UI involucrados:** MetaStatsPanel, PopularCardsChart, ArchetypeDistributionChart, MetaColorChart, TrendingArchetypes

### Feature 13: Ruling Quiz (Opcional)
**Prioridad:** Muy Baja  
**Descripción:** Sistema de quiz interactivo para aprender reglas del juego. Preguntas de opción múltiple sobre escenarios de juego, efectos de cartas, timing de acciones. Selección aleatoria de preguntas, tracking de score, feedback con explicaciones. Pool de preguntas enviadas por la comunidad. Ayuda a nuevos jugadores a familiarizarse con mecánicas complejas.  
**Componentes UI involucrados:** QuizPanel, QuestionCard, AnswerOptions, ScoreTracker, ExplanationModal, QuizHistory

---

## 4. Requisitos Funcionales

### 4.1 Módulo de Base de Datos de Cartas

**RF-001:** El sistema debe almacenar y sincronizar información completa de **8,095+ cartas** del Digimon TCG
- **Entrada:** Datos de cartas desde DigimonCardGame.Fandom (sincronización diaria automática via script Python)
- **Proceso:** Indexación y almacenamiento en base de datos Firebase + caché local (IndexedDB)
- **Salida:** Catálogo completo de cartas accesible para búsquedas offline y online
- **Validaciones:** 
  - Cada carta debe tener ID único (formato: "BT1-085")
  - Campos obligatorios: id, name, type, color, imageUrl
  - Variantes de ilustración identificadas con sufijos (P1, P2, P3)
- **Criterios de aceptación:**
  - [ ] Mínimo 8,095 cartas disponibles en lanzamiento
  - [ ] Sincronización automática diaria con Fandom (00:00 UTC)
  - [ ] Imágenes WebP optimizadas con lazy loading
  - [ ] Soporte para variantes de ilustración (P1/P2/P3)
  - [ ] Caché local para uso offline

**RF-002:** El sistema debe permitir búsqueda por múltiples criterios simultáneos en **8,095+ cartas**
- **Entrada:** Filtros seleccionados por usuario (color, coste, nombre, etc.)
- **Proceso:** Query con filtros combinados sobre IndexedDB + Fuse.js (fuzzy search)
- **Salida:** Lista de cartas que cumplen todos los criterios
- **Validaciones:** Mínimo 0 resultados, máximo todas las cartas si no hay filtros
- **Criterios de aceptación:**
  - [ ] Búsqueda por texto en nombre (autocompletado fuzzy)
  - [ ] Filtro por **7 colores** (Red, Blue, Yellow, Green, Black, Purple, White) - multi-selección
  - [ ] Filtro por rango de coste (slider 0-15+)
  - [ ] Filtro por tipo (Digimon, Tamer, Option, Digi-Egg)
  - [ ] Filtro por nivel de digievolución (Lv.2-7+ para Digimon)
  - [ ] Filtro por set/colección (BT1-BT24+, EX1-EX8+, ST1-ST18+, Promos)
  - [ ] Filtro por rareza (Common, Uncommon, Rare, Super Rare, Secret Rare)
  - [ ] Búsqueda en texto de efecto con keywords
  - [ ] Filtro por variantes de ilustración (P1/P2/P3)
  - [ ] Resultados en < 500ms con 8,095 cartas

### 4.2 Módulo de Construcción de Mazos

**RF-003:** El sistema debe permitir añadir cartas a **tres zonas diferenciadas** del mazo
- **Entrada:** Carta seleccionada + zona destino (Digi-Eggs, Main Deck o Side Deck)
- **Proceso:** Añadir carta al array correspondiente, actualizar contadores por nivel y tipo
- **Salida:** Carta visible en la zona del mazo, contadores actualizados (mostrar "X/5 - Y/50" para Digi-Eggs/Main)
- **Validaciones:** 
  - Digi-Eggs solo pueden ser cartas de tipo "Digi-Egg"
  - **Límite de 5 copias máximo** del mismo nombre en todo el mazo (Main + Side)
  - Digi-Eggs: exactamente 5 cartas
  - Main Deck: exactamente 50 cartas
  - Side Deck: sin límite fijo documentado oficialmente
- **Criterios de aceptación:**
  - [ ] Click en carta en galería → se añade al mazo (zona seleccionada)
  - [ ] Drag & drop desde galería a zona específica del mazo
  - [ ] Botón +/- en carta del mazo para ajustar cantidad
  - [ ] Contadores por nivel: Lv.2, Lv.3, Lv.4, Lv.5, Lv.6, Lv.7+
  - [ ] Contadores por tipo: TM (Tamers), OP (Options)
  - [ ] Visual feedback al añadir (animación, confirmación)

**RF-004:** El sistema debe validar reglas de construcción de mazo en tiempo real
- **Entrada:** Estado actual del mazo (Digi-Eggs, Main Deck, Side Deck)
- **Proceso:** Verificar limitaciones del formato oficial Digimon TCG
- **Salida:** Indicadores visuales de estado (válido/inválido), lista de errores y warnings
- **Validaciones:** 
  - Exactamente 5 Digi-Eggs (warning si < 5, error si > 5)
  - Exactamente 50 cartas en Main Deck (error si ≠50)
  - **Máximo 5 copias por nombre** en Main + Side combinados (error si > 5)
  - Side Deck: sin límite fijo (validación informativa)
  - (Opcional) Advertencia si colores de Main Deck no coinciden con Digi-Eggs
- **Criterios de aceptación:**
  - [ ] Indicador visual global (verde = válido, amarillo = warnings, rojo = errores)
  - [ ] Lista de errores específicos mostrada al usuario
  - [ ] Validación sin lag (< 100ms tras cada cambio)
  - [ ] Prevenir guardado si hay errores críticos
  - [ ] Mostrar progreso: "5/5 Digi-Eggs" y "47/50 Main Deck"

**RF-005:** El sistema debe guardar y cargar mazos con persistencia dual
- **Entrada:** Mazo construido + nombre del mazo + (opcional) credenciales de usuario
- **Proceso:** Serialización a JSON y guardado en **localStorage** (offline) + **Firebase Firestore** (sincronización entre dispositivos si hay login)
- **Salida:** Confirmación de guardado ("Your save was loaded successfully!"), mazo disponible en lista
- **Validaciones:** 
  - Nombre de mazo no vacío
  - Mazo con al menos 1 carta
  - Autenticación opcional (sin login → solo localStorage, con login → Firebase sync)
- **Criterios de aceptación:**
  - [ ] Botón "Guardar mazo" abre modal con nombre y descripción
  - [ ] Mazo guardado persiste tras cerrar/abrir app (localStorage)
  - [ ] Sincronización automática con Firebase si hay login
  - [ ] Lista de mazos muestra: nombre, colores (con deckbox SVG), fecha modificación, número de cartas
  - [ ] Click en mazo de la lista → carga en constructor
  - [ ] Opción de sobrescribir mazo existente con confirmación

### 4.3 Módulo de Análisis de Mazo

**RF-006:** El sistema debe generar estadísticas visuales del mazo
- **Entrada:** Mazo actual en el constructor
- **Proceso:** Análisis de cartas (conteo por coste, color, tipo)
- **Salida:** Gráficos y métricas visuales
- **Validaciones:** Mazo debe tener al menos 1 carta para análisis
- **Criterios de aceptación:**
  - [ ] Gráfico de curva de costes (barras)
  - [ ] Gráfico de distribución de colores (circular)
  - [ ] Desglose por tipo de carta (Digimon %, Tamer %, Option %)
  - [ ] Nivel promedio de digievolución
  - [ ] Identificación de "huecos" en curva de costes

### 4.4 Módulo de Gestión de Mazos

**RF-007:** El sistema debe permitir operaciones CRUD sobre mazos guardados
- **Entrada:** Operación (crear, leer, actualizar, eliminar) + ID de mazo
- **Proceso:** Ejecutar operación sobre almacenamiento persistent
- **Salida:** Confirmación de acción, actualización de lista
- **Validaciones:** Confirmación antes de eliminar
- **Criterios de aceptación:**
  - [ ] Crear mazo nuevo → guardar con nombre único
  - [ ] Leer mazo → cargar en constructor
  - [ ] Actualizar mazo → sobrescribir versión existente
  - [ ] Eliminar mazo → pedir confirmación → borrar
  - [ ] Duplicar mazo → crear copia con "(copia)"

**RF-008:** El sistema debe exportar/importar mazos en formato texto TCGOne estándar
- **Entrada:** Mazo seleccionado (para exportar) o texto pegado (para importar)
- **Proceso:** Generación/parsing de lista en formato: "[cantidad]x [código] [nombre]"
- **Salida:** Texto copiable al portapapeles o descargable como .txt / Mazo construido desde texto
- **Validaciones:** Validar formato al importar, verificar que cartas existan en base de datos
- **Criterios de aceptación:**
  - [ ] Formato de exportación: "4x BT1-085 Greymon" (una carta por línea)
  - [ ] Secciones separadas: "// Digi-Eggs (5)", "// Main Deck (50)", "// Side Deck (X)"
  - [ ] Botón "Copiar" → copia texto al clipboard con feedback visual
  - [ ] Botón "Descargar" → descarga archivo "[nombre-mazo].txt"
  - [ ] Importación: reconoce formato TCGOne, valida códigos de carta, muestra errores si carta no existe

### 4.5 Módulo de Sincronización de Datos

**RF-009:** El sistema debe sincronizar cartas desde DigimonCardGame.Fandom diariamente
- **Entrada:** Script Python ejecutado a las 00:00 UTC
- **Proceso:** Scraping de Fandom, parsing de datos, actualización de Firebase database
- **Salida:** Base de datos actualizada con nuevas cartas y sets, log de cambios
- **Validaciones:** 
  - Verificar integridad de datos (campos obligatorios)
  - Detectar duplicados por ID de carta
  - Validar URLs de imágenes
- **Criterios de aceptación:**
  - [ ] Script Python WikiVariables.py ejecuta sincronización diaria
  - [ ] Nuevas cartas detectadas automáticamente
  - [ ] Imágenes descargadas y optimizadas a WebP
  - [ ] Log de sincronización con cartas añadidas/actualizadas
  - [ ] Notificación en app cuando hay nuevas cartas disponibles

**RF-010:** El sistema debe autenticar usuarios opcionalmente con Firebase Auth
- **Entrada:** Email + contraseña o autenticación con Google
- **Proceso:** Validación de credenciales, creación de sesión JWT
- **Salida:** Usuario autenticado, acceso a sincronización de mazos entre dispositivos
- **Validaciones:** 
  - Email válido
  - Contraseña con mínimo 8 caracteres
  - Autenticación es **opcional** – app funciona sin login (solo localStorage)
- **Criterios de aceptación:**
  - [ ] Modo anónimo: guardado solo en localStorage
  - [ ] Login con email/contraseña o Google Sign-In
  - [ ] Sincronización automática de mazos con Firebase tras login
  - [ ] Mensaje de bienvenida: "Welcome back! Your save was loaded successfully!"
  - [ ] Logout limpia sesión pero mantiene caché local

### 4.6 Módulo de Collection Tracker

**RF-011:** El sistema debe permitir trackear colección personal de cartas
- **Entrada:** Carta seleccionada + cantidad poseída + variantes de ilustración
- **Proceso:** Guardar en Firebase o localStorage, actualizar progreso por set
- **Salida:** Indicadores visuales de posesión en Card Grid, estadísticas de colección
- **Validaciones:** Cantidad ≥0, variantes múltiples permitidas (P1/P2/P3)
- **Criterios de aceptación:**
  - [ ] Toggle en cada carta para marcar como poseída
  - [ ] Input para cantidad de copias poseídas (0-N)
  - [ ] Selección de variantes de ilustración (P1/P2/P3)
  - [ ] Progreso por set: "35/112 cartas - 31%" con barra de progreso
  - [ ] Icono visual en Card Grid indicando cartas poseídas
  - [ ] Filtro "Solo cartas poseídas" / "Cartas faltantes"

### 4.7 Módulo de Community Features

**RF-012:** El sistema debe permitir compartir y explorar mazos de la comunidad
- **Entrada:** Mazo a compartir (con nombre, descripción, tags) o búsqueda de mazos
- **Proceso:** Publicar en Firebase Firestore con URL única, indexar por tags y arquetipos
- **Salida:** URL compartible, mazo visible en Community Decks gallery
- **Validaciones:** 
  - Mazo debe ser válido (cumplir reglas)
  - Nombre y descripción obligatorios
  - Tags limitados a 10 por mazo
- **Criterios de aceptación:**
  - [ ] Botón "Compartir mazo" genera URL única
  - [ ] Galería de Community Decks con thumbnails de colores
  - [ ] Filtros: tags, arquetipos, colores, formato (Standard/Unlimited), tier ranking
  - [ ] Importar mazo de comunidad con un click
  - [ ] Sistema de likes/favoritos (opcional)

**RF-013:** El sistema debe mostrar tier lists de arquetipos del meta
- **Entrada:** Consulta de tier lists mantenidas por comunidad
- **Proceso:** Carga desde Firebase/API, renderizar arquetipos por tier (S-D)
- **Salida:** Vista visual con **190+ arquetipos** clasificados, cartas representativas
- **Validaciones:** N/A (solo lectura, datos curados por moderadores)
- **Criterios de aceptación:**
  - [ ] Vista con tiers: S (top meta), A (competitivo), B, C, D (casual/experimental)
  - [ ] Arquetipos tier S: Medusamon, Aegisdramon, Dukemon (X Antibody), Dark Masters, Titamon, etc.
  - [ ] Click en arquetipo → muestra mazos de ejemplo de la comunidad
  - [ ] Filtrar mazos por tier ranking
  - [ ] Indicación de maintainer: "Maintained by #Naethaen"

---

## 5. Requisitos No Funcionales

### 5.1 Performance
- **RNF-001:** La búsqueda de cartas debe retornar resultados en menos de 500ms en base de **8,095+ cartas**
- **RNF-002:** La carga inicial de la aplicación debe ser < 3 segundos en conexión 3G
- **RNF-003:** Las imágenes de cartas deben cargarse en formato WebP optimizado con lazy loading desde CDN (Firebase Storage o similar)
- **RNF-004:** La aplicación debe ser usable con hasta 100 mazos guardados sin degradación de performance
- **RNF-018:** Sincronización con DigimonCardGame.Fandom debe completarse en < 10 minutos (proceso batch diario)
- **RNF-019:** IndexedDB debe mantener caché de 8,095 cartas accesible en < 100ms para búsquedas offline

### 5.2 Seguridad
- **RNF-005:** Los datos de mazos guardados en localStorage deben estar en formato JSON legible (no hay datos sensibles)
- **RNF-006:** Autenticación con Firebase Auth usando JWT tokens seguros (HTTP-only cookies)
- **RNF-007:** API de sincronización con rate limiting: 100 requests/minuto por usuario
- **RNF-020:** Datos de colección personal protegidos con Firebase Security Rules (solo acceso del propietario)

### 5.3 Escalabilidad
- **RNF-008:** La base de datos Firebase debe escalar a **10,000+ cartas** sin impacto en búsquedas (actualmente 8,095)
- **RNF-009:** Firebase Firestore debe soportar hasta 10,000 usuarios simultáneos con sincronización en tiempo real
- **RNF-021:** Community Decks debe soportar 50,000+ mazos compartidos con búsqueda indexada eficiente

### 5.4 Usabilidad
- **RNF-010:** La interfaz debe ser responsive para dispositivos móviles (320px+), tablets y desktop
- **RNF-011:** El constructor de mazos debe ser operable con teclado (accesibilidad)
- **RNF-012:** Los botones principales deben tener áreas táctiles de al menos 44x44px (mobile)
- **RNF-013:** El flujo completo de construcción de mazo debe ser realizable en < 10 minutos por usuario experimentado

### 5.5 Compatibilidad
- **Navegadores:** 
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Dispositivos:** Desktop, tablet, móvil
- **Resoluciones:** 320px - 2560px

### 5.6 Accesibilidad
- **RNF-014:** La aplicación debe cumplir WCAG 2.1 nivel AA
- **RNF-015:** Todas las imágenes de cartas deben tener atributos alt descriptivos con nombre y código
- **RNF-016:** Los gráficos de estadísticas deben tener alternativas textuales y data tables accesibles
- **RNF-017:** Contraste de colores debe cumplir ratio 4.5:1 para texto normal
- **RNF-022:** Navegación completa por teclado con focus visible en todos los elementos interactivos

---

## 6. Casos de Uso

### CU-001: Buscar y Añadir Carta al Mazo
**Actor:** Usuario  
**Precondiciones:** Usuario está en la vista de constructor de mazos  
**Flujo Principal:**
1. Usuario introduce nombre parcial de carta en barra de búsqueda (ej: "Grey")
2. Sistema muestra autocompletado con sugerencias
3. Usuario selecciona "Greymon" de las sugerencias
4. Sistema muestra galería de cartas con variantes de Greymon
5. Usuario hace click en "BT1-085 Greymon"
6. Sistema abre vista detallada de la carta
7. Usuario hace click en botón "Añadir al mazo"
8. Sistema añade 1 copia al Main Deck y actualiza contador
9. Usuario ve la carta añadida en lista del mazo

**Flujos Alternativos:**
- **FA-001:** Usuario arrastra carta directamente desde galería
  1. En paso 5, usuario arrastra la carta en lugar de hacer click
  2. Usuario suelta carta sobre zona "Main Deck"
  3. Sistema añade carta (continuar en paso 8)

**Postcondiciones:** Mazo contiene la carta seleccionada, contadores actualizados  
**Excepciones:** 
- Si ya hay **5 copias** de esa carta: mostrar error "Límite de copias alcanzado (máximo 5 por nombre)"
- Si el mazo ya tiene 50 cartas en Main Deck: mostrar error "Mazo completo"

### CU-002: Guardar Mazo Completo
**Actor:** Usuario  
**Precondiciones:** Usuario ha construido un mazo con 5 Digi-Eggs y 50 cartas Main Deck  
**Flujo Principal:**
1. Usuario hace click en botón "Guardar Mazo"
2. Sistema valida que el mazo cumple todas las reglas
3. Sistema abre modal "Guardar Mazo" con campo de nombre
4. Usuario introduce nombre "Greymon Aggro 2026"
5. Usuario hace click en "Confirmar"
6. Sistema guarda mazo en localStorage con timestamp actual (+ Firebase si hay login)
7. Sistema muestra notificación "Mazo guardado correctamente" (o "Your save was loaded successfully!")
8. Sistema añade mazo a la lista de mazos guardados con deckbox SVG del color principal

**Flujos Alternativos:**
- **FA-002:** Mazo tiene errores de validación
  1. En paso 2, sistema detecta errores (ej: solo 45 cartas en Main Deck)
  2. Sistema muestra mensaje "El mazo tiene errores: Main Deck debe tener 50 cartas"
  3. Sistema no abre modal de guardado
  4. Usuario corrige el mazo y reintenta

- **FA-003:** Usuario quiere sobrescribir mazo existente
  1. En paso 4, usuario escribe nombre de mazo existente
  2. Sistema detecta duplicado y muestra "Ya existe un mazo con ese nombre. ¿Sobrescribir?"
  3. Usuario confirma sobrescritura
  4. Sistema actualiza mazo existente (continuar en paso 7)

**Postcondiciones:** Mazo persistido en almacenamiento, visible en lista de mazos  
**Excepciones:** 
- Si localStorage está lleno: mostrar error "No hay espacio disponible. Elimina mazos antiguos"

### CU-003: Analizar Estadísticas de Mazo
**Actor:** Usuario  
**Precondiciones:** Usuario tiene un mazo con al menos 10 cartas en Main Deck  
**Flujo Principal:**
1. Usuario hace click en pestaña "Estadísticas" en el constructor
2. Sistema calcula distribución de costes de todas las cartas
3. Sistema genera gráfico de barras mostrando cartas por coste (0-15+)
4. Sistema calcula porcentajes por color y genera gráfico circular
5. Sistema muestra desglose: 35% Digimon, 20% Tamers, 15% Options
6. Sistema identifica que hay 0 cartas de coste 3 y marca como "hueco en curva"
7. Usuario ve todos los gráficos y métricas en el panel

**Flujos Alternativos:**
- **FA-004:** Mazo vacío o con muy pocas cartas
  1. En paso 2, sistema detecta < 10 cartas
  2. Sistema muestra mensaje "Añade más cartas para ver estadísticas completas"
  3. Sistema muestra gráficos con datos disponibles pero marca como "incompleto"

**Postcondiciones:** Usuario comprende composición de su mazo visualmente  
**Excepciones:** Ninguna

### CU-004: Cargar Mazo Existente
**Actor:** Usuario  
**Precondiciones:** Usuario tiene al menos 1 mazo guardado  
**Flujo Principal:**
1. Usuario hace click en botón "Mis Mazos" en header
2. Sistema muestra lista de mazos guardados con previews
3. Usuario ve mazo "Greymon Aggro 2026" con info: colores Rojo/Amarillo, 55 cartas total, modificado 15/03/2026
4. Usuario hace click en el card del mazo
5. Sistema verifica si el constructor actual tiene cambios sin guardar
6. Sistema carga el mazo seleccionado en el constructor
7. Sistema muestra las 5 Digi-Eggs y 50 cartas del Main Deck
8. Usuario puede ahora modificar el mazo cargado

**Flujos Alternativos:**
- **FA-005:** Cambios sin guardar en mazo actual
  1. En paso 5, sistema detecta cambios no guardados
  2. Sistema muestra modal "¿Descartar cambios en mazo actual?"
  3. Usuario confirma o cancela
  4. Si confirma: continuar en paso 6
  5. Si cancela: cerrar modal, no cargar mazo

**Postcondiciones:** Mazo seleccionado es el activo en el constructor  
**Excepciones:** 
- Si el mazo guardado tiene cartas que ya no existen en la base de datos: mostrar warning y cargar lo que sea posible

### CU-005: Exportar Mazo a Formato Texto
**Actor:** Usuario  
**Precondiciones:** Usuario tiene un mazo completo guardado  
**Flujo Principal:**
1. Usuario está visualizando un mazo en el constructor
2. Usuario hace click en botón "Exportar"
3. Sistema genera lista de texto en formato estándar
4. Sistema muestra modal con el texto generado:
   ```
   // Digi-Eggs (5)
   4x ST1-01 Koromon
   1x BT1-001 Tsunomon
   
   // Main Deck (50)
   4x BT1-085 Greymon
   4x BT2-038 Agumon
   ...
   ```
5. Usuario hace click en "Copiar al Portapapeles"
6. Sistema copia texto al clipboard
7. Sistema muestra confirmación "¡Copiado!"
8. Usuario puede cerrar el modal o descargar como archivo .txt

**Flujos Alternativos:**
- **FA-006:** Usuario prefiere descargar archivo
  1. En paso 5, usuario hace click en "Descargar .txt"
  2. Sistema inicia descarga de archivo "[nombre-mazo].txt"
  3. Usuario guarda archivo en su equipo

**Postcondiciones:** Usuario tiene el mazo en formato texto para compartir  
**Excepciones:** Ninguna

### CU-006: Trackear Colección Personal de Cartas
**Actor:** Usuario  
**Precondiciones:** Usuario tiene acceso al módulo Collection Tracker  
**Flujo Principal:**
1. Usuario navega a sección "Mi Colección"
2. Sistema muestra galería de **8,095 cartas** con filtros de set
3. Usuario selecciona set "BT-01 New Evolution"
4. Sistema muestra 112 cartas del set con progreso "0/112 cartas - 0%"
5. Usuario hace click en carta "BT1-085 Greymon"
6. Sistema abre modal de colección con opciones de cantidad y variantes
7. Usuario marca "Poseído" y selecciona cantidad "2"
8. Usuario selecciona variante "P1 (Normal)"
9. Sistema guarda en Firebase/localStorage y actualiza progreso "1/112 - 0.9%"
10. Sistema muestra icono de posesión en la carta en galería principal

**Flujos Alternativos:**
- **FA-007:** Usuario posee múltiples variantes
  1. En paso 8, usuario selecciona variantes adicionales (P2, P3)
  2. Sistema registra cada variante por separado
  3. Contador de variantes muestra "2/3 variantes"

**Postcondiciones:** Colección actualizada, progreso visible por set  
**Excepciones:** Ninguna

### CU-007: Explorar y Importar Mazos Comunitarios
**Actor:** Usuario  
**Precondiciones:** Acceso a internet, sección Community Decks disponible  
**Flujo Principal:**
1. Usuario navega a "Community Decks"
2. Sistema muestra galería de mazos compartidos con previews
3. Usuario aplica filtro "Tier S" y tag "Aggro"
4. Sistema muestra mazos de arquetipos tier S tipo Aggro
5. Usuario ve mazo "Medusamon Aggro" con 150 vistas, 25 likes
6. Usuario hace click en el mazo
7. Sistema muestra detalle completo: lista de cartas, descripción, estadísticas
8. Usuario hace click en "Importar mazo"
9. Sistema valida mazo (5 Digi-Eggs, 50 Main, reglas cumplidas)
10. Sistema carga mazo en constructor y muestra confirmación
11. Usuario puede ahora modificar el mazo importado

**Flujos Alternativos:**
- **FA-008:** Usuario quiere ver tier list antes de elegir mazo
  1. En paso 3, usuario hace click en "Ver Tier Lists"
  2. Sistema muestra **190+ arquetipos** clasificados S-D
  3. Usuario hace click en "Medusamon" (Tier S)
  4. Sistema muestra mazos de ejemplo de ese arquetipo
  5. Continuar en paso 6

**Postcondiciones:** Mazo comunitario importado en el constructor del usuario  
**Excepciones:** 
- Si el mazo usa cartas que el usuario no tiene en su colección: mostrar warning opcional

### CU-008: Consultar Tier Lists del Meta
**Actor:** Usuario  
**Precondiciones:** Acceso a internet, tier lists actualizadas  
**Flujo Principal:**
1. Usuario navega a "Tier Lists"
2. Sistema carga tier lists mantenidas por #Naethaen
3. Sistema muestra **190+ arquetipos** organizados en tiers S, A, B, C, D
4. Usuario ve tier S con arquetipos: Medusamon, Aegisdramon, Dukemon (X Antibody), Dark Masters, Titamon, etc.
5. Usuario hace click en "Aegisdramon"
6. Sistema muestra:
   - Carta representativa (Aegisdramon EX3-026)
   - Descripción del arquetipo
   - Colores principales (Blue/Green)
   - Estilo de juego (Control/Mid-range)
   - Mazos de ejemplo de la comunidad (3-5 mazos)
7. Usuario hace click en un mazo de ejemplo
8. Sistema redirige a detalle del mazo (continuar en CU-007)

**Flujos Alternativos:**
- **FA-009:** Usuario filtra por color específico
  1. En paso 3, usuario selecciona filtro "Solo arquetipos Red"
  2. Sistema muestra arquetipos rojos en todos los tiers

**Postcondiciones:** Usuario informado sobre el estado actual del meta  
**Excepciones:** Ninguna

---

## 7. Referencias Visuales y Mockups

### 7.1 Aplicación Original Analizada
- **URL:** https://digimoncard.app/
- **Repositorio:** https://github.com/TakaOtaku/Digimon-Card-App (MIT License, Angular + Firebase)
- **Creador:** TakaOtaku (@8538 Discord)
- **Stack observado:** Angular 17+ (TypeScript 78.5%), NGRX, PrimeNG, TailwindCSS, Firebase
- **Base de datos:** 8,095 cartas sincronizadas diariamente desde DigimonCardGame.Fandom
- **Screenshots:** Ver carpeta `assets/screenshots/` (cuando se creen)

**Referencias de inspiración:**
- digimoncard.app - Aplicación de referencia principal analizada
- Digimon Card Game oficial: https://world.digimoncard.com/
- Otros deckbuilders TCG (MTG Arena, Yu-Gi-Oh Master Duel) para patrones UI/UX

### 7.2 Sitemap / Navegación

```
Home / Constructor de Mazos
├── Búsqueda de Cartas (8,095 cartas)
│   ├── Galería de Resultados (Grid view)
│   └── Detalle de Carta (Modal) - con variantes P1/P2/P3
├── Área de Construcción
│   ├── Zona Digi-Eggs (5 slots)
│   ├── Zona Main Deck (50 slots)
│   └── Zona Side Deck (sin límite fijo)
├── Selector de Color de Mazo (Red/Blue/Yellow/Green/Black/Purple/White)
├── Contadores
│   ├── Por Nivel: Lv.2, Lv.3, Lv.4, Lv.5, Lv.6, Lv.7+
│   └── Por Tipo: TM (Tamers), OP (Options)
├── Panel de Estadísticas
│   ├── Curva de Costes (por nivel)
│   ├── Distribución de Colores (7 colores TCG)
│   └── Desglose por Tipo (Digimon/Tamer/Option)
├── Mi Colección (Collection Tracker)
│   ├── Filtro por Set
│   ├── Progreso por Set (ej: "35/112 - 31%")
│   └── Gestión de Variantes (P1/P2/P3)
├── Community Decks
│   ├── Galería de Mazos Compartidos
│   ├── Filtros por Tags/Arquetipos/Tier
│   └── Sistema de Likes/Favoritos
├── Tier Lists
│   ├── Rankings S-D (190+ arquetipos)
│   └── Mazos de Ejemplo por Arquetipo
├── Statistics (Meta)
│   ├── Cartas Más Usadas
│   └── Distribución de Arquetipos
├── Lista de Mazos Guardados
│   ├── Card de Mazo (preview con deckbox SVG)
│   └── Opciones (Cargar/Editar/Duplicar/Eliminar/Compartir)
└── Menú de Opciones
    ├── Guardar Mazo
    ├── Exportar Mazo (formato TCGOne)
    ├── Importar Mazo
    ├── Login/Logout (opcional)
    └── Configuración
```

### 7.3 Wireframes Propuestos
[Por crear - wireframes en Figma o herramienta similar]

**Secciones clave a wireframear:**
1. Vista principal del constructor (desktop)
2. Vista principal del constructor (móvil)
3. Panel de búsqueda y filtros
4. Modal de detalle de carta
5. Lista de mazos guardados
6. Panel de estadísticas

### 7.4 Paleta de Colores y Diseño
**Temática:** Inspirada en los **7 colores oficiales** del Digimon TCG

- **Colores primarios de UI:** 
  - Azul/Aqua principal: `#0099CC` (reminiscente del logo Digimon)
  - Naranja acento: `#FF6600`
- **Colores del TCG (7 colores de cartas):**
  - **Red**: `#CC3333` o `#E74C3C`
  - **Blue**: `#3366CC` o `#3498DB`
  - **Yellow**: `#FFCC00` o `#F1C40F`
  - **Green**: `#339933` o `#27AE60`
  - **Black**: `#333333` o `#2C3E50`
  - **Purple**: `#9933CC` o `#9B59B6`
  - **White**: `#FFFFFF` o `#ECF0F1`
- **Colores de UI:**
  - Fondo: `#F5F5F5` o `#FAFAFA`
  - Superficie: `#FFFFFF`
  - Texto primario: `#212121`
  - Texto secundario: `#757575`
  - Bordes: `#E0E0E0`
  - Éxito: `#4CAF50`
  - Error: `#F44336`
  - Warning: `#FF9800`
  - Info: `#2196F3`

- **Tipografía:** 
  - Encabezados: Roboto Bold, Montserrat Bold, o similar sans-serif
  - Cuerpo: Roboto Regular o Inter
  - Código (listas de mazo): Roboto Mono o Fira Code
  - Tamaños: 12px, 14px, 16px, 18px, 24px, 32px

- **Espaciado:** Sistema basado en múltiplos de 8px (8, 16, 24, 32, 48, 64)
  - Tokens SCSS: `$spacing-1: 8px`, `$spacing-2: 16px`, etc.
  - Media query breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)

---

## 8. Arquitectura Propuesta

### 8.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────┐
│      Frontend (Angular 17+ + TypeScript)   │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │ Components   │      │  NGRX Store     │ │
│  │ - DeckBuilder│◄─────┤  - CardsState   │ │
│  │ - CardSearch │      │  - DecksState   │ │
│  │ - Collection │      │  - CollState    │ │
│  │ - Community  │      └────────┬────────┘ │
│  │ - Stats      │               │          │
│  │ (SCSS + BEM) │      ┌────────┴────────┐ │
│  └──────┬───────┘      │  Actions/       │ │
│         │              │  Reducers/      │ │
│         │    ┌─────────┤  Selectors/     │ │
│         └────►Services │  Effects        │ │
│              │ -CardSvc└─────────┬───────┘ │
│              │ -DeckSvc          │         │
│              │ -FandomSync       │         │
│              │ -FirebaseSvc      │         │
│              └──────────┬────────┘         │
└─────────────────────────┼───────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ localStorage │  │  IndexedDB   │  │  Firebase    │
│ (mazos off)  │  │ (cards cache)│  │ Firestore    │
│              │  │  (8,095)     │  │ (mazos online│
│              │  │              │  │  collections)│
└──────────────┘  └──────────────┘  └──────┬───────┘
                                            │
                 ┌──────────────────────────┴─────┐
                 │ DigimonCardGame.Fandom (Wiki)  │
                 │ Sync diaria (Python script)    │
                 └────────────────────────────────┘
```

**Explicación:**
- **Frontend:** SPA en **Angular 17+** con **TypeScript**
- **State Management:** **NGRX** (Redux pattern) con Actions, Reducers, Selectors y Effects
- **Estilos:** **SCSS con metodología BEM** (bloques con elementos `&__` y modificadores `&--` anidados)
- **Componentes UI:** **PrimeNG** para componentes enterprise (p-table, p-dropdown, p-card, etc.)
- **Servicios:** Capa intermedia para lógica de negocio y comunicación con Firebase
- **Persistencia:** 
  - **localStorage** para mazos guardados offline (pequeño volumen)
  - **IndexedDB** para caché de 8,095 cartas (búsquedas rápidas offline)
 - **Firebase Firestore** para sincronización entre dispositivos (mazos, colección)
  - **Fandom Wiki** como fuente de datos (sincronización diaria via Python script)

### 8.2 Estructura de Carpetas (Frontend - Angular)

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── card.service.ts
│   │   │   ├── deck.service.ts
│   │   │   ├── fandom-sync.service.ts
│   │   │   ├── firebase.service.ts
│   │   │   ├── validation.service.ts
│   │   │   └── storage.service.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts
│   │   └── models/
│   │       ├── card.model.ts
│   │       ├── deck.model.ts
│   │       ├── filter.model.ts
│   │       └── collection.model.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   ├── button.component.html
│   │   │   │   └── button.component.scss  // BEM: .btn, .btn__icon, .btn--primary
│   │   │   ├── modal/
│   │   │   ├── card-display/
│   │   │   └── loading-spinner/
│   │   ├── directives/
│   │   │   └── lazy-img.directive.ts
│   │   ├── pipes/
│   │   │   ├── card-filter.pipe.ts
│   │   │   └── deck-color.pipe.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       ├── validators.ts
│   │       └── formatters.ts
│   ├── features/
│   │   ├── deck-builder/
│   │   │   ├── deck-builder.module.ts
│   │   │   ├── components/
│   │   │   │   ├── deck-builder/
│   │   │   │   │   ├── deck-builder.component.ts
│   │   │   │   │   ├── deck-builder.component.html
│   │   │   │   │   └── deck-builder.component.scss  // BEM: .deck-builder
│   │   │   │   ├── deck-zone/
│   │   │   │   │   └── deck-zone.component.scss  // BEM: .deck-zone, .deck-zone__slot
│   │   │   │   ├── deck-list/
│   │   │   │   ├── card-counter/
│   │   │   │   │   └── card-counter.component.scss  // BEM: .card-counter, .card-counter__level
│   │   │   │   └── validation-panel/
│   │   │   └── store/
│   │   │       ├── deck.actions.ts
│   │   │       ├── deck.reducer.ts
│   │   │       ├── deck.selectors.ts
│   │   │       └── deck.effects.ts
│   │   ├── card-search/
│   │   │   ├── card-search.module.ts
│   │   │   ├── components/
│   │   │   │   ├── search-bar/
│   │   │   │   │   └── search-bar.component.scss  // BEM: .search-bar, .search-bar__input
│   │   │   │   ├── filter-panel/
│   │   │   │   │   └── filter-panel.component.scss  // BEM: .filter-panel, .filter-panel__section
│   │   │   │   ├── card-grid/
│   │   │   │   │   └── card-grid.component.scss  // BEM: .card-grid, .card-grid__item
│   │   │   │   └── card-detail-modal/
│   │   │   └── store/
│   │   │       ├── cards.actions.ts
│   │   │       ├── cards.reducer.ts
│   │   │       ├── cards.selectors.ts
│   │   │       └── cards.effects.ts
│   │   ├── collection/
│   │   │   ├── collection.module.ts
│   │   │   ├── components/
│   │   │   │   ├── collection-manager/
│   │   │   │   ├── collection-grid/
│   │   │   │   ├── set-progress/
│   │   │   │   └── variant-selector/
│   │   │   └── store/
│   │   │       ├── collection.actions.ts
│   │   │       ├── collection.reducer.ts
│   │   │       └── collection.selectors.ts
│   │   ├── community/
│   │   │   ├── community.module.ts
│   │   │   ├── components/
│   │   │   │   ├── community-deck-gallery/
│   │   │   │   ├── tier-list-view/
│   │   │   │   └── meta-stats-panel/
│   │   │   └── store/
│   │   │       ├── community.actions.ts
│   │   │       ├── community.reducer.ts
│   │   │       └── community.selectors.ts
│   │   └── deck-stats/
│   │       ├── deck-stats.module.ts
│   │       └── components/
│   │           ├── stats-panel/
│   │           │   └── stats-panel.component.scss  // BEM: .stats-panel
│   │           ├── cost-curve-chart/
│   │           └── color-distribution/
│   ├── store/
│   │   ├── app.state.ts
│   │   └── index.ts
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.component.html
│   └── app.component.scss  // Global BEM classes
├── assets/
│   ├── images/
│   │   ├── cards/           // 8,095+ card images (WebP)
│   │   ├── deckboxes/       // SVGs de colores
│   │   └── icons/
│   ├── data/
│   │   └── cards.json       // Backup local de cartas
│   └── scss/
│       ├── _variables.scss  // Tokens: colores, spacing, breakpoints
│       ├── _mixins.scss     // Mixins de BEM, media queries
│       ├── _typography.scss
│       └── _theme.scss      // PrimeNG theme customization
├── environments/
│   ├── environment.ts       // Dev: Firebase config
│   └── environment.prod.ts  // Prod: Firebase config
├── styles.scss              // Global styles, imports
└── main.ts                  // Bootstrap Angular app
```

### 8.3 Patrones de Diseño
- **Patrón de arquitectura:** Feature-Based Modules (organización por funcionalidad en Angular)
- **Gestión de estado:** **NGRX (Redux pattern)** con Actions, Reducers, Selectors y Effects
- **Estilos:** **SCSS con metodología BEM** 
  - Bloques: `.deck-builder`, `.card-search`, `.stats-panel`
  - Elementos anidados: `&__slot`, `&__input`, `&__item`
  - Modificadores: `&--active`, `&--disabled`, `&--primary`
  - Media queries inline dentro de cada bloque
  - Tokens de tema: `$color-primary`, `$spacing-4`, `$breakpoint-md`
- **Routing:** Angular Router con lazy loading de módulos
- **Componentes UI:** **PrimeNG** (p-table, p-dropdown, p-multiselect, p-card, p-button, p-dialog)
- **Drag & Drop:** Angular CDK Drag & Drop (accesible y performante)
- **Charts:** **Chart.js** con ng2-charts o Recharts (gráficos responsive)

### 8.4 Modelo de Datos

**Entidad: Card (Carta)**
```typescript
interface Card {
  id: string;                    // Código único (ej: "BT1-085")
  name: string;                  // Nombre (ej: "Greymon")
  type: CardType;                // "Digimon" | "Tamer" | "Option" | "Digi-Egg"
  color: Color[];                // ["Red"] o ["Red", "Yellow"] (multi-color)
  cost: number;                  // Coste de play (0-15+)
  digivolutionCost?: number;     // Coste de digi evolución (solo Digimon)
  level?: number;                // Nivel (2-7 para Digimon)
  dp?: number;                   // Digi Power (solo Digimon)
  form?: string;                 // Forma (Rookie, Champion, etc.)
  attribute?: string;            // Atributo (Vaccine, Virus, Data, etc.)
  rarity: Rarity;                // "Common" | "Uncommon" | "Rare" | "Super Rare" | "Secret Rare"
  set: string;                   // Set de origen (ej: "BT-01 New Evolution")
  cardNumber: string;            // Número en el set (ej: "085")
  imageUrl: string;              // URL de imagen WebP de la carta
  effect: string;                // Texto del efecto
  inheritedEffect?: string;      // Efecto heredado (solo Digimon)
  securityEffect?: string;       // Efecto de seguridad
  keywords: string[];            // Keywords (ej: ["Reboot", "Blocker"])
  variants?: CardVariant[];      // Variantes de ilustración (P1, P2, P3)
}

interface CardVariant {
  variantId: string;             // Identificador (ej: "P1", "P2", "P3")
  variantName: string;           // Nombre (ej: "Alternate Art 1")
  imageUrl: string;              // URL de imagen de esta variante
}

enum CardType {
  Digimon = "Digimon",
  Tamer = "Tamer",
  Option = "Option",
  DigiEgg = "Digi-Egg"
}

enum Color {
  Red = "Red",
  Blue = "Blue",
  Yellow = "Yellow",
  Green = "Green",
  Black = "Black",
  Purple = "Purple",
  White = "White"
}

enum Rarity {
  Common = "Common",
  Uncommon = "Uncommon",
  Rare = "Rare",
  SuperRare = "Super Rare",
  SecretRare = "Secret Rare"
}
```

**Entidad: Deck (Mazo)**
```typescript
interface Deck {
  id: string;                    // UUID generado
  name: string;                  // Nombre del mazo
  description?: string;          // Descripción opcional
  digiEggs: DeckCard[];          // Array de Digi-Eggs (max 5)
  mainDeck: DeckCard[];          // Array de cartas del mazo principal (max 50)
  sideDeck: DeckCard[];          // Array de Side Deck (sin límite oficial fijo)
  colors: Color[];               // Colores principales (calculado automáticamente)
  createdAt: Date;               // Fecha de creación
  updatedAt: Date;               // Última modificación
  tags?: string[];               // Etiquetas opcionales (ej: ["Aggro", "Competitive", "Tier S"])
  archetype?: string;            // Arquetipo (ej: "Medusamon", "Aegisdramon")
  format?: GameFormat;           // "Standard" | "Unlimited"
  isPublic?: boolean;            // Si está compartido en Community Decks
  likes?: number;                // Número de likes (solo para mazos públicos)
  author?: string;               // Autor del mazo (username o userId)
}

interface DeckCard {
  cardId: string;                // ID de la carta
  quantity: number;              // Cantidad de copias (1-5)
  variantId?: string;            // Variante de ilustración preferida (opcional)
}

enum GameFormat {
  Standard = "Standard",         // Solo sets recientes
  Unlimited = "Unlimited"        // Todas las cartas
}
```

**Entidad: Filter (Filtros de Búsqueda)**
```typescript
interface CardFilter {
  searchText?: string;           // Búsqueda por nombre
  colors?: Color[];              // Filtro por colores
  types?: CardType[];            // Filtro por tipos
  costMin?: number;              // Coste mínimo
  costMax?: number;              // Coste máximo
  levelMin?: number;             // Nivel mínimo (Digimon)
  levelMax?: number;             // Nivel máximo (Digimon)
  sets?: string[];               // Sets específicos
  rarities?: Rarity[];           // Rareza
  keywords?: string[];           // Keywords
  effectText?: string;           // Búsqueda en texto de efecto
}
```

**Relaciones:**
- Deck --1:N--> DeckCard
- DeckCard --N:1--> Card (via cardId)

---

## 9. Stack Tecnológico Recomendado

### 9.1 Frontend
- **Framework:** Angular 17+ (con Signals, standalone components y control flow syntax)
- **Lenguaje:** TypeScript 5+
- **Build tool:** Angular CLI + esbuild (build rápido, HMR)
- **Styling:** **SCSS con metodología BEM** (anidamiento con `&__` y `&--`, media queries inline, tokens de tema)
- **State management:** **NGRX** (Redux pattern con Actions/Reducers/Selectors/Effects)
- **Componentes UI:** **PrimeNG** (componentes enterprise: p-table, p-dropdown, p-multiselect, p-card, p-button, p-dialog, p-toast)
- **Drag & Drop:** Angular CDK Drag & Drop
- **Charts:** Chart.js con ng2-charts o ngx-charts (gráficos responsive)
- **Forms:** Reactive Forms de Angular con validadores personalizados
- **HTTP Client:** Angular HttpClient con interceptors
- **Animations:** Angular Animations API
- **Icons:** PrimeIcons o Material Icons

### 9.2 Backend y Sincronización
- **Backend:** Firebase (serverless)
  - **Firestore:** Base de datos NoSQL para mazos, colección, community decks
  - **Firebase Auth:** Autenticación opcional con email/password y Google Sign-In
  - **Firebase Storage:** Almacenamiento de imágenes WebP de cartas (8,095+)
  - **Firebase Functions:** Cloud Functions para sincronización y lógica backend
- **Sincronización de cartas:** Script Python (WikiVariables.py) que ejecuta scraping diario de DigimonCardGame.Fandom y actualiza Firebase
- **Lenguaje scripts:** Python 3.10+ con Beautiful Soup, Requests

### 9.3 Base de Datos
- **Base de datos en la nube:** Firebase Firestore (NoSQL)
  - Colecciones: `/cards`, `/decks/{userId}/{deckId}`, `/collections/{userId}`, `/community-decks`, `/tier-lists`
  - Índices compuestos para queries complejas (color + tipo + cost)
- **Caché local:**
  - **localStorage** para mazos offline (JSON serializado, ~5-10MB disponibles)
  - **IndexedDB** para caché de 8,095+ cartas (búsquedas rápidas offline con Dexie.js)

### 9.4 Autenticación
- **Método:** Firebase Auth con JWT tokens
- **Providers:** 
  - Email/Password (opcional)
  - Google Sign-In (OAuth 2.0)
- **Autenticación es opcional:** App funciona en modo anónimo con solo localStorage, login habilita sincronización cloud

### 9.5 Hosting y Deploy
- **Frontend:** Firebase Hosting (CDN global, SSL automático, deploy con Angular CLI)
- **Backend:** Firebase Functions (Node.js 18, serverless)
- **Assets (imágenes):** Firebase Storage con CDN, imágenes WebP optimizadas
- **Scripts Python:** Deploy manual o GitHub Actions para sincronización diaria

### 9.6 Herramientas de Desarrollo
- **Linting:** ESLint con configuración de Angular + Prettier
- **Formatting:** Prettier con reglas para TypeScript y SCSS
- **Testing:** 
  - **Jasmine + Karma** (unit tests de componentes y servicios)
  - **Cypress o Playwright** (E2E tests - opcional)
  - **NGRX DevTools** para debugging del store
- **CI/CD:** GitHub Actions (lint, test, build, deploy a Firebase)
- **Control de versiones:** Git + GitHub
- **Editor:** VS Code con Angular Language Service, SCSS IntelliSense

### 9.7 Librerías Clave Angular
| Librería | Propósito | Justificación |
|----------|-----------|---------------|
| Angular 17+ | Framework UI | Framework robusto, TypeScript nativo, Signals reactivos |
| TypeScript 5+ | Tipado estático | Prevención de errores, mejor DX, intellisense |
| NGRX | State management | Redux pattern probado, DevTools, efectos para side effects |
| PrimeNG | Componentes UI | Enterprise-grade, accesible, customizable, amplia gama de componentes |
| Angular CDK | Drag & Drop + Utilities | Accesible, performante, integrado con Angular |
| ng2-charts | Gráficos | Wrapper Angular para Chart.js, responsive, tipos incluidos |
| Firebase | Backend + Auth | Serverless, escalable, tiempo real, SDK bien integrado |
| Dexie.js | IndexedDB wrapper | API Promise-based simple para caché local de 8,095 cartas |
| Fuse.js | Búsqueda fuzzy | Búsqueda tolerante a errores en nombres de cartas |
| @angular/fire | Firebase SDK | Integración oficial de Firebase con Angular y NGRX |

### 9.2 Backend y Sincronización
- **Backend:** Firebase (serverless)
  - **Firestore:** Base de datos NoSQL para mazos, colección, community decks
  - **Firebase Auth:** Autenticación opcional con email/password y Google Sign-In
  - **Firebase Storage:** Almacenamiento de imágenes WebP de cartas (8,095+)
  - **Firebase Functions:** Cloud Functions para sincronización y lógica backend
- **Sincronización de cartas:** Script Python (WikiVariables.py) que ejecuta scraping diario de DigimonCardGame.Fandom y actualiza Firebase
- **Lenguaje scripts:** Python 3.10+ con Beautiful Soup, Requests

### 9.3 Base de Datos
- **Almacenamiento local (Fase 1):**
  - localStorage para mazos (JSON serializado)
  - IndexedDB para caché de cartas (búsquedas más rápidas)
  
- **Base de datos remota (Fase 2 - opcional):**
  - PostgreSQL o Supabase (si se añade autenticación y sincronización)

### 9.4 Autenticación
- **Método:** Firebase Auth con JWT tokens
- **Providers:** 
  - Email/Password (opcional)
  - Google Sign-In (OAuth 2.0)
- **Autenticación es opcional:** App funciona en modo anónimo con solo localStorage, login habilita sincronización cloud

### 9.5 Hosting y Deploy
- **Frontend:** Firebase Hosting (CDN global, SSL automático, deploy con Angular CLI)
- **Backend:** Firebase Functions (Node.js 18, serverless)
- **Assets (imágenes):** Firebase Storage con CDN, imágenes WebP optimizadas
- **Scripts Python:** Deploy manual o GitHub Actions para sincronización diaria

### 9.6 Herramientas de Desarrollo
- **Linting:** ESLint con configuración de Angular + Prettier
- **Formatting:** Prettier con reglas para TypeScript y SCSS
- **Testing:** 
  - **Jasmine + Karma** (unit tests de componentes y servicios)
  - **Cypress o Playwright** (E2E tests - opcional)
  - **NGRX DevTools** para debugging del store
- **CI/CD:** GitHub Actions (lint, test, build, deploy a Firebase)
- **Control de versiones:** Git + GitHub
- **Editor:** VS Code con Angular Language Service, SCSS IntelliSense

### 9.7 Librerías Clave Angular
| Librería | Propósito | Justificación |
|----------|-----------|---------------|
| Angular 17+ | Framework UI | Framework robusto, TypeScript nativo, Signals reactivos |
| TypeScript 5+ | Tipado estático | Prevención de errores, mejor DX, intellisense |
| NGRX | State management | Redux pattern probado, DevTools, efectos para side effects |
| PrimeNG | Componentes UI | Enterprise-grade, accesible, customizable, amplia gama de componentes |
| Angular CDK | Drag & Drop + Utilities | Accesible, performante, integrado con Angular |
| ng2-charts | Gráficos | Wrapper Angular para Chart.js, responsive, tipos incluidos |
| Firebase | Backend + Auth | Serverless, escalable, tiempo real, SDK bien integrado |
| Dexie.js | IndexedDB wrapper | API Promise-based simple para caché local de 8,095 cartas |
| Fuse.js | Búsqueda fuzzy | Búsqueda tolerante a errores en nombres de cartas |
| @angular/fire | Firebase SDK | Integración oficial de Firebase con Angular y NGRX |

### 9.8 Convenciones SCSS + BEM

#### Estructura BEM (Block Element Modifier)
**Filosofía:** Bloques independientes con elementos anidados y modificadores para variaciones

```scss
// Bloque principal
.deck-builder {
  display: flex;
  padding: $spacing-4;
  background-color: $color-surface;
  
  // Media query inline
  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    padding: $spacing-2;
  }
  
  // Elemento anidado
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-3;
    
    // Sub-elemento
    &-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-primary;
    }
  }
  
  // Otro elemento
  &__zone {
    border: 2px solid $color-border;
    border-radius: $border-radius-md;
    padding: $spacing-3;
    min-height: 200px;
    
    // Modificador del elemento
    &--digi-eggs {
      background-color: $color-eggs-bg;
      border-color: $color-eggs-border;
    }
    
    &--main-deck {
      background-color: $color-main-bg;
      border-color: $color-main-border;
    }
    
    &--side-deck {
      background-color: $color-side-bg;
      border-color: $color-side-border;
    }
  }
  
  // Modificador del bloque
  &--mobile {
    padding: $spacing-2;
    
    .deck-builder__zone {
      margin-bottom: $spacing-2;
    }
  }
  
  &--collapsed {
    .deck-builder__header {
      margin-bottom: 0;
    }
    
    .deck-builder__zone {
      display: none;
    }
  }
}

// Uso en HTML:
// <div class="deck-builder deck-builder--mobile">
//   <div class="deck-builder__header">
//     <h2 class="deck-builder__header-title">Construye tu Mazo</h2>
//   </div>
//   <div class="deck-builder__zone deck-builder__zone--digi-eggs">...</div>
//   <div class="deck-builder__zone deck-builder__zone--main-deck">...</div>
// </div>
```

#### Tokens de Tema (Variables SCSS)
**Archivo:** `src/assets/scss/_variables.scss`

```scss
// Colores TCG (7 colores oficiales)
$color-tcg-red: #E74C3C;
$color-tcg-blue: #3498DB;
$color-tcg-yellow: #F1C40F;
$color-tcg-green: #27AE60;
$color-tcg-black: #2C3E50;
$color-tcg-purple: #9B59B6;
$color-tcg-white: #ECF0F1;

// Colores de UI
$color-primary: #0099CC;
$color-secondary: #FF6600;
$color-surface: #FFFFFF;
$color-background: #F5F5F5;
$color-text-primary: #212121;
$color-text-secondary: #757575;
$color-border: #E0E0E0;
$color-success: #4CAF50;
$color-error: #F44336;
$color-warning: #FF9800;
$color-info: #2196F3;

// Espaciado (sistema de 8px)
$spacing-1: 8px;
$spacing-2: 16px;
$spacing-3: 24px;
$spacing-4: 32px;
$spacing-5: 40px;
$spacing-6: 48px;
$spacing-8: 64px;

// Tipografía
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 24px;
$font-size-2xl: 32px;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

// Breakpoints
$breakpoint-xs: 320px;  // Mobile pequeño
$breakpoint-sm: 480px;  // Mobile
$breakpoint-md: 768px;  // Tablet
$breakpoint-lg: 1024px; // Desktop
$breakpoint-xl: 1440px; // Desktop ancho

// Border radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-circle: 50%;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);

// Transitions
$transition-fast: 150ms ease-in-out;
$transition-base: 250ms ease-in-out;
$transition-slow: 350ms ease-in-out;
```

#### Mixins Útiles
**Archivo:** `src/assets/scss/_mixins.scss`

```scss
// Mixin para media queries
@mixin respond-to($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

// Mixin para truncar texto
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Mixin para flexbox centrado
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Mixin para grid responsive de cartas
@mixin card-grid($cols-mobile: 2, $cols-tablet: 4, $cols-desktop: 6) {
  display: grid;
  gap: $spacing-2;
  grid-template-columns: repeat($cols-mobile, 1fr);
  
  @include respond-to($breakpoint-md) {
    grid-template-columns: repeat($cols-tablet, 1fr);
  }
  
  @include respond-to($breakpoint-lg) {
    grid-template-columns: repeat($cols-desktop, 1fr);
  }
}
```

### 9.9 Integración con DigimonCardGame.Fandom

#### Proceso de Sincronización
**Script:** `WikiVariables.py` (adaptado de repositorio de referencia)

**Flujo:**
1. **Trigger:** Ejecución diaria a las 00:00 UTC via GitHub Actions o cron job
2. **Scraping:** Script accede a DigimonCardGame.Fandom y extrae datos de cartas
3. **Parsing:** Procesamiento de HTML, extracción de campos (nombre, tipo, coste, nivel, efectos, etc.)
4. **Imágenes:** Descarga de imágenes de cartas, conversión a WebP, optimización
5. **Upload:** Subida de imágenes a Firebase Storage con URLs generadas
6. **Database Update:** Actualización de Firebase Firestore con nuevas cartas y cambios
7. **Logging:** Registro de cartas añadidas/actualizadas, detección de errores
8. **Notificación:** Mensaje en app cuando hay nuevas cartas disponibles (opcional)

#### Estructura de Datos de Fandom
**Campos extraídos del Wiki:**
- `Card ID`: Código único (ej: BT1-085)
- `Card Name`: Nombre oficial
- `Card Type`: Digimon/Tamer/Option/Digi-Egg
- `Color`: Red/Blue/Yellow/Green/Black/Purple/White (puede ser múltiple)
- `Play Cost`: 0-15+
- `Digivolution Cost`: Solo para Digimon
- `Level`: Lv.2-7+ (Digimon) o - (otros tipos)
- `DP`: Digi Power (Digimon)
- `Form`: Rookie/Champion/Ultimate/Mega/etc.
- `Attribute`: Vaccine/Virus/Data/Free/Unknown
- `Rarity`: C/U/R/SR/SEC
- `Set`: BT1-24, EX1-8, ST1-18, Promos
- `Card Number`: 001-XXX
- `Main Effect`: Texto del efecto principal
- `Inherited Effect`: Efecto heredado (Digimon)
- `Security Effect`: Efecto al revelar de seguridad
- `Image URL`: URL de imagen (convertida a WebP)
- `Variants`: P1/P2/P3 (ilustraciones alternativas)

#### Formato JSON de Salida
```json
{
  "id": "BT1-085",
  "name": "Greymon",
  "type": "Digimon",
  "color": ["Red"],
  "playCost": 5,
  "digivolutionCost": 2,
  "level": 4,
  "dp": 5000,
  "form": "Champion",
  "attribute": "Vaccine",
  "rarity": "Rare",
  "set": "BT-01 New Evolution",
  "cardNumber": "085",
  "imageUrl": "https://firebasestorage.googleapis.com/.../BT1-085.webp",
  "effect": "[Your Turn] While this Digimon has [Greymon] or [Omnimon] in its name, it gets +1000 DP.",
  "inheritedEffect": "[Your Turn] This Digimon gets +1000 DP.",
  "securityEffect": "",
  "keywords": [],
  "variants": [
    {
      "variantId": "P1",
      "variantName": "Normal Art",
      "imageUrl": "https://firebasestorage.googleapis.com/.../BT1-085_P1.webp"
    },
    {
      "variantId": "P2",
      "variantName": "Alternate Art",
      "imageUrl": "https://firebasestorage.googleapis.com/.../BT1-085_P2.webp"
    }
  ],
  "lastUpdated": "2026-03-16T00:00:00Z"
}
```

#### Firebase Firestore Schema
```
/cards (colección)
  /{cardId} (documento: "BT1-085")
    - id: "BT1-085"
    - name: "Greymon"
    - type: "Digimon"
    - color: ["Red"]
    - ... (todos los campos arriba)
    
/decks (colección)
  /{userId} (documento)
    /user-decks (subcolección)
      /{deckId} (documento)
        - name: "Greymon Aggro"
        - digiEggs: [{cardId: "BT1-001", quantity: 4}, ...]
        - mainDeck: [{cardId: "BT1-085", quantity: 4}, ...]
        - sideDeck: [...]
        - createdAt: timestamp
        - updatedAt: timestamp

/collections (colección)
  /{userId} (documento)
    /owned-cards (subcolección)
      /{cardId} (documento)
        - quantity: 2
        - variants: ["P1", "P2"]
        - acquiredDate: timestamp

/community-decks (colección)
  /{deckId} (documento)
    - name: "Medusamon Tier S"
    - author: "userId"
    - archetype: "Medusamon"
    - tier: "S"
    - likes: 25
    - views: 150
    - digiEggs: [...]
    - mainDeck: [...]
    - sideDeck: [...]
    - tags: ["Aggro", "Competitive", "Tier S"]
    - publishedAt: timestamp

/tier-lists (colección)
  /{listId} (documento)
    - name: "Official Meta Tier List"
    - maintainer: "#Naethaen"
    - lastUpdated: timestamp
    - archetypes: [
        {name: "Medusamon", tier: "S", representativeCard: "BT21-029"},
        {name: "Aegisdramon", tier: "S", representativeCard: "EX3-026"},
        ... (190+ arquetipos)
      ]
```

---

## 10. Plan de Implementación (Opcional)

### Fase 1: MVP (Minimum Viable Product)
**Duración estimada:** 6-8 semanas (Angular + NGRX setup incluido)  
**Features incluidas:**
- [ ] Setup inicial: Angular 17+, NGRX, PrimeNG, Firebase SDK
- [ ] Sincronización inicial con Fandom: script Python para obtener **8,095+ cartas**
- [ ] Caché local: IndexedDB con Dexie.js para búsquedas offline
- [ ] Búsqueda básica por nombre con autocompletado fuzzy (Fuse.js)
- [ ] Filtros de **7 colores TCG**, tipo, coste, nivel
- [ ] Constructor de mazos con **tres zonas**: Digi-Eggs (5), Main Deck (50), Side Deck
- [ ] Contadores por nivel (Lv.2-7+) y tipo (TM/OP) en tiempo real
- [ ] Validación de reglas: **5 copias máximo por nombre**, límites de zonas
- [ ] Guardado de mazos en **localStorage** (modo offline)
- [ ] Lista de mazos guardados con previews de colores (deckbox SVG)
- [ ] Exportar mazo a formato texto TCGOne estándar
- [ ] Estilos SCSS con metodología BEM (tokens de tema aplicados)

**Objetivo MVP:** Usuario puede buscar en 8,095 cartas, construir mazos válidos con validación en tiempo real, guardarlos offline y exportarlos.

### Fase 2: Features Avanzadas
**Duración estimada:** 3-4 semanas  
**Features incluidas:**
- [ ] Panel de estadísticas con gráficos (curva de costes, distribución de colores)
- [ ] Drag & Drop para añadir/reorganizar cartas
- [ ] Filtros avanzados (nivel, set, rareza, keywords)
- [ ] Búsqueda en texto de efecto
- [ ] Modal de detalle de carta con imagen ampliada
- [ ] Importación de mazos desde formato texto
- [ ] Sistema de etiquetas/tags para organizar mazos
- [ ] Duplicar mazos

### Fase 3: Pulido y Optimización
**Duración estimada:** 2-3 semanas  
**Features incluidas:**
- [ ] Optimización de imágenes (webp, lazy loading)
- [ ] Mejoras de UX (animaciones, transiciones)
- [ ] Responsive design pulido para móviles
- [ ] Accesibilidad completa (navegación por teclado, screen readers)
- [ ] PWA (Progressive Web App) con modo offline
- [ ] Onboarding/tutorial para nuevos usuarios
- [ ] Actualizaciones de base de datos con nuevos sets

### Fase 4: Community Features y Backend Cloud
**Duración estimada:** 4-6 semanas  
**Actividades:**
- [ ] Configurar **Firebase Auth** (email/password + Google Sign-In opcional)
- [ ] Sincronización de mazos con **Firebase Firestore** entre dispositivos
- [ ] **Collection Tracker:** Sistema para trackear cartas poseídas con variantes P1/P2/P3
- [ ] **Community Decks:** Publicar mazos con sistema de búsqueda por tags y arquetipos
- [ ] **Tier Lists:** Integración de rankings S-D de arquetipos (190+) mantenidos por comunidad
- [ ] Sistema de likes y favoritos en mazos compartidos
- [ ] **Statistics del Meta:** Análisis de cartas más usadas y arquetipos populares
- [ ] **Ruling Quiz:** Sistema opcional de preguntas sobre reglas del juego
- [ ] Automatizar sincronización diaria con Fandom via GitHub Actions
- [ ] Firebase Functions para lógica backend (validaciones, notificaciones)
- [ ] Integración de API de precios de mercado (opcional, terceros)

**Objetivo Fase 4:** Convertir la app en plataforma comunitaria completa con sincronización cloud, compartir mazos y análisis del meta-game.

---

## 11. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Base de datos de cartas desactualizada | Alta | Medio | Establecer proceso mensual de actualización, permitir contribuciones de comunidad |
| Imágenes de cartas con copyright | Media | Alto | Verificar fair use para deck builders, considerar imágenes placeholder o API oficial |
| Validación de reglas incorrecta | Media | Alto | Testing exhaustivo, consultar reglas oficiales, feedback de usuarios competitivos |
| Performance con 1000+ cartas en búsqueda | Baja | Medio | Implementar virtualización de listas, indexación con Fuse.js, lazy loading |
| localStorage lleno (límite 5-10MB) | Media | Medio | Migrar a IndexedDB, implementar límite de mazos guardados con advertencia |
| Falta de diseño visual profesional | Alta | Bajo | Priorizar funcionalidad en MVP, iterar diseño con feedback de usuarios |

---

## 12. Próximos Pasos

1. **Definir integración con digimoncard.app como referencia** - Analizar estructura de datos y API de Firebase
2. **Crear wireframes de pantallas principales** - Diseñar flujo visual con componentes PrimeNG
3. **Configurar script de sincronización con Fandom** - Adaptar WikiVariables.py para obtener 8,095+ cartas
4. **Configurar proyecto Angular 17+ con NGRX** - Estructura modular con SCSS + BEM
5. **Configurar Firebase** - Firestore, Auth, Storage y Functions
6. **Implementar modelo de datos y servicios** - Crear interfaces TypeScript y servicios Angular
7. **Desarrollar componente de búsqueda de cartas** - Primera feature funcional para validar arquitectura NGRX
8. **Iterar con feedback** - Testear con usuarios reales del TCG desde etapa temprana

---

## 13. Referencias y Recursos

### Aplicaciones y Herramientas de Referencia
- **Aplicación principal analizada:** https://digimoncard.app/ (Angular + Firebase + NGRX)
- **Repositorio de referencia:** https://github.com/TakaOtaku/Digimon-Card-App
- **Digimon Card Game oficial:** https://world.digimoncard.com/
- **Otros deckbuilders TCG:** 
  - MTG Arena Deck Builder
  - Pokemon TCG Online Deck Builder
  - Yu-Gi-Oh Master Duel Deck Builder

### Bases de Datos de Cartas (Fuentes)
- **Fuente principal:** DigimonCardGame.Fandom.com (8,095+ cartas, actualización diaria)
- DigimonCard.io (alternativa)
- APIs de cartas TCG (si existen oficiales)

### Reglas Oficiales
- Digimon Card Game Official Rule Manual
- Formato BT/EX Standard - Restricted list
- **Límite oficial:** 5 copias máximo por nombre de carta

### Recursos Técnicos
- **Angular Documentation:** https://angular.dev/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **NGRX Documentation:** https://ngrx.io/docs
- **PrimeNG Documentation:** https://primeng.org/
- **Angular CDK:** https://material.angular.io/cdk/categories
- **Firebase Documentation:** https://firebase.google.com/docs
- **@angular/fire:** https://github.com/angular/angularfire
- **SCSS + BEM:** https://sass-lang.com/documentation + http://getbem.com/

### Comunidad
- Subreddit: r/DigimonCardGame2020
- Discord servers de Digimon TCG
- Grupos de Facebook de jugadores

---

**Documento creado:** 16/03/2026  
**Última actualización:** 16/03/2026  
**Estado:** Documento funcional completado con datos veraces de https://digimoncard.app/

**Cambios clave respecto a versión inicial:**
- Actualización de URL analizada: https://digimoncard.app/ (8,095 cartas)
- **Corrección crítica:** Límite de copias 4 → **5 copias por nombre**
- **Stack tecnológico definido:** Angular 17+ + NGRX + SCSS con BEM (no React)
- **Zonas de mazo actualizadas:** Digi-Eggs (5) + Main Deck (50) + **Side Deck** (añadido)
- **Nuevas features añadidas:** Collection Tracker, Community Decks, Tier Lists (190+ arquetipos S-D), Statistics del Meta, Ruling Quiz
- **Integración especificada:** Sincronización diaria con DigimonCardGame.Fandom via Python scripts
- **Persistencia dual:** localStorage (offline) + Firebase Firestore (sincronización online)
- **7 colores TCG especificados:** Red, Blue, Yellow, Green, Black, Purple, White
- **Variantes de ilustración:** P1/P2/P3 documentadas en modelo de datos
- **Contadores visuales:** Por nivel (Lv.2-7+) y tipo (TM/OP)
- **Casos de uso ampliados:** CU-006 (Collection Tracker), CU-007 (Community Decks), CU-008 (Tier Lists)
- **Requisitos funcionales nuevos:** RF-009 (Fandom sync), RF-010 (Firebase Auth), RF-011 (Collection), RF-012 (Community), RF-013 (Tier Lists)
