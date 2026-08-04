# Rules Validation Matrix

This document verifies that each rule is actionable for this repository and connected to real workflows.

## Validation Criteria
1. Clear scope (specific files/paths).
2. Clear reason (repo-specific risk/opportunity).
3. Actionable guidance (what to do when coding).
4. Direct evidence in current codebase.

## Rule 01: Backend Architecture and Data Determinism
- Scope clarity: PASS (`backend/app/**/*.py`, `backend/tests/**/*.py`).
- Repo fit: PASS. `backend/app/routes.py` centralizes concerns.
- Actionability: PASS. Thin handlers + service extraction + deterministic generator guidance.
- Evidence:
  - `backend/app/routes.py:94`
  - `backend/app/routes.py:96`
  - `backend/app/routes.py:97`
  - `backend/app/routes.py:248`

## Rule 02: Security and Runtime Modes
- Scope clarity: PASS (`backend/app/main.py`, `backend/Dockerfile`, `docker-compose.yml`, `frontend/vite.config.ts`).
- Repo fit: PASS. CORS is permissive and backend runtime is dev-oriented.
- Actionability: PASS. Environment-based CORS and dev/prod runtime split are concrete.
- Evidence:
  - `backend/app/main.py:9`
  - `backend/app/main.py:10`
  - `backend/Dockerfile:12`
  - `docker-compose.yml:20`
  - `frontend/vite.config.ts:13`

## Rule 03: Frontend Contracts, Error Handling, and UX States
- Scope clarity: PASS (`frontend/src/**/*.ts(x)`, `frontend/vite.config.ts`).
- Repo fit: PASS. API call is direct in App and formatting locale is hardcoded.
- Actionability: PASS. Central API client, mapping layer, and required UI states are concrete.
- Evidence:
  - `frontend/src/App.tsx:16`
  - `frontend/src/App.tsx:35`
  - `frontend/src/lib/financial-utils.ts:15`
  - `frontend/src/components/dashboard/kpi-card.tsx`

## Rule 04: Testing and Quality Gates
- Scope clarity: PASS (`backend/tests`, `frontend tests`, `frontend/package.json`).
- Repo fit: PASS. Backend and frontend unit tests exist; integration depth can grow.
- Actionability: PASS. Defines when tests are mandatory and what scripts are gates.
- Evidence:
  - `backend/tests/test_routes.py:9`
  - `backend/tests/test_routes.py:122`
  - `frontend/src/lib/financial-utils.test.ts:35`
  - `frontend/package.json:9`
  - `frontend/package.json:11`

## Rule 05: Documentation and Developer Experience Sync
- Scope clarity: PASS (`README.md`, `README.es.md`, compose, env example, mock data file).
- Repo fit: PASS. Bilingual docs and local workflow are core to this project.
- Actionability: PASS. Forces same-task docs updates when runtime settings change.
- Evidence:
  - `README.md:46`
  - `README.es.md:46`
  - `docker-compose.yml:7`
  - `docker-compose.yml:19`
  - `frontend/src/lib/mock-data.ts:3`

## Ambiguity Refinement Summary
The prior single rules file was too broad. It was refined into five scoped rule files with:
- explicit path-based scope,
- repo-specific reasons,
- coding-time decision guidance,
- concrete evidence links.