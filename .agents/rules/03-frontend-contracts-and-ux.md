# Rule 03: Frontend Contracts, Error Handling, and UX States

## Scope
Applies to:
- `frontend/src/**/*.ts`
- `frontend/src/**/*.tsx`
- `frontend/vite.config.ts`

## Reason
Frontend currently consumes backend data directly from `App.tsx` and computes metrics client-side. This works, but contract drift and weak error context can degrade maintainability.

## Rules
1. Centralize API calls.
- New API consumption should be implemented in a dedicated client module (`frontend/src/lib/*api*`).
- UI components should not build endpoint URLs directly when a shared client exists.

2. Preserve explicit data contracts.
- Keep strongly typed interfaces for wire payloads.
- If payload format changes (snake_case/camelCase), add a mapping function in one place.

3. Preserve loading, empty, and error states.
- New dashboard visual blocks must include loading and no-data behavior.
- Error handling should preserve response status/context for diagnostics.

4. Keep locale decisions explicit and consistent.
- Date, currency, and percent formatting locale must be documented and centralized.

## Task Guidance
- If adding a new dashboard chart, include skeleton + empty state in the component.
- If adding a new backend endpoint in UI, create typed response model and parsing/mapping in one module.

## Repo Validation Evidence
- Direct API call from UI exists: `fetch(`${API_BASE_URL}/api/metrics`)` at `frontend/src/App.tsx:16`.
- KPI and monthly logic are already isolated in utilities: `frontend/src/lib/financial-utils.ts:21`, `frontend/src/lib/financial-utils.ts:36`.
- Loading and empty states exist and should be preserved: `frontend/src/components/dashboard/kpi-card.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`.
- Locale is hardcoded to `en-US`: `frontend/src/lib/financial-utils.ts:15`, `frontend/src/lib/financial-utils.ts:70`.