import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  templateUrl: './quantity-stepper.component.html',
  styleUrls: ['./quantity-stepper.component.scss']
})
export class QuantityStepperComponent {
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max?: number;
  @Input() decreaseDisabled: boolean = false;
  @Input() increaseDisabled: boolean = false;
  @Input() size: 'small' | 'medium' = 'medium';
  
  @Output() decrease = new EventEmitter<void>();
  @Output() increase = new EventEmitter<void>();

  get isDecreaseDisabled(): boolean {
    return this.decreaseDisabled || this.value <= this.min;
  }

  get isIncreaseDisabled(): boolean {
    return this.increaseDisabled || (this.max !== undefined && this.value >= this.max);
  }

  onDecrease(): void {
    if (!this.isDecreaseDisabled) {
      this.decrease.emit();
    }
  }

  onIncrease(): void {
    if (!this.isIncreaseDisabled) {
      this.increase.emit();
    }
  }
}
