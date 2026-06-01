# Sistema de Análisis y Puntuación de Decks — Digimon TCG Deckbuilder

## 1. ¿Qué es el sistema de análisis?
El sistema de análisis es un conjunto de utilidades y componentes que evalúan automáticamente la calidad, consistencia y estructura de un mazo de Digimon TCG. Proporciona una puntuación objetiva (score), una calificación (grade), alertas y métricas visuales para ayudar al usuario a optimizar su deck.

## 2. ¿Cómo funciona el análisis?
El análisis se realiza en varias etapas:

### a) Mapeo de cartas (EnhancedCard)
- Todas las cartas del mazo se convierten a la interfaz `EnhancedCard`, que agrega propiedades útiles (tipo, nivel, color, si es buscador, si es blast, etc.)
- Esto permite que los motores de análisis trabajen con datos enriquecidos y homogéneos.

### b) Detección de Engine
- Se detecta el "engine" o arquetipo base del deck (ej: Classic Evolution, Royal Knights, Zoo, etc.) usando patrones de cartas clave.
- Esto influye en cómo se evalúan las curvas de nivel y la estructura.

### c) Métricas y distribuciones
- Se calculan métricas como:
  - Distribución por tipo (Digimon, Tamer, Option, Digi-Egg)
  - Curva de niveles (Lv3, Lv4, Lv5, Lv6)
  - Costos promedio de juego
  - Densidad de colores
- Estas métricas se usan tanto para visualización como para scoring.

### d) Probabilidad y Consistencia
- Se simulan manos iniciales usando un motor hipergeométrico para estimar:
  - Brick Rate (probabilidad de mano injugable)
  - Consistencia T1 y T2 (probabilidad de tener salida óptima en primer o segundo turno)
  - Recomendación de mulligan

### e) Evaluación y Score
- El motor `evaluateDeck` suma puntos en base a criterios clave:
  - Consistencia de apertura (hasta 30 pts)
  - Salud de la curva de niveles (hasta 30 pts)
  - Presencia de buscadores y tamers (hasta 20 pts)
  - Kit de interrupción/respuesta (hasta 20 pts)
- Penaliza o alerta si hay riesgos (curva invertida, falta de tamers, brick rate alto, etc.)
- El score final se normaliza a 100 y se asigna un grade:
  - A: 90-100
  - B: 80-89
  - C: 70-79
  - F: <70

## 3. Visualización
- El resultado se muestra en el `DeckLabPanelComponent`:
  - Score y grade en grande
  - Engine detectado
  - Alertas y recomendaciones
  - Barras de tipo y curva de nivel
  - Métricas de mano y mulligan

## 4. ¿Por qué este sistema?
- Permite a cualquier usuario identificar debilidades y fortalezas de su mazo sin ser experto.
- Fomenta la construcción de decks más sólidos y competitivos.
- El análisis es transparente: cada punto del score responde a criterios claros y visibles.

## 5. Extensibilidad
- El sistema está preparado para añadir nuevos criterios, arquetipos y métricas según evolucione el juego.

---

**Resumen:**
El sistema de análisis y puntuación es modular, transparente y orientado a la mejora continua del deck. Cada métrica y alerta tiene un fundamento matemático o estratégico, y la visualización ayuda a tomar decisiones informadas para optimizar el mazo.
