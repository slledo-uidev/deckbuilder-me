import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AppUser } from '@models/user.model';
import { ProfileService, DefaultLibraryView } from '@services/profile.service';

export type LibraryMode = DefaultLibraryView;

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

  constructor(private profileService: ProfileService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue === true) {
      this.libraryMode = this.profileService.defaultLibraryView;
    }
  }

  setLibraryMode(mode: LibraryMode): void {
    this.libraryMode = mode;
  }

  onSave(): void {
    this.profileService.setDefaultLibraryView(this.libraryMode);
    this.libraryModeChanged.emit(this.libraryMode);
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
