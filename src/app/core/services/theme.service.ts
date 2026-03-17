import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'deckbuilder-theme';
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  constructor() {
    // Cargar tema desde localStorage o usar preferencia del sistema
    const savedTheme = this.loadThemeFromStorage();
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme || systemTheme;
    
    this.currentThemeSubject = new BehaviorSubject<Theme>(initialTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    
    // Aplicar tema inicial
    this.applyTheme(initialTheme);
    
    // Escuchar cambios en preferencia del sistema
    this.listenToSystemThemeChanges();
  }

  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Cambia al tema especificado
   */
  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    this.saveThemeToStorage(theme);
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  toggleTheme(): void {
    const newTheme = this.currentThemeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Verifica si el modo oscuro está activo
   */
  isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }

  /**
   * Aplica el tema al documento
   */
  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  /**
   * Obtiene la preferencia del sistema
   */
  private getSystemTheme(): Theme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Escucha cambios en la preferencia del sistema
   */
  private listenToSystemThemeChanges(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Solo cambiar si no hay tema guardado explícitamente
        if (!this.loadThemeFromStorage()) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  }

  /**
   * Guarda el tema en localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.warn('No se pudo guardar el tema en localStorage', e);
    }
  }

  /**
   * Carga el tema desde localStorage
   */
  private loadThemeFromStorage(): Theme | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return (saved === 'light' || saved === 'dark') ? saved : null;
    } catch (e) {
      console.warn('No se pudo cargar el tema desde localStorage', e);
      return null;
    }
  }
}
