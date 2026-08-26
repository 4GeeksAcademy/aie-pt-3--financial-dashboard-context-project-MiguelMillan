import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface B2BB2CIncomeChartProps {
  data: Array<{ segment: string; income: number }>;
}

function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function B2BB2CIncomeChart({ data }: B2BB2CIncomeChartProps) {
  const chartDescriptionId = useId();

  return (
    <figure aria-label="Bar chart comparing B2B and B2C income totals" aria-describedby={chartDescriptionId}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
      <figcaption id={chartDescriptionId} className="sr-only">
        Comparison of B2B and B2C income totals for the selected date range.
      </figcaption>
    </figure>
  );
}
