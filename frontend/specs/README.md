# Documentacion del Contrato de Datos

Este documento describe el contrato de datos de las 3 funcionalidades nuevas del dashboard.

## Verificacion de endpoints contra /docs

Los endpoints y parametros aqui documentados fueron verificados contra el esquema OpenAPI generado por FastAPI (base de la pagina /docs), usando `app.openapi()` del backend.

Evidencia de definicion en backend:
- /api/metrics/facets en [backend/app/routes.py](../../backend/app/routes.py#L262)
- /api/metrics/alerts en [backend/app/routes.py](../../backend/app/routes.py#L342)
- /api/metrics/categories/top en [backend/app/routes.py](../../backend/app/routes.py#L287)
- /api/metrics en [backend/app/routes.py](../../backend/app/routes.py#L248)
- /api/metrics/summary en [backend/app/routes.py](../../backend/app/routes.py#L268)

Tipos TypeScript usados:
- Respuestas: [frontend/specs/api-types.ts](api-types.ts)
- Parametros: [frontend/specs/param-types.ts](param-types.ts)
- Cliente de consumo: [frontend/src/lib/api-client.ts](../src/lib/api-client.ts)

---

## Funcionalidad 1: Filtro de rango de fechas en dashboard principal

### Endpoints consumidos
1. GET /api/metrics/facets
- Uso: obtener min_date y max_date para mostrar rango valido al usuario.

2. GET /api/metrics
- Uso: obtener movimientos filtrados por fecha para recalcular KPIs y graficos actuales.
- Query params opcionales: start_date, end_date.

### Tipos TypeScript usados
Request:
- DateRangeFilter (param-types.ts)

Response:
- FacetsResponse (api-types.ts)
- FinancialMovement[] (src/lib/financial-types.ts)

### Valores validos y restricciones
1. start_date
- Tipo: string (fecha)
- Formato: YYYY-MM-DD
- Opcional

2. end_date
- Tipo: string (fecha)
- Formato: YYYY-MM-DD
- Opcional

3. Reglas de UI
- Ambos campos pueden ir vacios: se cargan todos los datos.
- Si start_date > end_date: no disparar consulta y mostrar error de validacion en pantalla.

### Casos edge y respuesta esperada de UI
1. Caso edge: ambos inputs vacios
- Esperado API: /api/metrics sin start_date ni end_date.
- Esperado UI: mostrar todo el dataset, KPIs y graficos completos.

2. Caso edge: solo un input de fecha relleno
- Esperado API:
  - solo start_date => filtra desde start_date en adelante.
  - solo end_date => filtra hasta end_date.
- Esperado UI: recalcular KPIs/graficos con filtro parcial valido, sin mostrar error.

3. Caso edge: start_date mayor que end_date
- Esperado API: no ejecutar fetch con rango invalido.
- Esperado UI: mostrar mensaje de validacion y mantener estado seguro (sin datos inconsistentes).

4. Caso edge: rango valido pero sin datos en ese periodo
- Esperado API: lista vacia.
- Esperado UI: KPIs en cero/estado neutro y graficos en estado vacio explicito.

---

## Funcionalidad 2: Tabla de alertas de anomalias

### Endpoints consumidos
1. GET /api/metrics/alerts
- Uso: obtener periodos con alerta de incremento de outcome.
- Query params:
  - threshold (numero, default 0.3, minimo 0 en backend)
  - start_date (opcional)
  - end_date (opcional)
  - group_by (opcional, default month; UI actual usa month)

2. GET /api/metrics/summary?group_by=month
- Uso: calcular media movil de 3 periodos anteriores para la tabla UI.
- Query params opcionales: start_date, end_date.

### Tipos TypeScript usados
Request:
- AlertsParams (param-types.ts)
- DateRangeFilter (param-types.ts)

Response:
- AlertsResponse / AlertEntry (api-types.ts)
- MetricsSummaryItem (tipo interno en api-client.ts)

### Valores validos y restricciones
1. threshold
- Tipo: number
- Restriccion backend: >= 0
- Restriccion UI: 0.01 a 1.0
- Default UI: 0.3

2. group_by
- Valores validos segun OpenAPI: day | week | month
- Valor usado por UI para la tabla: month

3. start_date / end_date
- Tipo: string (fecha)
- Formato: YYYY-MM-DD
- Opcionales

### Casos edge y respuesta esperada de UI
1. Caso edge: threshold alto sin anomalias
- Esperado API: []
- Esperado UI: tabla visible con mensaje explicito "No anomalies detected..." (no ocultar el bloque).

2. Caso edge: solo un input de fecha relleno
- Esperado API:
  - solo start_date => alertas desde start_date.
  - solo end_date => alertas hasta end_date.
- Esperado UI: tabla de alertas filtrada parcialmente, manteniendo panel visible.

3. Caso edge: threshold fuera de rango UI (por input manual)
- Esperado UI: clamp a [0.01, 1.0] antes de consultar.
- Esperado API: recibe valor normalizado.

4. Caso edge: summary sin suficientes periodos previos para media movil de 3
- Esperado UI: fallback a baseline_average del backend para evitar celdas vacias o NaN.

---

## Funcionalidad 3: Vista comparativa B2B vs B2C

### Endpoints consumidos
1. GET /api/metrics/categories/top
- Uso: top 5 categorias de ingreso por segmento.
- Query params usados:
  - operation_type=income
  - limit=5
  - business_type=B2B o B2C
  - start_date (opcional)
  - end_date (opcional)

2. GET /api/metrics/facets
- Uso: obtener categorias disponibles y rango de fechas de referencia.

### Tipos TypeScript usados
Request:
- TopCategoriesParams (param-types.ts)
- DateRangeFilter (param-types.ts)

Response:
- TopCategoriesResponse / CategoryEntry (api-types.ts)
- FacetsResponse (api-types.ts)

### Valores validos y restricciones
1. operation_type
- Valores validos OpenAPI: income | outcome
- Valor requerido por la funcionalidad: income

2. limit
- Tipo: integer
- Restriccion backend: 1 <= limit <= 20
- Valor requerido por la funcionalidad: 5

3. business_type
- Valores validos: B2B | B2C

4. start_date / end_date
- Tipo: string (fecha)
- Formato: YYYY-MM-DD
- Opcionales

### Casos edge y respuesta esperada de UI
1. Caso edge: solo un input de fecha relleno
- Esperado API:
  - solo start_date => top categories desde start_date.
  - solo end_date => top categories hasta end_date.
- Esperado UI: tablas y grafico recalculados con filtro parcial valido.

2. Caso edge: un segmento sin categorias en el rango
- Esperado API: [] para ese segmento.
- Esperado UI: tabla del segmento con estado vacio explicito; la otra tabla y grafico siguen visibles.

3. Caso edge: facets categorias no incluye alguna categoria devuelta por top
- Esperado UI: filtrar/validar usando facets para evitar render de categoria fuera de contrato.

4. Caso edge: ambos segmentos con total 0
- Esperado UI: grafico comparativo visible con barras en 0 y mensaje contextual opcional, sin romper layout.

---

## Mapeo rapido de contratos por funcionalidad

1. Filtro de fechas principal
- Request types: DateRangeFilter
- Response types: FacetsResponse, FinancialMovement[]

2. Alertas de anomalias
- Request types: AlertsParams, DateRangeFilter
- Response types: AlertsResponse, AlertEntry, MetricsSummaryItem

3. Comparativa B2B vs B2C
- Request types: TopCategoriesParams, DateRangeFilter
- Response types: TopCategoriesResponse, CategoryEntry, FacetsResponse
