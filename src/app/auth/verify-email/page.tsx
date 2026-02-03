/**
 * Email Verification page
 * Shows a message asking user to verify their email
 */

import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface VerifyEmailPageProps {
	searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({
	searchParams,
}: VerifyEmailPageProps) {
	const params = await searchParams;
	const email = params.email;

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Mail className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
					<CardDescription>
						We've sent a verification link to{" "}
						{email ? (
							<span className="font-medium text-foreground">{email}</span>
						) : (
							"your email address"
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-center">
					<p className="text-sm text-muted-foreground">
						Click the link in the email to verify your account and get started.
						The link will expire in 24 hours.
					</p>
					<div className="rounded-lg border bg-muted/50 p-4">
						<h4 className="font-medium text-sm mb-2">
							Didn't receive the email?
						</h4>
						<ul className="text-xs text-muted-foreground space-y-1 text-left">
							<li>• Check your spam or junk folder</li>
							<li>• Make sure you entered the correct email</li>
							<li>• Wait a few minutes and try again</li>
						</ul>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-3">
					<Button asChild variant="outline" className="w-full">
						<Link href="/auth/sign-up">Try a Different Email</Link>
					</Button>
					<Link
						href="/auth/sign-in"
						className="text-sm text-muted-foreground hover:text-primary"
					>
						Already verified? Sign in
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
