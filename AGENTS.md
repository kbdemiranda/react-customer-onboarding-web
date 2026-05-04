# Project: Customer Onboarding Web

## Purpose

This project implements the public web onboarding experience for a banking account opening flow.

It handles:
- customer personal data input
- contact information input
- address input
- document upload
- onboarding review
- onboarding status lookup, if implemented later

The interface must feel like a public banking product, not an internal backoffice/admin dashboard.

---

## Design Source

Follow `DESIGN.md` whenever available.

Rules:
- `DESIGN.md` defines visual direction, spacing, tone, colors, and UX principles.
- `AGENTS.md` defines engineering rules, architecture, and implementation behavior.
- If there is a conflict, preserve product UX and ask for clarification before making large design changes.

---

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- shadcn/ui when useful
- lucide-react for icons

---

## Architecture

Use a simple feature-based frontend architecture.

Recommended structure:

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── layout/
├── features/
│   └── onboarding/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/
│       └── types/
├── lib/
├── routes/
└── styles/
```

Rules:
- Keep pages thin.
- Put reusable UI in `components`.
- Put onboarding-specific logic inside `features/onboarding`.
- Keep API calls isolated in `api` files.
- Keep validation schemas in `schemas`.
- Keep TypeScript types in `types`.

---

## Coding Standards

- Use TypeScript strictly.
- Use functional React components.
- Prefer named exports.
- Avoid `any`.
- Keep components small and readable.
- Use Tailwind CSS for styling.
- Do not add unnecessary state management libraries.
- Use React Hook Form + Zod for forms.
- Use TanStack Query for server state.
- Use Axios for HTTP requests.

---

## Language Rules

- Source code, variables, functions, types, and file names must be in English.
- User-facing UI text must be in Brazilian Portuguese.

Examples:
- Component: `PersonalDataStep`
- Function: `submitOnboarding`
- UI label: `Nome completo`

---

## UX Rules

This is a public onboarding flow.

Do:
- Use a guided step-by-step experience.
- Keep one main task per screen.
- Use clear progress indicators.
- Show loading states.
- Show validation errors near fields.
- Disable submit buttons while submitting.
- Keep feedback simple and clear.

Do NOT:
- Build an admin dashboard.
- Use sidebars.
- Use internal-system navigation.
- Show large data tables in the public onboarding flow.
- Overload the user with too many fields at once.

---

## Main Flow

The onboarding flow should be split into steps:

1. Personal data
2. Contact information
3. Address
4. Documents
5. Review

Recommended routes:

```text
/onboarding
/onboarding/status
```

The internal step navigation can be handled in state or query params.

---

## API Integration

Backend base URL must come from environment variables.

Use:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Main endpoints:

```text
POST /api/v1/onboardings
GET /api/v1/onboardings
GET /api/v1/onboardings/{externalId}
POST /api/v1/onboardings/{externalId}/documents
GET /api/v1/onboardings/{externalId}/documents
GET /api/v1/onboardings/{externalId}/audit-logs
```

Rules:
- Do not hardcode the backend URL.
- Keep API clients typed.
- Normalize CPF, phone, and zip code only when needed by the API contract.
- Keep masking logic separate from API payload building.

---

## Form Rules

Use React Hook Form + Zod.

Validation rules:
- full name is required
- CPF is required
- email is required and must be valid
- phone is required
- zip code is required
- address number is required
- document type is required before upload
- file must be present before upload

Do not implement complex CPF digit validation in the frontend unless explicitly requested. The backend is the source of truth.

---

## Document Upload Rules

Allowed formats:
- PDF
- PNG
- JPG/JPEG

Frontend should:
- show selected file name
- show upload progress/loading state if simple
- validate obvious unsupported formats before sending
- keep backend as the final validator

Do not implement OCR, camera capture, or advanced document processing.

---

## Error Handling

Use backend `ErrorResponse` when available.

Display user-friendly messages:
- invalid input
- zip code not found
- onboarding not found
- document upload failed
- unexpected error

Do not expose stack traces or raw technical errors to the user.

---

## Accessibility

- Use semantic HTML.
- Labels must be associated with inputs.
- Buttons must have clear text.
- Keyboard navigation should work.
- Maintain sufficient contrast.

---

## Testing

When adding tests, prioritize:
- form validation
- step navigation
- API integration hooks
- document upload behavior

Do not block delivery with excessive tests.

---

## Git Rules

VERY IMPORTANT:

After each feature:
- `git add .`
- `git commit -m "feat: <feature description>"`

Rules:
- One feature per commit.
- Do not group unrelated changes.
- Use clear and descriptive commit messages.

Examples:
- `feat: create frontend project foundation`
- `feat: implement onboarding stepper layout`
- `feat: implement personal data form`
- `feat: integrate onboarding creation API`
- `feat: implement document upload step`

---

## Development Strategy

- Build in small steps.
- Keep the app compiling after every step.
- Prefer functional MVP over visual perfection.
- Do not implement all screens at once.
- Keep business rules aligned with the backend.

---

## What NOT to do

- Do NOT create a backoffice/admin dashboard.
- Do NOT add authentication.
- Do NOT add Redux/Zustand unless explicitly needed.
- Do NOT hardcode API URLs.
- Do NOT implement OCR.
- Do NOT add unnecessary animations.
- Do NOT change backend contracts without confirmation.

---

## Goal

Deliver a clean, responsive, public-facing banking onboarding frontend that integrates with the Customer Onboarding API and is suitable for a technical challenge demo.

