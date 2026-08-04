# Rule 04: Testing and Quality Gates

## Scope
Applies to:
- `backend/tests/**/*.py`
- `frontend/src/**/*.test.ts`
- `frontend/src/**/*.test.tsx`
- `frontend/package.json`

## Reason
The project already has useful tests and quality scripts. Rules should preserve this baseline and close the current integration-testing gap.

## Rules
1. Behavior changes require tests in the affected layer.
- Backend route behavior changes must update/add `backend/tests/test_routes.py` cases.
- Frontend business logic changes must update/add utility tests.

2. Add integration tests for UI data flow when touching API consumption.
- Changes to fetch/transform/render flow should include at least one integration-style test path.

3. Keep deterministic test data.
- Tests for date-sensitive behavior must use fixed dates/seeds.

4. Preserve quality scripts and treat them as merge gates.
- Keep `lint`, `test`, and `test:coverage` scripts operational.

## Task Guidance
- Before finishing non-trivial changes, run relevant test commands for touched areas.
- If tests are intentionally deferred, document the exact gap in the PR notes.

## Repo Validation Evidence
- Backend TestClient suite exists: `backend/tests/test_routes.py:9`.
- Backend covers summary/comparison/alerts endpoints: `backend/tests/test_routes.py:122`, `backend/tests/test_routes.py:159`, `backend/tests/test_routes.py:175`.
- Frontend tests exist for financial utilities: `frontend/src/lib/financial-utils.test.ts:35`.
- Quality scripts exist: `frontend/package.json:9`, `frontend/package.json:11`, `frontend/package.json:13`.