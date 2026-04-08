import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DecksLibraryComponent } from './components/decks-library/decks-library.component';

const routes: Routes = [
  {
    path: '',
    component: DecksLibraryComponent
  }
];

@NgModule({
  declarations: [
    DecksLibraryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DecksLibraryModule { }
