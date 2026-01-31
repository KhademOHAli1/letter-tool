/**
 * Step 1: Basic Info
 * Campaign name, description, slug, and country selection
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/auth/client";

export interface BasicInfoData {
	name: Record<string, string>;
	description: Record<string, string>;
	slug: string;
	countryCodes: string[];
}

interface StepBasicInfoProps {
	data: BasicInfoData;
	onChange: (data: BasicInfoData) => void;
	onValidityChange: (valid: boolean) => void;
}

const COUNTRIES = [
	{ code: "de", name: "Germany", flag: "🇩🇪" },
	{ code: "ca", name: "Canada", flag: "🇨🇦" },
	{ code: "uk", name: "United Kingdom", flag: "🇬🇧" },
	{ code: "us", name: "United States", flag: "🇺🇸" },
	{ code: "fr", name: "France", flag: "🇫🇷" },
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
			data.countryCodes.length > 0;

		if (prevValidRef.current !== isValid) {
			prevValidRef.current = isValid;
			onValidityChange(isValid);
		}
	}, [data.name, data.slug, data.countryCodes, slugError, onValidityChange]);

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

			{/* Countries */}
			<div className="space-y-4">
				<Label className="text-base font-medium">Target Countries *</Label>
				<p className="text-sm text-muted-foreground">
					Select which countries this campaign will target
				</p>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{COUNTRIES.map((country) => (
						<div
							key={country.code}
							className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
						>
							<Checkbox
								id={`country-${country.code}`}
								checked={data.countryCodes.includes(country.code)}
								onCheckedChange={(checked) =>
									handleCountryToggle(country.code, checked as boolean)
								}
							/>
							<label
								htmlFor={`country-${country.code}`}
								className="flex cursor-pointer items-center gap-2"
							>
								<span className="text-lg">{country.flag}</span>
								<span className="text-sm font-medium">{country.name}</span>
							</label>
						</div>
					))}
				</div>
				{data.countryCodes.length === 0 && (
					<p className="text-sm text-destructive">
						Please select at least one country
					</p>
				)}
			</div>
		</div>
	);
}
