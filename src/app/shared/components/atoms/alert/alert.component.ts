import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() message: string = '';
  @Input() title?: string;
  @Input() icon?: string;
  @Input() variant: 'info' | 'warning' | 'error' | 'error-login' | 'success' = 'info';
  @Input() size: 'small' | 'medium' = 'medium';

  ngOnInit(): void {
    // Set default icon if not provided
    if (!this.icon) {
      switch (this.variant) {
        case 'error':
        case 'error-login':
          this.icon = 'alert-circle';
          break;
        case 'warning':
          this.icon = 'alert-circle';
          break;
        case 'success':
          this.icon = 'check';
          break;
        case 'info':
          this.icon = 'info';
          break;
      }
    }
  }
}
