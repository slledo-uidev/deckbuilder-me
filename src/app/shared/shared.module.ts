import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

// Atoms
import { ButtonComponent } from './components/atoms/button/button.component';
import { InputComponent } from './components/atoms/input/input.component';
import { CardComponent } from './components/atoms/card/card.component';
import { BadgeComponent } from './components/atoms/badge/badge.component';

// Molecules
import { SearchBarComponent } from './components/molecules/search-bar/search-bar.component';
import { FilterPanelComponent } from './components/molecules/filter-panel/filter-panel.component';
import { DeckZoneComponent } from './components/molecules/deck-zone/deck-zone.component';
import { ValidationPanelComponent } from './components/molecules/validation-panel/validation-panel.component';
import { SaveDeckModalComponent } from './components/molecules/save-deck-modal/save-deck-modal.component';

// Organisms
import { CardGridComponent } from './components/organisms/card-grid/card-grid.component';
import { DeckStatsPanelComponent } from './components/organisms/deck-stats-panel/deck-stats-panel.component';
import { DeckListPanelComponent } from './components/organisms/deck-list-panel/deck-list-panel.component';

const COMPONENTS = [
  // Atoms
  ButtonComponent,
  InputComponent,
  CardComponent,
  BadgeComponent,
  // Molecules
  SearchBarComponent,
  FilterPanelComponent,
  DeckZoneComponent,
  ValidationPanelComponent,
  SaveDeckModalComponent,
  // Organisms
  CardGridComponent,
  DeckStatsPanelComponent,
  DeckListPanelComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule
  ],
  exports: [...COMPONENTS]
})
export class SharedModule { }
