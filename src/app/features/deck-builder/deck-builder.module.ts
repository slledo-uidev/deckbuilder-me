import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DeckBuilderComponent } from './components/deck-builder/deck-builder.component';

const routes: Routes = [
  {
    path: '',
    component: DeckBuilderComponent
  }
];

@NgModule({
  declarations: [
    DeckBuilderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DeckBuilderModule { }
