import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DeckArchetypeGroup } from '@core/models';

@Component({
  selector: 'app-archetype-grid',
  templateUrl: './archetype-grid.component.html',
  styleUrls: ['./archetype-grid.component.scss']
})
export class ArchetypeGridComponent {
  @Input() groups: DeckArchetypeGroup[] = [];
  @Input() loading: boolean = false;

  @Output() groupSelected = new EventEmitter<DeckArchetypeGroup>();

  onGroupSelected(group: DeckArchetypeGroup): void {
    this.groupSelected.emit(group);
  }
}
