import "@/app/globals.css";

/**
 * Embed Layout
 * Phase 9: Sharing & Distribution
 *
 * Minimal layout for embedded widgets
 * No header/footer, optimized for iframe display
 */

export default function EmbedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Allow embedding in iframes */}
				<meta name="robots" content="noindex, nofollow" />
			</head>
			<body className="min-h-screen bg-background antialiased">{children}</body>
		</html>
	);
}
