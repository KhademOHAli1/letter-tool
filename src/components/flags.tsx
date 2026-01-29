/**
 * SVG Flag Icons from Nucleo (https://nucleoapp.com/svg-flag-icons)
 * Optimized for 32px grid, used for country selectors
 */

interface FlagProps {
	className?: string;
}

export function FlagGermany({ className = "h-4 w-5" }: FlagProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="flagGermanyTitle"
		>
			<title id="flagGermanyTitle">Germany</title>
			<rect width="32" height="8" fill="#000" />
			<rect y="8" width="32" height="8" fill="#DD0000" />
			<rect y="16" width="32" height="8" fill="#FFCC00" />
		</svg>
	);
}

export function FlagCanada({ className = "h-4 w-5" }: FlagProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="flagCanadaTitle"
		>
			<title id="flagCanadaTitle">Canada</title>
			<rect width="32" height="24" fill="#F5F5F5" />
			<rect width="8" height="24" fill="#FF0000" />
			<rect x="24" width="8" height="24" fill="#FF0000" />
			<path
				d="M16 4L16.5 6H18L16.75 7L17.25 9L16 8L14.75 9L15.25 7L14 6H15.5L16 4Z"
				fill="#FF0000"
			/>
			<path
				d="M16 6L17 8L19 8.5L17 10L17.5 12L16 11L14.5 12L15 10L13 8.5L15 8L16 6Z"
				fill="#FF0000"
			/>
			<path
				d="M13 10L14 12V14L12 13L10 15L11 12L9 11H12L13 10Z"
				fill="#FF0000"
			/>
			<path
				d="M19 10L18 12V14L20 13L22 15L21 12L23 11H20L19 10Z"
				fill="#FF0000"
			/>
			<path d="M14 14H18V18H14V14Z" fill="#FF0000" />
		</svg>
	);
}

export function FlagUK({ className = "h-4 w-5" }: FlagProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="flagUKTitle"
		>
			<title id="flagUKTitle">United Kingdom</title>
			<rect width="32" height="24" fill="#012169" />
			<path d="M0 0L32 24M32 0L0 24" stroke="#FFF" strokeWidth="4" />
			<path
				d="M0 0L32 24M32 0L0 24"
				stroke="#C8102E"
				strokeWidth="2"
				clipPath="url(#ukClip)"
			/>
			<path d="M16 0V24M0 12H32" stroke="#FFF" strokeWidth="6" />
			<path d="M16 0V24M0 12H32" stroke="#C8102E" strokeWidth="3" />
		</svg>
	);
}

export function FlagFrance({ className = "h-4 w-5" }: FlagProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="flagFranceTitle"
		>
			<title id="flagFranceTitle">France</title>
			<rect width="10.67" height="24" fill="#002654" />
			<rect x="10.67" width="10.67" height="24" fill="#FFF" />
			<rect x="21.33" width="10.67" height="24" fill="#CE1126" />
		</svg>
	);
}

export function FlagUSA({ className = "h-4 w-5" }: FlagProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-labelledby="flagUSATitle"
		>
			<title id="flagUSATitle">United States</title>
			{/* Stripes */}
			<rect width="32" height="24" fill="#B22234" />
			<rect y="1.85" width="32" height="1.85" fill="#FFF" />
			<rect y="5.54" width="32" height="1.85" fill="#FFF" />
			<rect y="9.23" width="32" height="1.85" fill="#FFF" />
			<rect y="12.92" width="32" height="1.85" fill="#FFF" />
			<rect y="16.62" width="32" height="1.85" fill="#FFF" />
			<rect y="20.31" width="32" height="1.85" fill="#FFF" />
			{/* Blue canton */}
			<rect width="12.8" height="12.92" fill="#3C3B6E" />
			{/* Stars (simplified - 9 dots representing stars) */}
			<circle cx="2.1" cy="2.2" r="0.8" fill="#FFF" />
			<circle cx="4.3" cy="2.2" r="0.8" fill="#FFF" />
			<circle cx="6.4" cy="2.2" r="0.8" fill="#FFF" />
			<circle cx="8.5" cy="2.2" r="0.8" fill="#FFF" />
			<circle cx="10.7" cy="2.2" r="0.8" fill="#FFF" />
			<circle cx="3.2" cy="4.3" r="0.8" fill="#FFF" />
			<circle cx="5.3" cy="4.3" r="0.8" fill="#FFF" />
			<circle cx="7.5" cy="4.3" r="0.8" fill="#FFF" />
			<circle cx="9.6" cy="4.3" r="0.8" fill="#FFF" />
			<circle cx="2.1" cy="6.5" r="0.8" fill="#FFF" />
			<circle cx="4.3" cy="6.5" r="0.8" fill="#FFF" />
			<circle cx="6.4" cy="6.5" r="0.8" fill="#FFF" />
			<circle cx="8.5" cy="6.5" r="0.8" fill="#FFF" />
			<circle cx="10.7" cy="6.5" r="0.8" fill="#FFF" />
			<circle cx="3.2" cy="8.6" r="0.8" fill="#FFF" />
			<circle cx="5.3" cy="8.6" r="0.8" fill="#FFF" />
			<circle cx="7.5" cy="8.6" r="0.8" fill="#FFF" />
			<circle cx="9.6" cy="8.6" r="0.8" fill="#FFF" />
			<circle cx="2.1" cy="10.8" r="0.8" fill="#FFF" />
			<circle cx="4.3" cy="10.8" r="0.8" fill="#FFF" />
			<circle cx="6.4" cy="10.8" r="0.8" fill="#FFF" />
			<circle cx="8.5" cy="10.8" r="0.8" fill="#FFF" />
			<circle cx="10.7" cy="10.8" r="0.8" fill="#FFF" />
		</svg>
	);
}

// Map country codes to flag components
export const FLAGS: Record<string, React.FC<FlagProps>> = {
	de: FlagGermany,
	ca: FlagCanada,
	uk: FlagUK,
	fr: FlagFrance,
	us: FlagUSA,
};

export function Flag({ country, className }: { country: string } & FlagProps) {
	const FlagComponent = FLAGS[country];
	if (!FlagComponent) return null;
	return <FlagComponent className={className} />;
}
