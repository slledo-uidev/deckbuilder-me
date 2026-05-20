import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AppUser } from '@models/user.model';
import { StorageService } from '@services/storage.service';

export type LibraryMode = 'decklist' | 'advanced';

@Component({
  selector: 'app-user-settings-modal',
  templateUrl: './user-settings-modal.component.html',
  styleUrls: ['./user-settings-modal.component.scss']
})
export class UserSettingsModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() currentUser: AppUser | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() libraryModeChanged = new EventEmitter<LibraryMode>();

  libraryMode: LibraryMode = 'decklist';

  constructor(private storageService: StorageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue === true) {
      const settings = this.storageService.getSettings();
      this.libraryMode = settings?.libraryMode || 'decklist';
    }
  }

  setLibraryMode(mode: LibraryMode): void {
    this.libraryMode = mode;
  }

  onSave(): void {
    const settings = this.storageService.getSettings();
    this.storageService.saveSettings({ ...settings, libraryMode: this.libraryMode });
    this.libraryModeChanged.emit(this.libraryMode);
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
