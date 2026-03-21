import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { DecksLibraryComponent } from './components/decks-library/decks-library.component';
import { AdvanceDeckListComponent } from './components/advance-deck-list/advance-deck-list.component';

const routes: Routes = [
  {
    path: '',
    component: DecksLibraryComponent
  }
];

@NgModule({
  declarations: [
    DecksLibraryComponent,
    AdvanceDeckListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DecksLibraryModule { }
