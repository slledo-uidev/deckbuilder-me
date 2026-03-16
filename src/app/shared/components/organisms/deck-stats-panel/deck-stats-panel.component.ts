import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

export interface DeckCard {
  card: any;
  quantity: number;
}

@Component({
  selector: 'app-deck-stats-panel',
  templateUrl: './deck-stats-panel.component.html',
  styleUrls: ['./deck-stats-panel.component.scss']
})
export class DeckStatsPanelComponent implements OnChanges {
  @Input() digiEggs: DeckCard[] = [];
  @Input() mainDeck: DeckCard[] = [];
  @Input() sideDeck: DeckCard[] = [];

  // Cost Curve Chart
  costCurveChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  costCurveChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Cost Curve by Level' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };
  costCurveChartType: ChartType = 'bar';

  // Color Distribution Chart
  colorDistributionChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  colorDistributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Color Distribution' }
    }
  };
  colorDistributionChartType: ChartType = 'doughnut';

  // Type Distribution Chart
  typeDistributionChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  typeDistributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Type Distribution' }
    }
  };
  typeDistributionChartType: ChartType = 'pie';

  // Statistics
  averageLevel: number = 0;
  averageCost: number = 0;
  totalCards: number = 0;
  costGaps: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['digiEggs'] || changes['mainDeck'] || changes['sideDeck']) {
      this.calculateStatistics();
    }
  }

  private calculateStatistics(): void {
    const allCards = [...this.digiEggs, ...this.mainDeck, ...this.sideDeck];
    this.totalCards = allCards.reduce((sum, dc) => sum + dc.quantity, 0);

    if (this.totalCards === 0) {
      this.resetCharts();
      return;
    }

    this.calculateCostCurve();
    this.calculateColorDistribution();
    this.calculateTypeDistribution();
    this.calculateAverages();
    this.identifyCostGaps();
  }

  private calculateCostCurve(): void {
    const costMap = new Map<number, number>();
    const mainCards = [...this.mainDeck];

    // Count cards by cost
    mainCards.forEach(dc => {
      const cost = dc.card.cost || 0;
      costMap.set(cost, (costMap.get(cost) || 0) + dc.quantity);
    });

    // Create labels for costs 0-15+
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 0; i <= 15; i++) {
      labels.push(i.toString());
      data.push(costMap.get(i) || 0);
    }

    this.costCurveChartData = {
      labels,
      datasets: [{
        data,
        label: 'Cards',
        backgroundColor: '#3498DB',
        borderColor: '#2980B9',
        borderWidth: 1
      }]
    };
  }

  private calculateColorDistribution(): void {
    const colorMap = new Map<string, number>();
    const mainCards = [...this.mainDeck];

    mainCards.forEach(dc => {
      const colors = dc.card.color || [];
      colors.forEach((color: string) => {
        colorMap.set(color, (colorMap.get(color) || 0) + dc.quantity);
      });
    });

    const colorConfig: { [key: string]: string } = {
      'Red': '#E74C3C',
      'Blue': '#3498DB',
      'Yellow': '#F1C40F',
      'Green': '#27AE60',
      'Black': '#2C3E50',
      'Purple': '#9B59B6',
      'White': '#ECF0F1'
    };

    const labels = Array.from(colorMap.keys());
    const data = Array.from(colorMap.values());
    const backgroundColor = labels.map(color => colorConfig[color] || '#95A5A6');

    this.colorDistributionChartData = {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    };
  }

  private calculateTypeDistribution(): void {
    const typeMap = new Map<string, number>();
    const mainCards = [...this.mainDeck];

    mainCards.forEach(dc => {
      const type = dc.card.type || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + dc.quantity);
    });

    const typeColors: { [key: string]: string } = {
      'Digimon': '#3498DB',
      'Tamer': '#E74C3C',
      'Option': '#F39C12',
      'Digi-Egg': '#9B59B6'
    };

    const labels = Array.from(typeMap.keys());
    const data = Array.from(typeMap.values());
    const backgroundColor = labels.map(type => typeColors[type] || '#95A5A6');

    this.typeDistributionChartData = {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    };
  }

  private calculateAverages(): void {
    const mainCards = [...this.mainDeck];
    let totalLevel = 0;
    let levelCount = 0;
    let totalCost = 0;
    let costCount = 0;

    mainCards.forEach(dc => {
      if (dc.card.level !== undefined && dc.card.level > 0) {
        totalLevel += dc.card.level * dc.quantity;
        levelCount += dc.quantity;
      }
      if (dc.card.cost !== undefined) {
        totalCost += dc.card.cost * dc.quantity;
        costCount += dc.quantity;
      }
    });

    this.averageLevel = levelCount > 0 ? Math.round((totalLevel / levelCount) * 10) / 10 : 0;
    this.averageCost = costCount > 0 ? Math.round((totalCost / costCount) * 10) / 10 : 0;
  }

  private identifyCostGaps(): void {
    const costMap = new Map<number, number>();
    const mainCards = [...this.mainDeck];

    mainCards.forEach(dc => {
      const cost = dc.card.cost || 0;
      costMap.set(cost, (costMap.get(cost) || 0) + dc.quantity);
    });

    this.costGaps = [];
    for (let i = 0; i <= 15; i++) {
      if (!costMap.has(i) || costMap.get(i) === 0) {
        this.costGaps.push(i);
      }
    }
  }

  private resetCharts(): void {
    this.costCurveChartData = { labels: [], datasets: [] };
    this.colorDistributionChartData = { labels: [], datasets: [] };
    this.typeDistributionChartData = { labels: [], datasets: [] };
    this.averageLevel = 0;
    this.averageCost = 0;
    this.costGaps = [];
  }

  get hasData(): boolean {
    return this.totalCards > 0;
  }

  get typeBreakdown(): { type: string; count: number; percentage: number }[] {
    if (!this.hasData) return [];

    const typeMap = new Map<string, number>();
    const mainCards = [...this.mainDeck];

    mainCards.forEach(dc => {
      const type = dc.card.type || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + dc.quantity);
    });

    const mainDeckTotal = mainCards.reduce((sum, dc) => sum + dc.quantity, 0);

    return Array.from(typeMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / mainDeckTotal) * 100)
    }));
  }
}
