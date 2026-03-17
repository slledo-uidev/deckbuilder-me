import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  templateUrl: './section-title.component.html',
  styleUrls: ['./section-title.component.scss']
})
export class SectionTitleComponent {
  @Input() title: string = '';
  @Input() count?: number;
  @Input() level: 'h2' | 'h3' | 'h4' = 'h3';
  @Input() variant: 'default' | 'error' | 'warning' | 'success' = 'default';
}
