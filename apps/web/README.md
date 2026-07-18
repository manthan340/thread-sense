# Thread Sense Frontend

Angular 18+ frontend application for Thread Sense - Your personal style assistant.

## Architecture

This application follows enterprise-grade Angular best practices:

- **Standalone Components**: Modern Angular architecture
- **Feature-First Structure**: Organized by business domains
- **Signal-Based State Management**: Reactive state using Angular Signals
- **Lazy Loading**: Optimized route-level code splitting
- **OnPush Change Detection**: Performance-optimized by default

## Project Structure

```
src/
├── app/
│   ├── core/           # Singleton services, interceptors, guards
│   ├── shared/         # Reusable UI components
│   ├── layouts/        # Application shells (sidebar, bottom nav)
│   ├── features/       # Business features (auth, dashboard, capture, etc.)
│   ├── models/         # API DTOs and view models
│   ├── state/          # Signal stores
│   └── routes/         # Route configuration
├── assets/             # Static assets
├── environments/       # Environment configuration
└── styles.scss         # Global styles
```

## Features

### Authentication
- Email/password login and registration
- Email verification flow
- Password reset functionality
- JWT-based session management

### Dashboard
- Overview of recent wardrobe items
- Quick access to capture and wardrobe

### Photo Capture
- Live camera capture with permission handling
- File upload from device
- Real-time preview before upload

### Wardrobe Management
- Grid view of all wardrobe items
- Visual tagging and categorization
- Filter and search capabilities

### Visual Tagging
- Backend-driven taxonomy system
- 8 tag categories: Category, Color, Season, Occasion, Style, Material, Pattern, Formality
- Tag editing interface for wardrobe items

### Responsive Design
- Desktop: Sidebar navigation
- Mobile: Bottom navigation bar
- Mobile-first approach throughout

## Technology Stack

- **Framework**: Angular 18+
- **State Management**: @ngrx/signals
- **UI Library**: Angular Material
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Testing**: Jasmine/Karma + Playwright
- **Linting**: ESLint + Prettier

## Development

### Prerequisites
- Node.js 18+ and npm
- Angular CLI

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`

### Build
```bash
npm run build
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run e2e
```

### Linting
```bash
npm run lint
```

## API Integration

The frontend integrates with the NestJS backend API at the following endpoints:

- `/auth/*` - Authentication endpoints
- `/images/*` - Image upload and management
- `/taxonomies` - Tag taxonomy data

API base URL is configured in `src/environments/environment.ts`

## State Management

Uses Angular Signals with @ngrx/signals for reactive state:

- **SessionStore**: Authentication and user session
- **TaxonomyStore**: Cached taxonomy/enum data

## Security

- JWT tokens stored in sessionStorage
- HTTP-only cookie support ready
- Auth interceptor for automatic token attachment
- Error interceptor for centralized error handling
- Route guards for protected routes

## Performance Optimizations

- OnPush change detection strategy
- Lazy-loaded route modules
- Virtual scrolling for long lists
- Image optimization
- TrackBy functions for ngFor

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Follow the established patterns:
- Use standalone components
- Implement OnPush change detection
- Follow the feature-first folder structure
- Write tests for new features
- Use Signals for state management

## License

Private - Thread Sense Project
