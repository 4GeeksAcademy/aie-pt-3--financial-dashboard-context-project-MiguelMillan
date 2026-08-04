# Rule 01: Backend Architecture and Data Determinism

## Scope
Applies to:
- `backend/app/**/*.py`
- `backend/tests/**/*.py`

## Reason
The current backend concentrates models, data generation, business logic, and route handlers in one file (`backend/app/routes.py`). This increases change risk and makes tasks harder to review.

## Rules
1. Keep route handlers thin.
- Route handlers should orchestrate only: read params, call service functions, return typed response.

2. Keep business logic outside route handlers.
- Aggregation, comparison, alerts, and filtering logic should live in dedicated service modules.

3. Keep deterministic data generation local and explicit.
- Avoid mutating global random state.
- Prefer local generators (`random.Random(seed)`) passed to helper functions.

4. Make temporal reference explicit in generators.
- Data generation must accept a reference date for reproducibility in tests.

5. Preserve typed API contracts.
- New endpoints must declare a `response_model` and input constraints when relevant.

## Task Guidance
- If adding endpoint logic > 20 lines, create/extend a service function instead of embedding logic in the handler.
- If adding date-sensitive behavior, include tests with fixed reference dates.

## Repo Validation Evidence
- Router and business logic are currently mixed: `backend/app/routes.py`.
- Determinism concern exists: `random.seed(seed)` at `backend/app/routes.py:96`.
- Temporal coupling exists: `date.today()` at `backend/app/routes.py:97`.
- Typed contracts are already used and must be preserved: `@router.get(..., response_model=...)` at `backend/app/routes.py:248`, `backend/app/routes.py:268`, `backend/app/routes.py:305`.