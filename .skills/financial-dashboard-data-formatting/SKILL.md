# Financial Dashboard Data Formatting

## Objetivo
Estandarizar el formato de montos monetarios, porcentajes y valores faltantes en el dashboard financiero para evitar interpretaciones inconsistentes entre KPIs, tablas y tooltips.

## Inputs
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/App.tsx`
- Componentes que renderizan importes o porcentajes:
  - `frontend/src/components/dashboard/kpi-row.tsx`
  - `frontend/src/components/dashboard/income-outcome-chart.tsx`
  - `frontend/src/components/dashboard/profit-percent-chart.tsx`
  - `frontend/src/components/dashboard/b2b-b2c-income-chart.tsx`

## Instrucciones
1. Reutilizar funciones centralizadas de formateo (`formatCurrency`, `formatPercent`) cuando existan; no duplicar lógica de `Intl.NumberFormat` en múltiples componentes sin justificación.
2. Formato monetario base del dashboard:
   - Locale: `en-US`
   - Moneda: `USD`
  - Sin decimales para KPIs, tablas y tooltips de datos.
  - Excepción explícita: ticks de ejes pueden usar notación compacta (ej. `$12k`).
3. Valores faltantes (`null`, `undefined`, `NaN`) deben mostrarse como `—` en KPI y tablas.
  - En tooltips de gráficos: mostrar `—` si el dato original no es numérico.
  - Usar `0` solo cuando el valor de negocio sea realmente cero.
4. Porcentajes en KPI, tablas y tooltips deben mostrar 1 decimal y símbolo `%`.
  - En ticks de ejes se permite 0 o 1 decimal, pero debe quedar explícito por componente.
5. En variaciones o deltas (por ejemplo incrementos), preservar el signo negativo cuando aplique; no convertir negativos a valor absoluto.
6. En gráficos Recharts, normalizar valores no numéricos antes de formatear para evitar `NaN` visuales.
7. Si aparece un nuevo caso de formato financiero, extender `frontend/src/lib/financial-utils.ts` y reutilizarlo; evitar crear formateadores locales ad hoc.

## Output esperado
- Formato consistente entre tarjetas KPI, tablas y tooltips.
- Helpers centralizados usados de forma uniforme.
- Ausencia de `NaN`, `undefined` o formatos monetarios contradictorios en pantalla.

## Criterios de aceptación
- Todas las rutas visuales del dashboard muestran moneda con el mismo locale/moneda base.
- Todos los porcentajes en KPI, tablas y tooltips usan un decimal (`0.0%`).
- No aparecen strings `NaN` ni `undefined` en KPIs, tablas o tooltips.
- Los nuevos componentes financieros no introducen formateadores ad hoc si ya existe un helper equivalente.
