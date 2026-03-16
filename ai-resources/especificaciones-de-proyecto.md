# Especificaciones de Proyecto - Digimon TCG Probability Calculator

**Documento de referencia para creación de Agent.md optimizado**  
**Creado:** 16 de marzo de 2026  
**Proyecto:** Digimon TCG Probability Calculator  
**Autor:** LledoSL

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura y Estructura](#arquitectura-y-estructura)
4. [Sistema de Estilado](#sistema-de-estilado)
5. [Metodología BEM](#metodología-bem)
6. [Sistema de Design Tokens](#sistema-de-design-tokens)
7. [Patrones y Convenciones](#patrones-y-convenciones)
8. [Configuración del Proyecto](#configuración-del-proyecto)
9. [Reglas Específicas del Proyecto](#reglas-específicas-del-proyecto)
10. [Plantilla para Agent.md](#plantilla-para-agentmd)

---

## Visión General del Proyecto

### Tipo de Aplicación
- **Categoría:** Single Page Application (SPA)
- **Propósito:** Calculadora de probabilidades hipergeométricas para Digimon TCG
- **Usuario objetivo:** Jugadores del Digimon Trading Card Game
- **Funcionalidad principal:** Calcular probabilidades de encontrar cartas específicas en mazo durante partida

### Características Principales
- Configuración de mazo (50 cartas)
- Tracking en tiempo real de cartas vistas/removidas
- Múltiples métodos de búsqueda (Training, Memory, Specific Search, Plain Draw)
- Cálculo probabilístico con distribución hipergeométrica
- Persistencia con LocalStorage
- Diseño responsive mobile-first
- Sistema de temas claro/oscuro

---

## Stack Tecnológico

### Core Framework
```json
{
  "framework": "Angular",
  "version": "16.2.0",
  "language": "TypeScript 5.1.3",
  "nodeVersion": ">=16.x",
  "packageManager": "npm"
}
```

### Dependencias Principales

#### Angular Ecosystem
```
@angular/animations: ^16.2.0
@angular/common: ^16.2.0
@angular/compiler: ^16.2.0
@angular/core: ^16.2.0
@angular/forms: ^16.2.0
@angular/platform-browser: ^16.2.0
@angular/platform-browser-dynamic: ^16.2.0
@angular/router: ^16.2.0
```

#### Reactive Programming
```
rxjs: ~7.8.0
```

#### UI Libraries
```
lucide: ^0.577.0
lucide-angular: ^0.577.0
```

#### Utilities
```
zone.js: ~0.13.0
tslib: ^2.3.0
```

### Development Dependencies
```
@angular-devkit/build-angular: ^16.2.16
@angular/cli: ^16.2.16
@angular/compiler-cli: ^16.2.0
@types/jasmine: ~4.3.0
jasmine-core: ~4.6.0
karma: ~6.4.0
karma-chrome-launcher: ~3.2.0
karma-coverage: ~2.2.0
karma-jasmine: ~5.1.0
karma-jasmine-html-reporter: ~2.1.0
typescript: ~5.1.3
```

### TypeScript Configuration

#### Compiler Options
```json
{
  "target": "ES2022",
  "module": "ES2022",
  "lib": ["ES2022", "dom"],
  "moduleResolution": "node",
  "strict": true,
  "forceConsistentCasingInFileNames": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "experimentalDecorators": true,
  "useDefineForClassFields": false
}
```

#### Angular Compiler Options
```json
{
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true,
  "strictTemplates": true,
  "enableI18nLegacyMessageIdFormat": false
}
```

---

## Arquitectura y Estructura

### Patrón Arquitectónico
**Atomic Design + Component-Driven Architecture**

### Estructura de Carpetas
```
src/
├── app/
│   ├── components/
│   │   ├── molecules/         # Componentes simples (form, header, results, card)
│   │   └── organisms/         # Componentes complejos (calculator)
│   ├── models/                # Interfaces y tipos TypeScript
│   ├── services/              # Lógica de negocio y estado
│   └── scss/                  # Sistema de design tokens
├── assets/                    # Recursos estáticos
├── environments/              # Configuración por ambiente
├── index.html                 # HTML base
├── main.ts                    # Bootstrap de Angular
├── styles.scss                # Estilos globales
└── ...
```

### Componentes Activos (Actuales)

#### Organisms
- `calculator.component` - Componente orquestador principal

#### Molecules
- `calculator-form.component` - Formulario de entrada
- `calculator-header.component` - Encabezado con selector de tema
- `calculator-results.component` - Visualización de resultados
- `result-card.component` - Tarjeta individual de resultado

**NOTA:** Existen componentes antiguos (`deck-configuration`, `card-tracker`, etc.) que NO están en uso y deben ser ignorados.

### Services Layer

#### CalculatorService
```typescript
/**
 * Servicio principal de cálculo de probabilidades
 * Implementa distribución hipergeométrica
 */
@Injectable({ providedIn: 'root' })
export class CalculatorService {
  // Cálculo de probabilidad para cada tipo de búsqueda
  calculateProbability(input: CalculatorInput): CalculatorResult;
  
  // Métodos específicos por tipo de búsqueda
  private calculateCoolBoy(...): ProbabilityBreakdown[];
  private calculateMemory(...): ProbabilityBreakdown[];
  private calculateSpecificSearch(...): ProbabilityBreakdown[];
  private calculatePlainDraw(...): ProbabilityBreakdown[];
  
  // Utilities
  private hypergeometric(...): number;
  private combinations(...): number;
  private factorial(...): number;
}
```

#### ThemeService
```typescript
/**
 * Manejo de temas claro/oscuro
 * Persistencia con LocalStorage
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme$: BehaviorSubject<'light' | 'dark'>;
  
  toggleTheme(): void;
  setTheme(theme: 'light' | 'dark'): void;
  private applyTheme(theme: string): void;
}
```

### Models

#### CalculatorInput
```typescript
interface CalculatorInput {
  searchType: SearchType;
  customValue?: number;      // Solo para búsquedas customizables
  drawCount: number;         // Cuántas cartas se verán
  totalCardsInDeck: number;  // Total en mazo
  type1Cards: number;        // Cartas del tipo 1
  type2Cards?: number;       // Cartas del tipo 2 (opcional)
  overlap?: number;          // Solapamiento entre tipos (opcional)
}
```

#### SearchType Enum
```typescript
enum SearchType {
  COOL_BOY = 'COOL_BOY',           // Training: 2 cards por color
  MEMORY = 'MEMORY',                // Memory: 3-4 cards por tipo/color
  SPECIFIC_SEARCH = 'SPECIFIC_SEARCH', // Búsqueda de cartas específicas
  PLAIN_DRAW = 'PLAIN_DRAW'         // Robo normal
}
```

#### CalculatorResult
```typescript
interface CalculatorResult {
  searchType: SearchType;
  probabilities: ProbabilityBreakdown[];
  summary?: {
    totalProbability: number;
    expectedValue: number;
  };
}
```

---

## Sistema de Estilado

### Preprocesador: SCSS (Sassy CSS)

### Configuración Angular
```json
{
  "schematics": {
    "@schematics/angular:component": {
      "style": "scss"
    }
  },
  "inlineStyleLanguage": "scss"
}
```

### Arquitectura de Estilos

#### Niveles de Abstracción
```
1. Primitivos     → _d-prob-colors.scss
2. Tokens         → _d-prob-theme-tokens.scss
3. Variables CSS  → _d-prob-theme-variables.scss
4. Global Styles  → styles.scss
5. Components     → *.component.scss
```

#### Archivos de Tema

##### `_d-prob-colors.scss` - Colores Primitivos
```scss
// Colores extraídos de identidad visual del proyecto
$color-turquoise-500: #78c3b4;  // Principal
$color-turquoise-600: #69b4a5;
$color-turquoise-400: #87d2c3;

$color-dark-900: #1e1e1e;
$color-dark-800: #2d2d2d;

$color-red-400: #b41e1e;
$color-orange-400: #f0c369;

$color-gray-900: #1e1e1e;
$color-gray-600: #5a5a5a;
// ... más variaciones de gris
$color-white: #ffffff;
$color-black: #000000;
```

##### `_d-prob-theme-tokens.scss` - Tokens Semánticos
```scss
@import './d-prob-colors';

// Semantic Colors
$theme-color-primary: $color-turquoise-500;
$theme-color-primary-hover: $color-turquoise-600;

$theme-color-success: $color-turquoise-500;
$theme-color-warning: $color-orange-400;
$theme-color-danger: $color-red-400;

$theme-color-text-primary: $color-gray-900;
$theme-color-text-secondary: $color-gray-600;

$theme-color-bg-base: $color-gray-100;
$theme-color-bg-card: $color-white;

$theme-color-border-base: $color-gray-150;

// Spacing (escala base 4px)
$theme-spacing-1: 0.25rem;  // 4px
$theme-spacing-2: 0.5rem;   // 8px
$theme-spacing-4: 1rem;     // 16px
$theme-spacing-6: 1.5rem;   // 24px
$theme-spacing-8: 2rem;     // 32px

// Border Radius
$theme-radius-sm: 4px;
$theme-radius-base: 6px;
$theme-radius-md: 8px;

// Shadows
$theme-shadow-sm: 0 2px 4px rgba($color-black, 0.1);
$theme-shadow-md: 0 4px 8px rgba($color-black, 0.12);

// Typography
$theme-font-size-xs: 0.75rem;    // 12px
$theme-font-size-sm: 0.875rem;   // 14px
$theme-font-size-base: 1rem;     // 16px
$theme-font-size-lg: 1.125rem;   // 18px
$theme-font-size-xl: 1.25rem;    // 20px

$theme-font-weight-normal: 400;
$theme-font-weight-medium: 500;
$theme-font-weight-semibold: 600;
$theme-font-weight-bold: 700;

// Breakpoints
$theme-breakpoint-sm: 480px;
$theme-breakpoint-md: 768px;
$theme-breakpoint-lg: 1024px;
$theme-breakpoint-xl: 1280px;

// Transitions
$theme-transition-base: 0.2s ease;
$theme-transition-slow: 0.3s ease;
```

##### `_d-prob-theme-variables.scss` - CSS Custom Properties
```scss
// Tema Claro (default)
body, body.light-theme {
  --theme-color-primary: #{$color-turquoise-500};
  --theme-color-bg-base: #{$color-gray-100};
  --theme-color-text-primary: #{$color-gray-900};
  // ... más propiedades
}

// Tema Oscuro
body.dark-theme {
  --theme-color-primary: #{$color-dark-turquoise-400};
  --theme-color-bg-base: #{$color-dark-bg-base};
  --theme-color-text-primary: #{$color-dark-text-primary};
  // ... más propiedades
}
```

### Import Order en Componentes
```scss
// 1. Importar solo tokens (no variables CSS)
@import '../../../scss/d-prob-theme-tokens';

// 2. :host si es necesario
:host {
  display: block;
}

// 3. Componente con BEM
.component {
  // Estilos...
}
```

---

## Metodología BEM

### Block Element Modifier (Anidado con SCSS)

#### Estructura Básica
```scss
.block {
  // Propiedades del bloque
  property: value;
  
  // Media queries contextuales
  @media (min-width: $theme-breakpoint-md) {
    property: value;
  }
  
  // Elementos (usar &__)
  &__element {
    property: value;
    
    // Pseudo-clases dentro del elemento
    &:hover,
    &:focus {
      property: value;
    }
  }
  
  // Sub-elementos
  &__element-inner {
    property: value;
  }
  
  // Modificadores de bloque (usar &--)
  &--modifier {
    property: value;
  }
  
  // Modificadores con variantes
  &--modifier-variant {
    property: value;
    
    // Modificar elementos desde el modificador
    .block__element {
      property: modified-value;
    }
  }
}
```

#### Ejemplo Real del Proyecto
```scss
// calculator-form.component.scss
.inputs {
  &__card {
    background: var(--theme-color-bg-elevated);
    padding: $theme-spacing-4;
    border-radius: $theme-radius-md;
    
    @media (min-width: $theme-breakpoint-md) {
      padding: $theme-spacing-6;
    }
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $theme-spacing-6;
  }
  
  &__title {
    font-size: $theme-font-size-xl;
    font-weight: $theme-font-weight-bold;
    color: var(--theme-color-text-primary);
  }
  
  &__toggle-btn {
    padding: $theme-spacing-2 $theme-spacing-4;
    background: var(--theme-color-primary);
    
    &:hover {
      background: var(--theme-color-primary-hover);
    }
    
    @media (min-width: $theme-breakpoint-md) {
      display: none;
    }
  }
  
  &__form {
    display: flex;
    flex-direction: column;
    gap: $theme-spacing-4;
    opacity: 1;
    transition: opacity $theme-transition-base;
    
    &--collapsed {
      display: none;
      opacity: 0;
    }
  }
}
```

### Naming Conventions

#### Blocks (Bloques)
- Nombres en minúsculas
- Palabras separadas por guiones
- Representan componente independiente

```scss
.calculator { }
.inputs { }
.results { }
.result-card { }
```

#### Elements (Elementos)
- Doble underscore `__` después del bloque
- Representan partes del bloque

```scss
.calculator__container { }
.inputs__header { }
.results__list { }
.result-card__title { }
```

#### Modifiers (Modificadores)
- Doble guion `--` después del bloque o elemento
- Representan variaciones o estados

```scss
.inputs__form--collapsed { }
.result-card--success { }
.button--primary { }
.button--disabled { }
```

### Beneficios de BEM Anidado
1. **Reduce líneas de código** - Agrupa lógica relacionada
2. **Mejor mantenibilidad** - Cambios localizados
3. **Contexto visual claro** - Jerarquía obvia en SCSS
4. **Media queries contextuales** - Responsive dentro del bloque
5. **Evita colisiones de nombres** - Namespace por componente
6. **Reutilización** - Modificadores predecibles

---

## Sistema de Design Tokens

### Filosofía: Design Tokens First

**NUNCA hardcodear valores.** Siempre usar tokens del sistema.

### Categorías de Tokens

#### 1. Spacing (Escala base: 4px)
```scss
// ❌ INCORRECTO
padding: 24px;
margin-bottom: 1.5rem;

// ✅ CORRECTO
padding: $theme-spacing-6;      // 24px
margin-bottom: $theme-spacing-6; // 24px
```

**Escala disponible:**
```scss
$theme-spacing-1: 0.25rem;  // 4px
$theme-spacing-2: 0.5rem;   // 8px
$theme-spacing-3: 0.75rem;  // 12px
$theme-spacing-4: 1rem;     // 16px
$theme-spacing-5: 1.25rem;  // 20px
$theme-spacing-6: 1.5rem;   // 24px
$theme-spacing-7: 1.75rem;  // 28px
$theme-spacing-8: 2rem;     // 32px
$theme-spacing-10: 2.5rem;  // 40px
$theme-spacing-12: 3rem;    // 48px
$theme-spacing-16: 4rem;    // 64px
```

#### 2. Colors
```scss
// ❌ INCORRECTO
color: #78c3b4;
background: #f0f0f0;
border: 1px solid #e0e0e0;

// ✅ CORRECTO (SCSS variables para estáticos)
color: $color-turquoise-500;
background: $theme-color-bg-base;

// ✅ CORRECTO (CSS vars para theming)
color: var(--theme-color-primary);
background: var(--theme-color-bg-base);
border-color: var(--theme-color-border-base);
```

**Cuándo usar cada uno:**
- **SCSS Variables** (`$theme-*`): Valores que no cambian con tema
- **CSS Custom Properties** (`var(--theme-*)`): Valores que cambian con tema claro/oscuro

#### 3. Typography
```scss
// ❌ INCORRECTO
font-size: 18px;
font-weight: 600;
line-height: 1.5;

// ✅ CORRECTO
font-size: $theme-font-size-lg;
font-weight: $theme-font-weight-semibold;
line-height: $theme-line-height-relaxed;
```

#### 4. Border Radius
```scss
// ❌ INCORRECTO
border-radius: 8px;

// ✅ CORRECTO
border-radius: $theme-radius-md;
```

#### 5. Shadows
```scss
// ❌ INCORRECTO
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);

// ✅ CORRECTO
box-shadow: var(--theme-shadow-md);
```

#### 6. Transitions
```scss
// ❌ INCORRECTO
transition: all 0.2s ease;

// ✅ CORRECTO
transition: opacity $theme-transition-base;
transition: transform $theme-transition-slow;
```

#### 7. Breakpoints
```scss
// ❌ INCORRECTO
@media (min-width: 768px) { }

// ✅ CORRECTO
@media (min-width: $theme-breakpoint-md) { }
```

**Breakpoints disponibles:**
```scss
$theme-breakpoint-sm: 480px;   // Móvil pequeño
$theme-breakpoint-md: 768px;   // Tablet
$theme-breakpoint-lg: 1024px;  // Desktop
$theme-breakpoint-xl: 1280px;  // Desktop grande
```

### Guía de Referencia Rápida
```scss
// Importar tokens al inicio del archivo
@import '../../../scss/d-prob-theme-tokens';

.component {
  // Spacing
  padding: $theme-spacing-4;
  margin: $theme-spacing-6 0;
  gap: $theme-spacing-4;
  
  // Colors (estáticos)
  color: $color-white;
  
  // Colors (dinámicos con tema)
  background: var(--theme-color-bg-elevated);
  border-color: var(--theme-color-border-base);
  
  // Typography
  font-size: $theme-font-size-lg;
  font-weight: $theme-font-weight-semibold;
  line-height: $theme-line-height-relaxed;
  
  // Borders
  border-radius: $theme-radius-md;
  border: 1px solid var(--theme-color-border-base);
  
  // Shadows
  box-shadow: var(--theme-shadow-md);
  
  // Transitions
  transition: all $theme-transition-base;
  
  // Breakpoints
  @media (min-width: $theme-breakpoint-md) {
    padding: $theme-spacing-6;
  }
}
```

---

## Patrones y Convenciones

### TypeScript Patterns

#### 1. Interfaces y Tipos
```typescript
// Siempre exportar interfaces
export interface Card {
  id: string;
  name: string;
  quantity: number;
  categories: CardCategories;
}

// Tipos para enums
export enum SearchType {
  COOL_BOY = 'COOL_BOY',
  MEMORY = 'MEMORY',
  SPECIFIC_SEARCH = 'SPECIFIC_SEARCH',
  PLAIN_DRAW = 'PLAIN_DRAW'
}

// Type aliases para unions
export type Theme = 'light' | 'dark';
```

#### 2. Services con Dependency Injection
```typescript
@Injectable({
  providedIn: 'root'  // Singleton en toda la app
})
export class MyService {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}
}
```

#### 3. Reactive State Management
```typescript
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$ = this.themeSubject.asObservable();
  
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.persistTheme(theme);
  }
}
```

#### 4. Component Lifecycle
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.setupSubscriptions();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupSubscriptions(): void {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }
}
```

### Angular Forms Pattern

#### Reactive Forms
```typescript
export class FormComponent implements OnInit {
  form!: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForm();
    this.setupFormListeners();
  }
  
  private initForm(): void {
    this.form = this.fb.group({
      field: ['', [Validators.required, Validators.min(0)]],
      optional: [null]
    });
  }
  
  private setupFormListeners(): void {
    this.form.get('field')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.onFieldChange(value);
      });
  }
  
  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      // Process form
    }
  }
}
```

### Template Patterns

#### Conditional Rendering
```html
<!-- Structural directives -->
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items; trackBy: trackById">{{ item }}</div>

<!-- Else clause -->
<div *ngIf="result; else noResult">
  <app-result [data]="result"></app-result>
</div>
<ng-template #noResult>
  <p>No results</p>
</ng-template>
```

#### Forms Binding
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input 
    type="number" 
    formControlName="field"
    [class.invalid]="form.get('field')?.invalid && form.get('field')?.touched"
  >
  
  <div *ngIf="form.get('field')?.hasError('required')">
    Field is required
  </div>
</form>
```

### File Organization

#### Component Files
```
component-name/
├── component-name.component.ts        # Logic
├── component-name.component.html      # Template
├── component-name.component.scss      # Styles
└── component-name.component.spec.ts   # Tests
```

#### Naming Conventions
```
# Files
my-component.component.ts
my-service.service.ts
my-interface.model.ts

# Classes
MyComponent
MyService
MyInterface

# Selectors
app-my-component
```

---

## Configuración del Proyecto

### Angular.json Key Points

#### Build Configuration
```json
{
  "inlineStyleLanguage": "scss",
  "assets": [
    "src/favicon.ico",
    "src/assets",
    "src/robots.txt",
    "src/sitemap.xml"
  ],
  "styles": ["src/styles.scss"],
  "scripts": []
}
```

#### Production Optimization
```json
{
  "optimization": true,
  "outputHashing": "all",
  "sourceMap": false,
  "extractLicenses": true,
  "vendorChunk": false,
  "buildOptimizer": true,
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "10kb",
      "maximumError": "15kb"
    }
  ]
}
```

### Package Scripts
```json
{
  "start": "ng serve",
  "build": "ng build",
  "build:prod": "ng build --configuration production",
  "test": "ng test",
  "test:ci": "ng test --watch=false --code-coverage --browsers=ChromeHeadless"
}
```

### Environment Files
```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com'
};
```

---

## Reglas Específicas del Proyecto

### 🚫 Regla #1: NO Añadir Emojis/Iconos

**NUNCA añadir emojis o iconos en el código HTML de los componentes.**

#### Iconos Permitidos (únicos)
- `📝` - Botón FAB de recalcular (mobile)
- `📊` - Estado vacío en resultados

#### Razón
El usuario añadirá librería de iconos (Lucide Angular) más adelante. Hasta entonces, usar solo texto o los 2 emojis permitidos.

#### Componentes Antiguos a Ignorar
- `probability-results.component.html` - Tiene iconos pero NO SE USA
- **NO tocar** componentes antiguos sin instrucción explícita

### 📐 Regla #2: BEM Anidado Obligatorio

Todos los archivos SCSS deben usar BEM con anidación.

```scss
// ✅ CORRECTO
.block {
  property: value;
  
  @media (min-width: $theme-breakpoint-md) {
    property: other;
  }
  
  &__element {
    property: value;
  }
  
  &--modifier {
    property: modified;
  }
}

// ❌ INCORRECTO - clases separadas
.block { }
.block__element { }
.block--modifier { }
```

### 🎨 Regla #3: Siempre Usar Tokens del Tema

**NUNCA hardcodear valores.**

```scss
// ❌ INCORRECTO
padding: 24px;
color: #78c3b4;
font-size: 18px;
border-radius: 8px;

// ✅ CORRECTO
padding: $theme-spacing-6;
color: var(--theme-color-primary);
font-size: $theme-font-size-lg;
border-radius: $theme-radius-md;
```

### 📱 Regla #4: Mobile-First Responsive

Breakpoint principal: `$theme-breakpoint-md` (768px)

#### Desktop >= 768px
- Formulario siempre expandido
- Auto-recálculo en cambio de valores
- Sin FAB flotante

#### Mobile < 768px
- Formulario colapsable con botón toggle
- FAB flotante para recalcular
- Auto-collapse al calcular exitosamente
- NO auto-recálculo

```typescript
// Detectar viewport móvil
this.mediaQuery = window.matchMedia('(max-width: 767px)');
this.isMobile = this.mediaQuery.matches;

// Escuchar cambios
this.mediaQuery.addEventListener('change', (e) => {
  this.isMobile = e.matches;
});
```

```scss
// Mobile-first en SCSS
.component {
  // Estilos mobile por defecto
  padding: $theme-spacing-4;
  
  // Desktop override
  @media (min-width: $theme-breakpoint-md) {
    padding: $theme-spacing-6;
  }
}
```

### 📂 Regla #5: Archivos Clave del Sistema

#### Tokens y Tema
```
src/app/scss/
├── _d-prob-colors.scss           # Primitivos
├── _d-prob-colors-dark.scss      # Primitivos oscuros
├── _d-prob-theme-tokens.scss     # Tokens semánticos
└── _d-prob-theme-variables.scss  # CSS Custom Properties
```

#### Componentes Activos
```
src/app/components/organisms/calculator/
└── calculator.component.*  # Único componente en uso
```

#### Componentes Antiguos (NO USAR)
- `deck-configuration/`
- `card-tracker/`
- `search-selector/`
- `probability-results/`

**Estos están pendientes de limpieza, no modificar.**

---

## Plantilla para Agent.md

```markdown
---
applyTo:
  - angular/**/*.ts
  - angular/**/*.html
  - angular/**/*.scss
  - angular/**/*.json
customInstructions: |
  # Agent Configuration - [Project Name]

  ## Project Overview

  **Project Name:** [Name]
  **Type:** Angular [Version] Web Application
  **Purpose:** [Purpose]
  **Tech Stack:** Angular, TypeScript, SCSS, RxJS

  ---

  ## Technical Stack

  ### Framework
  - **Angular:** 16.2.0
  - **TypeScript:** 5.1.3
  - **RxJS:** 7.8.0
  - **SCSS:** Sass preprocessor
  - **Node:** >=16.x

  ### Key Libraries
  - `@angular/forms` - Reactive Forms
  - `lucide-angular` - Icons (pending implementation)

  ### Development Tools
  - Angular CLI 16.2.16
  - Karma + Jasmine para testing
  - TypeScript strict mode enabled

  ---

  ## Architecture

  ### Component Structure
  - **Atomic Design:** molecules/ + organisms/
  - **Current Active Components:**
    - `calculator.component` (organism)
    - `calculator-form.component` (molecule)
    - `calculator-header.component` (molecule)
    - `calculator-results.component` (molecule)
    - `result-card.component` (molecule)

  ### Services Layer
  ```
  services/
  ├── calculator.service.ts    # Core calculations
  └── theme.service.ts          # Theme management
  ```

  ### Models
  ```
  models/
  └── calculator.model.ts      # Interfaces and types
  ```

  ---

  ## Styling Methodology

  ### Preprocessor: SCSS

  ### Methodology: BEM (Block Element Modifier) - NESTED

  #### Mandatory Pattern
  ```scss
  // ✅ ALWAYS use this structure
  .block {
    property: value;
    
    // Media queries inside block
    @media (min-width: $theme-breakpoint-md) {
      property: value;
    }
    
    // Elements with &__
    &__element {
      property: value;
      
      &:hover {
        property: hover-value;
      }
    }
    
    // Modifiers with &--
    &--modifier {
      property: modified-value;
    }
  }
  ```

  ### Design Token System

  #### NEVER Hardcode Values

  ```scss
  // ❌ NEVER DO THIS
  padding: 24px;
  color: #78c3b4;
  font-size: 18px;

  // ✅ ALWAYS USE TOKENS
  padding: $theme-spacing-6;
  color: var(--theme-color-primary);
  font-size: $theme-font-size-lg;
  ```

  #### Token Categories

  **Spacing** (4px base scale)
  ```scss
  $theme-spacing-1  // 4px
  $theme-spacing-2  // 8px
  $theme-spacing-4  // 16px
  $theme-spacing-6  // 24px
  $theme-spacing-8  // 32px
  ```

  **Colors**
  ```scss
  // Static (SCSS vars)
  $color-white
  $color-turquoise-500
  $theme-color-primary

  // Dynamic (CSS vars for theming)
  var(--theme-color-primary)
  var(--theme-color-bg-base)
  var(--theme-color-text-primary)
  ```

  **Typography**
  ```scss
  $theme-font-size-xs     // 12px
  $theme-font-size-sm     // 14px
  $theme-font-size-base   // 16px
  $theme-font-size-lg     // 18px
  $theme-font-size-xl     // 20px

  $theme-font-weight-normal    // 400
  $theme-font-weight-semibold  // 600
  $theme-font-weight-bold      // 700
  ```

  **Breakpoints**
  ```scss
  $theme-breakpoint-sm: 480px
  $theme-breakpoint-md: 768px   // PRIMARY BREAKPOINT
  $theme-breakpoint-lg: 1024px
  $theme-breakpoint-xl: 1280px
  ```

  **Other Tokens**
  ```scss
  $theme-radius-md              // Border radius
  var(--theme-shadow-md)        // Shadows
  $theme-transition-base        // Transitions
  ```

  #### Token Files Location
  ```
  src/app/scss/
  ├── _d-prob-colors.scss           # Color primitives
  ├── _d-prob-theme-tokens.scss     # Semantic tokens
  └── _d-prob-theme-variables.scss  # CSS custom properties
  ```

  #### Import in Components
  ```scss
  @import '../../../scss/d-prob-theme-tokens';
  ```

  ---

  ## Project-Specific Rules

  ### 🚫 Rule #1: NO Emojis/Icons

  **NEVER add emojis or icons in component HTML.**

  **Allowed (only 2):**
  - 📝 - FAB recalculate button (mobile)
  - 📊 - Empty state in results

  **Reason:** Icon library (Lucide) pending implementation.

  ### 📐 Rule #2: BEM Nested MANDATORY

  All SCSS files MUST use nested BEM structure. No flat classes.

  ### 🎨 Rule #3: ALWAYS Use Theme Tokens

  NEVER hardcode: spacing, colors, font-sizes, shadows, radius, breakpoints.

  ### 📱 Rule #4: Mobile-First Responsive

  **Primary Breakpoint:** `$theme-breakpoint-md` (768px)

  **Desktop (>= 768px):**
  - Form always expanded
  - Auto-recalculate on value change
  - No floating FAB

  **Mobile (< 768px):**
  - Form collapsible with toggle button
  - Floating FAB to recalculate
  - Auto-collapse on successful calculation
  - NO auto-recalculate

  ```scss
  .component {
    // Mobile styles (default)
    padding: $theme-spacing-4;
    
    // Desktop override
    @media (min-width: $theme-breakpoint-md) {
      padding: $theme-spacing-6;
    }
  }
  ```

  ### 📂 Rule #5: Active Components Only

  **Active (in use):**
  - `components/organisms/calculator/`

  **Deprecated (DO NOT USE):**
  - `deck-configuration/`
  - `card-tracker/`
  - Old `probability-results.component` with icons

  ---

  ## TypeScript Patterns

  ### Strict Mode Enabled
  ```json
  {
    "strict": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "strictTemplates": true
  }
  ```

  ### Component Pattern
  ```typescript
  @Component({
    selector: 'app-component',
    templateUrl: './component.component.html',
    styleUrls: ['./component.component.scss']
  })
  export class ComponentName implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    
    constructor(
      private fb: FormBuilder,
      private service: MyService
    ) {}
    
    ngOnInit(): void {
      this.init();
    }
    
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
  ```

  ### Service Pattern
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class MyService {
    private dataSubject = new BehaviorSubject<Data>(initialData);
    public data$ = this.dataSubject.asObservable();
    
    updateData(data: Data): void {
      this.dataSubject.next(data);
    }
  }
  ```

  ---

  ## Development Commands

  ```bash
  # Start dev server
  npm start

  # Build for production
  npm run build:prod

  # Run tests
  npm test

  # Run tests (CI)
  npm run test:ci
  ```

  ---

  ## Key Files Reference

  ### Configuration
  - `angular.json` - Angular CLI config
  - `tsconfig.json` - TypeScript config
  - `package.json` - Dependencies

  ### Theme System
  - `src/app/scss/_d-prob-colors.scss`
  - `src/app/scss/_d-prob-theme-tokens.scss`
  - `src/app/scss/_d-prob-theme-variables.scss`
  - `src/styles.scss` - Global styles

  ### Main Component
  - `src/app/components/organisms/calculator/`

  ---

  ## Quality Standards

  ### Code Style
  - TypeScript strict mode
  - BEM nested structure for SCSS
  - Reactive programming with RxJS
  - Unsubscribe pattern with takeUntil

  ### CSS Standards
  - Mobile-first responsive
  - Token-based spacing/colors
  - No hardcoded values
  - CSS Custom Properties for theming

  ### Performance
  - OnPush change detection when possible
  - Lazy loading of routes
  - Bundle size limits in angular.json

  ---

  ## Important Notes

  1. **Old Components:** Several deprecated components exist (deck-configuration, card-tracker). DO NOT USE unless explicitly required.

  2. **Icons:** Only 2 emojis allowed (📝, 📊). Full icon system pending.

  3. **Mobile Detection:** Use `window.matchMedia('(max-width: 767px)')` for viewport detection.

  4. **Auto-recalculate:** Only on desktop (>= 768px), never on mobile.

  5. **LocalStorage:** Theme preference persisted automatically.

  ---

  ## When Adding New Features

  1. ✅ Use BEM nested structure
  2. ✅ Use theme tokens exclusively
  3. ✅ Follow mobile-first approach
  4. ✅ Add TypeScript types
  5. ✅ Implement unsubscribe pattern
  6. ❌ DO NOT add emojis/icons
  7. ❌ DO NOT hardcode values
  8. ❌ DO NOT use flat BEM classes

---
```

---

## Conclusión

Este documento proporciona todas las especificaciones técnicas necesarias para:
1. Entender la arquitectura completa del proyecto
2. Replicar la metodología en futuros proyectos
3. Crear un `Agent.md` optimizado y específico
4. Mantener consistencia en el código
5. Onboarding rápido de nuevos desarrolladores

**Mantener este documento actualizado** cuando se realicen cambios arquitectónicos significativos.

---

**Última actualización:** 16 de marzo de 2026  
**Versión del proyecto:** 1.1.0  
**Autor:** LledoSL
