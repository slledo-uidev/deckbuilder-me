import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collapsible-header',
  templateUrl: './collapsible-header.component.html',
  styleUrls: ['./collapsible-header.component.scss']
})
export class CollapsibleHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() isExpanded: boolean = false;
  @Input() status: 'valid' | 'warning' | 'error' | 'unknown' = 'unknown';
  
  @Output() toggle = new EventEmitter<void>();

  get statusIcon(): string {
    switch (this.status) {
      case 'valid': return '✓';
      case 'error': return '✗';
      case 'warning': return '!';
      default: return '?';
    }
  }

  onToggle(): void {
    this.toggle.emit();
  }
}
