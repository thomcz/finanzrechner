# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finanzrechner is a financial calculator for computing loan amortization schedules, monthly annuities, and payment plans. It's a monorepo with three parts:

- **Root level**: Legacy JavaScript calculator with Webpack bundling, deployed to GitHub Pages
- **frontend/**: Modern Angular 21 application (under development)
- **backend/**: Spring Boot 4.0.1 Kotlin application (scaffolded, minimal)

Live site: https://thomcz.github.io/finanzrechner

## Commands

### Root Level (Legacy Calculator)
```bash
npm run build     # Webpack bundles src/app.js → docs/index.js
npm start         # Serve docs/ on http://localhost:8080
npm test          # Run Jest tests on src/app.test.js
```

### Frontend (Angular)
```bash
cd frontend
npm start         # Dev server on http://localhost:4200
npm run build     # Production build to dist/
npm test          # Run Vitest tests
```

### Backend (Spring Boot)
```bash
cd backend
./gradlew build      # Build JAR
./gradlew test       # Run JUnit 5 tests
./gradlew bootRun    # Run application
```

## Architecture

### Core Calculation Logic (src/app.js)
The main financing calculations are in vanilla JavaScript:

- `calculateFinanzierung(laufzeit, darlehen, zinsatz, tilgungsSatz)` - Computes full financing plan with payment schedule
- `calculateMonatlicheAnnuitaet(anfangsBestand, zinsatz, tilgungsSatz)` - Monthly annuity calculation
- `calculateZahlung(monat, anfangsBestand, zinsatz, monatlicheAnnuitaet)` - Individual payment calculation

Data models:
- `Finanzierung` - Result object containing payment plan array
- `ZahlungsplanItem` - Individual payment with month, principal, interest, repayment amounts

### Frontend (frontend/)
- Angular 21 with standalone components (no NgModule)
- Strict TypeScript and Angular compiler options enabled
- Uses Vitest for testing
- Prettier configured with single quotes and 100 char width

### Backend (backend/)
- Spring Boot 4.0.1 with Kotlin 2.2.21
- Java 21 toolchain
- Currently just scaffolded structure

## CI/CD

GitHub Actions (.github/workflows/main.yml):
- Triggers on push to main
- Runs `npm ci`, `npm run build`, `npm test`
- Deploys docs/ directory to GitHub Pages

## Key Files

| File | Purpose |
|------|---------|
| `src/app.js` | Core financing calculation functions |
| `src/app.test.js` | Jest tests for calculations |
| `docs/index.html` | Static HTML UI for GitHub Pages |
| `webpack.config.js` | Bundles src/app.js to docs/index.js |
| `frontend/src/app/app.ts` | Angular root component |
| `backend/src/main/kotlin/.../BackendApplication.kt` | Spring Boot entry point |