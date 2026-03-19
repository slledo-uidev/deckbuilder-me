import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { LucideAngularModule, X, ChevronDown, ChevronUp, Plus, Minus, Trash2, Check, AlertCircle, Info, Save, Download, Upload, Filter, Search, BarChart3, PieChart, Layout, Layers, Package, Inbox, RotateCcw, Sun, Moon } from 'lucide-angular';

// Atoms
import { ButtonComponent } from './components/atoms/button/button.component';
import { InputComponent } from './components/atoms/input/input.component';
import { CardComponent } from './components/atoms/card/card.component';
import { BadgeComponent } from './components/atoms/badge/badge.component';
import { IconButtonComponent } from './components/atoms/icon-button/icon-button.component';
import { EmptyStateComponent } from './components/atoms/empty-state/empty-state.component';
import { StatusBadgeComponent } from './components/atoms/status-badge/status-badge.component';
import { QuantityStepperComponent } from './components/atoms/quantity-stepper/quantity-stepper.component';
import { StatItemComponent } from './components/atoms/stat-item/stat-item.component';
import { AlertComponent } from './components/atoms/alert/alert.component';
import { SectionTitleComponent } from './components/atoms/section-title/section-title.component';
import { ThemeToggleComponent } from './components/atoms/theme-toggle/theme-toggle.component';

// Molecules
import { SearchBarComponent } from './components/molecules/search-bar/search-bar.component';
import { FilterPanelComponent } from './components/molecules/filter-panel/filter-panel.component';
import { DeckZoneComponent } from './components/molecules/deck-zone/deck-zone.component';
import { ValidationPanelComponent } from './components/molecules/validation-panel/validation-panel.component';
import { SaveDeckModalComponent } from './components/molecules/save-deck-modal/save-deck-modal.component';
import { ModalComponent } from './components/molecules/modal/modal.component';
import { CardMetaComponent } from './components/molecules/card-meta/card-meta.component';
import { SectionHeaderComponent } from './components/molecules/section-header/section-header.component';
import { CollapsibleHeaderComponent } from './components/molecules/collapsible-header/collapsible-header.component';
import { InlineConfirmComponent } from './components/molecules/inline-confirm/inline-confirm.component';
import { NavBarComponent } from './components/molecules/nav-bar/nav-bar.component';
import { ImportDeckModalComponent } from './components/molecules/import-deck-modal/import-deck-modal.component';

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
  IconButtonComponent,
  EmptyStateComponent,
  StatusBadgeComponent,
  QuantityStepperComponent,
  StatItemComponent,
  AlertComponent,
  ThemeToggleComponent,
  SectionTitleComponent,
  // Molecules
  SearchBarComponent,
  FilterPanelComponent,
  DeckZoneComponent,
  ValidationPanelComponent,
  SaveDeckModalComponent,
  ModalComponent,
  CardMetaComponent,
  SectionHeaderComponent,
  CollapsibleHeaderComponent,
  InlineConfirmComponent,
  NavBarComponent,
  ImportDeckModalComponent,
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
    RouterModule,
    NgChartsModule,
    LucideAngularModule.pick({ 
      X, 
      ChevronDown, 
      ChevronUp, 
      Plus, 
      Minus, 
      Trash2, 
      Check, 
      AlertCircle, 
      Info, 
      Save, 
      Download, 
      Upload, 
      Filter, 
      Search, 
      BarChart3, 
      PieChart, 
      Layout,
      Layers,
      Package,
      Inbox,
      RotateCcw,
      Sun,
      Moon
    })
  ],
  exports: [...COMPONENTS, LucideAngularModule]
})
export class SharedModule { }
