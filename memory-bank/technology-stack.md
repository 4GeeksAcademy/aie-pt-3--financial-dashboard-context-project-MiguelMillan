# Technology Stack

## Frontend
1. Framework principal: React 19 + TypeScript + Vite.
2. Visualizacion: Recharts.
3. UI y estilos: Tailwind CSS v4, utilidades clsx y tailwind-merge.
4. Lint y calidad: ESLint con typescript-eslint y plugins de React.
5. Testing: Vitest y cobertura con @vitest/coverage-v8.

Evidencia:
1. Dependencias y scripts: [frontend/package.json](../frontend/package.json#L7)
2. Punto de entrada React: [frontend/src/main.tsx](../frontend/src/main.tsx#L6)
3. Consumo API en App: [frontend/src/App.tsx](../frontend/src/App.tsx#L16)
4. Proxy de desarrollo: [frontend/vite.config.ts](../frontend/vite.config.ts#L11)

## Backend
1. Framework principal: FastAPI.
2. Servidor ASGI: Uvicorn.
3. Debug en desarrollo: debugpy.
4. Modelado de respuesta y tipado: Pydantic + typing.Literal.
5. Testing backend: pytest, pytest-cov, httpx y TestClient.

Evidencia:
1. Creacion de app: [backend/app/main.py](../backend/app/main.py#L6)
2. Dependencias Python: [backend/requirements.txt](../backend/requirements.txt#L1)
3. Endpoints tipados: [backend/app/routes.py](../backend/app/routes.py#L248)
4. Runtime de contenedor backend: [backend/Dockerfile](../backend/Dockerfile#L12)
5. Suite de pruebas: [backend/tests/test_routes.py](../backend/tests/test_routes.py#L9)

## Infraestructura y Tooling
1. Orquestacion de servicios con Docker Compose.
2. Frontend y backend en contenedores separados con volumenes de desarrollo.
3. Puertos expuestos: 5173 frontend, 8000 API, 5678 debug.
4. Configuracion de entorno frontend mediante VITE_API_BASE_URL.

Evidencia:
1. Servicios y puertos: [docker-compose.yml](../docker-compose.yml#L1)
2. Docker frontend: [frontend/Dockerfile](../frontend/Dockerfile#L1)
3. Docker backend: [backend/Dockerfile](../backend/Dockerfile#L1)
4. Documentacion de variable de entorno: [README.md](../README.md#L46), [README.es.md](../README.es.md#L46)

## Dependencias clave
1. Frontend: react, react-dom, recharts, tailwindcss, vite, vitest, eslint.
2. Backend: fastapi, uvicorn, debugpy, pytest, pytest-cov.

Evidencia:
1. Frontend deps: [frontend/package.json](../frontend/package.json#L15)
2. Backend deps: [backend/requirements.txt](../backend/requirements.txt#L1)
