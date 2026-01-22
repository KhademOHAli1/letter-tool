"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type DocLanguage = "de" | "en" | "fa";

interface DocPageProps {
	title: string;
	subtitle: string;
	content: string;
	language?: DocLanguage;
	backLink?: string;
	backLabel?: string;
	footerLinks?: Array<{ href: string; label: string }>;
}

const backLabels: Record<DocLanguage, string> = {
	de: "← Zurück zur Startseite",
	en: "← Back to home",
	fa: "→ بازگشت به صفحه اصلی",
};

/**
 * Shared layout component for documentation pages.
 * Renders markdown content with consistent styling.
 * Supports RTL for Farsi content.
 */
export function DocPage({
	title,
	subtitle,
	content,
	language = "de",
	backLink = "/",
	backLabel,
	footerLinks = [
		{ href: "/datenschutz", label: "Datenschutzerklärung" },
		{ href: "/impressum", label: "Impressum" },
		{ href: "/", label: "Startseite" },
	],
}: DocPageProps) {
	const isRTL = language === "fa";
	const resolvedBackLabel = backLabel || backLabels[language];

	return (
		<div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
			<header className="border-b border-border/50">
				<div className="container mx-auto max-w-3xl px-4 py-8">
					<Link
						href={backLink}
						className="text-sm text-muted-foreground hover:text-primary transition-colors"
					>
						{resolvedBackLabel}
					</Link>
					<h1 className="text-3xl font-bold mt-4">{title}</h1>
					<p className="text-muted-foreground mt-2">{subtitle}</p>
				</div>
			</header>

			<main className="container mx-auto max-w-3xl px-4 py-10">
				<div className="prose prose-neutral dark:prose-invert max-w-none">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={{
							// Headings
							h1: ({ children }) => (
								<h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">
									{children}
								</h1>
							),
							h2: ({ children }) => (
								<h2 className="text-xl font-semibold mt-8 mb-3">{children}</h2>
							),
							h3: ({ children }) => (
								<h3 className="text-lg font-medium mt-6 mb-2">{children}</h3>
							),

							// Paragraphs
							p: ({ children }) => (
								<p className="text-muted-foreground mt-3 first:mt-0">
									{children}
								</p>
							),

							// Lists
							ul: ({ children }) => (
								<ul className="list-disc list-inside text-muted-foreground mt-3 space-y-1">
									{children}
								</ul>
							),
							ol: ({ children }) => (
								<ol className="list-decimal list-inside text-muted-foreground mt-3 space-y-1">
									{children}
								</ol>
							),
							li: ({ children }) => <li>{children}</li>,

							// Links
							a: ({ href, children }) => (
								<a
									href={href}
									target={href?.startsWith("http") ? "_blank" : undefined}
									rel={
										href?.startsWith("http") ? "noopener noreferrer" : undefined
									}
									className="text-primary hover:underline"
								>
									{children}
								</a>
							),

							// Strong/emphasis
							strong: ({ children }) => (
								<strong className="font-semibold text-foreground">
									{children}
								</strong>
							),
							em: ({ children }) => <em className="italic">{children}</em>,

							// Tables (for data transparency page)
							table: ({ children }) => (
								<div className="overflow-x-auto mt-4">
									<table className="min-w-full border border-border rounded-lg">
										{children}
									</table>
								</div>
							),
							thead: ({ children }) => (
								<thead className="bg-muted/50">{children}</thead>
							),
							tbody: ({ children }) => <tbody>{children}</tbody>,
							tr: ({ children }) => (
								<tr className="border-b border-border last:border-0">
									{children}
								</tr>
							),
							th: ({ children }) => (
								<th className="px-4 py-3 text-start font-semibold text-foreground">
									{children}
								</th>
							),
							td: ({ children }) => (
								<td className="px-4 py-3 text-muted-foreground text-start">
									{children}
								</td>
							),

							// Blockquotes (for callouts/warnings)
							blockquote: ({ children }) => (
								<blockquote className="border-s-4 border-primary/50 ps-4 py-2 my-4 bg-primary/5 rounded-e-lg">
									{children}
								</blockquote>
							),

							// Code (for technical terms)
							code: ({ children }) => (
								<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
									{children}
								</code>
							),

							// Horizontal rule
							hr: () => <hr className="border-border my-8" />,
						}}
					>
						{content}
					</ReactMarkdown>
				</div>
			</main>

			<footer className="border-t border-border/50 mt-10">
				<div className="container mx-auto max-w-3xl px-4 py-6">
					<p className="text-sm text-muted-foreground text-center">
						{footerLinks.map((link, index) => (
							<span key={link.href}>
								{index > 0 && " · "}
								<Link href={link.href} className="hover:text-primary">
									{link.label}
								</Link>
							</span>
						))}
					</p>
				</div>
			</footer>
		</div>
	);
}
