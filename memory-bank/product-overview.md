# Product Overview

## Proposito
Este repositorio implementa un dashboard financiero full-stack para visualizar ingresos, egresos, utilidad neta y margen de utilidad mensual.

## Problema que resuelve
Permite explorar metricas operativas de negocio con filtros y agregaciones temporales sin depender de una base de datos real, usando datos simulados reproducibles.

## Arquitectura funcional
1. Backend FastAPI expone endpoints de salud y metricas financieras.
2. Frontend React consume la API, calcula KPIs y prepara datos para graficos.
3. Docker Compose orquesta ambos servicios para desarrollo local.

## Flujo principal de usuario
1. El frontend inicia en el navegador y monta la aplicacion.
2. La vista principal solicita datos a /api/metrics.
3. Se calculan KPI y serie mensual en cliente.
4. Se renderizan tarjetas y graficos de tendencia.

## Alcance actual del producto
1. API incluye endpoints avanzados para summary, top categories, comparacion, alertas y cortes B2B/B2C.
2. La UI principal actualmente consume solo /api/metrics.
3. El enfoque esta orientado a desarrollo y aprendizaje, no a produccion.

## Evidencia verificable
1. Inicializacion backend: [backend/app/main.py](../backend/app/main.py#L6)
2. Registro de rutas backend: [backend/app/main.py](../backend/app/main.py#L14)
3. Endpoints de metricas: [backend/app/routes.py](../backend/app/routes.py#L248), [backend/app/routes.py](../backend/app/routes.py#L268), [backend/app/routes.py](../backend/app/routes.py#L305), [backend/app/routes.py](../backend/app/routes.py#L342), [backend/app/routes.py](../backend/app/routes.py#L362), [backend/app/routes.py](../backend/app/routes.py#L378)
4. Fetch principal del frontend: [frontend/src/App.tsx](../frontend/src/App.tsx#L16)
5. Calculo de KPIs y mensual: [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L21), [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts#L36)
6. Orquestacion local de servicios: [docker-compose.yml](../docker-compose.yml#L1)
