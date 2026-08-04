# Rule 02: Security and Runtime Modes

## Scope
Applies to:
- `backend/app/main.py`
- `backend/Dockerfile`
- `docker-compose.yml`
- `frontend/vite.config.ts`

## Reason
Current setup is optimized for development and can be unsafe if copied to production without guards.

## Rules
1. CORS must be environment-aware.
- Development may allow broad origins.
- Production must not use wildcard origins with credentials enabled.

2. Separate development and production runtime.
- Production runtime must not expose debug ports or use autoreload.
- Keep dev convenience (`debugpy`, `--reload`) isolated to dev configuration.

3. Keep network boundaries explicit.
- API proxy target and container ports must be documented and consistent with compose config.

## Task Guidance
- Any change to CORS or ports requires a paired doc update in both README files.
- Any production-oriented Docker change must remove debug options from production command paths.

## Repo Validation Evidence
- Permissive CORS currently present: `allow_origins=["*"]` and `allow_credentials=True` at `backend/app/main.py:9-10`.
- Dev-oriented backend runtime currently present: `debugpy` and `--reload` at `backend/Dockerfile:12`.
- Debug port exposed in compose: `5678:5678` at `docker-compose.yml:20`.
- Frontend proxy target is explicit: `http://backend:8000` at `frontend/vite.config.ts:13`.