# Quality and Risk Rules

## Purpose
These rules reduce current risks and preserve working patterns in this project.

## Architecture
1. Keep transport, domain logic, and data generation separated.
- API route handlers must stay thin.
- Move heavy business logic from backend/app/routes.py into dedicated service modules.

2. Avoid single-file API growth.
- Split route groups into module files when a router file exceeds 250 lines.

3. Keep frontend-to-backend contracts centralized.
- Define shared API schema source (OpenAPI-generated TS types or explicit adapters).
- Do not duplicate domain contracts manually in multiple places without sync checks.

## Security
4. Restrict CORS by environment.
- Development can allow broad origins.
- Production must not use wildcard origins with credentials enabled.

5. Separate development runtime from production runtime.
- Do not expose debug ports or run reload mode in production images.
- Use dedicated dev and prod Docker commands/configs.

## Data and Determinism
6. Use local random generator instances for deterministic mock data.
- Do not mutate global random state.
- Prefer random.Random(seed) and pass generator explicitly.

7. Make dataset time window explicit.
- Avoid implicit date.today() behavior for core data generation.
- Accept a reference date parameter with a safe default.

## Testing
8. Preserve and expand unit tests for pure calculations.
- Keep tests for KPI, monthly aggregation, and formatting utilities.
- Add edge cases for empty data, timezone/date boundary behavior, and invalid ranges.

9. Add API contract tests for frontend consumption.
- Validate response shape used by App against backend endpoints.
- Include at least one integration test that covers fetch + transformation flow.

10. Enforce CI quality gates.
- PRs must pass frontend lint + tests and backend tests before merge.

## Naming and Consistency
11. Standardize naming conventions across layers.
- Keep API wire format explicit (snake_case or camelCase) and document it.
- If API uses snake_case, frontend mapping layer should be explicit when converting to UI models.

12. Standardize locale strategy.
- Define one locale policy for dates, numbers, and user-facing messages.

## Documentation and DX
13. Keep README operationally accurate.
- Document run commands, ports, and environment variables in both README files.
- Update docs when endpoints or setup commands change.

14. Remove or mark unused development artifacts.
- Unused mock datasets must be deleted or clearly marked as optional examples.

## Preserve Useful Existing Patterns
15. Keep strong typing and response models.
- Continue using Pydantic response models and TypeScript type declarations.

16. Keep loading/empty UI states.
- Maintain skeletons and empty-state messages in dashboard widgets.

17. Keep local-first developer workflow.
- Preserve docker compose setup and Vite proxy behavior for fast local iteration.
