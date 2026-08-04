# Especificacion de Componentes

Este documento desglosa los componentes necesarios para las 3 funcionalidades solicitadas.

## Convenciones generales

1. Todos los componentes deben ser presentacionales cuando sea posible.
2. La carga de datos debe centralizarse en componentes contenedor o hooks de dominio.
3. Los params y respuestas de API deben tiparse con:
- ../specs/param-types.ts
- ../specs/api-types.ts
4. El formato de fechas para API siempre es YYYY-MM-DD.

---

## Funcionalidad 1: Filtro de rango de fechas en dashboard principal

### 1. DateRangeFilterCard

Responsabilidad:
- Renderizar inputs de fecha inicio/fin.
- Mostrar el rango disponible de dataset.
- Mostrar validacion local de rango invalido.

Props:
- title: string
- value: { start_date: string; end_date: string }
- onChange: (next: { start_date: string; end_date: string }) => void
- minDate?: string
- maxDate?: string
- loading?: boolean
- invalidRange?: boolean

Estado interno:
- Sin estado de negocio; controlado por props.

Renderizado condicional requerido:
- Si start_date y end_date estan vacios: no aplicar filtros de fecha.
- Si solo start_date tiene valor: filtrar desde start_date en adelante (end_date indefinido).
- Si solo end_date tiene valor: filtrar hasta end_date (start_date indefinido).
- Si start_date > end_date: mostrar error de validacion y evitar actualizar datos con rango invalido.

Dependencias:
- FacetsResponse para min_date y max_date.

Reutilizacion:
- Se usa en vista principal.
- Se usa en vista comparativa B2B vs B2C.

### 2. MainDashboardContainer

Responsabilidad:
- Orquestar fetch de metricas con DateRangeFilter opcional.
- Calcular KPIs y serie mensual.
- Pasar datos a KPIRow, IncomeOutcomeChart y ProfitPercentChart.

Estado:
- dateRange
- loading
- error
- metrics
- monthlyData

APIs:
- GET /api/metrics
- GET /api/metrics/facets

Renderizado condicional requerido:
- Si loading=true: mostrar estados de carga en KPI y charts.
- Si error existe: mostrar banner de error sin ocultar toda la pagina.
- Si metrics vacio por filtro valido: mostrar estados vacios explicitos en graficos.

---

## Funcionalidad 2: Tabla de alertas de anomalias

### 1. AlertsPanel

Responsabilidad:
- Encapsular input de threshold.
- Renderizar tabla de alertas o estado vacio.
- Mostrar loading/error propio de alertas.

Props:
- rows: AlertTableRow[]
- threshold: number
- onThresholdChange: (value: number) => void
- loading?: boolean
- error?: string | null

Estado interno:
- Opcional: estado transitorio para input numerico.

Notas de UX:
- El input de threshold permite rango 0.01 a 1.0.
- Si no hay filas, mostrar mensaje explicito de vacio.

Renderizado condicional requerido:
- Si loading=true: mostrar fila/celda de carga en la tabla.
- Si rows.length===0: renderizar texto explicito de estado vacio (no ocultar panel ni tabla).
- Si error!=null: mostrar error y mantener estructura del panel visible.

### 2. AlertsTable

Responsabilidad:
- Renderizar estructura tabular con columnas:
- Periodo
- Outcome registrado
- Media movil de 3 periodos anteriores
- Incremento porcentual

Props:
- rows: AlertTableRow[]
- loading?: boolean
- emptyMessage?: string

Renderizado condicional requerido:
- `loading` => fila unica con mensaje de carga.
- `rows.length===0` => fila unica con `emptyMessage` (por defecto: "No anomalies detected for the current threshold.").
- `rows.length>0` => render normal de filas.

Tipo de fila sugerido:
- AlertTableRow = {
  period: string;
  outcomeTotal: number;
  movingAverage3: number;
  increasePercent: number;
}

### 3. useAlertsData (hook de dominio sugerido)

Responsabilidad:
- Obtener AlertsResponse con AlertsParams.
- Obtener summary mensual para media movil real de 3 periodos.
- Transformar payload API a AlertTableRow.

Entradas:
- threshold: number
- dateRange: DateRangeFilter

Salidas:
- rows
- loading
- error

APIs:
- GET /api/metrics/alerts
- GET /api/metrics/summary?group_by=month

---

## Funcionalidad 3: Vista comparativa B2B vs B2C

### 1. ComparisonViewContainer

Responsabilidad:
- Gestionar filtro de fechas para comparativa.
- Cargar top categorias de ingreso para B2B y B2C.
- Calcular totales por segmento.

Estado:
- comparisonDateRange
- loading
- error
- b2bTopCategories
- b2cTopCategories

APIs:
- GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
- GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
- GET /api/metrics/facets

Renderizado condicional requerido:
- Si loading=true: mostrar estados de carga de ambas tablas y grafico.
- Si solo una lista (B2B o B2C) esta vacia: su panel muestra estado vacio explicito; el otro panel y grafico siguen visibles.
- Si ambas listas estan vacias: ambos paneles muestran estado vacio explicito y el grafico muestra barras en 0.

### 2. TopCategoriesTable

Responsabilidad:
- Mostrar top 5 categorias por grupo.
- Renderizar porcentaje sobre total del grupo.

Props:
- title: string
- rows: CategoryEntry[]
- groupTotal: number
- loading?: boolean
- emptyMessage?: string

Columnas:
- Categoria
- Total de ingresos
- % sobre total del grupo

Renderizado condicional requerido por panel:
- Panel B2B:
  - Si `rows.length===0`, mostrar mensaje: "No category data available for B2B in the selected range.".
- Panel B2C:
  - Si `rows.length===0`, mostrar mensaje: "No category data available for B2C in the selected range.".

### 3. SegmentIncomeComparisonChart

Responsabilidad:
- Comparar visualmente ingreso total B2B vs B2C.

Props:
- data: Array<{ segment: "B2B" | "B2C"; income: number }>
- loading?: boolean

Notas:
- Unico grafico debajo de ambas tablas.
- Debe respetar el mismo DateRangeFilter aplicado en la vista comparativa.

---

## Componentes transversales

### 1. DashboardViewSwitcher

Responsabilidad:
- Permitir navegar entre:
- Main dashboard
- B2B vs B2C

Props:
- value: "main" | "comparison"
- onChange: (value: "main" | "comparison") => void

### 2. ApiErrorBanner

Responsabilidad:
- Mostrar errores de carga de forma consistente.

Props:
- message: string
- visible: boolean

### 3. EmptyStateRow

Responsabilidad:
- Estado vacio reutilizable para tablas.

Props:
- colSpan: number
- message: string

---

## Mapeo de implementacion actual

1. Ya existe en App:
- Selector de vista principal/comparativa.
- Filtros de fecha para ambas vistas.
- Tabla de alertas con threshold.
- Tablas top categorias B2B/B2C.
- Grafico comparativo B2B vs B2C.

2. Refactor recomendado:
- Extraer DateRangeFilterCard.
- Extraer AlertsPanel y AlertsTable.
- Extraer TopCategoriesTable y SegmentIncomeComparisonChart.
- Extraer hooks useMainMetricsData, useAlertsData y useComparisonData.

Objetivo del refactor:
- Reducir complejidad de App.
- Facilitar pruebas unitarias e integracion por bloque funcional.
- Reutilizar componentes entre vistas y futuras funcionalidades.
