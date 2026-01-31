/**
 * Step 4: Prompts
 * LLM prompt configuration
 */

"use client";

import { AlertCircle, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface PromptsData {
	useDefaultTemplate: boolean;
	customPrompt: string;
}

interface StepPromptsProps {
	data: PromptsData;
	onChange: (data: PromptsData) => void;
	onValidityChange: (valid: boolean) => void;
}

const DEFAULT_TEMPLATE = `You are a skilled advocacy letter writer helping citizens write compelling personal letters to their elected representatives.

CAMPAIGN CONTEXT:
{{cause_context}}

CAMPAIGN DEMANDS:
{{demands}}

USER'S PERSONAL STORY:
{{personal_story}}

SELECTED DEMANDS TO ADDRESS:
{{selected_demands}}

REPRESENTATIVE:
{{representative}}

Write a personal advocacy letter that:
1. Opens with a personal connection to the issue (Story of Self)
2. Connects the writer's experience to shared values (Story of Us)
3. Makes a clear call to action with the selected demands (Story of Now)

The letter should be:
- Written in first person from the user's perspective
- Authentic and emotionally resonant
- Between 300-500 words
- Professional but personal in tone
- In the language appropriate for the country

IMPORTANT RULES:
- Do not invent facts or statistics
- Do not use hate speech or dehumanizing language
- Focus only on legal, non-violent advocacy
- Avoid party-political framing`;

export function StepPrompts({
	data,
	onChange,
	onValidityChange,
}: StepPromptsProps) {
	const [showAdvanced, setShowAdvanced] = useState(!data.useDefaultTemplate);

	// Track previous validity to avoid unnecessary parent updates
	const prevValidRef = useRef<boolean | null>(null);

	// Validate the step - only call onValidityChange when value changes
	useEffect(() => {
		const isValid =
			data.useDefaultTemplate || data.customPrompt.trim().length > 100;
		if (prevValidRef.current !== isValid) {
			prevValidRef.current = isValid;
			onValidityChange(isValid);
		}
	}, [data.useDefaultTemplate, data.customPrompt, onValidityChange]);

	const handleUseDefaultChange = (checked: boolean) => {
		onChange({ ...data, useDefaultTemplate: checked });
		if (checked) {
			setShowAdvanced(false);
		}
	};

	const handleUseTemplate = () => {
		onChange({
			...data,
			customPrompt: DEFAULT_TEMPLATE,
			useDefaultTemplate: false,
		});
	};

	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-muted/30 p-4">
				<div className="flex gap-3">
					<Wand2 className="h-5 w-5 text-primary" />
					<div>
						<h4 className="font-medium">AI Letter Generation</h4>
						<p className="text-sm text-muted-foreground">
							The prompt controls how the AI generates letters for your
							campaign. For most campaigns, the default template works well.
						</p>
					</div>
				</div>
			</div>

			<div className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-muted/50">
				<Checkbox
					id="useDefaultTemplate"
					checked={data.useDefaultTemplate}
					onCheckedChange={handleUseDefaultChange}
				/>
				<label htmlFor="useDefaultTemplate" className="cursor-pointer">
					<span className="font-medium">Use Default Template</span>
					<p className="text-sm text-muted-foreground">
						The default template is optimized for advocacy campaigns and
						includes the Public Narrative framework (Story of Self, Us, and
						Now).
					</p>
				</label>
			</div>

			<Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						type="button"
						className="w-full justify-start text-muted-foreground"
					>
						{showAdvanced ? "▼" : "▶"} Advanced: Custom Prompt
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-4 pt-4">
					<div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
						<div className="flex gap-2">
							<AlertCircle className="h-5 w-5 text-amber-600" />
							<p className="text-sm text-amber-800 dark:text-amber-200">
								Custom prompts require careful testing. Make sure to test letter
								generation before publishing your campaign.
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="customPrompt" className="text-base font-medium">
								Custom System Prompt
							</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleUseTemplate}
							>
								Start from default
							</Button>
						</div>
						<Textarea
							id="customPrompt"
							value={data.customPrompt}
							onChange={(e) =>
								onChange({
									...data,
									customPrompt: e.target.value,
									useDefaultTemplate: false,
								})
							}
							placeholder="Enter your custom system prompt..."
							rows={16}
							className="font-mono text-sm"
						/>
						<p className="text-xs text-muted-foreground">
							Available template variables: {"{{cause_context}}"},{" "}
							{"{{demands}}"}, {"{{personal_story}}"}, {"{{selected_demands}}"},{" "}
							{"{{representative}}"}
						</p>
					</div>

					{!data.useDefaultTemplate &&
						data.customPrompt.length > 0 &&
						data.customPrompt.length < 100 && (
							<p className="text-sm text-destructive">
								Custom prompt should be at least 100 characters
							</p>
						)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
