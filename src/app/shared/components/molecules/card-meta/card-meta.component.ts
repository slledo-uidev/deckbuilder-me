import { Component, Input } from '@angular/core';

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
}
