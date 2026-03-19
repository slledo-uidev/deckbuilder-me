import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-import-deck-modal',
  templateUrl: './import-deck-modal.component.html',
  styleUrls: ['./import-deck-modal.component.scss']
})
export class ImportDeckModalComponent {
  @Input() isVisible = false;
  @Output() import = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  decklistText = '';
  errorMessage = '';

  onImportClick(): void {
    if (!this.decklistText.trim()) {
      this.errorMessage = 'Please paste a decklist';
      return;
    }

    this.errorMessage = '';
    this.import.emit(this.decklistText);
    this.decklistText = '';
  }

  onCancelClick(): void {
    this.decklistText = '';
    this.errorMessage = '';
    this.cancel.emit();
  }

  onTextChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}
