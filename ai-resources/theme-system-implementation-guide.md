# Guía de Implementación - Sistema de Temas Claro/Oscuro

Esta guía documenta la arquitectura del sistema de temas (modo claro y oscuro) implementado en **Digimon TCG Probability**, diseñada para ser replicada en otros proyectos con Angular y SCSS.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Implementación Paso a Paso](#implementación-paso-a-paso)
4. [Código Completo de Archivos](#código-completo-de-archivos)
5. [Patrones y Buenas Prácticas](#patrones-y-buenas-prácticas)
6. [Integración con Componentes](#integración-con-componentes)

---

## 🏗️ Arquitectura General

### Filosofía del Sistema

El sistema de temas se basa en una **arquitectura de tres capas**:

```
┌─────────────────────────────────────────────┐
│ 1. PRIMITIVOS DE COLOR                       │
│    _d-prob-colors.scss                       │
│    _d-prob-colors-dark.scss                  │
│    (Valores hexadecimales sin semántica)     │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ 2. TOKENS SEMÁNTICOS                        │
│    _d-prob-theme-tokens.scss                │
│    (Variables SCSS con significado)          │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ 3. CSS CUSTOM PROPERTIES                     │
│    _d-prob-theme-variables.scss              │
│    (Variables CSS dinámicas por tema)        │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ 4. SERVICIO DE TEMA (TypeScript)            │
│    theme.service.ts                          │
│    (Lógica de cambio y persistencia)         │
└─────────────────────────────────────────────┘
```

### Ventajas de esta Arquitectura

✅ **Separación de responsabilidades**: Colores primitivos, tokens semánticos y valores dinámicos en archivos separados  
✅ **Escalabilidad**: Fácil añadir nuevos colores o temas  
✅ **Mantenibilidad**: Un solo lugar para actualizar cada tipo de valor  
✅ **Consistencia**: Todos los componentes usan los mismos tokens  
✅ **Responsive al sistema**: Detecta automáticamente la preferencia del SO  
✅ **Persistencia**: Guarda la elección del usuario en localStorage  

---

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── scss/
│   │   ├── _d-prob-colors.scss              # Primitivos modo claro
│   │   ├── _d-prob-colors-dark.scss         # Primitivos modo oscuro
│   │   ├── _d-prob-theme-tokens.scss        # Tokens semánticos
│   │   └── _d-prob-theme-variables.scss     # CSS Custom Properties
│   └── services/
│       └── theme.service.ts                 # Servicio Angular
├── styles.scss                               # Estilos globales
└── ...
```

### Propósito de Cada Archivo

| Archivo | Propósito | Tipo de Variables |
|---------|-----------|-------------------|
| `_d-prob-colors.scss` | Paleta base de colores para modo claro | `$color-turquoise-500: #78c3b4;` |
| `_d-prob-colors-dark.scss` | Colores optimizados para modo oscuro | `$color-dark-bg-base: #0f0f0f;` |
| `_d-prob-theme-tokens.scss` | Tokens semánticos agnósticos del tema | `$theme-color-primary: $color-turquoise-500;` |
| `_d-prob-theme-variables.scss` | Variables CSS que cambian por tema | `--theme-color-primary: ...;` |
| `theme.service.ts` | Lógica de negocio y cambio de tema | TypeScript Service |

---

## 🔧 Implementación Paso a Paso

### Paso 1: Crear la Estructura de Carpetas

```bash
mkdir src/app/scss
mkdir src/app/services
```

### Paso 2: Crear Archivos de Colores Primitivos

#### 2.1. Archivo `_d-prob-colors.scss`

Define todos los colores base para el **modo claro**.

**Convenciones de nomenclatura:**
- `$color-[nombre]-[intensidad]` donde intensidad va de 100 (claro) a 900 (oscuro)
- Ejemplos: `$color-turquoise-500`, `$color-gray-800`

```scss
// Colores principales de identidad
$color-turquoise-500: #78c3b4;
$color-turquoise-600: #69b4a5;
$color-turquoise-400: #87d2c3;

// Escala de grises
$color-gray-900: #1e1e1e;
$color-gray-800: #2d2d2d;
$color-gray-700: #3c3c3c;
$color-gray-600: #5a5a5a;
$color-gray-500: #787878;
$color-gray-400: #969696;
$color-gray-300: #b4b4b4;
$color-gray-200: #d0d0d0;
$color-gray-150: #e0e0e0;
$color-gray-100: #f0f0f0;
$color-gray-50: #f8f9fa;

// Colores de estado
$color-orange-400: #f0c369;
$color-orange-500: #e6b558;
$color-yellow-300: #f5ce7a;
$color-red-400: #b41e1e;
$color-red-500: #a31a1a;

// Absolutos
$color-white: #ffffff;
$color-black: #000000;
```

#### 2.2. Archivo `_d-prob-colors-dark.scss`

Define colores **optimizados para modo oscuro** con mejor contraste.

**Criterios para dark mode:**
- Fondos muy oscuros (#0f0f0f - #2a2a2a)
- Textos claros (#e8e8e8 - #888888)
- Colores de acento más brillantes para legibilidad
- Bordes sutiles con bajo contraste

```scss
// Fondos oscuros
$color-dark-bg-base: #0f0f0f;
$color-dark-bg-elevated: #1a1a1a;
$color-dark-bg-elevated-hover: #232323;
$color-dark-bg-input: #2a2a2a;

// Textos claros
$color-dark-text-primary: #e8e8e8;
$color-dark-text-secondary: #b0b0b0;
$color-dark-text-tertiary: #888888;
$color-dark-text-muted: #666666;

// Bordes
$color-dark-border-base: #2a2a2a;
$color-dark-border-elevated: #3a3a3a;
$color-dark-border-input: #404040;

// Colores ajustados (más brillantes)
$color-dark-turquoise-400: #8ed4c7;
$color-dark-turquoise-500: #78c3b4;
$color-dark-turquoise-300: #a0e0d5;
$color-dark-orange-300: #f5d389;
$color-dark-red-400: #d64545;
```

### Paso 3: Crear Tokens Semánticos

#### 3.1. Archivo `_d-prob-theme-tokens.scss`

Mapea los **colores primitivos a propósitos semánticos**. Estos no cambian entre temas, solo referencian los primitivos.

```scss
@import './d-prob-colors';

// ===== COLORES SEMÁNTICOS =====
$theme-color-primary: $color-turquoise-500;
$theme-color-primary-hover: $color-turquoise-600;
$theme-color-primary-dark: $color-turquoise-600;

// Colores de estado
$theme-color-success: $color-turquoise-500;
$theme-color-warning: $color-orange-400;
$theme-color-danger: $color-red-400;

// Textos
$theme-color-text-primary: $color-gray-900;
$theme-color-text-secondary: $color-gray-600;
$theme-color-text-tertiary: $color-gray-500;
$theme-color-text-muted: $color-gray-400;

// Fondos
$theme-color-bg-base: $color-gray-100;
$theme-color-bg-light: $color-gray-50;
$theme-color-bg-card: $color-white;

// Bordes
$theme-color-border-base: $color-gray-150;
$theme-color-border-dark: $color-gray-300;
$theme-color-border-input: $color-gray-200;

// ===== ESPACIADO (escala base: 4px) =====
$theme-spacing-0: 0;
$theme-spacing-1: 0.25rem;  // 4px
$theme-spacing-2: 0.5rem;   // 8px
$theme-spacing-3: 0.75rem;  // 12px
$theme-spacing-4: 1rem;     // 16px
$theme-spacing-6: 1.5rem;   // 24px
$theme-spacing-8: 2rem;     // 32px
$theme-spacing-12: 3rem;    // 48px

// ===== BORDER RADIUS =====
$theme-radius-sm: 4px;
$theme-radius-base: 6px;
$theme-radius-md: 8px;
$theme-radius-lg: 12px;
$theme-radius-xl: 16px;
$theme-radius-full: 50%;

// ===== SOMBRAS =====
$theme-shadow-sm: 0 2px 4px rgba($color-black, 0.1);
$theme-shadow-md: 0 4px 8px rgba($color-black, 0.12);
$theme-shadow-lg: 0 4px 15px rgba($color-black, 0.15);
$theme-shadow-xl: 0 8px 16px rgba($color-black, 0.15);

// ===== TRANSICIONES =====
$theme-transition-fast: all 0.15s ease;
$theme-transition-base: all 0.3s ease;
$theme-transition-slow: all 0.5s ease;

// ===== TIPOGRAFÍA =====
$theme-font-family-base: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

$theme-font-size-xs: 0.75rem;   // 12px
$theme-font-size-sm: 0.85rem;   // 13.6px
$theme-font-size-base: 0.95rem; // 15.2px
$theme-font-size-md: 1rem;      // 16px
$theme-font-size-lg: 1.1rem;    // 17.6px
$theme-font-size-xl: 1.25rem;   // 20px
$theme-font-size-2xl: 1.5rem;   // 24px
$theme-font-size-3xl: 1.75rem;  // 28px

$theme-font-weight-normal: 400;
$theme-font-weight-medium: 500;
$theme-font-weight-semibold: 600;
$theme-font-weight-bold: 700;

$theme-line-height-tight: 1.2;
$theme-line-height-normal: 1.5;
$theme-line-height-relaxed: 1.6;

// ===== BREAKPOINTS =====
$theme-breakpoint-xs: 480px;
$theme-breakpoint-sm: 640px;
$theme-breakpoint-md: 768px;
$theme-breakpoint-lg: 1024px;
$theme-breakpoint-xl: 1280px;

// ===== Z-INDEX =====
$theme-z-index-dropdown: 100;
$theme-z-index-sticky: 200;
$theme-z-index-modal: 500;
$theme-z-index-tooltip: 700;
```

### Paso 4: Crear CSS Custom Properties Dinámicas

#### 4.1. Archivo `_d-prob-theme-variables.scss`

Define las **variables CSS que cambian según el tema activo** (`.light-theme` o `.dark-theme`).

**🔑 Aspecto clave**: Estas son las variables que los componentes deben usar en su CSS.

```scss
@import './d-prob-colors';
@import './d-prob-colors-dark';

// ===== LIGHT THEME (por defecto) =====
body,
body.light-theme {
  // Primary colors
  --theme-color-primary: #{$color-turquoise-500};
  --theme-color-primary-hover: #{$color-turquoise-600};
  --theme-color-primary-rgb: 120, 195, 180;
  
  // Backgrounds
  --theme-color-bg-base: #{$color-gray-100};
  --theme-color-bg-elevated: #{$color-white};
  --theme-color-bg-elevated-hover: #{$color-gray-50};
  --theme-color-bg-input: #{$color-white};
  
  // Text
  --theme-color-text-primary: #{$color-gray-900};
  --theme-color-text-secondary: #{$color-gray-600};
  --theme-color-text-tertiary: #{$color-gray-500};
  --theme-color-text-muted: #{$color-gray-400};
  
  // Borders
  --theme-color-border-base: #{$color-gray-150};
  --theme-color-border-elevated: #{$color-gray-300};
  --theme-color-border-input: #{$color-gray-200};
  --theme-color-border-input-hover: #{$color-gray-400};
  
  // State colors
  --theme-color-success: #{$color-turquoise-500};
  --theme-color-success-light: #{$color-turquoise-400};
  --theme-color-warning: #{$color-orange-400};
  --theme-color-danger: #{$color-red-400};
  
  // Shadows
  --theme-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --theme-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --theme-shadow-lg: 0 4px 15px rgba(0, 0, 0, 0.15);
  --theme-shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.15);
  
  // Gradients
  --theme-gradient-primary: linear-gradient(135deg, #{$color-turquoise-500} 0%, #{$color-turquoise-600} 100%);
}

// ===== DARK THEME =====
body.dark-theme {
  // Primary colors (más brillantes)
  --theme-color-primary: #{$color-dark-turquoise-400};
  --theme-color-primary-hover: #{$color-dark-turquoise-500};
  --theme-color-primary-rgb: 142, 212, 199;
  
  // Backgrounds
  --theme-color-bg-base: #{$color-dark-bg-base};
  --theme-color-bg-elevated: #{$color-dark-bg-elevated};
  --theme-color-bg-elevated-hover: #{$color-dark-bg-elevated-hover};
  --theme-color-bg-input: #{$color-dark-bg-input};
  
  // Text
  --theme-color-text-primary: #{$color-dark-text-primary};
  --theme-color-text-secondary: #{$color-dark-text-secondary};
  --theme-color-text-tertiary: #{$color-dark-text-tertiary};
  --theme-color-text-muted: #{$color-dark-text-muted};
  
  // Borders
  --theme-color-border-base: #{$color-dark-border-base};
  --theme-color-border-elevated: #{$color-dark-border-elevated};
  --theme-color-border-input: #{$color-dark-border-input};
  --theme-color-border-input-hover: #{$color-gray-500};
  
  // State colors
  --theme-color-success: #{$color-dark-turquoise-400};
  --theme-color-success-light: #{$color-dark-turquoise-300};
  --theme-color-warning: #{$color-dark-orange-300};
  --theme-color-danger: #{$color-dark-red-400};
  
  // Shadows (más intensas)
  --theme-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --theme-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --theme-shadow-lg: 0 4px 15px rgba(0, 0, 0, 0.5);
  --theme-shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.5);
  
  // Gradients
  --theme-gradient-primary: linear-gradient(135deg, #{$color-turquoise-500} 0%, #{$color-turquoise-600} 100%);
}
```

### Paso 5: Crear el Servicio de Tema (TypeScript)

#### 5.1. Archivo `theme.service.ts`

Servicio Angular que gestiona la lógica de cambio de tema.

**Características:**
- ✅ Detecta preferencia del sistema operativo
- ✅ Persiste la elección en `localStorage`
- ✅ Escucha cambios en la preferencia del sistema
- ✅ Expone un Observable para reactividad
- ✅ Aplica clase CSS al `<body>`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme'; // Cambiar según tu app
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
```

### Paso 6: Integrar en Estilos Globales

#### 6.1. Archivo `styles.scss`

```scss
@import './app/scss/d-prob-theme-tokens';
@import './app/scss/d-prob-theme-variables';

/* Reset básico */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Variables CSS raíz (opcional - para compatibilidad) */
:root {
  --color-primary: #{$theme-color-primary};
  --color-success: #{$theme-color-success};
  --color-warning: #{$theme-color-warning};
  --color-danger: #{$theme-color-danger};
}

/* Estilos base del body */
body {
  font-family: $theme-font-family-base;
  color: var(--theme-color-text-primary);
  background-color: var(--theme-color-bg-base);
  line-height: $theme-line-height-relaxed;
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
}

/* Tipografía */
h1, h2, h3, h4, h5, h6 {
  font-weight: $theme-font-weight-bold;
  color: var(--theme-color-text-primary);
}

/* Links */
a {
  color: var(--theme-color-primary);
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--theme-color-primary-hover);
  }
}
```

---

## 🎨 Patrones y Buenas Prácticas

### ✅ Usar Variables CSS en Componentes

**❌ INCORRECTO:**
```scss
.my-component {
  background-color: #78c3b4; // Hardcoded
  color: #1e1e1e;
  padding: 16px;
}
```

**✅ CORRECTO:**
```scss
.my-component {
  background-color: var(--theme-color-primary);
  color: var(--theme-color-text-primary);
  padding: $theme-spacing-4;
}
```

### ✅ Organización BEM con Anidación

```scss
.card {
  background-color: var(--theme-color-bg-elevated);
  border: 1px solid var(--theme-color-border-base);
  border-radius: $theme-radius-md;
  padding: $theme-spacing-6;
  
  &__title {
    color: var(--theme-color-text-primary);
    font-size: $theme-font-size-xl;
    font-weight: $theme-font-weight-bold;
    margin-bottom: $theme-spacing-4;
  }
  
  &__content {
    color: var(--theme-color-text-secondary);
    line-height: $theme-line-height-relaxed;
  }
  
  &--highlighted {
    border-color: var(--theme-color-primary);
    box-shadow: var(--theme-shadow-md);
  }
}
```

### ✅ Media Queries Anidadas

```scss
.responsive-element {
  padding: $theme-spacing-4;
  
  @media (min-width: $theme-breakpoint-md) {
    padding: $theme-spacing-8;
  }
  
  &__content {
    font-size: $theme-font-size-base;
    
    @media (min-width: $theme-breakpoint-lg) {
      font-size: $theme-font-size-lg;
    }
  }
}
```

### ✅ Estados Interactivos

```scss
.button {
  background-color: var(--theme-color-primary);
  color: $color-white;
  padding: $theme-spacing-3 $theme-spacing-6;
  border-radius: $theme-radius-md;
  border: none;
  cursor: pointer;
  transition: $theme-transition-fast;
  
  &:hover {
    background-color: var(--theme-color-primary-hover);
    box-shadow: var(--theme-shadow-md);
  }
  
  &:focus {
    outline: 2px solid var(--theme-color-primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### ✅ Inputs con Tema

```scss
.input {
  background-color: var(--theme-color-bg-input);
  color: var(--theme-color-text-primary);
  border: 2px solid var(--theme-color-border-input);
  border-radius: $theme-radius-md;
  padding: $theme-spacing-3 $theme-spacing-4;
  font-size: $theme-font-size-md;
  transition: $theme-transition-fast;
  
  &:hover {
    border-color: var(--theme-color-border-input-hover);
  }
  
  &:focus {
    outline: none;
    border-color: var(--theme-color-primary);
    box-shadow: 0 0 0 3px rgba(var(--theme-color-primary-rgb), 0.1);
  }
  
  &::placeholder {
    color: var(--theme-color-text-muted);
  }
}
```

---

## 🔌 Integración con Componentes

### Ejemplo 1: Botón Toggle de Tema

**Componente TypeScript:**
```typescript
import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
      {{ isDarkMode ? '☀️' : '🌙' }}
    </button>
  `,
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
  isDarkMode: boolean;

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.isDarkMode();
    
    // Suscribirse a cambios de tema
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

**Componente SCSS:**
```scss
.theme-toggle {
  background-color: var(--theme-color-bg-elevated);
  color: var(--theme-color-text-primary);
  border: 1px solid var(--theme-color-border-base);
  border-radius: $theme-radius-full;
  padding: $theme-spacing-2;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: $theme-transition-fast;
  
  &:hover {
    background-color: var(--theme-color-bg-elevated-hover);
    box-shadow: var(--theme-shadow-md);
  }
}
```

### Ejemplo 2: Card con Tema

```scss
.result-card {
  background-color: var(--theme-color-bg-elevated);
  border: 1px solid var(--theme-color-border-base);
  border-radius: $theme-radius-lg;
  padding: $theme-spacing-6;
  box-shadow: var(--theme-shadow-sm);
  transition: $theme-transition-base;
  
  &:hover {
    box-shadow: var(--theme-shadow-md);
  }
  
  &__header {
    color: var(--theme-color-text-primary);
    font-size: $theme-font-size-xl;
    font-weight: $theme-font-weight-bold;
    margin-bottom: $theme-spacing-4;
  }
  
  &__value {
    color: var(--theme-color-primary);
    font-size: $theme-font-size-3xl;
    font-weight: $theme-font-weight-bold;
  }
  
  &__description {
    color: var(--theme-color-text-secondary);
    font-size: $theme-font-size-sm;
    margin-top: $theme-spacing-2;
  }
}
```

### Ejemplo 3: Modal con Overlay

```scss
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: $theme-z-index-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  
  body.dark-theme & {
    background-color: rgba(0, 0, 0, 0.8); // Más oscuro en dark mode
  }
}

.modal {
  background-color: var(--theme-color-bg-elevated);
  border-radius: $theme-radius-xl;
  box-shadow: var(--theme-shadow-xl);
  padding: $theme-spacing-8;
  max-width: 90vw;
  width: 500px;
  
  &__title {
    color: var(--theme-color-text-primary);
    font-size: $theme-font-size-2xl;
    font-weight: $theme-font-weight-bold;
    margin-bottom: $theme-spacing-4;
  }
}
```

---

## 📋 Checklist de Implementación

Al replicar este sistema en otro proyecto, asegúrate de:

- [ ] Crear carpeta `src/app/scss/`
- [ ] Crear los 4 archivos SCSS de tema
- [ ] Crear `theme.service.ts` en `src/app/services/`
- [ ] Importar archivos SCSS en `styles.scss`
- [ ] Registrar el servicio en `app.module.ts` (si no usa `providedIn: 'root'`)
- [ ] Crear componente de toggle de tema
- [ ] Actualizar todos los componentes para usar `var(--theme-color-*)` en lugar de colores hardcoded
- [ ] Actualizar todos los componentes para usar `$theme-spacing-*`, `$theme-font-size-*`, etc.
- [ ] Probar en ambos modos (claro y oscuro)
- [ ] Probar persistencia (recargar página)
- [ ] Probar cambio automático con preferencia del sistema
- [ ] Verificar contraste de colores (WCAG AA o superior)

---

## 🎯 Consideraciones de Accesibilidad

1. **Contraste de color**: Todos los pares texto/fondo deben cumplir WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
2. **Preferencias del sistema**: El servicio detecta automáticamente `prefers-color-scheme`
3. **Persistencia**: No obligar al usuario a cambiar el tema cada vez
4. **Transiciones suaves**: `transition: background-color 0.3s ease` para evitar cambios bruscos
5. **ARIA labels**: Botones de toggle deben tener `aria-label` descriptivo

---

## 🚀 Próximos Pasos

Una vez implementado el sistema básico, puedes:

1. **Añadir más temas**: Crear `_d-prob-colors-sepia.scss` para un tema sepia, por ejemplo
2. **Auto-detección horaria**: Cambiar automáticamente según la hora del día
3. **Temas por dominio**: Diferentes temas para subsecciones de la app
4. **Animaciones avanzadas**: Transiciones personalizadas por tema
5. **Mejoras de performance**: Usar estrategia OnPush en componentes que escuchan el tema

---

## 📚 Recursos Adicionales

- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

## ✍️ Autor y Licencia

Sistema de temas implementado en **Digimon TCG Probability Calculator**  
Documentación creada para facilitar la replicación en otros proyectos  

**Licencia**: Libre para uso en cualquier proyecto

---

## 🔄 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-03-17 | Documentación inicial completa |

---

**¿Preguntas o mejoras?** Contacta al equipo o abre un issue en el repositorio.
