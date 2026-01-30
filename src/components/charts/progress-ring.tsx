"use client";

/**
 * Progress Ring Component
 * Phase 8: Frontend Analytics Dashboard
 *
 * Circular progress indicator for goal tracking
 */

interface ProgressRingProps {
	/** Progress value (0-100) */
	value: number;
	/** Size in pixels */
	size?: number;
	/** Stroke width */
	strokeWidth?: number;
	/** Progress color */
	color?: string;
	/** Background track color */
	trackColor?: string;
	/** Show percentage text */
	showValue?: boolean;
	/** Custom label instead of percentage */
	label?: string;
	/** Subtitle below the value */
	subtitle?: string;
}

export function ProgressRing({
	value,
	size = 120,
	strokeWidth = 8,
	color = "hsl(var(--primary))",
	trackColor = "hsl(var(--muted))",
	showValue = true,
	label,
	subtitle,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (Math.min(value, 100) / 100) * circumference;

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg
				width={size}
				height={size}
				className="transform -rotate-90"
				aria-hidden="true"
			>
				{/* Background track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={trackColor}
					strokeWidth={strokeWidth}
				/>
				{/* Progress arc */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="transition-all duration-500 ease-out"
				/>
			</svg>
			{showValue && (
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-2xl font-bold">
						{label || `${Math.round(value)}%`}
					</span>
					{subtitle && (
						<span className="text-xs text-muted-foreground">{subtitle}</span>
					)}
				</div>
			)}
		</div>
	);
}
