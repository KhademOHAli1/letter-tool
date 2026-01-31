/**
 * Auth error page
 * Shows authentication error messages
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthErrorPageProps {
	searchParams: Promise<{ message?: string }>;
}

export default async function AuthErrorPage({
	searchParams,
}: AuthErrorPageProps) {
	const params = await searchParams;
	const message = params.message || "An authentication error occurred";

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-red-600">Authentication Error</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-muted-foreground">{message}</p>
					<div className="flex gap-4">
						<Button asChild variant="outline">
							<Link href="/">Go Home</Link>
						</Button>
						<Button asChild>
							<Link href="/auth/sign-in">Try Again</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
