/**
 * Optional date range used by dashboard filters.
 */
export interface DateRangeFilter {
  /**
   * Inclusive start date for filtering.
   * Optional. Format: YYYY-MM-DD.
   */
  start_date?: string;

  /**
   * Inclusive end date for filtering.
   * Optional. Format: YYYY-MM-DD.
   */
  end_date?: string;
}

/**
 * Query parameters for /api/metrics/alerts.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Alert threshold ratio.
   * Valid range in UI: 0.01 to 1.0.
   */
  threshold: number;
}

/**
 * Query parameters for /api/metrics/categories/top.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation type used to rank categories.
   * Valid values: "income" or "outcome".
   */
  operation_type: "income" | "outcome";

  /**
   * Maximum number of categories to return.
   * Typical value in this dashboard: 5.
   */
  limit: number;

  /**
   * Optional business segment filter.
   * Valid values: "B2B" or "B2C".
   */
  business_type?: "B2B" | "B2C";
}
