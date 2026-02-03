/**
 * Root Error page
 * Handles runtime errors in the app (used by nested layouts)
 */

"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

export default function RootError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to console (in production, send to error reporting service)
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md text-center">
				<CardHeader className="space-y-4">
					<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
						<AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
					</div>
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
						<p className="text-muted-foreground">
							We encountered an unexpected error. Don't worry, your data is
							safe.
						</p>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{error.digest && (
						<div className="rounded-lg border bg-muted/50 p-3">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">Error ID:</span>{" "}
								<code className="font-mono">{error.digest}</code>
							</p>
						</div>
					)}
					<p className="text-sm text-muted-foreground">
						If this keeps happening, please contact support with the error ID
						above.
					</p>
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
	);
}
