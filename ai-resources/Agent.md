# Agent Configuration - Digimon TCG Probability Calculator

## Project Overview

**Project Name:** Digimon TCG Probability Calculator  
**Type:** Angular 16 Web Application  
**Purpose:** Calculate probabilities of finding specific cards in Digimon TCG deck during gameplay  
**Tech Stack:** Angular 16.2, TypeScript 5.1, SCSS, RxJS 7.8, Lucide Angular

---

## Technical Stack

### Framework & Language
- **Angular:** 16.2.0
- **TypeScript:** 5.1.3 (strict mode enabled)
- **RxJS:** 7.8.0 (reactive state management)
- **SCSS:** Sass preprocessor with BEM methodology
- **Node.js:** >=16.x
- **Icons:** Lucide Angular 0.577.0 (pending full implementation)

### Key Dependencies
```json
{
  "@angular/core": "^16.2.0",
  "@angular/forms": "^16.2.0",
  "rxjs": "~7.8.0",
  "lucide-angular": "^0.577.0"
}
```

### Development Tools
- Angular CLI 16.2.16
- Karma + Jasmine (testing framework)
- TypeScript Compiler with strict settings
- SCSS compilation via Angular build system

---

## Architecture

### Component Structure (Atomic Design)

**Active Components (in use):**
```
app/components/
├── organisms/
│   └── calculator/              # Main orchestrator component
└── molecules/
    ├── calculator-form/         # Input form with validation
    ├── calculator-header/       # Header with theme toggle
    ├── calculator-results/      # Results visualization  
    └── result-card/             # Individual result card
```

**Deprecated Components (DO NOT USE):**
- `deck-configuration/` - Old deck builder (not in use)
- `card-tracker/` - Old tracker (not in use)
- `search-selector/` - Old selector (not in use)
- Old `probability-results/` - Has emoji icons (not current pattern)

### Services Layer

#### CalculatorService (`calculator.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class CalculatorService {
  // Main calculation entry point
  calculateProbability(input: CalculatorInput): CalculatorResult;
  
  // Search-specific calculations
  private calculateCoolBoy(...): ProbabilityBreakdown[];
  private calculateMemory(...): ProbabilityBreakdown[];
  private calculateSpecificSearch(...): ProbabilityBreakdown[];
  private calculatePlainDraw(...): ProbabilityBreakdown[];
  
  // Hypergeometric distribution: P(X=k) = [C(K,k) × C(N-K,n-k)] / C(N,n)
  private hypergeometric(n: number, K: number, N: number, k: number): number;
  private combinations(n: number, k: number): number;
  private factorial(n: number): number;
}
```

#### ThemeService (`theme.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  public theme$ = this.themeSubject.asObservable();
  
  toggleTheme(): void;
  setTheme(theme: 'light' | 'dark'): void;
  private applyTheme(theme: string): void;
  private persistTheme(theme: string): void;
}
```

### Data Models (`calculator.model.ts`)

#### SearchType Enum
```typescript
export enum SearchType {
  COOL_BOY = 'COOL_BOY',           // Training: 2 cards by color
  MEMORY = 'MEMORY',                // Memory: 3-4 cards by type/color
  SPECIFIC_SEARCH = 'SPECIFIC_SEARCH', // Custom card search
  PLAIN_DRAW = 'PLAIN_DRAW'         // Normal draw
}
```

#### CalculatorInput Interface
```typescript
export interface CalculatorInput {
  searchType: SearchType;
  customValue?: number;      // For customizable searches
  drawCount: number;         // Cards to be seen
  totalCardsInDeck: number;  // Total in deck
  type1Cards: number;        // Type 1 card count
  type2Cards?: number;       // Type 2 card count (optional)
  overlap?: number;          // Card overlap between types
}
```

#### CalculatorResult Interface
```typescript
export interface CalculatorResult {
  searchType: SearchType;
  probabilities: ProbabilityBreakdown[];
  summary?: {
    totalProbability: number;
    expectedValue: number;
  };
}
```

---

## Styling System

### Methodology: BEM (Block Element Modifier) - NESTED

**MANDATORY PATTERN - ALL SCSS files must follow this structure:**

```scss
// ✅ CORRECT - Nested BEM structure
.block {
  // Block properties
  property: value;
  
  // Media queries inside block (contextual responsive)
  @media (min-width: $theme-breakpoint-md) {
    property: value;
  }
  
  // Elements (use &__)
  &__element {
    property: value;
    
    // Pseudo-classes inside element
    &:hover,
    &:focus {
      property: hover-value;
    }
  }
  
  // Sub-elements
  &__element-inner {
    property: value;
  }
  
  // Modifiers (use &--)
  &--modifier {
    property: modified-value;
  }
  
  // Modifier variants
  &--modifier-variant {
    property: value;
    
    // Modify internal elements from modifier
    .block__element {
      property: modified-element-value;
    }
  }
}
```

```scss
// ❌ INCORRECT - Flat classes (NEVER do this)
.block { }
.block__element { }
.block--modifier { }
```

### Benefits of Nested BEM
1. Reduces lines of code
2. Groups related logic together
3. Contextual media queries
4. Clear visual hierarchy
5. Easy maintenance
6. No naming collisions

---

## Design Token System

### Philosophy: NEVER Hardcode Values

**ALWAYS use design tokens from the theme system.**

### Token Categories

#### 1. Spacing (4px base scale)
```scss
// ❌ NEVER
padding: 24px;
margin: 1.5rem;

// ✅ ALWAYS
padding: $theme-spacing-6;      // 24px
margin: $theme-spacing-6;       // 24px
```

**Available Scale:**
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
// ❌ NEVER
color: #78c3b4;
background: #f0f0f0;

// ✅ For static colors (SCSS variables)
color: $color-turquoise-500;
background: $theme-color-bg-base;

// ✅ For themeable colors (CSS custom properties)
color: var(--theme-color-primary);
background: var(--theme-color-bg-base);
border-color: var(--theme-color-border-base);
```

**When to use each:**
- **SCSS Variables** (`$theme-*`): Static values that don't change with theme
- **CSS Custom Properties** (`var(--theme-*)`): Dynamic values for light/dark theme

#### 3. Typography
```scss
// ❌ NEVER
font-size: 18px;
font-weight: 600;

// ✅ ALWAYS
font-size: $theme-font-size-lg;
font-weight: $theme-font-weight-semibold;
line-height: $theme-line-height-relaxed;
```

#### 4. Border Radius
```scss
// ❌ NEVER
border-radius: 8px;

// ✅ ALWAYS
border-radius: $theme-radius-md;
```

#### 5. Shadows
```scss
// ❌ NEVER
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);

// ✅ ALWAYS
box-shadow: var(--theme-shadow-md);
```

#### 6. Transitions
```scss
// ❌ NEVER
transition: all 0.2s ease;

// ✅ ALWAYS
transition: opacity $theme-transition-base;
transition: transform $theme-transition-slow;
```

#### 7. Breakpoints
```scss
// ❌ NEVER
@media (min-width: 768px) { }

// ✅ ALWAYS
@media (min-width: $theme-breakpoint-md) { }
```

**Available Breakpoints:**
```scss
$theme-breakpoint-sm: 480px;   // Small mobile
$theme-breakpoint-md: 768px;   // PRIMARY BREAKPOINT (tablet)
$theme-breakpoint-lg: 1024px;  // Desktop
$theme-breakpoint-xl: 1280px;  // Large desktop
```

### Token File Structure
```
src/app/scss/
├── _d-prob-colors.scss           # Color primitives
├── _d-prob-colors-dark.scss      # Dark theme primitives
├── _d-prob-theme-tokens.scss     # Semantic tokens (spacing, typography, etc)
└── _d-prob-theme-variables.scss  # CSS custom properties (light/dark theme)
```

### Import Pattern in Components
```scss
// Only import tokens (not variables CSS)
@import '../../../scss/d-prob-theme-tokens';

:host {
  display: block;
}

.component {
  // Your styles using tokens
}
```

---

## Project-Specific Rules

### 🚫 Rule #1: NO Emojis/Icons in Code

**NEVER add emojis or icons in component HTML.**

**Allowed (only 2 in entire project):**
- `📝` - FAB recalculate button (calculator.component.html, mobile only)
- `📊` - Empty state in results (calculator.component.html)

**Reason:** Icon library (Lucide Angular) is pending full implementation. Until then, use only text or the 2 allowed emojis.

**Old Components to Ignore:**
- `probability-results.component.html` has icons but this component is NOT IN USE
- DO NOT touch old deprecated components unless explicitly required

### 📐 Rule #2: BEM Nested Structure is MANDATORY

All SCSS files MUST use nested BEM structure. Flat classes are forbidden.

**Real Example from Project:**
```scss
// ✅ CORRECT
.inputs {
  &__card {
    background: var(--theme-color-bg-elevated);
    padding: $theme-spacing-4;
    
    @media (min-width: $theme-breakpoint-md) {
      padding: $theme-spacing-6;
    }
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $theme-spacing-6;
  }
  
  &__form {
    display: flex;
    flex-direction: column;
    gap: $theme-spacing-4;
    
    &--collapsed {
      display: none;
      opacity: 0;
    }
  }
}

// ❌ INCORRECT - NEVER do this
.inputs__card {
  background: var(--theme-color-bg-elevated);
}

.inputs__header {
  display: flex;
}

.inputs__form--collapsed {
  opacity: 0;
}
```

### 🎨 Rule #3: ALWAYS Use Theme Tokens

**NEVER hardcode values like `24px`, `#78c3b4`, `1.5rem`, `600`, `8px`**

Every value must come from the token system:
- Spacing: `$theme-spacing-*`
- Colors: `$color-*` or `var(--theme-color-*)`
- Typography: `$theme-font-size-*`, `$theme-font-weight-*`
- Shadows: `var(--theme-shadow-*)`
- Radius: `$theme-radius-*`
- Transitions: `$theme-transition-*`
- Breakpoints: `$theme-breakpoint-*`

**Quick Reference:**
```scss
// Import tokens at top of component SCSS
@import '../../../scss/d-prob-theme-tokens';

.component {
  // Spacing
  padding: $theme-spacing-4;
  margin: $theme-spacing-6 0;
  gap: $theme-spacing-4;
  
  // Colors (static)
  color: $color-white;
  
  // Colors (themeable)
  background: var(--theme-color-bg-elevated);
  border-color: var(--theme-color-border-base);
  
  // Typography
  font-size: $theme-font-size-lg;
  font-weight: $theme-font-weight-semibold;
  
  // Borders
  border-radius: $theme-radius-md;
  
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

### 📱 Rule #4: Mobile-First Responsive Design

**Primary Breakpoint:** `$theme-breakpoint-md` (768px)

#### Desktop (>= 768px)
- Form always expanded and visible
- Auto-recalculate on value change
- No floating FAB button
- Show toggle theme in header

#### Mobile (< 768px)
- Form collapsible with toggle button
- Floating FAB button for recalculate
- Auto-collapse form after successful calculation
- NO auto-recalculate (user must tap FAB)

**Implementation Pattern:**
```typescript
// In component.ts
export class Component {
  isMobile: boolean = false;
  isFormExpanded: boolean = true;
  private mediaQuery?: MediaQueryList;

  private setupMobileDetection(): void {
    this.mediaQuery = window.matchMedia('(max-width: 767px)');
    this.isMobile = this.mediaQuery.matches;
    
    this.mediaQuery.addEventListener('change', (e) => {
      this.isMobile = e.matches;
      if (!this.isMobile) {
        this.isFormExpanded = true;
      }
    });
  }

  private setupFormListeners(): void {
    this.form.valueChanges.subscribe(() => {
      // Only auto-recalculate on desktop
      if (this.result && !this.isMobile) {
        this.calculate();
      }
    });
  }
}
```

```scss
// In component.scss (mobile-first)
.component {
  // Mobile styles (default)
  padding: $theme-spacing-4;
  
  // Desktop override
  @media (min-width: $theme-breakpoint-md) {
    padding: $theme-spacing-6;
  }
}
```

### 📂 Rule #5: Know Active vs Deprecated Components

**Active Components (use these):**
```
components/organisms/calculator/      # Main orchestrator
components/molecules/calculator-form/ # Input form
components/molecules/calculator-header/ # Header with theme toggle
components/molecules/calculator-results/ # Results display
components/molecules/result-card/     # Individual result card
```

**Deprecated Components (DO NOT USE):**
```
components/deck-configuration/  # Old, not in use
components/card-tracker/        # Old, not in use  
components/search-selector/     # Old, not in use
Old probability-results/        # Old version with emoji icons
```

**Reason:** Project evolved, old components pending cleanup. Only modify active components unless explicitly instructed.

---

## TypeScript Patterns

### Strict Mode Configuration
```json
{
  "strict": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "strictTemplates": true
}
```

### Component Pattern with Lifecycle
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-component',
  templateUrl: './component.component.html',
  styleUrls: ['./component.component.scss']
})
export class ComponentName implements OnInit, OnDestroy {
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private service: MyService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      field: ['', [Validators.required, Validators.min(0)]]
    });
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

### Service Pattern with BehaviorSubject
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MyService {
  private dataSubject = new BehaviorSubject<Data>(initialData);
  public data$: Observable<Data> = this.dataSubject.asObservable();

  updateData(data: Data): void {
    this.dataSubject.next(data);
    this.persistData(data);
  }

  private persistData(data: Data): void {
    localStorage.setItem('key', JSON.stringify(data));
  }
}
```

### Interface & Type Definitions
```typescript
// Always export interfaces
export interface CalculatorInput {
  searchType: SearchType;
  drawCount: number;
  totalCardsInDeck: number;
  type1Cards: number;
  type2Cards?: number;
  overlap?: number;
}

// Enums for constants
export enum SearchType {
  COOL_BOY = 'COOL_BOY',
  MEMORY = 'MEMORY',
  SPECIFIC_SEARCH = 'SPECIFIC_SEARCH',
  PLAIN_DRAW = 'PLAIN_DRAW'
}

// Type aliases for unions
export type Theme = 'light' | 'dark';
```

---

## Angular Forms Best Practices

### Reactive Forms Pattern
```typescript
private initForm(): void {
  this.form = this.fb.group({
    searchType: [SearchType.COOL_BOY, Validators.required],
    customValue: [3],
    drawCount: [1, [Validators.min(1)]],
    totalCardsInDeck: [45, [Validators.required, Validators.min(1)]],
    type1Cards: [4, [Validators.required, Validators.min(0)]],
    type2Cards: [0, [Validators.min(0)]],
    overlap: [0, [Validators.min(0)]]
  });
}

private setupFormListeners(): void {
  // Listen to specific field changes
  this.form.get('searchType')?.valueChanges.subscribe(value => {
    this.updateFormValidation(value);
  });

  // Listen to all form changes
  this.form.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(() => {
      if (this.form.valid) {
        this.onFormChange();
      }
    });
}

private updateFormValidation(searchType: SearchType): void {
  const type2Control = this.form.get('type2Cards');
  
  if (requiresType2(searchType)) {
    type2Control?.setValidators([Validators.required, Validators.min(0)]);
    type2Control?.enable();
  } else {
    type2Control?.clearValidators();
    type2Control?.disable();
  }
  
  type2Control?.updateValueAndValidity();
}
```

### Template Binding
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label>Field Name</label>
    <input 
      type="number" 
      formControlName="field"
      [class.invalid]="form.get('field')?.invalid && form.get('field')?.touched"
    >
    
    <!-- Error messages -->
    <div 
      *ngIf="form.get('field')?.hasError('required') && form.get('field')?.touched"
      class="error-message"
    >
      Field is required
    </div>
  </div>
</form>
```

---

## Development Workflow

### Commands
```bash
# Start development server
npm start

# Build for production
npm run build:prod

# Run tests
npm test

# Run tests in CI mode
npm run test:ci
```

### File Structure
```
component-name/
├── component-name.component.ts        # Component logic
├── component-name.component.html      # Template
├── component-name.component.scss      # Styles (BEM nested)
└── component-name.component.spec.ts   # Unit tests
```

### Naming Conventions
```
# Files
my-component.component.ts
my-service.service.ts
my-interface.model.ts

# Classes
export class MyComponent
export class MyService
export interface MyInterface

# Selectors
selector: 'app-my-component'
```

---

## Key Configuration Files

### angular.json
- **Style preprocessor:** SCSS
- **Inline style language:** SCSS
- **Assets:** favicon, robots.txt, sitemap.xml
- **Budget limits:** Initial 1MB max, component styles 15KB max

### tsconfig.json
- **Target:** ES2022
- **Module:** ES2022
- **Strict mode:** Enabled
- **Experimental decorators:** Enabled
- **Strict templates:** Enabled

### package.json
- **Angular CLI:** 16.2.16
- **TypeScript:** 5.1.3
- **RxJS:** 7.8.0
- **Lucide Angular:** 0.577.0

---

## Quality Standards

### Code Quality
1. **TypeScript Strict Mode** - All enabled (noImplicitReturns, noFallthroughCasesInSwitch, etc.)
2. **BEM Nested Structure** - Mandatory for all SCSS files
3. **Design Tokens First** - Never hardcode values
4. **Reactive Programming** - Use RxJS patterns with proper unsubscribe
5. **Component Lifecycle** - Implement OnDestroy with cleanup

### CSS/SCSS Quality
1. **Mobile-First** - Default mobile styles, override for desktop
2. **Contextual Media Queries** - Inside blocks, not separate files
3. **No Flat Classes** - Always use nested BEM structure
4. **Token Usage** - 100% token coverage, no hardcoded values
5. **Consistent Spacing** - Use spacing scale (4px base)

### Performance
1. **Bundle Size** - Initial: max 1MB, Component styles: max 15KB
2. **OnPush Change Detection** - When possible for better performance
3. **RxJS Optimization** - Use takeUntil for unsubscribe pattern
4. **Lazy Loading** - For routes (if/when added)

---

## Important Notes

### Current State of Project

1. **Old Components Exist**: `deck-configuration`, `card-tracker`, etc. are deprecated but not deleted. DO NOT USE or modify them.

2. **Active Component**: Only `calculator/` (organism) with its child molecules is currently in use.

3. **Icon System**: Lucide Angular is installed but not fully implemented. Only 2 emojis allowed until implementation.

4. **Mobile Detection**: Uses `window.matchMedia('(max-width: 767px)')` for viewport detection at 768px breakpoint.

5. **Auto-Recalculate**: Only on desktop (>= 768px). Mobile requires manual FAB tap.

6. **Theme Persistence**: Theme preference saved to LocalStorage automatically.

7. **Form State**: No persistence of form values between sessions (by design).

### When Adding New Features

#### Checklist for New Components
- [ ] Create with Angular CLI: `ng generate component components/molecules/new-component`
- [ ] Use nested BEM structure in SCSS
- [ ] Import `@import '../../../scss/d-prob-theme-tokens';`
- [ ] Use design tokens exclusively
- [ ] Implement OnDestroy with cleanup
- [ ] Add TypeScript interfaces for all data
- [ ] Follow mobile-first responsive pattern
- [ ] NO emojis/icons unless explicitly allowed

#### Checklist for SCSS Changes
- [ ] Use nested BEM (no flat classes)
- [ ] All values from tokens (no hardcoding)
- [ ] Media queries inside blocks
- [ ] Mobile-first approach
- [ ] Import tokens at top of file
- [ ] Use `var(--theme-*)` for themeable properties
- [ ] Use `$theme-*` for static properties

#### Checklist for TypeScript Changes
- [ ] Export all interfaces
- [ ] Use strict type checking
- [ ] Implement proper lifecycle hooks
- [ ] Use takeUntil for subscriptions
- [ ] FormBuilder for reactive forms
- [ ] Validators for form fields
- [ ] Clear, descriptive variable names

---

## Quick Reference

### Import Tokens in SCSS
```scss
@import '../../../scss/d-prob-theme-tokens';
```

### Common Token Values
```scss
// Spacing
$theme-spacing-4: 1rem;     // 16px - Standard padding
$theme-spacing-6: 1.5rem;   // 24px - Large spacing

// Breakpoints
$theme-breakpoint-md: 768px;  // PRIMARY - Mobile/Desktop split

// Colors (static)
$color-white: #ffffff;
$color-turquoise-500: #78c3b4;

// Colors (themeable)
var(--theme-color-primary)
var(--theme-color-bg-base)
var(--theme-color-text-primary)

// Typography
$theme-font-size-lg: 1.125rem;      // 18px
$theme-font-weight-semibold: 600;
```

### Mobile Detection Pattern
```typescript
private mediaQuery = window.matchMedia('(max-width: 767px)');
this.isMobile = this.mediaQuery.matches;

this.mediaQuery.addEventListener('change', (e) => {
  this.isMobile = e.matches;
});
```

### Unsubscribe Pattern
```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* ... */ });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Form Validation Update
```typescript
const control = this.form.get('fieldName');
control?.setValidators([Validators.required, Validators.min(0)]);
control?.updateValueAndValidity();
```

---

## File Locations Quick Reference

### Theme System Files
```
src/app/scss/
├── _d-prob-colors.scss              # Primitive colors
├── _d-prob-colors-dark.scss         # Dark theme primitives
├── _d-prob-theme-tokens.scss        # Semantic tokens (USE THIS)
└── _d-prob-theme-variables.scss     # CSS custom properties
```

### Active Components
```
src/app/components/
├── organisms/
│   └── calculator/                  # Main component (active)
└── molecules/
    ├── calculator-form/             # Input form (active)
    ├── calculator-header/           # Header (active)
    ├── calculator-results/          # Results (active)
    └── result-card/                 # Result card (active)
```

### Services
```
src/app/services/
├── calculator.service.ts            # Probability calculations
└── theme.service.ts                 # Theme management
```

### Models
```
src/app/models/
└── calculator.model.ts              # All interfaces and enums
```

---

## Common Mistakes to Avoid

### ❌ DON'T DO THIS:

```scss
// ❌ Flat BEM classes
.button { }
.button__icon { }
.button--primary { }

// ❌ Hardcoded values
padding: 24px;
color: #78c3b4;
font-size: 18px;

// ❌ Separate media queries
.component { padding: 16px; }
@media (min-width: 768px) {
  .component { padding: 24px; }
}

// ❌ Add emojis/icons
<button>✨ Click me</button>
```

```typescript
// ❌ No unsubscribe
ngOnInit() {
  this.service.data$.subscribe(data => {
    // Memory leak!
  });
}

// ❌ Magic numbers
if (viewport < 768) { }

// ❌ No types
function calculate(input) { }
```

### ✅ DO THIS:

```scss
// ✅ Nested BEM
.button {
  &__icon { }
  &--primary { }
}

// ✅ Use tokens
padding: $theme-spacing-6;
color: var(--theme-color-primary);
font-size: $theme-font-size-lg;

// ✅ Contextual media queries
.component {
  padding: $theme-spacing-4;
  
  @media (min-width: $theme-breakpoint-md) {
    padding: $theme-spacing-6;
  }
}

// ✅ Text only (until icon system implemented)
<button>Click me</button>
```

```typescript
// ✅ Proper unsubscribe
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* ... */ });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// ✅ Use constants
if (viewport < this.MOBILE_BREAKPOINT) { }
// Or better, use the mediaQuery pattern

// ✅ Strong typing
function calculate(input: CalculatorInput): CalculatorResult { }
```

---

## When in Doubt

1. **SCSS Question?**
   - Check `_d-prob-theme-tokens.scss` for available tokens
   - Use nested BEM structure
   - Import tokens at top of file

2. **Responsive Question?**
   - Primary breakpoint is `$theme-breakpoint-md` (768px)
   - Mobile-first: default mobile, override for desktop
   - Use `window.matchQuery` for JS detection

3. **Icon Question?**
   - Only 2 emojis allowed (📝, 📊)
   - Use text until Lucide is fully implemented
   - NO other emojis or Unicode icons

4. **Component Question?**
   - Is it in `organisms/calculator/` or `molecules/calculator-*`? Use it!
   - Is it old component? DO NOT USE

5. **TypeScript Question?**
   - Add types for everything
   - Use interfaces for data structures
   - Implement OnDestroy for cleanup

---

## Resources & Documentation

### Internal Documentation
- **Specifications:** `/especificaciones-de-proyecto.md` - Complete technical specifications
- **Memory:** `/memories/repo/base-project-standards.md` - Base standards and rules
- **User Memory:** `/memories/digimon-tcg-standards.md` - User preferences and standards

### External Resources
- Angular Docs: https://angular.io/docs
- RxJS Docs: https://rxjs.dev/
- TypeScript Docs: https://www.typescriptlang.org/docs/
- SCSS/Sass Docs: https://sass-lang.com/documentation/
- Lucide Icons: https://lucide.dev/

---

## Project Metadata

**Version:** 1.1.0  
**Last Updated:** March 16, 2026  
**Angular Version:** 16.2.0  
**TypeScript Version:** 5.1.3  
**Developer:** LledoSL  
**License:** MIT

---

## Agent Behavior Guidelines

### When Receiving Requests

1. **Always check** if it involves old/deprecated components
2. **Always use** design tokens, never hardcode
3. **Always follow** nested BEM structure in SCSS
4. **Always implement** proper TypeScript types
5. **Always consider** mobile-first responsive design
6. **Never add** emojis/icons (except the 2 allowed)
7. **Never modify** deprecated components without explicit instruction

### When Making Changes

1. **Read first** - Check existing patterns and implementation
2. **Use tokens** - All spacing, colors, typography from token system
3. **BEM structure** - Nested blocks with elements and modifiers
4. **Mobile-first** - Default mobile, override desktop at 768px
5. **Type safety** - Interfaces, enums, strict types
6. **Clean up** - Implement OnDestroy, use takeUntil pattern
7. **Test responsive** - Verify behavior at mobile breakpoint

### When in Doubt

- **Check** `especificaciones-de-proyecto.md` for detailed specs
- **Check** `/memories/repo/base-project-standards.md` for standards
- **Check** existing component implementations for patterns
- **Ask user** if something is unclear or conflicts with rules

---

**Remember:** This project has very specific standards for SCSS (nested BEM), design tokens (never hardcode), and responsive design (mobile-first with 768px breakpoint). Always follow these patterns.
