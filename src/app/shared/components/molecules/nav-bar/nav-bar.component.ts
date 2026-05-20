import { Component, EventEmitter, OnInit, OnDestroy, HostListener, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '@services/auth.service';
import { AppUser } from '@models/user.model';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  navItems = [
    { path: '/gallery', label: 'Card Gallery', icon: 'grid' },
    { path: '/builder', label: 'Deck Builder', icon: 'layers' },
    { path: '/decks', label: 'Decks Library', icon: 'folder' }
  ];

  currentUser: AppUser | null = null;
  isUserMenuOpen: boolean = false;
  @Output() settingsRequested = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.nav-bar__user');
    if (!clickedInside && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onLogout(): void {
    this.isUserMenuOpen = false;
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  openSettings(): void {
    this.isUserMenuOpen = false;
    this.settingsRequested.emit();
  }
}
