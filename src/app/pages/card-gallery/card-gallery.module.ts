import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CardGalleryComponent } from './components/card-gallery/card-gallery.component';

const routes: Routes = [
  {
    path: '',
    component: CardGalleryComponent
  }
];

@NgModule({
  declarations: [
    CardGalleryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class CardGalleryModule { }
