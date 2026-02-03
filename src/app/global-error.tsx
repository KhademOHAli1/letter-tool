/**
 * Global Error page
 * Handles runtime errors in the app
 */

"use client";

import { AlertOctagon, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to console (in production, send to error reporting service)
		console.error("Global error:", error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<div className="min-h-screen bg-background flex items-center justify-center p-4">
					<Card className="w-full max-w-md text-center">
						<CardHeader className="space-y-4">
							<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
								<AlertOctagon className="h-12 w-12 text-destructive" />
							</div>
							<div className="space-y-2">
								<h1 className="text-2xl font-bold">Something Went Wrong</h1>
								<p className="text-muted-foreground">
									An unexpected error occurred. We've been notified and are
									looking into it.
								</p>
							</div>
						</CardHeader>
						<CardContent>
							{error.digest && (
								<p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
									Error ID: {error.digest}
								</p>
							)}
						</CardContent>
						<CardFooter className="flex gap-3">
							<Button onClick={reset} className="flex-1">
								<RefreshCw className="mr-2 h-4 w-4" />
								Try Again
							</Button>
							<Button asChild variant="outline" className="flex-1">
								<Link href="/">
									<Home className="mr-2 h-4 w-4" />
									Home
								</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</body>
		</html>
	);
}
