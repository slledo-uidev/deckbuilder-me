import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ToggleSwitchSize = 'small' | 'medium' | 'large';
export type ToggleLabelPosition = 'left' | 'right';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss']
})
export class ToggleSwitchComponent {
  @Input() checked: boolean = false;
  @Input() label: string = '';
  @Input() labelPosition: ToggleLabelPosition = 'right';
  @Input() size: ToggleSwitchSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() ariaLabel?: string;

  @Output() toggled = new EventEmitter<boolean>();

  get hostClasses(): string {
    const classes = ['toggle-switch'];
    classes.push(`toggle-switch--${this.size}`);
    if (this.disabled) classes.push('toggle-switch--disabled');
    if (this.labelPosition === 'left') classes.push('toggle-switch--label-left');
    return classes.join(' ');
  }

  onToggle(): void {
    if (this.disabled) return;
    this.toggled.emit(!this.checked);
  }
}
