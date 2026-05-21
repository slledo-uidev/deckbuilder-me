import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '@services/auth.service';
import { AppUser } from '@models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Digimon TCG Deck Builder';
  isLoginPage: boolean = false;
  headerHidden: boolean = false;
  isSettingsModalOpen: boolean = false;
  currentUser: AppUser | null = null;
  private lastScrollY = 0;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentY = window.scrollY;
    if (currentY > this.lastScrollY && currentY > 60) {
      this.headerHidden = true;   // scrolling down
    } else {
      this.headerHidden = false;  // scrolling up
    }
    this.lastScrollY = currentY;
  }

  ngOnInit(): void {
    // Check initial route
    this.checkLoginRoute(this.router.url);

    // Subscribe to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.checkLoginRoute(event.urlAfterRedirects || event.url);
      });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => { this.currentUser = user; });
  }

  openSettingsModal(): void {
    this.isSettingsModalOpen = true;
  }

  onSettingsModalClosed(): void {
    this.isSettingsModalOpen = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkLoginRoute(url: string): void {
    this.isLoginPage = url === '/login' || url.startsWith('/login')
                    || url === '/register' || url.startsWith('/register');
  }
}
