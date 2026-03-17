import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-item',
  templateUrl: './stat-item.component.html',
  styleUrls: ['./stat-item.component.scss']
})
export class StatItemComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() status: 'default' | 'valid' | 'warning' | 'error' = 'default';
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
