/**
 * Application form component for becoming a campaigner
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	type CreateApplicationSchema,
	createApplicationSchema,
} from "@/lib/schemas";

type FormState = "idle" | "submitting" | "success" | "error";

export function ApplyForm() {
	const [formState, setFormState] = useState<FormState>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<CreateApplicationSchema>({
		resolver: zodResolver(createApplicationSchema),
		defaultValues: {
			email: "",
			name: "",
			organizationName: "",
			organizationWebsite: "",
			organizationDescription: "",
			referralSource: "",
			intendedUse: "",
			expectedVolume: "",
			termsAccepted: false as unknown as true,
		},
	});

	const termsAccepted = watch("termsAccepted");

	const onSubmit = async (data: CreateApplicationSchema) => {
		setFormState("submitting");
		setErrorMessage(null);

		try {
			const response = await fetch("/api/applications", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...data, turnstileToken }),
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || "Failed to submit application");
			}

			setFormState("success");
		} catch (error) {
			setFormState("error");
			setErrorMessage(
				error instanceof Error ? error.message : "Something went wrong",
			);
		}
	};

	if (formState === "success") {
		return (
			<Card>
				<CardContent className="py-12 text-center space-y-4">
					<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Success</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h2 className="text-2xl font-bold">Application Submitted!</h2>
					<p className="text-muted-foreground max-w-md mx-auto">
						Thank you for applying. We'll review your application and get back
						to you via email within 2-3 business days.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Application Form</CardTitle>
				<CardDescription>
					Tell us about yourself and how you plan to use the platform.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Personal Info */}
					<div className="space-y-4">
						<h3 className="font-medium">About You</h3>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Full Name *</Label>
								<Input
									id="name"
									placeholder="Jane Smith"
									{...register("name")}
									className={errors.name ? "border-destructive" : ""}
								/>
								{errors.name && (
									<p className="text-sm text-destructive">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email Address *</Label>
								<Input
									id="email"
									type="email"
									placeholder="jane@example.org"
									{...register("email")}
									className={errors.email ? "border-destructive" : ""}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Organization Info */}
					<div className="space-y-4">
						<h3 className="font-medium">Organization (Optional)</h3>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="organizationName">Organization Name</Label>
								<Input
									id="organizationName"
									placeholder="Climate Action Now"
									{...register("organizationName")}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="organizationWebsite">Website</Label>
								<Input
									id="organizationWebsite"
									type="url"
									placeholder="https://example.org"
									{...register("organizationWebsite")}
									className={
										errors.organizationWebsite ? "border-destructive" : ""
									}
								/>
								{errors.organizationWebsite && (
									<p className="text-sm text-destructive">
										{errors.organizationWebsite.message}
									</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="organizationDescription">
								Organization Description
							</Label>
							<Textarea
								id="organizationDescription"
								placeholder="Brief description of your organization and its mission..."
								rows={3}
								{...register("organizationDescription")}
							/>
						</div>
					</div>

					{/* Campaign Plans */}
					<div className="space-y-4">
						<h3 className="font-medium">Your Campaign Plans</h3>

						<div className="space-y-2">
							<Label htmlFor="intendedUse">
								What campaigns do you plan to run? *
							</Label>
							<Textarea
								id="intendedUse"
								placeholder="Describe the causes you want to campaign for, your target audience, and the type of advocacy letters you'd like supporters to send..."
								rows={4}
								{...register("intendedUse")}
								className={errors.intendedUse ? "border-destructive" : ""}
							/>
							{errors.intendedUse && (
								<p className="text-sm text-destructive">
									{errors.intendedUse.message}
								</p>
							)}
							<p className="text-xs text-muted-foreground">
								Minimum 50 characters. The more detail you provide, the faster
								we can review your application.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="expectedVolume">Expected Monthly Volume</Label>
								<Input
									id="expectedVolume"
									placeholder="e.g., 100-500 letters"
									{...register("expectedVolume")}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="referralSource">
									How did you hear about us?
								</Label>
								<Input
									id="referralSource"
									placeholder="Social media, friend, search..."
									{...register("referralSource")}
								/>
							</div>
						</div>
					</div>

					{/* Terms */}
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<Checkbox
								id="termsAccepted"
								checked={termsAccepted === true}
								onCheckedChange={(checked) =>
									setValue(
										"termsAccepted",
										checked === true ? true : (false as unknown as true),
									)
								}
							/>
							<label
								htmlFor="termsAccepted"
								className="text-sm text-muted-foreground cursor-pointer"
							>
								I agree to the{" "}
								<a
									href="/terms"
									className="underline hover:text-foreground"
									target="_blank"
									rel="noopener"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									className="underline hover:text-foreground"
									target="_blank"
									rel="noopener"
								>
									Privacy Policy
								</a>
								. I understand that my campaigns must comply with platform
								guidelines and all applicable laws. *
							</label>
						</div>
						{errors.termsAccepted && (
							<p className="text-sm text-destructive">
								{errors.termsAccepted.message}
							</p>
						)}
					</div>

					{/* Error message */}
					{formState === "error" && errorMessage && (
						<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
							<p className="text-sm text-destructive">{errorMessage}</p>
						</div>
					)}

					{/* Turnstile CAPTCHA */}
					<Turnstile
						onVerify={setTurnstileToken}
						onExpire={() => setTurnstileToken(null)}
						className="flex justify-center"
					/>

					{/* Submit */}
					<Button
						type="submit"
						className="w-full"
						disabled={formState === "submitting"}
					>
						{formState === "submitting"
							? "Submitting..."
							: "Submit Application"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
