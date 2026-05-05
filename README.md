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

## System Demo

> Add demo assets here (GIFs, screenshots, short videos, or links).

Suggested blocks:
- Demo URL: `https://your-demo-url`
- Main flow video: `https://your-video-url`
- Screenshots:
  - Home/Start
  - Personal Data Step
  - Contact Step
  - Address Step
  - Documents Step
  - Review/Confirmation

Example markdown snippet:

```md
## System Demo

### Live Demo
[Open demo](https://your-demo-url)

### Main Flow (Video)
[Watch video](https://your-video-url)

### Screenshots
![Home](./docs/images/home.png)
![Personal Data](./docs/images/personal-data.png)
![Documents](./docs/images/documents.png)
```

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

The frontend uses environment variables loaded from `.env`.

```bash
VITE_API_BASE_URL=http://localhost:8080
LOCAL_FRONTEND_PORT=5173
DEV_VITE_API_BASE_URL=https://dev-api.seu-dominio.com
DEV_FRONTEND_PORT=4173
PROD_VITE_API_BASE_URL=https://api.seu-dominio.com
PROD_FRONTEND_PORT=80
APP_IMAGE_HUB=kbdemiranda/java-customer-onboarding-api:latest
FRONTEND_IMAGE_HUB=kbdemiranda/react-customer-onboarding-web:latest
SERVER_PORT=8080
FRONTEND_PORT=3000
POSTGRES_PORT=5432
POSTGRES_DB=onboarding
POSTGRES_USER=onboarding
POSTGRES_PASSWORD=onboarding
WIREMOCK_PORT=8081
```

Setup:

```bash
cp .env.model .env
```

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
- `docker-compose.dev.yml` -> production-like build with dev variables
- `docker-compose.prod.yml` -> production build/runtime
- `docker-compose.hub.yml` -> run API + frontend + Postgres + WireMock using Docker Hub images

### Docker Files

- `Dockerfile`:
  - `development` stage: runs Vite dev server on `5173`
  - `production` stage: serves static build with Nginx on `80`
- `docker/nginx/default.conf`: SPA routing fallback (`/index.html`)
- `.env.model` (tracked template)
- `.env` (local file, gitignored)

### Run Local Docker (HMR)

```bash
docker compose -f docker-compose.local.yml up --build
```

Access app:
- `http://localhost:5173`

### Run Dev Docker

```bash
docker compose -f docker-compose.dev.yml up --build
```

Access app:
- `http://localhost:4173`

### Run Prod Docker

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Access app:
- `http://localhost:80`

### Stop Containers

```bash
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.hub.yml down
```

### Run from Docker Hub Images (API + Frontend)

This flow uses pre-built images from Docker Hub and includes backend dependencies:

- `kbdemiranda/react-customer-onboarding-web`
- `kbdemiranda/java-customer-onboarding-api`
- `postgres:17-alpine`
- `wiremock/wiremock:3.13.1`

Start containers:

```bash
cp .env.hub.model .env
docker compose -f docker-compose.hub.yml up -d
```

Access:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- WireMock: `http://localhost:8081`
- Postgres: `localhost:5432`

Optional (pin image tags):

```bash
APP_IMAGE_HUB=kbdemiranda/java-customer-onboarding-api:latest \
FRONTEND_IMAGE_HUB=kbdemiranda/react-customer-onboarding-web:latest \
docker compose -f docker-compose.hub.yml up -d
```

Important:
- The frontend image is static and uses the API base URL defined at image build time (`VITE_API_BASE_URL`).
- If you need a different API URL in the frontend, publish a new frontend image tag built with the target `VITE_API_BASE_URL`.
- WireMock mappings should be placed in `wiremock/mappings` (this repository includes the folder scaffold).

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
