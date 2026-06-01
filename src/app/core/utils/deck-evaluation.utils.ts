/**
 * Deck Evaluation Utilities — Motor de puntuación final para laboratorio TCG.
 *
 * Coordina los motores de análisis y devuelve score, grade y alertas.
 */

import { EnhancedCard } from '@models/index';
import { detectDeckEngine } from './deck-analysis.utils';
import { ProbabilityEngine } from './probability-engine';
import { generateDeckMetrics, DeckMetrics } from './deck-analytics.utils';

export interface DeckEvaluation {
  score: number;
  grade: 'A' | 'B' | 'C' | 'F';
  engine: string;
  alerts: string[];
  breakdown: DeckScoreBreakdown[];
}

export interface DeckScoreBreakdown {
  key: 'opening' | 'structure' | 'memory' | 'interaction';
  label: string;
  score: number;
  max: number;
  detail: string;
}

export function evaluateDeck(cards: EnhancedCard[]): DeckEvaluation {
  const alerts: string[] = [];
  let openingScore = 0;
  let structureScore = 0;
  let memoryScore = 0;
  let interactionScore = 0;

  // 1. Detectar engine
  const engine = detectDeckEngine(cards);
  // 2. Consistencia de apertura
  const consistencia = ProbabilityEngine.analizarConsistenciaMano(cards, engine);
  // 3. Métricas
  const metrics: DeckMetrics = generateDeckMetrics(cards);

  // ──────────────
  // Consistencia de Apertura (30 pts)
  // ──────────────
  const pApertura = consistencia.probabilidadExitoManoInicial;
  if (pApertura > 90) openingScore = 30;
  else if (pApertura >= 80) openingScore = 25;
  else if (pApertura < 70) {
    openingScore = 10;
    alerts.push('Riesgo de Ladrillo extremo en Turno 1');
  } else {
    openingScore = 15;
  }

  // ──────────────
  // Salud de la Estructura (30 pts)
  // ──────────────
  if (engine === 'CLASSIC_EVOLUTION') {
    // Pirámide ideal: Lv3 > Lv4 > Lv5 > Lv6
    const lv = metrics.levelDistribution;
    let estructuraPts = 30;
    const niveles = ['Lv3', 'Lv4', 'Lv5', 'Lv6'];
    for (let i = 0; i < niveles.length - 1; i++) {
      const curr = lv[niveles[i]] || 0;
      const next = lv[niveles[i + 1]] || 0;
      if (curr <= next) {
        estructuraPts -= 10;
        alerts.push(`Curva evolutiva invertida entre ${niveles[i]} y ${niveles[i + 1]}`);
      }
    }
    structureScore = Math.max(estructuraPts, 0);
  } else if (engine === 'ROYAL_KNIGHTS_ZOO') {
    // Más del 35% del mazo son Lv6/Lv7 y hay base de reducción de coste
    const lv = metrics.levelDistribution;
    const totalDigimon = Object.values(lv).reduce((a, b) => a + b, 0);
    const lv67 = (lv['Lv6'] || 0) + (lv['Lv7'] || 0);
    const ratio = totalDigimon > 0 ? lv67 / totalDigimon : 0;
    const tieneBase = cards.some(c => c.type === 'Tamer' && /yggdrasil|base|starter|egg|holy sword/i.test(c.name));
    if (ratio > 0.35 && tieneBase) {
      structureScore = 30;
    } else {
      structureScore = 15;
      if (!tieneBase) alerts.push('No se detecta base/reducción de coste para Royal Knights Zoo');
      if (ratio <= 0.35) alerts.push('Pocos Digimon de coste alto para Zoo');
    }
  } else if (engine.startsWith('ARCHETYPE_')) {
    // Al menos 60% de los Digimon comparten el trait principal
    const lv = metrics.levelDistribution;
    const totalDigimon = Object.values(lv).reduce((a, b) => a + b, 0);
    // Buscar trait dominante
    const trait = engine.replace('ARCHETYPE_', '').replace(/_/g, ' ');
    const digimonTrait = cards.filter(c => c.type === 'Digimon' && c.archetypes.some(a => a.toUpperCase().replace(/\W+/g, '_') === trait.replace(/\W+/g, '_').toUpperCase()));
    const ratio = totalDigimon > 0 ? digimonTrait.length / totalDigimon : 0;
    if (ratio >= 0.6) {
      structureScore = 30;
    } else {
      structureScore = 15;
      alerts.push('El rasgo principal no domina el 60% de los Digimon');
    }
  }

  // ──────────────
  // Economía de Memoria (20 pts, meta moderno)
  // ──────────────
  const memoryTamers = cards.filter(c => c.providesMemoryGuarantee).length;
  if (memoryTamers >= 3 && memoryTamers <= 5) {
    // Rango objetivo: consistencia estable sin sobrecargar slots.
    memoryScore = 20;
  } else if (memoryTamers >= 6 && memoryTamers <= 7) {
    // Aun funcional, pero normalmente ya sacrifica calidad de otras piezas.
    memoryScore = 15;
    alerts.push('Tienes muchos Tamers de memoria; la base es estable pero puede sobredensificar slots no reactivos');
  } else if (memoryTamers >= 1 && memoryTamers <= 2) {
    memoryScore = 10;
    alerts.push('Flujo de memoria moderado. Dependes de mantener las condiciones de tu Tamer para no quedarte atascado a 1 de memoria');
  } else if (memoryTamers >= 8) {
    memoryScore = 8;
    alerts.push('Exceso de Tamers de memoria. Estabilizas memoria, pero pierdes demasiado tempo/impacto de cartas activas');
  } else if (memoryTamers === 0) {
    memoryScore = 0;
    alerts.push('El mazo carece de Tamers de control de memoria. El rival podrá neutralizar tu ritmo dejándote a 1 constantemente');
  }

  // ──────────────
  // Kit de Interrupción / Respuesta (20 pts, refinado)
  // ──────────────
  // 1. Interrupción Reactiva (Options de control, [Counter], [Blast Digivolve])
  const controlOptionRE = /(delete|return|de-digivolve|suspend|reduce|remove|trash|bounce|cannot attack|cannot block|memory -|security -|unsuspend|rest|rested|unsuspend|blocker|prevent|negate|cancel|counter|blast digivolve)/i;
  const counterRE = /\[counter\]/i;
  const blastRE = /blast digivolve/i;
  const allTurnsRE = /\[all turns\]/i;
  const cloudRE = /(until (the(ir)?|your|opponent'?s) turn ends?)/i;
  // Options de control
  const controlOptions = cards.filter(c => c.type === 'Option' && controlOptionRE.test(c.effect || ''));
  // Cartas con [Counter] o [Blast Digivolve]
  const counterCards = cards.filter(c => counterRE.test(c.effect || '') || blastRE.test(c.effect || ''));
  // 2. Disuasión Estática: Digimon con [All Turns] y efecto de control
  const digimonAllTurns = cards.filter(c => c.type === 'Digimon' && allTurnsRE.test(c.effect || '') && controlOptionRE.test(c.effect || ''));
  // 3. Efectos Nube/Permanentes: "until their turn ends"
  const cloudEffects = cards.filter(c => cloudRE.test(c.effect || ''));

  // Suma total de cartas de interacción (sin duplicar cartas que cumplen varias)
  const interactionCardIds = new Set([
    ...controlOptions.map(c => c.name + c.effect),
    ...counterCards.map(c => c.name + c.effect),
    ...digimonAllTurns.map(c => c.name + c.effect),
    ...cloudEffects.map(c => c.name + c.effect)
  ]);
  const totalInteracciones = interactionCardIds.size;

  // Puntuación base
  let interaccionPts = 0;
  // Interrupción Reactiva (hasta 10 pts)
  const reactivos = new Set([...controlOptions.map(c => c.name + c.effect), ...counterCards.map(c => c.name + c.effect)]).size;
  interaccionPts += Math.min(reactivos, 5) * 2; // 2 pts por carta, máx 10
  // Disuasión Estática (hasta 10 pts)
  const disuasorios = new Set(digimonAllTurns.map(c => c.name + c.effect)).size;
  interaccionPts += Math.min(disuasorios, 5) * 2; // 2 pts por carta, máx 10
  // Efectos Nube/Permanentes (hasta 5 pts de bonus)
  const nube = new Set(cloudEffects.map(c => c.name + c.effect)).size;
  let nubeBonus = Math.min(nube, 5); // 1 pt por carta, máx 5

  // Regla de ratio saludable: si el total combinado está entre 4 y 8, se otorgan los 20 pts completos
  if (totalInteracciones >= 4 && totalInteracciones <= 8) {
    interaccionPts = 20;
  } else if (totalInteracciones === 0) {
    interaccionPts = 0;
    alerts.push('Mazo indefenso: No tienes ni opciones reactivas ni Digimon con presencia disuasoria en el turno rival');
  } else {
    // Suma normal, pero nunca más de 20
    interaccionPts = Math.min(interaccionPts + nubeBonus, 20);
  }
  interactionScore = interaccionPts;

  let score = openingScore + structureScore + memoryScore + interactionScore;

  // ──────────────
  // Grade
  // ──────────────
  let grade: DeckEvaluation['grade'] = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  const breakdown: DeckScoreBreakdown[] = [
    {
      key: 'opening',
      label: 'Consistencia de apertura',
      score: openingScore,
      max: 30,
      detail: `${pApertura.toFixed(1)}% de manos con inicio funcional`
    },
    {
      key: 'structure',
      label: 'Salud estructural',
      score: structureScore,
      max: 30,
      detail: `Engine detectado: ${engine}`
    },
    {
      key: 'memory',
      label: 'Economia de memoria',
      score: memoryScore,
      max: 20,
      detail: `${memoryTamers} tamers con garantia de memoria (optimo: 3-5)`
    },
    {
      key: 'interaction',
      label: 'Interaccion y respuesta',
      score: interactionScore,
      max: 20,
      detail: `${totalInteracciones} herramientas de interaccion detectadas`
    }
  ];

  return {
    score,
    grade,
    engine,
    alerts,
    breakdown
  };
}
