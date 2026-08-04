# Rule 05: Documentation and Developer Experience Sync

## Scope
Applies to:
- `README.md`
- `README.es.md`
- `docker-compose.yml`
- `frontend/.env.example`
- `frontend/src/lib/mock-data.ts`

## Reason
This project depends on a clear local workflow (Docker Compose + Vite proxy + env override). Documentation drift or stale artifacts can quickly confuse contributors.

## Rules
1. Keep setup docs synchronized in both languages.
- Any change in ports, startup commands, or env variables must be reflected in `README.md` and `README.es.md`.

2. Keep run-path consistency.
- Compose services, Dockerfiles, and Vite proxy must agree on backend host/port assumptions.

3. Avoid stale artifacts in active paths.
- Unused mock sources must be removed or explicitly marked as optional reference data.

4. Keep onboarding commands simple and verifiable.
- Local run command examples must be directly executable as documented.

## Task Guidance
- If you change `docker-compose.yml` or proxy settings, update both READMEs in the same task.
- If adding mock data, either wire it into a clear dev flow or place a note explaining purpose and usage.

## Repo Validation Evidence
- Setup command documented: `docker compose up --build` in both READMEs.
- Env override documented in both READMEs: `VITE_API_BASE_URL` at `README.md:46` and `README.es.md:46`.
- Compose ports are explicit: `docker-compose.yml:7`, `docker-compose.yml:19`, `docker-compose.yml:20`.
- Vite proxy target is explicit: `frontend/vite.config.ts:13`.
- Potential stale artifact: `frontend/src/lib/mock-data.ts` appears exported but not used.