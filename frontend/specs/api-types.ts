/**
 * Response for /api/metrics/facets.
 */
export interface FacetsResponse {
  /**
   * Allowed operation types exposed by the dataset.
   * Valid values include "income" and "outcome".
   */
  operation_types: Array<"income" | "outcome">;

  /**
   * Allowed business segments exposed by the dataset.
   * Valid values include "B2B" and "B2C".
   */
  business_types: Array<"B2B" | "B2C">;

  /**
   * Allowed financial categories present in the dataset.
   */
  categories: Array<
    "suppliers" | "sales" | "operational" | "administrative" | "others"
  >;

  /**
   * Earliest date available in the dataset.
   * Format: YYYY-MM-DD.
   */
  min_date: string;

  /**
   * Latest date available in the dataset.
   * Format: YYYY-MM-DD.
   */
  max_date: string;
}

/**
 * Single anomaly row returned by /api/metrics/alerts.
 */
export interface AlertEntry {
  /**
   * Time bucket where the anomaly was detected.
   * Format depends on grouping (e.g. YYYY-MM for month).
   */
  period: string;

  /**
   * Observed outcome total for the period.
   */
  outcome_total: number;

  /**
   * Baseline average used by the backend for comparison.
   */
  baseline_average: number;

  /**
   * Increase ratio relative to baseline.
   * Example: 0.35 means +35%.
   */
  increase_ratio: number;
}

/**
 * Response list for /api/metrics/alerts.
 */
export type AlertsResponse = AlertEntry[];

/**
 * Single row returned by /api/metrics/categories/top.
 */
export interface CategoryEntry {
  /**
   * Category identifier.
   */
  category: "suppliers" | "sales" | "operational" | "administrative" | "others";

  /**
   * Operation type used in ranking.
   */
  operation_type: "income" | "outcome";

  /**
   * Aggregated amount for the category.
   */
  total_amount: number;
}

/**
 * Response list for /api/metrics/categories/top.
 */
export type TopCategoriesResponse = CategoryEntry[];
