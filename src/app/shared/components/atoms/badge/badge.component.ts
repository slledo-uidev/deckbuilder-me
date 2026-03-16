import { Component, Input } from '@angular/core';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'medium';
  @Input() rounded: boolean = false;
  
  get badgeClasses(): string {
    const classes = ['badge'];
    classes.push(`badge--${this.variant}`);
    classes.push(`badge--${this.size}`);
    
    if (this.rounded) {
      classes.push('badge--rounded');
    }
    
    return classes.join(' ');
  }
}
