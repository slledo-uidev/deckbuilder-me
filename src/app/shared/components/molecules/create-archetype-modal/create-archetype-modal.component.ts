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
  @Input() existingNames: string[] = [];

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
    const duplicate = this.existingNames
      .some(n => n.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      this.nameError = `An archetype named "${trimmed}" already exists`;
      return;
    }

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
