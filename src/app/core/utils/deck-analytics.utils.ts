/**
 * Deck Analytics Utilities — Métricas detalladas para análisis de mazos Digimon TCG.
 *
 * Provee la función generateDeckMetrics(cards) para obtener ratios y distribuciones clave.
 */

import { EnhancedCard, CardType, Color } from '@models/index';

export interface DeckMetrics {
  typeDistribution: {
    [type: string]: { count: number; percent: number }
  };
  levelDistribution: {
    [level: string]: number;
  };
  memoryCurva: {
    avgPlayCostDigimon: number;
    avgPlayCostOption: number;
    tamerMemorySetters: number;
  };
  colorDensity: {
    [color: string]: number;
  };
}

export function generateDeckMetrics(cards: EnhancedCard[]): DeckMetrics {
  // Excluir DigiEgg del conteo principal
  const mainDeck = cards.filter(c => c.type !== CardType.DigiEgg);
  const totalMain = mainDeck.length;

  // ──────────────
  // Type Distribution
  // ──────────────
  const typeCounts: { [type: string]: number } = {};
  for (const card of mainDeck) {
    typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
  }
  // DigiEgg sí se cuenta en la métrica, pero no en el %
  const eggCount = cards.filter(c => c.type === CardType.DigiEgg).length;
  if (eggCount > 0) typeCounts[CardType.DigiEgg] = eggCount;

  const typeDistribution: DeckMetrics['typeDistribution'] = {};
  for (const [type, count] of Object.entries(typeCounts)) {
    typeDistribution[type] = {
      count,
      percent: type === CardType.DigiEgg ? 0 : +(count / totalMain * 100).toFixed(2)
    };
  }

  // ──────────────
  // Level Distribution
  // ──────────────
  const levelDistribution: DeckMetrics['levelDistribution'] = {};
  for (const card of mainDeck) {
    if (card.type === CardType.Digimon && typeof card.level === 'number') {
      const lv = `Lv${card.level}`;
      levelDistribution[lv] = (levelDistribution[lv] || 0) + 1;
    }
  }

  // ──────────────
  // Memory Curve
  // ──────────────
  let sumCostDigimon = 0, countDigimon = 0;
  let sumCostOption = 0, countOption = 0;
  let tamerMemorySetters = 0;
  for (const card of mainDeck) {
    if (card.type === CardType.Digimon && typeof card.cost === 'number') {
      sumCostDigimon += card.cost;
      countDigimon++;
    }
    if (card.type === CardType.Option && typeof card.cost === 'number') {
      sumCostOption += card.cost;
      countOption++;
    }
    if (card.type === CardType.Tamer && (card.cost === 3 || card.cost === 4)) {
      tamerMemorySetters++;
    }
  }
  const avgPlayCostDigimon = countDigimon ? +(sumCostDigimon / countDigimon).toFixed(2) : 0;
  const avgPlayCostOption = countOption ? +(sumCostOption / countOption).toFixed(2) : 0;

  // ──────────────
  // Color Density
  // ──────────────
  const colorDensity: DeckMetrics['colorDensity'] = {};
  for (const card of mainDeck) {
    if (Array.isArray(card.color)) {
      for (const color of card.color) {
        colorDensity[color] = (colorDensity[color] || 0) + 1;
      }
    }
  }

  return {
    typeDistribution,
    levelDistribution,
    memoryCurva: {
      avgPlayCostDigimon,
      avgPlayCostOption,
      tamerMemorySetters
    },
    colorDensity
  };
}
