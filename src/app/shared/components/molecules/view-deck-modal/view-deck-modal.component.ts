import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Deck, Card, CardType } from '@core/models';
import { mapApiCardToEnhanced, detectDeckEngine, ProbabilityEngine } from '@core/utils';
import { EnhancedCard } from '@models/index';

export type ViewDeckTab = 'preview' | 'decklist';

// ── Lab types ────────────────────────────────────────────────────────────────
export interface LabSimResults {
  brickRate: number;
  optimalT1: number;
  consistencyT2: number;
  mulliganAdvice: 'keep' | 'mulligan' | 'pending';
}

export interface LabCurveEntry {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface LabTypeEntry {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface PracticeCard {
  cardId: string;
  name: string;
  imageUrl: string;
}

export interface PracticeState {
  hand: PracticeCard[];
  security: PracticeCard[];
  drawPile: PracticeCard[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<number, string> = {
  2: '#FFC107',
  3: '#00e5ff',
  4: '#7c4dff',
  5: '#ff6d00',
  6: '#f50057',
  7: '#76ff03',
};

const TYPE_COLORS: Record<string, string> = {
  Digimon:  '#00e5ff',
  'Digi-Egg': '#FFC107',
  Tamer:    '#7c4dff',
  Option:   '#ff6d00',
};

@Component({
  selector: 'app-view-deck-modal',
  templateUrl: './view-deck-modal.component.html',
  styleUrls: ['./view-deck-modal.component.scss'],
  animations: [
    trigger('slidePanel', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('520ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('520ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(100%)' }))
      ])
    ]),
    trigger('labSlide', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('380ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('380ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class ViewDeckModalComponent implements OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Input() deck: Deck | null = null;
  @Input() allCards: Card[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() openInEditor = new EventEmitter<void>();
  @Output() exportDeck = new EventEmitter<void>();
  @Output() deleteDeck = new EventEmitter<void>();

  activeTab: ViewDeckTab = 'preview';

  // ── Lab state ──────────────────────────────────────────────────────────────
  labOpen = false;
  labResults: LabSimResults | null = null;
  labLevelCurve: LabCurveEntry[] = [];
  labTypeDist: LabTypeEntry[] = [];
  practiceHand: PracticeCard[] = [];
  practiceState: PracticeState | null = null;
  labCurveAlert: string | null = null;
  labPieSegments: string = '';
  deckLabCards: EnhancedCard[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      document.body.style.overflow = changes['isVisible'].currentValue ? 'hidden' : '';
      if (!changes['isVisible'].currentValue) {
        this.labOpen = false;
        this.labResults = null;
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  setTab(tab: ViewDeckTab): void {
    this.activeTab = tab;
  }

  onClose(): void {
    this.activeTab = 'preview';
    this.labOpen = false;
    this.close.emit();
  }

  onOpenInEditor(): void {
    this.openInEditor.emit();
  }

  onExportDeck(): void {
    this.exportDeck.emit();
  }

  onDeleteDeck(): void {
    this.deleteDeck.emit();
  }

  // ── Lab: toggle ────────────────────────────────────────────────────────────
  toggleLab(): void {
    this.labOpen = !this.labOpen;
    if (this.labOpen) {
      this._buildStaticCharts();
      this.simulateHands();
      this._dealPracticeHand();
      this.prepareLabCards();
    }
  }

  prepareLabCards(): void {
    if (!this.deck) { this.deckLabCards = []; return; }
    const flat: EnhancedCard[] = [];
    for (const dc of this.deck.mainDeck) {
      const card = this.allCards.find(c => c.id === dc.cardId);
      if (card) {
        const enhanced = mapApiCardToEnhanced(card);
        for (let i = 0; i < dc.quantity; i++) flat.push(enhanced);
      }
    }
    this.deckLabCards = flat;
  }

  // ── Lab: expand flat card list from deck ──────────────────────────────────
  private _expandDeck(): Card[] {
    if (!this.deck) return [];
    const expanded: Card[] = [];
    for (const dc of this.deck.mainDeck) {
      const card = this.allCards.find(c => c.id === dc.cardId);
      if (card) {
        for (let i = 0; i < dc.quantity; i++) expanded.push(card);
      }
    }
    return expanded;
  }

  // ── Lab: Fisher-Yates shuffle ─────────────────────────────────────────────
  private _shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Lab: is a hand "good" (has Lv3 + searcher or Lv3 + Tamer) ────────────
  private _isOptimalHand(hand: Card[]): boolean {
    const hasLv3 = hand.some(c => c.type === CardType.Digimon && c.level === 3);
    const hasSearcher = hand.some(c => this._isSearcher(c));
    const hasTamer = hand.some(c => c.type === CardType.Tamer);
    return hasLv3 && (hasSearcher || hasTamer);
  }

  private _isSearcher(card: Card): boolean {
    if (!card.effect) return false;
    const eff = card.effect.toLowerCase();
    return eff.includes('reveal') || eff.includes('search') || eff.includes('look at') || eff.includes('add 1') || eff.includes('add a');
  }

  // ── Lab: Montecarlo simulation ─────────────────────────────────────────────
  simulateHands(): void {
    const deckCards = this._expandDeck();
    if (deckCards.length < 5) return;

    // Brick rate unificado con el motor probabilistico del deck-lab-panel.
    const enhancedDeck = deckCards.map(c => mapApiCardToEnhanced(c));
    const engine = detectDeckEngine(enhancedDeck);
    const consistencia = ProbabilityEngine.analizarConsistenciaMano(enhancedDeck, engine);

    const ITERATIONS = 10000;
    const HAND_SIZE = 5;

    let optT1Count = 0;
    let optT2Count = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      const shuffled = this._shuffle(deckCards);
      const hand5 = shuffled.slice(0, HAND_SIZE);
      const hand6 = shuffled.slice(0, HAND_SIZE + 1);

      if (this._isOptimalHand(hand5)) optT1Count++;
      if (this._isOptimalHand(hand6)) optT2Count++;
    }

    const brickRate   = Math.round(consistencia.brickRate);
    const optT1       = Math.round((optT1Count  / ITERATIONS) * 100);
    const optT2       = Math.round((optT2Count  / ITERATIONS) * 100);

    const mulliganAdvice: 'keep' | 'mulligan' = optT1 > 75 ? 'keep' : 'mulligan';

    this.labResults = { brickRate, optimalT1: optT1, consistencyT2: optT2, mulliganAdvice };
  }

  // ── Lab: static charts ─────────────────────────────────────────────────────
  private _buildStaticCharts(): void {
    const deckCards = this._expandDeck();
    const total = deckCards.length;
    if (total === 0) return;

    // Level curve (main deck only)
    const levelMap: Record<number, number> = {};
    for (const c of deckCards) {
      if (c.type === CardType.Digimon && c.level != null) {
        levelMap[c.level] = (levelMap[c.level] || 0) + 1;
      }
    }
    const levels = [3, 4, 5, 6, 7].filter(l => levelMap[l] > 0);
    const maxLevelCount = Math.max(...levels.map(l => levelMap[l] || 0), 1);
    this.labLevelCurve = levels.map(l => ({
      label: `Lv${l}`,
      count: levelMap[l] || 0,
      pct: Math.round(((levelMap[l] || 0) / maxLevelCount) * 100),
      color: LEVEL_COLORS[l] || '#888'
    }));

    // Curve alert
    const lv3 = levelMap[3] || 0;
    const lv4 = levelMap[4] || 0;
    this.labCurveAlert = lv4 > lv3
      ? `Tienes más Lv4 (${lv4}) que Lv3 (${lv3}). Tu curva evolutiva se atascará.`
      : null;

    // Type distribution (excluyendo Digi-Egg)
    const typeMap: Partial<Record<string, number>> = {};
    for (const c of deckCards) {
      if (c.type === 'Digi-Egg') continue;
      const key = c.type as string;
      typeMap[key] = (typeMap[key] || 0) + 1;
    }
    const typeTotal = Object.values(typeMap).reduce((a, b) => (a || 0) + (b || 0), 0) || 1;
    this.labTypeDist = Object.entries(typeMap)
      .filter(([, v]) => (v || 0) > 0)
      .map(([label, count]) => ({
        label,
        count: count || 0,
        pct: Math.round(((count || 0) / typeTotal) * 100),
        color: TYPE_COLORS[label] || '#888'
      }));

    // Pie conic-gradient
    let cumPct = 0;
    this.labPieSegments = this.labTypeDist
      .map(e => {
        const start = cumPct;
        cumPct += e.pct;
        return `${e.color} ${start}% ${cumPct}%`;
      })
      .join(', ');

  }

  // ── Lab: practice hand ─────────────────────────────────────────────────────
  _dealPracticeHand(): void {
    const deckCards = this._expandDeck();
    if (deckCards.length < 15) {
      this.practiceHand = [];
      this.practiceState = null;
      return;
    }
    const shuffled = this._shuffle(deckCards);
    const toCard = (c: Card): PracticeCard => ({
      cardId: c.id,
      name: c.name,
      imageUrl: this.getPlaceholderUrl(c.id)
    });
    const hand     = shuffled.slice(0, 5).map(toCard);
    const security = shuffled.slice(5, 10).map(toCard);
    const drawPile = shuffled.slice(10, 35).map(toCard);

    this.practiceHand  = hand;
    this.practiceState = { hand, security, drawPile };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getCombinedCardList() {
    if (!this.deck) return [];
    return [...this.deck.digiEggs, ...this.deck.mainDeck];
  }

  getCardName(cardId: string): string {
    const card = this.allCards.find(c => c.id === cardId);
    return card ? card.name : cardId;
  }

  getPlaceholderUrl(cardId?: string): string {
    if (!cardId) return 'https://via.placeholder.com/150x210?text=No+Cards';
    const card = this.allCards.find(c => c.id === cardId);
    if (card && (card as any).imageUrl) return (card as any).imageUrl;
    return `https://images.digimoncard.io/images/cards/${cardId}.jpg`;
  }

  getMainCount(deck?: Deck | null): number {
    if (!deck) return 0;
    return deck.mainDeck.reduce((sum, dc) => sum + (dc.quantity || 0), 0);
  }

  getDigiEggCount(deck?: Deck | null): number {
    if (!deck) return 0;
    return deck.digiEggs.reduce((sum, dc) => sum + (dc.quantity || 0), 0);
  }
}
