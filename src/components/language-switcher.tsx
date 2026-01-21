"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function LanguageSwitcher() {
	const { language, setLanguage, t } = useLanguage();

	return (
		<div className="flex items-center gap-1 rounded-lg border border-border/50 p-1">
			<Button
				variant={language === "de" ? "default" : "ghost"}
				size="sm"
				className="h-7 px-2 text-xs font-medium"
				onClick={() => setLanguage("de")}
				aria-label={t("languages", "de")}
			>
				DE
			</Button>
			<Button
				variant={language === "en" ? "default" : "ghost"}
				size="sm"
				className="h-7 px-2 text-xs font-medium"
				onClick={() => setLanguage("en")}
				aria-label={t("languages", "en")}
			>
				EN
			</Button>
		</div>
	);
}
