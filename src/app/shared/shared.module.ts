import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Atoms
import { ButtonComponent } from './components/atoms/button/button.component';
import { InputComponent } from './components/atoms/input/input.component';
import { CardComponent } from './components/atoms/card/card.component';
import { BadgeComponent } from './components/atoms/badge/badge.component';

const COMPONENTS = [
  // Atoms
  ButtonComponent,
  InputComponent,
  CardComponent,
  BadgeComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [...COMPONENTS]
})
export class SharedModule { }
