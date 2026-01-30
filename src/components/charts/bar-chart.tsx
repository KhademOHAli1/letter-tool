"use client";

/**
 * Bar Chart Component
 * Phase 8: Frontend Analytics Dashboard
 *
 * Uses recharts for categorical data visualization
 */

import {
	Bar,
	CartesianGrid,
	Cell,
	Legend,
	BarChart as RechartsBarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface BarChartProps {
	data: Array<{
		name: string;
		value: number;
		color?: string;
		/** Optional category for party color matching */
		category?: string;
	}>;
	/** Height in pixels */
	height?: number;
	/** Show legend */
	showLegend?: boolean;
	/** Horizontal layout (bars go left-right instead of bottom-up) */
	horizontal?: boolean;
	/** Alternative to horizontal - 'vertical' means bars go up, 'horizontal' means bars go right */
	layout?: "vertical" | "horizontal";
	/** Default bar color */
	color?: string;
	/** Value format function */
	formatValue?: (value: number) => string;
	/** Axis label */
	label?: string;
}

// Party colors for German/international political parties
const PARTY_COLORS: Record<string, string> = {
	// German parties
	SPD: "#E3000F",
	"CDU/CSU": "#000000",
	CDU: "#000000",
	CSU: "#0080C8",
	GRÜNE: "#46962B",
	FDP: "#FFED00",
	AfD: "#009EE0",
	"DIE LINKE": "#BE3075",
	BSW: "#FC8C03",
	// Canadian parties
	Liberal: "#D71920",
	Conservative: "#1A4782",
	NDP: "#F37021",
	"Bloc Québécois": "#33B2CC",
	Green: "#3D9B35",
	// UK parties
	Labour: "#DC241F",
	Conservatives: "#0087DC",
	"Liberal Democrats": "#FDBB30",
	SNP: "#FFF95D",
	// Generic
	Unknown: "#888888",
	Other: "#888888",
};

export function BarChart({
	data,
	height = 300,
	showLegend = false,
	horizontal = false,
	layout,
	color = "hsl(var(--primary))",
	formatValue = (v) => v.toLocaleString(),
	label,
}: BarChartProps) {
	// Support both 'horizontal' boolean and 'layout' prop
	const isHorizontal = layout ? layout === "vertical" : horizontal;
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

	// Determine bar colors
	const getColor = (entry: {
		name: string;
		color?: string;
		category?: string;
	}) => {
		if (entry.color) return entry.color;
		// Try category first, then name
		if (entry.category && PARTY_COLORS[entry.category])
			return PARTY_COLORS[entry.category];
		if (PARTY_COLORS[entry.name]) return PARTY_COLORS[entry.name];
		return color;
	};

	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsBarChart
				data={data}
				layout={isHorizontal ? "vertical" : "horizontal"}
				margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
				{horizontal ? (
					<>
						<XAxis
							type="number"
							tickFormatter={formatValue}
							tick={{ fontSize: 12 }}
							className="text-muted-foreground"
						/>
						<YAxis
							dataKey="name"
							type="category"
							tick={{ fontSize: 12 }}
							className="text-muted-foreground"
							width={100}
						/>
					</>
				) : (
					<>
						<XAxis
							dataKey="name"
							tick={{ fontSize: 12 }}
							className="text-muted-foreground"
						/>
						<YAxis
							tickFormatter={formatValue}
							tick={{ fontSize: 12 }}
							className="text-muted-foreground"
							width={60}
						/>
					</>
				)}
				<Tooltip
					formatter={(value) => [
						formatValue(Number(value) || 0),
						label || "Value",
					]}
					contentStyle={{
						backgroundColor: "hsl(var(--popover))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "6px",
					}}
				/>
				{showLegend && <Legend />}
				<Bar dataKey="value" radius={[4, 4, 0, 0]}>
					{data.map((entry) => (
						<Cell
							key={
								entry.category ? `${entry.category}-${entry.name}` : entry.name
							}
							fill={getColor(entry)}
						/>
					))}
				</Bar>
			</RechartsBarChart>
		</ResponsiveContainer>
	);
}
