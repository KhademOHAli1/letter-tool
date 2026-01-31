"use client";

/**
 * Embed Code Generator Component
 * Phase 9: Sharing & Distribution
 *
 * Generates iframe code snippets for embedding campaigns on external websites
 */

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface EmbedCodeGeneratorProps {
	campaignSlug: string;
	campaignName: string;
	countryCodes: string[];
}

export function EmbedCodeGenerator({
	campaignSlug,
	campaignName,
	countryCodes,
}: EmbedCodeGeneratorProps) {
	const [copied, setCopied] = useState(false);
	const [options, setOptions] = useState({
		country: countryCodes[0] || "de",
		theme: "auto" as "light" | "dark" | "auto",
		hideHeader: false,
		hideStats: true,
		width: "100%",
		height: "600",
		primaryColor: "",
	});

	// Generate the embed URL
	const baseUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/embed/${campaignSlug}`
			: `/embed/${campaignSlug}`;

	const params = new URLSearchParams();
	params.set("country", options.country);
	if (options.theme !== "auto") params.set("theme", options.theme);
	if (options.hideHeader) params.set("hideHeader", "true");
	if (options.hideStats) params.set("hideStats", "true");
	if (options.primaryColor) params.set("primaryColor", options.primaryColor);

	const embedUrl = `${baseUrl}?${params.toString()}`;

	// Generate the iframe code
	const iframeCode = `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="${campaignName} - Write a Letter"
  allow="clipboard-write"
></iframe>`;

	// Generate JavaScript embed code (alternative)
	const jsEmbedCode = `<div id="letter-tools-embed"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '${options.width}';
    iframe.height = '${options.height}';
    iframe.frameBorder = '0';
    iframe.style.cssText = 'border: 1px solid #e5e7eb; border-radius: 8px;';
    iframe.title = '${campaignName} - Write a Letter';
    iframe.allow = 'clipboard-write';
    document.getElementById('letter-tools-embed').appendChild(iframe);
  })();
</script>`;

	const handleCopy = async (code: string) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback
			const textarea = document.createElement("textarea");
			textarea.value = code;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div className="space-y-6">
			{/* Configuration */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Embed Configuration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Country */}
						<div className="space-y-2">
							<Label htmlFor="embed-country">Country</Label>
							<Select
								value={options.country}
								onValueChange={(value) =>
									setOptions((prev) => ({ ...prev, country: value }))
								}
							>
								<SelectTrigger id="embed-country">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{countryCodes.map((code) => (
										<SelectItem key={code} value={code}>
											{code.toUpperCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Theme */}
						<div className="space-y-2">
							<Label htmlFor="embed-theme">Theme</Label>
							<Select
								value={options.theme}
								onValueChange={(value: "light" | "dark" | "auto") =>
									setOptions((prev) => ({ ...prev, theme: value }))
								}
							>
								<SelectTrigger id="embed-theme">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="auto">Auto (match system)</SelectItem>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="dark">Dark</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Width */}
						<div className="space-y-2">
							<Label htmlFor="embed-width">Width</Label>
							<Input
								id="embed-width"
								value={options.width}
								onChange={(e) =>
									setOptions((prev) => ({ ...prev, width: e.target.value }))
								}
								placeholder="100% or 600px"
							/>
						</div>

						{/* Height */}
						<div className="space-y-2">
							<Label htmlFor="embed-height">Height (px)</Label>
							<Input
								id="embed-height"
								value={options.height}
								onChange={(e) =>
									setOptions((prev) => ({ ...prev, height: e.target.value }))
								}
								placeholder="600"
							/>
						</div>

						{/* Primary Color */}
						<div className="space-y-2">
							<Label htmlFor="embed-color">Primary Color (optional)</Label>
							<div className="flex gap-2">
								<Input
									id="embed-color"
									value={options.primaryColor}
									onChange={(e) =>
										setOptions((prev) => ({
											...prev,
											primaryColor: e.target.value,
										}))
									}
									placeholder="#10b981"
									className="flex-1"
								/>
								{options.primaryColor && (
									<div
										className="w-10 h-10 rounded border"
										style={{ backgroundColor: options.primaryColor }}
									/>
								)}
							</div>
						</div>
					</div>

					{/* Visibility options */}
					<div className="flex flex-wrap gap-4 pt-2">
						<div className="flex items-center gap-2">
							<Checkbox
								id="hide-header"
								checked={options.hideHeader}
								onCheckedChange={(checked) =>
									setOptions((prev) => ({
										...prev,
										hideHeader: checked === true,
									}))
								}
							/>
							<label htmlFor="hide-header" className="text-sm cursor-pointer">
								Hide campaign header
							</label>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="hide-stats"
								checked={options.hideStats}
								onCheckedChange={(checked) =>
									setOptions((prev) => ({
										...prev,
										hideStats: checked === true,
									}))
								}
							/>
							<label htmlFor="hide-stats" className="text-sm cursor-pointer">
								Hide stats
							</label>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Preview */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Preview</CardTitle>
						<Button variant="outline" size="sm" asChild>
							<a href={embedUrl} target="_blank" rel="noopener noreferrer">
								<ExternalLink className="w-4 h-4 mr-1" />
								Open in new tab
							</a>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div
						className="border rounded-lg overflow-hidden bg-muted/50"
						style={{
							height: `${Math.min(Number(options.height) || 600, 400)}px`,
						}}
					>
						<iframe
							src={embedUrl}
							width="100%"
							height="100%"
							frameBorder="0"
							title="Embed Preview"
							className="bg-background"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Embed Codes */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Embed Code</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* iframe code */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>HTML (iframe)</Label>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleCopy(iframeCode)}
							>
								{copied ? (
									<>
										<Check className="w-4 h-4 mr-1" />
										Copied
									</>
								) : (
									<>
										<Copy className="w-4 h-4 mr-1" />
										Copy
									</>
								)}
							</Button>
						</div>
						<pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
							{iframeCode}
						</pre>
					</div>

					{/* JavaScript code */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>JavaScript (dynamic)</Label>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleCopy(jsEmbedCode)}
							>
								<Copy className="w-4 h-4 mr-1" />
								Copy
							</Button>
						</div>
						<pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
							{jsEmbedCode}
						</pre>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
