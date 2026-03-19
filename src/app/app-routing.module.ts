import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/gallery',
    pathMatch: 'full'
  },
  {
    path: 'gallery',
    loadChildren: () => import('./pages/card-gallery/card-gallery.module').then(m => m.CardGalleryModule)
  },
  {
    path: 'builder',
    loadChildren: () => import('./pages/deck-builder/deck-builder.module').then(m => m.DeckBuilderModule)
  },
  {
    path: 'decks',
    loadChildren: () => import('./pages/decks-library/decks-library.module').then(m => m.DecksLibraryModule)
  },
  {
    path: '**',
    redirectTo: '/gallery'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
