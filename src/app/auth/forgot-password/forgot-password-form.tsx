/**
 * Forgot Password Form
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";
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
import { resetPassword } from "@/lib/auth/client";

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		setIsSubmitting(true);
		setError(null);

		const result = await resetPassword(data.email);

		if (result.error) {
			setError(result.error);
			setIsSubmitting(false);
		} else {
			setIsSuccess(true);
			setIsSubmitting(false);
		}
	};

	if (!mounted) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
					<CardDescription>
						Enter your email to receive a reset link
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	if (isSuccess) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Mail className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
					<CardDescription>
						We've sent a password reset link to your email address.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-center">
					<p className="text-sm text-muted-foreground">
						Click the link in the email to reset your password. If you don't see
						the email, check your spam folder.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => {
							setIsSuccess(false);
							form.reset();
						}}
					>
						Send Another Email
					</Button>
					<Link
						href="/auth/sign-in"
						className="text-sm text-muted-foreground hover:text-primary"
					>
						<ArrowLeft className="mr-1 inline h-4 w-4" />
						Back to Sign In
					</Link>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
				<CardDescription>
					Enter your email address and we'll send you a link to reset your
					password.
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
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="you@example.com"
											disabled={isSubmitting}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								"Send Reset Link"
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="justify-center">
				<Link
					href="/auth/sign-in"
					className="text-sm text-muted-foreground hover:text-primary"
				>
					<ArrowLeft className="mr-1 inline h-4 w-4" />
					Back to Sign In
				</Link>
			</CardFooter>
		</Card>
	);
}
