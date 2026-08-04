import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";
import {
  fetchAlerts,
  fetchFacets,
  fetchMetrics,
  fetchMonthlySummary,
  fetchTopCategories,
} from "@/lib/api-client";
import type {
  AlertEntry,
  CategoryEntry,
  FacetsResponse,
} from "../specs/api-types";
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "../specs/param-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewMode = "main" | "comparison";

interface DateRangeInputState {
  start_date: string;
  end_date: string;
}

interface AlertTableRow {
  period: string;
  outcomeTotal: number;
  movingAverage3: number;
  increasePercent: number;
}

const DEFAULT_ALERT_THRESHOLD = 0.3;

function toRangeFilter(range: DateRangeInputState): DateRangeFilter {
  return {
    start_date: range.start_date || undefined,
    end_date: range.end_date || undefined,
  };
}

function hasInvalidRange(range: DateRangeInputState): boolean {
  return Boolean(range.start_date && range.end_date && range.start_date > range.end_date);
}

function buildMovingAverageMap(
  summary: Array<{ period: string; outcome: number }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < summary.length; i += 1) {
    if (i < 3) {
      continue;
    }
    const previousThree = summary.slice(i - 3, i);
    const average =
      previousThree.reduce((acc, item) => acc + item.outcome, 0) / previousThree.length;
    map.set(summary[i].period, average);
  }
  return map;
}

function formatPeriodLabel(range: DateRangeInputState, facets: FacetsResponse | null): string {
  const start = range.start_date || facets?.min_date;
  const end = range.end_date || facets?.max_date;
  if (!start || !end) {
    return "Financial range";
  }
  return `${start} - ${end}`;
}

function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("main");

  const [mainRange, setMainRange] = useState<DateRangeInputState>({
    start_date: "",
    end_date: "",
  });
  const [comparisonRange, setComparisonRange] = useState<DateRangeInputState>({
    start_date: "",
    end_date: "",
  });

  const [facets, setFacets] = useState<FacetsResponse | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(true);

  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [alerts, setAlerts] = useState<AlertTableRow[]>([]);
  const [alertsThreshold, setAlertsThreshold] = useState(DEFAULT_ALERT_THRESHOLD);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [b2bTopCategories, setB2bTopCategories] = useState<CategoryEntry[]>([]);
  const [b2cTopCategories, setB2cTopCategories] = useState<CategoryEntry[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setFacetsLoading(true);
    fetchFacets()
      .then((data) => {
        if (!active) {
          return;
        }
        setFacets(data);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setError("No se pudo cargar el rango disponible de fechas.");
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setFacetsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hasInvalidRange(mainRange)) {
      setError("La fecha de inicio no puede ser mayor que la fecha de fin.");
      setMetrics(null);
      setMonthlyData([]);
      setMetricsLoading(false);
      return;
    }

    let active = true;
    setMetricsLoading(true);
    setError(null);

    fetchMetrics(toRangeFilter(mainRange))
      .then((movements) => {
        if (!active) {
          return;
        }
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setError("No se pudo cargar la informacion financiera. Revisa la API de backend.");
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setMetricsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mainRange]);

  useEffect(() => {
    if (hasInvalidRange(mainRange)) {
      setAlertsError("La fecha de inicio no puede ser mayor que la fecha de fin.");
      setAlerts([]);
      setAlertsLoading(false);
      return;
    }

    let active = true;
    setAlertsLoading(true);
    setAlertsError(null);

    const params: AlertsParams = {
      threshold: alertsThreshold,
      ...toRangeFilter(mainRange),
    };

    Promise.all([fetchAlerts(params), fetchMonthlySummary(toRangeFilter(mainRange))])
      .then(([alertRows, summary]) => {
        if (!active) {
          return;
        }

        const movingAverageMap = buildMovingAverageMap(summary);
        const tableRows: AlertTableRow[] = alertRows.map((entry: AlertEntry) => {
          const movingAverage3 = movingAverageMap.get(entry.period) ?? entry.baseline_average;
          const ratio =
            movingAverage3 > 0
              ? (entry.outcome_total - movingAverage3) / movingAverage3
              : entry.increase_ratio;

          return {
            period: entry.period,
            outcomeTotal: entry.outcome_total,
            movingAverage3,
            increasePercent: ratio * 100,
          };
        });

        setAlerts(tableRows);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setAlertsError("No se pudo cargar la tabla de alertas.");
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setAlertsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [alertsThreshold, mainRange]);

  useEffect(() => {
    if (hasInvalidRange(comparisonRange)) {
      setComparisonError("La fecha de inicio no puede ser mayor que la fecha de fin.");
      setB2bTopCategories([]);
      setB2cTopCategories([]);
      setComparisonLoading(false);
      return;
    }

    let active = true;
    setComparisonLoading(true);
    setComparisonError(null);

    const baseParams: Omit<TopCategoriesParams, "business_type"> = {
      operation_type: "income",
      limit: 5,
      ...toRangeFilter(comparisonRange),
    };

    Promise.all([
      fetchTopCategories({ ...baseParams, business_type: "B2B" }),
      fetchTopCategories({ ...baseParams, business_type: "B2C" }),
    ])
      .then(([b2bData, b2cData]) => {
        if (!active) {
          return;
        }

        const validCategories = new Set(facets?.categories ?? []);
        const b2bValidated =
          validCategories.size > 0
            ? b2bData.filter((item) => validCategories.has(item.category))
            : b2bData;
        const b2cValidated =
          validCategories.size > 0
            ? b2cData.filter((item) => validCategories.has(item.category))
            : b2cData;

        setB2bTopCategories(b2bValidated);
        setB2cTopCategories(b2cValidated);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setComparisonError("No se pudo cargar la comparativa B2B vs B2C.");
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setComparisonLoading(false);
      });

    return () => {
      active = false;
    };
  }, [comparisonRange, facets]);

  const b2bTotalIncome = useMemo(
    () => b2bTopCategories.reduce((acc, item) => acc + item.total_amount, 0),
    [b2bTopCategories],
  );
  const b2cTotalIncome = useMemo(
    () => b2cTopCategories.reduce((acc, item) => acc + item.total_amount, 0),
    [b2cTopCategories],
  );

  const comparisonChartData = useMemo(
    () => [
      { segment: "B2B", income: b2bTotalIncome },
      { segment: "B2C", income: b2cTotalIncome },
    ],
    [b2bTotalIncome, b2cTotalIncome],
  );

  const availableRangeLabel = facets
    ? `${facets.min_date} to ${facets.max_date}`
    : "Loading range...";

  const availableCategoriesLabel = facets
    ? facets.categories.join(", ")
    : "Loading categories...";

  const periodLabel =
    viewMode === "main"
      ? formatPeriodLabel(mainRange, facets)
      : formatPeriodLabel(comparisonRange, facets);

  const isMainRangeInvalid = hasInvalidRange(mainRange);
  const isComparisonRangeInvalid = hasInvalidRange(comparisonRange);

  const renderDateRangeControls = (
    title: string,
    range: DateRangeInputState,
    setRange: Dispatch<SetStateAction<DateRangeInputState>>,
    invalid: boolean,
  ) => (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>
          Available dataset range: {facetsLoading ? "Loading..." : availableRangeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Start date</span>
          <input
            type="date"
            value={range.start_date}
            onChange={(event) => {
              setRange((previous) => ({
                ...previous,
                start_date: event.target.value,
              }));
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">End date</span>
          <input
            type="date"
            value={range.end_date}
            onChange={(event) => {
              setRange((previous) => ({
                ...previous,
                end_date: event.target.value,
              }));
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        {invalid ? (
          <p className="col-span-full rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive-foreground">
            Start date must be before or equal to end date.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderTopCategoryTable = (title: string, rows: CategoryEntry[], totalIncome: number) => (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>Available categories from facets: {availableCategoriesLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Income total</th>
                <th className="px-2 py-2 font-medium">% of group</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-muted-foreground">
                    No category data available.
                  </td>
                </tr>
              ) : (
                rows.map((entry) => {
                  const percentage = totalIncome > 0 ? (entry.total_amount / totalIncome) * 100 : 0;
                  return (
                    <tr key={`${title}-${entry.category}`} className="border-b border-border/40">
                      <td className="px-2 py-2 capitalize">{entry.category}</td>
                      <td className="px-2 py-2">{formatCurrencyCompact(entry.total_amount)}</td>
                      <td className="px-2 py-2">{percentage.toFixed(1)}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={periodLabel} />

          <section aria-label="Dashboard view selector" className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewMode("main");
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "main"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Main dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("comparison");
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "comparison"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              B2B vs B2C
            </button>
          </section>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          {viewMode === "main" ? (
            <>
              {renderDateRangeControls(
                "Date range filter",
                mainRange,
                setMainRange,
                isMainRangeInvalid,
              )}

              <section aria-label="Key performance indicators">
                <KPIRow metrics={metrics} loading={metricsLoading} />
              </section>

              <section
                aria-label="Financial charts"
                className="grid grid-cols-1 gap-4 xl:grid-cols-2"
              >
                <IncomeOutcomeChart data={monthlyData} loading={metricsLoading} />
                <ProfitPercentChart data={monthlyData} loading={metricsLoading} />
              </section>

              <section aria-label="Anomaly alerts table" className="flex flex-col gap-4">
                <Card className="border-border/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">Outcome anomaly alerts</CardTitle>
                    <CardDescription>
                      Detect periods where outcome rises unexpectedly vs the previous baseline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <label className="flex max-w-xs flex-col gap-1 text-sm">
                      <span className="text-muted-foreground">Threshold ratio (0.01 to 1.0)</span>
                      <input
                        type="number"
                        min={0.01}
                        max={1}
                        step={0.01}
                        value={alertsThreshold}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isNaN(value)) {
                            return;
                          }
                          const clamped = Math.min(1, Math.max(0.01, value));
                          setAlertsThreshold(clamped);
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </label>

                    {alertsError ? (
                      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                        {alertsError}
                      </div>
                    ) : null}

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/70 text-left text-muted-foreground">
                            <th className="px-2 py-2 font-medium">Period</th>
                            <th className="px-2 py-2 font-medium">Recorded outcome</th>
                            <th className="px-2 py-2 font-medium">Moving avg (prev 3 periods)</th>
                            <th className="px-2 py-2 font-medium">Increase %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alertsLoading ? (
                            <tr>
                              <td colSpan={4} className="px-2 py-4 text-muted-foreground">
                                Loading alerts...
                              </td>
                            </tr>
                          ) : alerts.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-2 py-4 text-muted-foreground">
                                No anomalies detected for the current threshold.
                              </td>
                            </tr>
                          ) : (
                            alerts.map((row) => (
                              <tr key={row.period} className="border-b border-border/40">
                                <td className="px-2 py-2">{row.period}</td>
                                <td className="px-2 py-2">{formatCurrencyCompact(row.outcomeTotal)}</td>
                                <td className="px-2 py-2">{formatCurrencyCompact(row.movingAverage3)}</td>
                                <td className="px-2 py-2">{row.increasePercent.toFixed(1)}%</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          ) : (
            <>
              {renderDateRangeControls(
                "Date range filter for comparison",
                comparisonRange,
                setComparisonRange,
                isComparisonRangeInvalid,
              )}

              {comparisonError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                  {comparisonError}
                </div>
              ) : null}

              <section aria-label="B2B vs B2C top income categories" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {renderTopCategoryTable("B2B top 5 income categories", b2bTopCategories, b2bTotalIncome)}
                {renderTopCategoryTable("B2C top 5 income categories", b2cTopCategories, b2cTotalIncome)}
              </section>

              <section aria-label="B2B and B2C income comparison chart">
                <Card className="border-border/60">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">
                      Income comparison: B2B vs B2C
                    </CardTitle>
                    <CardDescription>
                      Visual comparison of grouped income totals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {comparisonLoading ? (
                      <div className="h-[280px] rounded-md border border-border/40 p-3 text-sm text-muted-foreground">
                        Loading comparison data...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={comparisonChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
                          <XAxis
                            dataKey="segment"
                            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(value) => {
                              const numericValue =
                                typeof value === "number"
                                  ? value
                                  : Number(Array.isArray(value) ? value[0] : value ?? 0);
                              return formatCurrencyCompact(Number.isFinite(numericValue) ? numericValue : 0);
                            }}
                            labelFormatter={(label) => `Segment: ${label}`}
                          />
                          <Bar dataKey="income" fill="var(--chart-income)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
