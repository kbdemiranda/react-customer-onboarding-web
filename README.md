# Customer Onboarding Web

Public-facing banking onboarding frontend built with React, TypeScript, and Vite.

This application guides customers through an account opening flow, including personal data, contact details, address, document upload, and final review.

## Overview

This project is designed as a step-by-step onboarding journey (not an admin dashboard).

Main goals:
- Collect customer onboarding data
- Upload customer documents
- Submit onboarding data to the backend API
- Provide onboarding status lookup route support

Current main routes:
- `/onboarding`
- `/onboarding/status`

## Tech Stack

- Vite
- React + TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Axios
- Vitest + Testing Library

## Architecture

Feature-based structure:

```text
src/
├── app/
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   └── onboarding/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/
│       ├── types/
│       └── utils/
├── lib/
├── routes/
└── test/
```

## Environment Variables

The frontend uses the backend base URL from Vite env:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

You can copy from `.env.example`.

## Getting Started (Node.js)

Requirements:
- Node.js 22+
- npm 10+

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Tests:

```bash
npm run test
```

Watch tests:

```bash
npm run test:watch
```

## Docker

This repository includes a multi-stage Docker setup and three Docker Compose files:

- `docker-compose.local.yml` -> local development container (Vite + HMR)
- `docker-compose.dev.yml` -> production-like build with dev environment variables
- `docker-compose.prod.yml` -> production build/runtime

### Docker Files

- `Dockerfile`:
  - `development` stage: runs Vite dev server on `5173`
  - `production` stage: serves static build with Nginx on `80`
- `docker/nginx/default.conf`: SPA routing fallback (`/index.html`)
- `docker/env/local.env`
- `docker/env/dev.env`
- `docker/env/prod.env`

### Run Local Docker (HMR)

```bash
docker compose --env-file docker/env/local.env -f docker-compose.local.yml up --build
```

Access app:
- `http://localhost:5173`

### Run Dev Docker

```bash
docker compose --env-file docker/env/dev.env -f docker-compose.dev.yml up --build
```

Access app:
- `http://localhost:4173`

### Run Prod Docker

```bash
docker compose --env-file docker/env/prod.env -f docker-compose.prod.yml up --build -d
```

Access app:
- `http://localhost:80`

### Stop Containers

```bash
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.prod.yml down
```

## API Integration

Expected backend base URL is injected by `VITE_API_BASE_URL`.

Main API endpoints used by the onboarding domain:
- `POST /api/v1/onboardings`
- `GET /api/v1/onboardings`
- `GET /api/v1/onboardings/{externalId}`
- `POST /api/v1/onboardings/{externalId}/documents`
- `GET /api/v1/onboardings/{externalId}/documents`
- `GET /api/v1/onboardings/{externalId}/audit-logs`

## Product and UX Notes

- Source code is written in English
- User-facing interface text is in Brazilian Portuguese
- The flow is optimized for public onboarding usability:
  - one main task per step
  - clear validation messages
  - loading/submitting feedback
  - simple and guided progression

## Git Workflow

Feature-oriented commits are preferred:
- one feature per commit
- descriptive commit message (`feat: ...`)

## License

This project is intended for technical challenge/demo usage unless otherwise defined by repository owner.
