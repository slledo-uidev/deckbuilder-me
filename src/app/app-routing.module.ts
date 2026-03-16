import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/deck-builder',
    pathMatch: 'full'
  },
  {
    path: 'deck-builder',
    loadChildren: () => import('./features/deck-builder/deck-builder.module').then(m => m.DeckBuilderModule)
  },
  {
    path: '**',
    redirectTo: '/deck-builder'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
