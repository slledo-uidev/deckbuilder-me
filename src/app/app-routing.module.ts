import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'gallery',
    loadChildren: () => import('./pages/card-gallery/card-gallery.module').then(m => m.CardGalleryModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'builder',
    loadChildren: () => import('./pages/deck-builder/deck-builder.module').then(m => m.DeckBuilderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'decks',
    loadChildren: () => import('./pages/decks-library/decks-library.module').then(m => m.DecksLibraryModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
