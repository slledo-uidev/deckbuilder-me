import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  navItems = [
    { path: '/gallery', label: 'Card Gallery', icon: 'grid' },
    { path: '/builder', label: 'Deck Builder', icon: 'layers' },
    { path: '/decks', label: 'Decks Library', icon: 'folder' }
  ];
}
