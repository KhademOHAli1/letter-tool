/**
 * Step 1: Basic Info
 * Campaign name, description, slug, and country selection
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { TargetTableEditor } from "@/components/admin/targets/target-table-editor";
import { Flag } from "@/components/flags";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/auth/client";
import type { TargetUploadRow } from "@/lib/campaign-targets";
import type { CountryCode } from "@/lib/country-config";

export interface BasicInfoData {
	name: Record<string, string>;
	description: Record<string, string>;
	slug: string;
	countryCodes: string[];
	useCustomTargets: boolean;
	customTargets: TargetUploadRow[];
}

interface StepBasicInfoProps {
	data: BasicInfoData;
	onChange: (data: BasicInfoData) => void;
	onValidityChange: (valid: boolean) => void;
}

const TARGET_AUDIENCES: { code: CountryCode; label: string }[] = [
	{ code: "de", label: "German Bundestag" },
	{ code: "uk", label: "UK House of Commons" },
	{ code: "us", label: "US Congress" },
	{ code: "fr", label: "French National Assembly" },
	{ code: "ca", label: "Canadian Parliament" },
];

const LANGUAGES = ["en", "de"];

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

export function StepBasicInfo({
	data,
	onChange,
	onValidityChange,
}: StepBasicInfoProps) {
	const [slugTouched, setSlugTouched] = useState(false);
	const [slugError, setSlugError] = useState<string | null>(null);

	const customTargets = data.customTargets ?? [];
	const useCustomTargets = data.useCustomTargets ?? false;

	// Auto-generate slug from English name if not manually edited
	useEffect(() => {
		if (!slugTouched && data.name.en) {
			const newSlug = generateSlug(data.name.en);
			if (newSlug !== data.slug) {
				onChange({ ...data, slug: newSlug });
			}
		}
	}, [data, slugTouched, onChange]);

	// Validate slug uniqueness
	useEffect(() => {
		const checkSlug = async () => {
			if (!data.slug) {
				setSlugError(null);
				return;
			}

			const supabase = getSupabaseBrowserClient();
			const { data: existing } = await supabase
				.from("campaigns")
				.select("id")
				.eq("slug", data.slug)
				.single();

			if (existing) {
				setSlugError("This URL slug is already taken");
			} else {
				setSlugError(null);
			}
		};

		const timeout = setTimeout(checkSlug, 500);
		return () => clearTimeout(timeout);
	}, [data.slug]);

	// Track previous validity to avoid unnecessary parent updates
	const prevValidRef = useRef<boolean | null>(null);

	// Validate the step - only call onValidityChange when validity actually changes
	useEffect(() => {
		const isValid =
			Object.values(data.name).some((n) => n.trim().length > 0) &&
			data.slug.length >= 3 &&
			!slugError &&
			data.countryCodes.length > 0 &&
			(!useCustomTargets || customTargets.length > 0);

		if (prevValidRef.current !== isValid) {
			prevValidRef.current = isValid;
			onValidityChange(isValid);
		}
	}, [
		data.name,
		data.slug,
		data.countryCodes,
		useCustomTargets,
		customTargets.length,
		slugError,
		onValidityChange,
	]);

	const handleNameChange = (lang: string, value: string) => {
		onChange({
			...data,
			name: { ...data.name, [lang]: value },
		});
	};

	const handleDescriptionChange = (lang: string, value: string) => {
		onChange({
			...data,
			description: { ...data.description, [lang]: value },
		});
	};

	const handleSlugChange = (value: string) => {
		setSlugTouched(true);
		onChange({
			...data,
			slug: generateSlug(value),
		});
	};

	const handleCountryToggle = (code: string, checked: boolean) => {
		const newCodes = checked
			? [...data.countryCodes, code]
			: data.countryCodes.filter((c) => c !== code);

		onChange({
			...data,
			countryCodes: newCodes,
		});
	};

	const handleAudienceApply = (rows: TargetUploadRow[]) => {
		onChange({
			...data,
			useCustomTargets: true,
			customTargets: rows,
		});
	};

	return (
		<div className="space-y-6">
			{/* Campaign Name */}
			<div className="space-y-4">
				<Label className="text-base font-medium">Campaign Name *</Label>
				<p className="text-sm text-muted-foreground">
					Enter the name in each language you want to support
				</p>
				{LANGUAGES.map((lang) => (
					<div key={lang} className="space-y-1">
						<Label
							htmlFor={`name-${lang}`}
							className="text-sm text-muted-foreground"
						>
							{lang === "en" ? "English" : "German"}
						</Label>
						<Input
							id={`name-${lang}`}
							value={data.name[lang] || ""}
							onChange={(e) => handleNameChange(lang, e.target.value)}
							placeholder={`Campaign name in ${lang === "en" ? "English" : "German"}`}
						/>
					</div>
				))}
			</div>

			{/* URL Slug */}
			<div className="space-y-2">
				<Label htmlFor="slug" className="text-base font-medium">
					URL Slug *
				</Label>
				<p className="text-sm text-muted-foreground">
					This will be used in the campaign URL: /c/{data.slug || "your-slug"}
				</p>
				<Input
					id="slug"
					value={data.slug}
					onChange={(e) => handleSlugChange(e.target.value)}
					placeholder="your-campaign-slug"
					className={slugError ? "border-destructive" : ""}
				/>
				{slugError && <p className="text-sm text-destructive">{slugError}</p>}
			</div>

			{/* Description */}
			<div className="space-y-4">
				<Label className="text-base font-medium">Description</Label>
				<p className="text-sm text-muted-foreground">
					A brief description of your campaign (shown on the campaign page)
				</p>
				{LANGUAGES.map((lang) => (
					<div key={lang} className="space-y-1">
						<Label
							htmlFor={`desc-${lang}`}
							className="text-sm text-muted-foreground"
						>
							{lang === "en" ? "English" : "German"}
						</Label>
						<Textarea
							id={`desc-${lang}`}
							value={data.description[lang] || ""}
							onChange={(e) => handleDescriptionChange(lang, e.target.value)}
							placeholder={`Description in ${lang === "en" ? "English" : "German"}`}
							rows={3}
						/>
					</div>
				))}
			</div>

			{/* Target Audience */}
			<div className="space-y-4">
				<Label className="text-base font-medium">Target Audience *</Label>
				<p className="text-sm text-muted-foreground">
					Select which audience this campaign will target
				</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{TARGET_AUDIENCES.map((audience) => (
						<div
							key={audience.code}
							className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
						>
							<Checkbox
								id={`audience-${audience.code}`}
								checked={data.countryCodes.includes(audience.code)}
								onCheckedChange={(checked) =>
									handleCountryToggle(audience.code, checked as boolean)
								}
							/>
							<label
								htmlFor={`audience-${audience.code}`}
								className="flex cursor-pointer items-center gap-2"
							>
								<Flag country={audience.code} className="h-4 w-6" />
								<span className="text-sm font-medium">{audience.label}</span>
							</label>
						</div>
					))}
				</div>
				{data.countryCodes.length === 0 && (
					<p className="text-sm text-destructive">
						Please select at least one audience
					</p>
				)}
			</div>

			{/* Custom Audience */}
			<div className="space-y-4">
				<Label className="text-base font-medium">Custom Audience</Label>
				<p className="text-sm text-muted-foreground">
					Upload a target list to route supporters to the nearest recipient
				</p>

				<div className="flex items-start gap-3">
					<Checkbox
						id="custom-audience"
						checked={useCustomTargets}
						onCheckedChange={(checked) =>
							onChange({ ...data, useCustomTargets: checked as boolean })
						}
					/>
					<label htmlFor="custom-audience" className="space-y-1 cursor-pointer">
						<p className="text-sm font-medium">Enable custom audience list</p>
						<p className="text-xs text-muted-foreground">
							Supporters can find the nearest target by postal code or search.
						</p>
					</label>
				</div>

				{useCustomTargets ? (
					<>
						{customTargets.length > 0 && (
							<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
								<p className="text-sm">
									<span className="font-medium">{customTargets.length}</span>{" "}
									targets loaded
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onChange({ ...data, customTargets: [] })}
								>
									Clear and re-import
								</Button>
							</div>
						)}

						<TargetTableEditor
							mode="wizard"
							variant="inline"
							onApply={handleAudienceApply}
						/>
					</>
				) : (
					<p className="text-xs text-muted-foreground">
						Enable custom audience to upload a target list.
					</p>
				)}
			</div>
		</div>
	);
}
