# Especificación Funcional — Deck Lab (Laboratorio de Simulación)

**Documento:** Análisis funcional del Modo Lab para el Deck Builder  
**Fecha:** 22 de mayo de 2026  
**Origen:** Sesión de diseño con Gemini  

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Metadatos Requeridos en el Modelo de Carta](#metadatos-requeridos-en-el-modelo-de-carta)
3. [Módulo A — Optimizador de Mano Inicial](#módulo-a--optimizador-de-mano-inicial-y-turno-1-2)
4. [Módulo B — Estadísticas de Curva y Composición](#módulo-b--estadísticas-de-curva-y-composición)
5. [Valor Añadido — Utilidades Extra del Lab](#utilidades-extra-del-lab-valor-añadido)
6. [UI/UX — Transformación Visual al Activar el Modo Lab](#uiux--transformación-visual-al-activar-el-modo-lab)

---

## Visión General

El **Deck Lab** (Laboratorio de Simulación) transforma el Deck Builder de una herramienta de construcción genérica a un simulador probabilístico y de rendimiento en tiempo real orientado al juego competitivo.

Al activar el **Modo Lab**, la interfaz del mazo sufre una transformación visual (tinte oscuro tipo consola/laboratorio con acentos neón) y el visor derecho del mazo pasa a ser un panel de analíticas avanzadas.

---

## Metadatos Requeridos en el Modelo de Carta

Para que los cálculos de probabilidad sean posibles, el JSON de cartas (Atlas) debe estar **enriquecido** con los siguientes campos técnicos. Sin ellos la IA no tiene base para calcular nada.

| Campo | Tipo | Descripción |
|---|---|---|
| `level` | `number \| null` | Nivel del Digimon (3–7). `null` para Option/Tamer. |
| `card_type` | `enum` | `'Digimon' \| 'Digiegg' \| 'Tamer' \| 'Option'` |
| `play_cost` | `number` | Coste de memoria para jugar la carta. |
| `digivolve_cost` | `number[]` | Array de costes de devolución (puede haber varios). |
| `tags_roles` | `string[]` | Array de roles funcionales. Ver tabla de valores más abajo. |
| `search_depth` | `number \| null` | Cuántas cartas revela el efecto buscador (ej. `3`). `null` si no aplica. |

### Valores posibles para `tags_roles`

| Valor | Descripción |
|---|---|
| `'searcher'` | La carta tiene un efecto de búsqueda/revelación del mazo. |
| `'draw_power'` | La carta permite robar cartas adicionales. |
| `'memory_boost'` | La carta otorga memoria al jugador activo. |
| `'removal'` | La carta elimina o borra Digimons/cartas del rival. |

---

## Módulo A — Optimizador de Mano Inicial y Turno 1-2

### Propósito
Calcular estadísticamente la viabilidad de las manos iniciales del mazo actual usando la **Fórmula Hipergeométrica** (probabilidad sin reposición) y simulaciones **Montecarlo** (10.000 iteraciones en segundo plano).

### Flujo Funcional

1. El usuario pulsa el botón **"Simular Mano"** dentro del Modo Lab.
2. El sistema ejecuta 10.000 simulaciones de robo aleatorio del mazo internamente (Montecarlo).
3. Se calculan y muestran las métricas en el panel de analíticas.

### Métricas a Mostrar

| Métrica | Descripción |
|---|---|
| **Brick Rate** | % de manos iniciales con 0 Digimon Lv3 (mano injugable). |
| **Salida Óptima Turno 1 (Going First)** | % de manos que contienen (Lv3 + buscador) o (Lv3 + Tamer de memoria). |
| **Consistencia Turno 2 (Going Second)** | % de éxito sumando la carta extra de robo por salir segundo. |
| **Mulligan Advisor** | Indicador tipo semáforo basado en la mano actual. |

### Mulligan Advisor — Lógica del Semáforo

| Estado | Condición | Mensaje |
|---|---|---|
| 🟢 Verde | Probabilidad de éxito > 75 % | "Mantener Mano" |
| 🔴 Rojo | Sin Lv3 ni buscadores en las primeras 5 cartas | "Hacer Mulligan" |

---

## Módulo B — Estadísticas de Curva y Composición

### Propósito
Transformar la composición del mazo en gráficos interactivos para que el jugador visualice desequilibrios estructurales de un vistazo.

> **Tecnología sugerida:** Chart.js (ligera) o componentes CSS puros generados por Copilot para mantener el bundle contenido.

### Gráficos a Implementar

#### 1. Curva de Niveles — Pirámide de Evolución
- **Tipo:** Gráfico de barras comparativo.
- **Datos:** Recuento de cartas por nivel (Lv3 / Lv4 / Lv5 / Lv6 / Lv7).
- **Alerta automática:** Si `count(Lv4) > count(Lv3)` → mostrar aviso:  
  _"Tienes más Lv4 que Lv3. Tu curva evolutiva se atascará."_

#### 2. Distribución por Tipo — Pie Chart
- **Tipo:** Gráfico de sectores.
- **Datos:** Porcentaje de Digimon / Tamers / Options sobre el total del mazo.

#### 3. Curva de Coste de Memoria — Histograma
- **Tipo:** Histograma.
- **Datos:** Coste de juego (`play_cost`) de las cartas Options y Tamers.
- **Objetivo:** Visualizar cuánta memoria se le regala al rival al jugar estas cartas en un turno.

---

## Utilidades Extra del Lab (Valor Añadido)

### 1. Simulador de Buscadores — Searcher Sandbox
- Para cada carta del mazo con `tags_roles.includes('searcher')` se muestra un botón interactivo **"Testear Buscador"**.
- Al pulsarlo, el sistema simula revelar las `search_depth` siguientes cartas del mazo real y muestra visualmente qué se habría robado.
- **Objetivo:** Comprobar si el ratio de objetivos buscables en el mazo es suficiente para que el buscador no fizzlee (falle sin encontrar nada).

### 2. Calculador de Fuentes Evolutivas — Inherited Effects
- Desglose analítico de cuántas cartas del mazo otorgan efectos heredados de:
  - Protección (reducción de daño, blindaje, etc.)
  - Robo (draw on digivolve, etc.)
  - Aumento de DP
- **Objetivo:** Determinar si la estrategia final del stack es puramente agresiva o de control.

### 3. Mano de Práctica Interactiva
- Zona visual en el panel Lab que muestra **5 cartas robadas aleatoriamente** del mazo.
- Botón **"Hacer Mulligan"**: sustituye la mano actual por otras 5 cartas.
- **Objetivo:** Permitir al jugador comprobar de forma tangible e intuitiva las estadísticas calculadas en el Módulo A.

---

## UI/UX — Transformación Visual al Activar el Modo Lab

| Elemento | Estado Normal | Estado Lab |
|---|---|---|
| Fondo del panel de mazo | Tema base del usuario | Tinte oscuro tipo consola (`#0d0d0d` o similar) |
| Acentos de color | Colores del tema activo | Luces neón (sugerencia: cyan `#00f5ff` o verde `#39ff14`) |
| Visor derecho | Lista del mazo / estadísticas básicas | Panel de analíticas avanzadas con módulos A y B |
| Botón activador | "Modo Lab" (toggle) | Estado activo resaltado con animación de pulso |

### Consideraciones de accesibilidad
- El cambio de tema Lab debe tener una **transición CSS suave** para no ser abrupto.
- Los colores neón de acento deben mantener un contraste mínimo **WCAG AA** sobre el fondo oscuro.
- El panel de analíticas debe ser **colapsable** para no obstaculizar la construcción del mazo.

---

## Notas de Implementación para Copilot

- Los cálculos Montecarlo son **CPU-bound**: considerar ejecutarlos en un **Web Worker** para no bloquear el hilo principal de Angular.
- El estado del Modo Lab debe persistirse en el servicio de estado del mazo activo (no en LocalStorage) para que se reinicie al cambiar de mazo.
- Los gráficos deben **reaccionar reactivamente** a cada cambio de composición del mazo (nuevo `BehaviorSubject` o `computed signal` según la versión de Angular en uso).
- Los `tags_roles` y `search_depth` se pueden enriquecer progresivamente: primero mapear las cartas más usadas en el meta y expandir desde ahí.
