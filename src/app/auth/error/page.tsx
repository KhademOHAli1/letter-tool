/**
 * Auth error page
 * Shows authentication error messages with helpful guidance
 */

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
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

// Map error codes to user-friendly messages
const ERROR_MESSAGES: Record<
	string,
	{ title: string; message: string; suggestion: string }
> = {
	access_denied: {
		title: "Access Denied",
		message: "You don't have permission to access this resource.",
		suggestion: "Please sign in with an authorized account or contact support.",
	},
	invalid_request: {
		title: "Invalid Request",
		message: "The authentication request was invalid or malformed.",
		suggestion: "Please try signing in again from the beginning.",
	},
	server_error: {
		title: "Server Error",
		message: "An unexpected error occurred on our servers.",
		suggestion:
			"Please wait a moment and try again. If the problem persists, contact support.",
	},
	expired_link: {
		title: "Link Expired",
		message: "This verification or reset link has expired.",
		suggestion: "Please request a new link and try again.",
	},
	email_not_verified: {
		title: "Email Not Verified",
		message: "Please verify your email before signing in.",
		suggestion:
			"Check your inbox for the verification email or request a new one.",
	},
	invalid_credentials: {
		title: "Invalid Credentials",
		message: "The email or password you entered is incorrect.",
		suggestion: "Double-check your credentials or reset your password.",
	},
	user_exists: {
		title: "Account Exists",
		message: "An account with this email already exists.",
		suggestion:
			"Try signing in instead, or reset your password if you forgot it.",
	},
};

interface AuthErrorPageProps {
	searchParams: Promise<{
		message?: string;
		error?: string;
		error_code?: string;
	}>;
}

export default async function AuthErrorPage({
	searchParams,
}: AuthErrorPageProps) {
	const params = await searchParams;
	const errorCode = params.error_code || params.error;
	const customMessage = params.message;

	// Get error details from code or use defaults
	const errorDetails =
		errorCode && ERROR_MESSAGES[errorCode]
			? ERROR_MESSAGES[errorCode]
			: {
					title: "Authentication Error",
					message: customMessage || "An error occurred during authentication.",
					suggestion:
						"Please try again or contact support if the problem persists.",
				};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-bold">
						{errorDetails.title}
					</CardTitle>
					<CardDescription className="text-base">
						{errorDetails.message}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border bg-muted/50 p-4">
						<p className="text-sm text-muted-foreground">
							<strong>What to do:</strong> {errorDetails.suggestion}
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-3">
					<div className="flex w-full gap-3">
						<Button asChild variant="outline" className="flex-1">
							<Link href="/">
								<Home className="mr-2 h-4 w-4" />
								Home
							</Link>
						</Button>
						<Button asChild className="flex-1">
							<Link href="/auth/sign-in">
								<RefreshCw className="mr-2 h-4 w-4" />
								Try Again
							</Link>
						</Button>
					</div>
					{errorCode === "expired_link" && (
						<Button asChild variant="ghost" className="w-full">
							<Link href="/auth/forgot-password">Request New Reset Link</Link>
						</Button>
					)}
					<Link
						href="/auth/sign-up"
						className="text-sm text-muted-foreground hover:text-primary"
					>
						<ArrowLeft className="mr-1 inline h-4 w-4" />
						Need an account? Sign up
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
