import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() message: string = '';
  @Input() title?: string;
  @Input() icon?: string;
  @Input() variant: 'info' | 'warning' | 'error' | 'success' = 'info';
  @Input() size: 'small' | 'medium' = 'medium';
}
