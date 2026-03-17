import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() current: number = 0;
  @Input() max?: number;
  @Input() status: 'valid' | 'warning' | 'error' | 'default' = 'default';
  @Input() size: 'small' | 'medium' = 'medium';

  get displayText(): string {
    return this.max !== undefined ? `${this.current}/${this.max}` : `${this.current}`;
  }
}
