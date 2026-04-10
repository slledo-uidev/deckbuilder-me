import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface CreateArchetypeData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-create-archetype-modal',
  templateUrl: './create-archetype-modal.component.html',
  styleUrls: ['./create-archetype-modal.component.scss']
})
export class CreateArchetypeModalComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  // Optional server-side error message to display (e.g. "already exists")
  @Input() serverError?: string;

  @Output() saved = new EventEmitter<CreateArchetypeData>();
  @Output() cancelled = new EventEmitter<void>();

  name: string = '';
  description: string = '';
  nameError: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.name = '';
      this.description = '';
      this.nameError = '';
    }
    // Clear client-side nameError when modal is reopened; serverError comes
    // from parent and is displayed separately.
  }

  onConfirm(): void {
    const trimmed = this.name.trim();

    if (!trimmed) {
      this.nameError = 'Archetype name is required';
      return;
    }
    if (trimmed.length > 60) {
      this.nameError = 'Name must be 60 characters or less';
      return;
    }

    // Emit to parent — uniqueness check and persistence should be done on the server.
    this.saved.emit({ name: trimmed, description: this.description.trim() });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.onConfirm(); }
    if (event.key === 'Escape') { this.onCancel(); }
  }
}
