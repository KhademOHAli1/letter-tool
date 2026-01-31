"use client";

/**
 * Error boundary for campaign pages
 * Phase 3, Epic 3.1
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CampaignErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function CampaignError({ error, reset }: CampaignErrorProps) {
	useEffect(() => {
		// Log error to console (or external service)
		console.error("Campaign page error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="text-center space-y-6 px-6 max-w-md">
				<div className="text-6xl">⚠️</div>
				<h1 className="text-2xl font-bold text-foreground">
					Something went wrong
				</h1>
				<p className="text-muted-foreground">
					We encountered an error loading this campaign. This might be a
					temporary issue.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button onClick={reset} variant="default">
						Try again
					</Button>
					<Button variant="outline" asChild>
						<a href="/">Go home</a>
					</Button>
				</div>
				{error.digest && (
					<p className="text-xs text-muted-foreground/60">
						Error ID: {error.digest}
					</p>
				)}
			</div>
		</div>
	);
}
