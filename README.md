# Digimon TCG Deck Builder

A modern, functional web application for building and managing Digimon Trading Card Game decks.

## Features

- **Card Search**: Browse and filter 8,095+ cards from DigimonCard.dev API
- **Three-Zone Deck Builder**: Digi-Eggs (5), Main Deck (50), and Side Deck
- **Real-time Validation**: Enforces official TCG rules (max 5 copies per card)
- **Deck Statistics**: Visual analytics with cost curves and color distribution
- **Collection Tracker**: Manage your personal card collection with variants
- **Import/Export**: Share decks in TCGOne text format
- **Offline Support**: IndexedDB caching for offline card browsing

## Tech Stack

- **Framework**: Angular 16.2
- **Language**: TypeScript 5.1 (strict mode)
- **Styling**: SCSS with BEM methodology
- **State Management**: RxJS BehaviorSubjects
- **Storage**: localStorage + IndexedDB (Dexie.js)
- **Charts**: Chart.js with ng2-charts
- **Drag & Drop**: Angular CDK

## Project Structure

```
src/
├── app/
│   ├── core/           # Services, models, guards
│   ├── shared/         # Reusable components (Atomic Design)
│   ├── features/       # Feature modules
│   └── scss/           # Design system tokens
├── assets/             # Static resources
└── environments/       # Environment configs
```

## Getting Started

### Prerequisites

- Node.js >= 16.x
- npm >= 7.x
- Angular CLI 16.2.x

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200
```

### Build

```bash
# Production build
npm run build

# Output will be in dist/deckbuilder-me
```

## Development Standards

### SCSS + BEM Methodology

All styles use **nested BEM** (Block Element Modifier) with theme tokens:

```scss
.deck-builder {
  padding: $spacing-4;
  
  &__zone {
    border: 2px solid $color-border;
    
    &--digi-eggs {
      background-color: $color-eggs-bg;
    }
  }
  
  @media (min-width: $breakpoint-md) {
    padding: $spacing-6;
  }
}
```

### Atomic Design

Components organized as:
- **Atoms**: Button, Input, Card, Badge
- **Molecules**: SearchBar, FilterPanel, CardCounter
- **Organisms**: DeckBuilder, CardGrid, StatsPanel

### Design Tokens

Located in `src/app/scss/_variables.scss`:
- **7 TCG Colors**: Red, Blue, Yellow, Green, Black, Purple, White
- **Spacing**: 8px base system ($spacing-1 through $spacing-8)
- **Typography**: Roboto font family with size/weight tokens
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px)

## API Integration

Uses [DigimonCard.dev](https://digimoncard.dev) public API for card data.

## License

MIT License - See LICENSE file for details

## Contributing

1. Follow BEM naming conventions for all SCSS
2. Use TypeScript strict mode
3. Write unit tests for services and components
4. Ensure mobile responsiveness (320px+)
5. No hardcoded values - use theme tokens only

## Roadmap

- [x] Phase 0: Project setup and design system
- [ ] Phase 1: Core deck builder with validation
- [ ] Phase 2: Collection tracker and import/export
- [ ] Phase 3: Community features and statistics

---

Built with ❤️ for the Digimon TCG community
