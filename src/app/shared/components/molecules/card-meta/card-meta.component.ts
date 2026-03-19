import { Component, Input } from '@angular/core';
import { BadgeVariant } from '../../atoms/badge/badge.component';

@Component({
  selector: 'app-card-meta',
  templateUrl: './card-meta.component.html',
  styleUrls: ['./card-meta.component.scss']
})
export class CardMetaComponent {
  @Input() type: string = '';
  @Input() code: string = '';
  @Input() cost?: number | string;
  @Input() level?: number | string;
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'small' | 'medium' = 'small';
  
  getTypeBadgeVariant(type: string): BadgeVariant {
    const typeMap: { [key: string]: BadgeVariant } = {
      'Digimon': 'digimon',
      'Tamer': 'tamer',
      'Option': 'option',
      'Digi-Egg': 'digi-egg'
    };
    return typeMap[type] || 'default';
  }
}
