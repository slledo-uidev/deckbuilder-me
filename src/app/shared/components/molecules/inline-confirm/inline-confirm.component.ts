import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-inline-confirm',
  templateUrl: './inline-confirm.component.html',
  styleUrls: ['./inline-confirm.component.scss']
})
export class InlineConfirmComponent {
  @Input() label: string = 'Delete';
  @Input() confirmLabel: string = 'Confirm?';
  @Input() variant: 'danger' | 'warning' | 'default' = 'danger';
  @Input() size: 'small' | 'medium' = 'small';
  
  @Output() confirmed = new EventEmitter<void>();

  isConfirming: boolean = false;

  onInitiate(): void {
    this.isConfirming = true;
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.isConfirming = false;
  }

  onCancel(): void {
    this.isConfirming = false;
  }
}
