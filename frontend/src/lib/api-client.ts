import type {
  AlertsResponse,
  FacetsResponse,
  TopCategoriesResponse,
} from "../../specs/api-types";
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "../../specs/param-types";
import type { FinancialMovement } from "@/lib/financial-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type QueryValue = string | number | undefined;

interface MetricsSummaryItem {
  period: string;
  income: number;
  outcome: number;
  net: number;
}

function buildQuery(params: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

async function fetchJson<T>(path: string, params: Record<string, QueryValue> = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }
  return (await response.json()) as T;
}

export function fetchFacets(): Promise<FacetsResponse> {
  return fetchJson<FacetsResponse>("/api/metrics/facets");
}

export function fetchMetrics(filters: DateRangeFilter): Promise<FinancialMovement[]> {
  return fetchJson<FinancialMovement[]>("/api/metrics", {
    start_date: filters.start_date,
    end_date: filters.end_date,
  });
}

export function fetchAlerts(params: AlertsParams): Promise<AlertsResponse> {
  return fetchJson<AlertsResponse>("/api/metrics/alerts", {
    threshold: params.threshold,
    start_date: params.start_date,
    end_date: params.end_date,
  });
}

export function fetchMonthlySummary(filters: DateRangeFilter): Promise<MetricsSummaryItem[]> {
  return fetchJson<MetricsSummaryItem[]>("/api/metrics/summary", {
    group_by: "month",
    start_date: filters.start_date,
    end_date: filters.end_date,
  });
}

export function fetchTopCategories(params: TopCategoriesParams): Promise<TopCategoriesResponse> {
  return fetchJson<TopCategoriesResponse>("/api/metrics/categories/top", {
    operation_type: params.operation_type,
    limit: params.limit,
    business_type: params.business_type,
    start_date: params.start_date,
    end_date: params.end_date,
  });
}
