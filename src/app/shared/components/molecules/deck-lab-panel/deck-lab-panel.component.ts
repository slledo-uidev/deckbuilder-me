import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EnhancedCard } from '@models/index';
import { evaluateDeck, DeckEvaluation, generateDeckMetrics, ProbabilityEngine } from '@core/utils';

type BreakdownItem = {
  key: 'opening' | 'structure' | 'memory' | 'interaction';
  label: string;
  score: number;
  max: number;
  detail: string;
};

@Component({
  selector: 'deck-lab-panel',
  templateUrl: './deck-lab-panel.component.html',
  styleUrls: ['./deck-lab-panel.component.scss']
})
export class DeckLabPanelComponent implements OnChanges {
  @Input() cards: EnhancedCard[] = [];

  evaluation: DeckEvaluation | null = null;
  metrics: any = null;
  consistencia: any = null;
  breakdown: BreakdownItem[] = [];
  searchersByType: { [type: string]: number } = {};
  totalSearchers = 0;

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.cards && this.cards.length > 0) {
      this.evaluation   = evaluateDeck(this.cards);
      this.breakdown    = this.evaluation?.breakdown ?? [];
      this.metrics      = generateDeckMetrics(this.cards);
      this.consistencia = ProbabilityEngine.analizarConsistenciaMano(this.cards, this.evaluation.engine);

      const searchers     = this.cards.filter(c => c.isSearcher);
      this.totalSearchers = searchers.length;
      this.searchersByType = { Tamer: 0 };
      for (const s of searchers) {
        this.searchersByType[s.type] = (this.searchersByType[s.type] || 0) + 1;
      }
    }
  }

  isCritical(alert: string): boolean {
    return /ladrillo|carece|invertida|vulnerable|riesgo|no se detecta/i.test(alert);
  }

  getTypeValue(val: unknown): { count: number; percent: number } {
    return val as { count: number; percent: number };
  }

  getSearcherPercent(count: number): number {
    if (this.totalSearchers <= 0) {
      return 0;
    }
    return (count / this.totalSearchers) * 100;
  }

  getTypeDistributionPercent(count: number): number {
    if (!this.cards.length) {
      return 0;
    }
    return Math.round((count / this.cards.length) * 100);
  }

  getTypeColor(type: unknown): string {
    switch ((type as string)?.toLowerCase()) {
      case 'digimon':  return 'var(--color-type-digimon)';
      case 'tamer':    return 'var(--color-type-tamer)';
      case 'option':   return 'var(--color-type-option)';
      case 'digi-egg': return 'var(--color-type-digi-egg)';
      default:         return 'var(--color-primary)';
    }
  }

  getBreakdownPercent(item: BreakdownItem): number {
    if (!item?.max) return 0;
    return (item.score / item.max) * 100;
  }

  getBreakdownBarColor(item: BreakdownItem): string {
    switch (item.key) {
      case 'opening': return '#00e5ff';
      case 'structure': return '#7c4dff';
      case 'memory': return '#ffab00';
      case 'interaction': return '#00e676';
      default: return 'var(--color-primary)';
    }
  }
}