import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-save-deck-modal',
  templateUrl: './save-deck-modal.component.html',
  styleUrls: ['./save-deck-modal.component.scss']
})
export class SaveDeckModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() currentName = '';

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  deckName = '';
  nameError = '';

  ngOnChanges(): void {
    if (this.isVisible) {
      this.deckName = this.currentName || '';
      this.nameError = '';
    }
  }

  onConfirm(): void {
    const trimmed = this.deckName.trim();
    if (!trimmed) {
      this.nameError = 'Deck name is required';
      return;
    }
    if (trimmed.length > 60) {
      this.nameError = 'Name must be 60 characters or less';
      return;
    }
    this.save.emit(trimmed);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('save-deck-modal__backdrop')) {
      this.cancel.emit();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onConfirm();
    } else if (event.key === 'Escape') {
      this.cancel.emit();
    }
  }
}
