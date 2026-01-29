"use client";

import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Clock,
	Mail,
	MailCheck,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";
import {
	clearLetterHistory,
	deleteFromHistory,
	getLetterHistory,
	type HistoryLetter,
} from "@/lib/letter-cache";

interface LetterHistoryProps {
	/** Show compact version */
	compact?: boolean;
}

function formatDate(timestamp: number, locale: string): string {
	return new Date(timestamp).toLocaleDateString(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatTime(timestamp: number, locale: string): string {
	return new Date(timestamp).toLocaleTimeString(locale, {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function LetterCard({
	letter,
	onDelete,
	language,
	locale,
}: {
	letter: HistoryLetter;
	onDelete: (id: string) => void;
	language: "de" | "en" | "fr" | "es";
	locale: string;
}) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="rounded-lg border border-border bg-card overflow-hidden">
			{/* Header - always visible */}
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
			>
				{/* Status icon */}
				<div
					className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
						letter.emailSent
							? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
							: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
					}`}
				>
					{letter.emailSent ? (
						<MailCheck className="h-5 w-5" />
					) : (
						<Mail className="h-5 w-5" />
					)}
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0">
					<p className="font-medium text-sm truncate">{letter.mdbName}</p>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span
							className={`px-1.5 py-0.5 rounded text-xs font-medium ${
								letter.mdbParty === "CDU/CSU"
									? "bg-black text-white"
									: letter.mdbParty === "SPD"
										? "bg-red-600 text-white"
										: letter.mdbParty === "GRÜNE"
											? "bg-green-600 text-white"
											: "bg-gray-200 text-gray-800"
							}`}
						>
							{letter.mdbParty}
						</span>
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{formatDate(letter.createdAt, locale)}
						</span>
					</div>
				</div>

				{/* Expand icon */}
				{expanded ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
				)}
			</button>

			{/* Expanded content */}
			{expanded && (
				<div className="border-t border-border p-4 space-y-4">
					{/* Letter preview */}
					<div className="bg-muted/30 rounded-lg p-3 max-h-48 overflow-y-auto">
						<p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
							{letter.content.slice(0, 500)}
							{letter.content.length > 500 && "..."}
						</p>
					</div>

					{/* Meta info */}
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{formatTime(letter.createdAt, locale)}
						</span>
						<span>
							{letter.wordCount} {t("common", "words", language)}
						</span>
						{letter.emailSent && letter.emailSentAt && (
							<span className="text-green-600 dark:text-green-400">
								{t("letterHistory", "sent", language)}{" "}
								{formatDate(letter.emailSentAt, locale)}
							</span>
						)}
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{!letter.emailSent && (
							<Button
								size="sm"
								variant="secondary"
								className="flex-1"
								onClick={(e) => {
									e.stopPropagation();
									window.location.href = `mailto:${encodeURIComponent(letter.mdbEmail)}?subject=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.content)}`;
								}}
							>
								<Mail className="h-4 w-4 mr-1.5" />
								{t("common", "send", language)}
							</Button>
						)}
						<Button
							size="sm"
							variant="ghost"
							className="text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(letter.id);
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export function LetterHistory({ compact = false }: LetterHistoryProps) {
	const { language } = useLanguage();
	const [history, setHistory] = useState<HistoryLetter[]>([]);
	const [showAll, setShowAll] = useState(false);

	const locale =
		language === "de" ? "de-DE" : language === "fr" ? "fr-CA" : "en-US";

	useEffect(() => {
		setHistory(getLetterHistory());
	}, []);

	const handleDelete = (id: string) => {
		deleteFromHistory(id);
		setHistory(getLetterHistory());
	};

	const handleClearAll = () => {
		const confirmMsg =
			language === "de"
				? "Alle Briefe aus dem Verlauf löschen?"
				: language === "fr"
					? "Supprimer toutes les lettres de l'historique?"
					: "Delete all letters from history?";
		if (window.confirm(confirmMsg)) {
			clearLetterHistory();
			setHistory([]);
		}
	};

	// Don't show if no history
	if (history.length === 0) {
		return null;
	}

	const displayedLetters = showAll ? history : history.slice(0, 3);
	const sentCount = history.filter((l) => l.emailSent).length;

	if (compact) {
		const letterWord =
			history.length === 1
				? t("letterHistory", "letterSingular", language)
				: t("letterHistory", "letterPlural", language);
		const createdWord =
			language === "de"
				? "erstellt"
				: language === "fr"
					? "créée(s)"
					: "created";
		return (
			<div className="text-sm text-muted-foreground">
				{history.length} {letterWord} {createdWord}
				{sentCount > 0 && (
					<span className="text-green-600 dark:text-green-400">
						{" "}
						({sentCount} {t("letterHistory", "sent", language)})
					</span>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">
					{t("letterHistory", "title", language)}
				</h3>
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						{history.length}{" "}
						{history.length === 1
							? t("letterHistory", "letterSingular", language)
							: t("letterHistory", "letterPlural", language)}
					</span>
					{history.length > 0 && (
						<Button
							size="sm"
							variant="ghost"
							className="text-xs text-destructive hover:text-destructive"
							onClick={handleClearAll}
						>
							{t("letterHistory", "clearAll", language)}
						</Button>
					)}
				</div>
			</div>

			{/* Stats */}
			<div className="flex items-center gap-4 text-sm">
				<div className="flex items-center gap-1.5">
					<div className="w-2 h-2 rounded-full bg-green-500" />
					<span>
						{sentCount} {t("letterHistory", "sent", language)}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-2 h-2 rounded-full bg-amber-500" />
					<span>
						{history.length - sentCount}{" "}
						{t("letterHistory", "pending", language)}
					</span>
				</div>
			</div>

			{/* Letter cards */}
			<div className="space-y-2">
				{displayedLetters.map((letter) => (
					<LetterCard
						key={letter.id}
						letter={letter}
						onDelete={handleDelete}
						language={language}
						locale={locale}
					/>
				))}
			</div>

			{/* Show more button */}
			{history.length > 3 && (
				<Button
					variant="ghost"
					className="w-full"
					onClick={() => setShowAll(!showAll)}
				>
					{showAll
						? t("letterHistory", "showLess", language)
						: `${history.length - 3} ${t("letterHistory", "showMore", language)}`}
				</Button>
			)}
		</div>
	);
}
