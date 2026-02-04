/**
 * Reset Password Form
 * Set a new password after clicking reset link
 *
 * This form handles the password reset flow when a user clicks on
 * a password reset link sent via email. Supabase sends the user
 * to this page with a hash fragment containing the access token.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	getSupabaseBrowserClient,
	isSupabaseConfigured,
	updatePassword,
} from "@/lib/auth/client";

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain uppercase, lowercase, and number",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [isVerifying, setIsVerifying] = useState(true);
	const [sessionValid, setSessionValid] = useState(false);

	// Verify the recovery session on mount
	useEffect(() => {
		setMounted(true);

		async function verifySession() {
			if (!isSupabaseConfigured()) {
				setError("Authentication is not configured");
				setIsVerifying(false);
				return;
			}

			try {
				const supabase = getSupabaseBrowserClient();

				// Check for existing session (user clicked recovery link)
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (sessionError) {
					console.error("Session error:", sessionError);
					setError(
						"Invalid or expired reset link. Please request a new password reset.",
					);
					setIsVerifying(false);
					return;
				}

				if (session) {
					// User has a valid session from the recovery link
					setSessionValid(true);
					setIsVerifying(false);
					return;
				}

				// No session - check if we have hash params (Supabase sends these)
				// The supabase client should auto-handle these, but we wait a moment
				// for it to process
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Check again after waiting
				const {
					data: { session: newSession },
				} = await supabase.auth.getSession();

				if (newSession) {
					setSessionValid(true);
				} else {
					setError(
						"Invalid or expired reset link. Please request a new password reset.",
					);
				}
			} catch (err) {
				console.error("Error verifying session:", err);
				setError("An error occurred while verifying your reset link.");
			} finally {
				setIsVerifying(false);
			}
		}

		verifySession();
	}, []);

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		setIsSubmitting(true);
		setError(null);

		const result = await updatePassword(data.password);

		if (result.error) {
			setError(result.error);
			setIsSubmitting(false);
		} else {
			setIsSuccess(true);
			setIsSubmitting(false);
			// Redirect to sign in after 3 seconds
			setTimeout(() => {
				router.push("/auth/sign-in");
			}, 3000);
		}
	};

	if (!mounted || isVerifying) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
					<CardDescription>
						{isVerifying
							? "Verifying your reset link..."
							: "Enter your new password below"}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	// Show error if session is invalid
	if (!sessionValid && error) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-bold">
						Reset Link Invalid
					</CardTitle>
					<CardDescription>{error}</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<p className="text-sm text-muted-foreground">
						Password reset links expire after a certain time for security
						reasons.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-3">
					<Button asChild className="w-full">
						<Link href="/auth/forgot-password">Request New Reset Link</Link>
					</Button>
					<Button variant="ghost" asChild className="w-full">
						<Link href="/auth/sign-in">Back to Sign In</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	if (isSuccess) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
						<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
					<CardTitle className="text-2xl font-bold">
						Password Updated!
					</CardTitle>
					<CardDescription>
						Your password has been successfully reset.
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<p className="text-sm text-muted-foreground">
						Redirecting you to sign in...
					</p>
				</CardContent>
				<CardFooter className="justify-center">
					<Button asChild>
						<Link href="/auth/sign-in">Sign In Now</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
				<CardDescription>
					Enter a new password for your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="text-xs text-muted-foreground">
							Password must be at least 8 characters and contain uppercase,
							lowercase, and a number.
						</div>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Password"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
