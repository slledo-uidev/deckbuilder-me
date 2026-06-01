/**
 * ProbabilityEngine — Herramientas matemáticas para análisis de consistencia en TCGs.
 *
 * Incluye cálculo hipergeométrico puro y análisis de consistencia de mano inicial.
 * Sin dependencias externas. Seguro para decks grandes (usa log-factorial para evitar overflow).
 */

import { EnhancedCard } from '@models/index';

export class ProbabilityEngine {
  /**
   * Calcula la probabilidad hipergeométrica de obtener al menos x éxitos en n extracciones.
   *
   * @param N Tamaño total del mazo
   * @param k Número de cartas "éxito" en el mazo
   * @param n Número de cartas que robas
   * @param x Número mínimo de éxitos deseados
   * @returns Probabilidad (0..1)
   */
  static calcularHipergeometrica(N: number, k: number, n: number, x: number): number {
    // Suma P(X >= x) = sum_{i=x}^{min(k, n)} [C(k, i) * C(N-k, n-i)] / C(N, n)
    let prob = 0;
    const maxI = Math.min(k, n);
    for (let i = x; i <= maxI; i++) {
      prob += ProbabilityEngine.combinatoria(k, i) * ProbabilityEngine.combinatoria(N - k, n - i);
    }
    prob /= ProbabilityEngine.combinatoria(N, n);
    return prob;
  }

  /**
   * Combinatoria eficiente: C(n, k) = n! / (k! * (n-k)!) usando log-factorial para evitar overflow.
   */
  static combinatoria(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    // log(n!) - log(k!) - log((n-k)!)
    const logC = ProbabilityEngine.logFactorial(n) - ProbabilityEngine.logFactorial(k) - ProbabilityEngine.logFactorial(n - k);
    return Math.round(Math.exp(logC));
  }

  /**
   * log(n!) usando la aproximación de Stirling para n grande.
   */
  static logFactorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 0;
    // Para n grande, Stirling es muy preciso
    if (n > 20) {
      return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
    }
    // Para n pequeño, calculo directo
    let res = 0;
    for (let i = 2; i <= n; i++) res += Math.log(i);
    return res;
  }

  /**
   * Analiza la consistencia de la mano inicial según el tipo de engine y cartas.
   * @param cartas Deck plano de EnhancedCard (cada copia es un elemento)
   * @param tipoEngine String de engine detectado
   */
  static analizarConsistenciaMano(cartas: EnhancedCard[], tipoEngine: string) {
    const N = cartas.length;
    let cartasInicio: EnhancedCard[] = [];

    if (tipoEngine === 'CLASSIC_EVOLUTION' || tipoEngine.startsWith('ARCHETYPE_')) {
      cartasInicio = cartas.filter(c => (c.level === 3 && c.type === 'Digimon') || c.isSearcher);
    } else if (tipoEngine === 'ROYAL_KNIGHTS_ZOO') {
      // Coste reducido: cost <= 4, o Tamer base clave
      cartasInicio = cartas.filter(c => (c.type === 'Tamer' && /yggdrasil|base|starter|egg|holy sword/i.test(c.name)) || (typeof c.cost === 'number' && c.cost <= 4));
    }
    // Otros engines: se puede extender aquí

    const k = cartasInicio.length;
    const n1 = 5; // Mano inicial
    const n2 = 6; // Mano + robo turno 2

    // Probabilidad de al menos 1 carta de inicio en mano inicial
    const p1 = ProbabilityEngine.calcularHipergeometrica(N, k, n1, 1);
    // Probabilidad de al menos 1 carta de inicio en mano + robo
    const p2 = ProbabilityEngine.calcularHipergeometrica(N, k, n2, 1);
    // Brick rate: probabilidad de 0 cartas útiles
    const brick = ProbabilityEngine.calcularHipergeometrica(N, k, n1, 0) - ProbabilityEngine.calcularHipergeometrica(N, k, n1, 1);

    // Recomendación
    let mulliganRecomendacion = '';
    if (brick > 0.20) mulliganRecomendacion = 'RECOMENDADO';
    else if (brick > 0.10) mulliganRecomendacion = 'ESTABLE';
    else mulliganRecomendacion = 'EXCELENTE';

    return {
      probabilidadExitoManoInicial: +(p1 * 100).toFixed(2),
      probabilidadExitoConRoboTurno2: +(p2 * 100).toFixed(2),
      brickRate: +(brick * 100).toFixed(2),
      mulliganRecomendacion
    };
  }
}
