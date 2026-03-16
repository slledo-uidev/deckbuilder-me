import { Component, Input } from '@angular/core';

export type CardVariant = 'default' | 'hover' | 'flat';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
  @Input() clickable: boolean = false;
  
  get cardClasses(): string {
    const classes = ['card'];
    classes.push(`card--${this.variant}`);
    classes.push(`card--padding-${this.padding}`);
    
    if (this.clickable) {
      classes.push('card--clickable');
    }
    
    return classes.join(' ');
  }
}
