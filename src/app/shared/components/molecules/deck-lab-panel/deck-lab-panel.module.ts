import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  FlaskConical, BarChart3, Search, AlertCircle, Info, Check, Layout
} from 'lucide-angular';
import { DeckLabPanelComponent } from './deck-lab-panel.component';

@NgModule({
  declarations: [DeckLabPanelComponent],
  imports: [
    CommonModule,
    LucideAngularModule.pick({ FlaskConical, BarChart3, Search, AlertCircle, Info, Check, Layout })
  ],
  exports: [DeckLabPanelComponent]
})
export class DeckLabPanelModule {}
