"use client";

/**
 * Line Chart Component
 * Phase 8: Frontend Analytics Dashboard
 *
 * Uses recharts for time series visualization
 * Lazy loaded to reduce bundle size
 */

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface LineChartProps {
	data: Array<{
		date: string;
		[key: string]: string | number;
	}>;
	/** Data keys to plot as lines (besides date) */
	dataKeys: Array<{
		key: string;
		/** Display name for legend (use name or label) */
		name?: string;
		/** @deprecated Use name instead */
		label?: string;
		color?: string;
	}>;
	/** Height in pixels */
	height?: number;
	/** Show legend */
	showLegend?: boolean;
	/** Date format function */
	formatDate?: (date: string) => string;
	/** Value format function */
	formatValue?: (value: number) => string;
}

// Default colors for multi-line charts
const DEFAULT_COLORS = [
	"hsl(var(--primary))",
	"hsl(var(--chart-2))",
	"hsl(var(--chart-3))",
	"hsl(var(--chart-4))",
	"hsl(var(--chart-5))",
];

export function LineChart({
	data,
	dataKeys,
	height = 300,
	showLegend = true,
	formatDate = (d) => new Date(d).toLocaleDateString(),
	formatValue = (v) => v.toLocaleString(),
}: LineChartProps) {
	if (!data || data.length === 0) {
		return (
			<div
				className="flex items-center justify-center text-muted-foreground"
				style={{ height }}
			>
				No data available
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsLineChart
				data={data}
				margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
				<XAxis
					dataKey="date"
					tickFormatter={formatDate}
					tick={{ fontSize: 12 }}
					className="text-muted-foreground"
				/>
				<YAxis
					tickFormatter={formatValue}
					tick={{ fontSize: 12 }}
					className="text-muted-foreground"
					width={60}
				/>
				<Tooltip
					formatter={(value) => formatValue(Number(value) || 0)}
					labelFormatter={(label) => formatDate(String(label))}
					contentStyle={{
						backgroundColor: "hsl(var(--popover))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "6px",
					}}
				/>
				{showLegend && <Legend />}
				{dataKeys.map((dk, idx) => (
					<Line
						key={dk.key}
						type="monotone"
						dataKey={dk.key}
						name={dk.name || dk.label || dk.key}
						stroke={dk.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
						strokeWidth={2}
						dot={false}
						activeDot={{ r: 4 }}
					/>
				))}
			</RechartsLineChart>
		</ResponsiveContainer>
	);
}
