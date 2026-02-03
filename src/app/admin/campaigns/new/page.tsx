/**
 * Campaign Creation Wizard
 * Phase 5: Frontend Admin Interface - Epic 5.4
 */

"use client";

import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
// Step components
import {
	type BasicInfoData,
	StepBasicInfo,
} from "@/components/admin/wizard/step-basic-info";
import {
	type DemandsData,
	StepDemands,
} from "@/components/admin/wizard/step-demands";
import {
	type DetailsData,
	StepDetails,
} from "@/components/admin/wizard/step-details";
import {
	type PromptsData,
	StepPrompts,
} from "@/components/admin/wizard/step-prompts";
import { StepReview } from "@/components/admin/wizard/step-review";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import type { CampaignStatus } from "@/lib/types";

export interface CampaignWizardData {
	basicInfo: BasicInfoData;
	details: DetailsData;
	demands: DemandsData;
	prompts: PromptsData;
}

const STORAGE_KEY = "campaign-wizard-draft";

const STEPS = [
	{ id: "basic", title: "Basic Info", description: "Name and description" },
	{ id: "details", title: "Details", description: "Goals and dates" },
	{ id: "demands", title: "Demands", description: "Political demands" },
	{ id: "prompts", title: "Prompts", description: "LLM configuration" },
	{ id: "review", title: "Review", description: "Review and create" },
];

const DEFAULT_DATA: CampaignWizardData = {
	basicInfo: {
		name: { en: "", de: "" },
		description: { en: "", de: "" },
		slug: "",
		countryCodes: ["de"],
		useCustomTargets: false,
		customTargets: [],
	},
	details: {
		causeContext: "",
		goalLetters: null,
		startDate: null,
		endDate: null,
	},
	demands: {
		items: [
			{
				id: crypto.randomUUID(),
				title: { en: "", de: "" },
				description: { en: "", de: "" },
				briefText: { en: "", de: "" },
			},
		],
	},
	prompts: {
		useDefaultTemplate: true,
		customPrompt: "",
	},
};

export default function NewCampaignPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(0);
	const [data, setData] = useState<CampaignWizardData>(DEFAULT_DATA);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [stepValidity, setStepValidity] = useState<Record<number, boolean>>({});

	// Load saved draft from localStorage
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as Partial<CampaignWizardData>;
				const merged: CampaignWizardData = {
					...DEFAULT_DATA,
					...parsed,
					basicInfo: {
						...DEFAULT_DATA.basicInfo,
						...(parsed.basicInfo || {}),
						useCustomTargets: parsed.basicInfo?.useCustomTargets ?? false,
						customTargets: parsed.basicInfo?.customTargets ?? [],
					},
					details: {
						...DEFAULT_DATA.details,
						...(parsed.details || {}),
					},
					demands: parsed.demands || DEFAULT_DATA.demands,
					prompts: {
						...DEFAULT_DATA.prompts,
						...(parsed.prompts || {}),
					},
				};
				setData(merged);
			} catch (e) {
				console.error("Failed to parse saved draft:", e);
			}
		}
	}, []);

	// Save draft to localStorage on changes
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}, [data]);

	const updateBasicInfo = (basicInfo: BasicInfoData) => {
		setData((prev) => ({ ...prev, basicInfo }));
	};

	const updateDetails = (details: DetailsData) => {
		setData((prev) => ({ ...prev, details }));
	};

	const updateDemands = (demands: DemandsData) => {
		setData((prev) => ({ ...prev, demands }));
	};

	const updatePrompts = (prompts: PromptsData) => {
		setData((prev) => ({ ...prev, prompts }));
	};

	const handleStepValidityChange = useCallback(
		(stepIndex: number, isValid: boolean) => {
			setStepValidity((prev) => {
				// Only update if the value actually changed
				if (prev[stepIndex] === isValid) return prev;
				return { ...prev, [stepIndex]: isValid };
			});
		},
		[],
	);

	// Create stable callbacks for each step
	const handleStep0Validity = useCallback(
		(valid: boolean) => handleStepValidityChange(0, valid),
		[handleStepValidityChange],
	);
	const handleStep1Validity = useCallback(
		(valid: boolean) => handleStepValidityChange(1, valid),
		[handleStepValidityChange],
	);
	const handleStep2Validity = useCallback(
		(valid: boolean) => handleStepValidityChange(2, valid),
		[handleStepValidityChange],
	);
	const handleStep3Validity = useCallback(
		(valid: boolean) => handleStepValidityChange(3, valid),
		[handleStepValidityChange],
	);

	const canProceed = stepValidity[currentStep] !== false;

	const handleNext = () => {
		if (currentStep < STEPS.length - 1 && canProceed) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const handleSubmit = async () => {
		if (!user) return;

		setIsSubmitting(true);

		try {
			const supabase = getSupabaseBrowserClient();

			// Create the campaign
			const { data: campaign, error: campaignError } = await supabase
				.from("campaigns")
				.insert({
					slug: data.basicInfo.slug,
					name: data.basicInfo.name,
					description: data.basicInfo.description,
					country_codes: data.basicInfo.countryCodes,
					use_custom_targets: data.basicInfo.useCustomTargets,
					cause_context: data.details.causeContext,
					goal_letters: data.details.goalLetters,
					start_date: data.details.startDate,
					end_date: data.details.endDate,
					status: "draft" as CampaignStatus,
					created_by: user.id,
				})
				.select()
				.single();

			if (campaignError) throw campaignError;

			// Create the demands
			const demandInserts = data.demands.items.map((demand, index) => ({
				campaign_id: campaign.id,
				title: demand.title,
				description: demand.description,
				brief_text: demand.briefText,
				sort_order: index,
			}));

			const { error: demandsError } = await supabase
				.from("campaign_demands")
				.insert(demandInserts);

			if (demandsError) throw demandsError;

			if (data.basicInfo.customTargets.length > 0) {
				const inserts = data.basicInfo.customTargets.map((row) => ({
					campaign_id: campaign.id,
					name: row.name,
					email: row.email,
					postal_code: row.postal_code,
					city: row.city || null,
					region: row.region || null,
					country_code: row.country_code || null,
					category: row.category || null,
					image_url: row.image_url || null,
					latitude: row.latitude ? Number.parseFloat(row.latitude) : null,
					longitude: row.longitude ? Number.parseFloat(row.longitude) : null,
				}));

				const chunkSize = 500;
				for (let i = 0; i < inserts.length; i += chunkSize) {
					const chunk = inserts.slice(i, i + chunkSize);
					const { error } = await supabase
						.from("campaign_targets")
						.insert(chunk);
					if (error) throw error;
				}
			}

			// Create the prompt if custom
			if (!data.prompts.useDefaultTemplate && data.prompts.customPrompt) {
				for (const country of data.basicInfo.countryCodes) {
					const { error: promptError } = await supabase
						.from("campaign_prompts")
						.insert({
							campaign_id: campaign.id,
							country_code: country,
							language: country === "de" ? "de" : "en",
							system_prompt: data.prompts.customPrompt,
							is_active: true,
							version: 1,
						});

					if (promptError) throw promptError;
				}
			}

			// Clear the draft
			localStorage.removeItem(STORAGE_KEY);

			// Redirect to the campaign edit page
			router.push(`/admin/campaigns/${campaign.slug}`);
		} catch (error) {
			console.error("Error creating campaign:", error);
			alert("Failed to create campaign. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleExit = () => {
		if (
			confirm(
				"Are you sure you want to exit? Your progress will be saved as a draft.",
			)
		) {
			router.push("/admin/campaigns");
		}
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Create Campaign</h1>
					<p className="text-muted-foreground">
						Set up your advocacy campaign in a few steps
					</p>
				</div>
				<Button variant="ghost" onClick={handleExit}>
					Exit
				</Button>
			</div>

			{/* Progress indicator */}
			<div className="relative">
				<div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
					/>
				</div>
				<div className="relative flex justify-between">
					{STEPS.map((step, index) => (
						<button
							key={step.id}
							type="button"
							onClick={() => index <= currentStep && setCurrentStep(index)}
							disabled={index > currentStep}
							className="flex flex-col items-center"
						>
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors ${
									index <= currentStep
										? "border-primary bg-primary text-primary-foreground"
										: "border-muted text-muted-foreground"
								}`}
							>
								{index + 1}
							</div>
							<span
								className={`mt-2 text-xs font-medium ${
									index <= currentStep
										? "text-foreground"
										: "text-muted-foreground"
								}`}
							>
								{step.title}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Step content */}
			<Card>
				<CardHeader>
					<CardTitle>{STEPS[currentStep].title}</CardTitle>
					<CardDescription>{STEPS[currentStep].description}</CardDescription>
				</CardHeader>
				<CardContent>
					{currentStep === 0 && (
						<StepBasicInfo
							data={data.basicInfo}
							onChange={updateBasicInfo}
							onValidityChange={handleStep0Validity}
						/>
					)}
					{currentStep === 1 && (
						<StepDetails
							data={data.details}
							onChange={updateDetails}
							onValidityChange={handleStep1Validity}
						/>
					)}
					{currentStep === 2 && (
						<StepDemands
							data={data.demands}
							onChange={updateDemands}
							onValidityChange={handleStep2Validity}
						/>
					)}
					{currentStep === 3 && (
						<StepPrompts
							data={data.prompts}
							onChange={updatePrompts}
							onValidityChange={handleStep3Validity}
						/>
					)}
					{currentStep === 4 && <StepReview data={data} />}
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between">
				<Button
					variant="outline"
					onClick={handlePrevious}
					disabled={currentStep === 0}
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Previous
				</Button>

				{currentStep < STEPS.length - 1 ? (
					<Button onClick={handleNext} disabled={!canProceed}>
						Next
						<ChevronRight className="ml-2 h-4 w-4" />
					</Button>
				) : (
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Create Campaign
							</>
						)}
					</Button>
				)}
			</div>
		</div>
	);
}
