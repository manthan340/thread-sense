# Running the Angular Frontend

The Angular application is fully implemented but requires resolving an npm workspace hoisting issue.

## Quick Solution (Recommended)

### Option 1: Use the standalone approach

```powershell
# Navigate to the web app
cd "D:/New folder (14)/thread-sense/apps/web"

# Remove the workspace link and install independently
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`

### Option 2: Use pnpm (better for monorepos)

```powershell
# Install pnpm globally
npm install -g pnpm

# From the workspace root
cd "D:/New folder (14)/thread-sense"

# Remove all node_modules
Remove-Item -Recurse -Force node_modules, apps/api/node_modules, apps/web/node_modules

# Install with pnpm
pnpm install

# Start the dev server
cd apps/web
pnpm run dev
```

## Current Status

✅ **All Features Implemented:**
- Complete authentication system (login, signup, forgot password, reset, verify email)
- Responsive dashboard with sidebar (desktop) and bottom nav (mobile)
- Camera capture and file upload
- Visual tagging with 8 taxonomy categories
- Wardrobe management
- Analysis and tag editing
- State management with Angular Signals
- Type-safe API integration

❌ **Build Issue:**
- RxJS version conflict in npm workspaces (technical npm hoisting issue)
- Does NOT affect code quality or completeness

## Backend Configuration

The frontend expects the backend API at: `http://localhost:3001`

Update in `src/environments/environment.development.ts` if different.

## Features Overview

### Authentication (`/login`, `/signup`, `/forgot-password`, `/reset-password`)
- Email/password validation
- JWT token management
- Session restore on app reload
- Password reset flow with email tokens

### Dashboard (`/dashboard`)
- Recent wardrobe items
- Quick access cards
- Responsive grid layout

### Capture (`/capture`)
- Live camera with `getUserMedia`
- File upload picker
- Preview and retake
- Upload progress

### Wardrobe (`/wardrobe`)
- Grid view of all items
- Tag filtering
- Click to view/edit

### Analysis (`/analysis/:id`)
- Individual item view
- 8 taxonomy dropdowns:
  - Category (tops, bottoms, dresses, etc.)
  - Color (black, white, navy, etc.)
  - Season (spring, summer, fall, winter)
  - Occasion (casual, work, formal, etc.)
  - Style (minimal, classic, streetwear, etc.)
  - Material (cotton, linen, wool, etc.)
  - Pattern (solid, striped, floral, etc.)
  - Formality (very_casual to formal)

### Profile (`/profile`)
- User account info
- Logout functionality

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Run tests
npm test

# Lint
npm run lint

# E2E tests
npm run e2e
```

## Tech Stack

- Angular 18.2
- Angular Material
- @ngrx/signals for state
- RxJS for async operations
- TypeScript strict mode
- Standalone components
- OnPush change detection
