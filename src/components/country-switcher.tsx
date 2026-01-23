"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setCookie } from "@/lib/cookies";

const COUNTRIES = [
	{ code: "de", label: "🇩🇪", name: "Deutschland" },
	{ code: "ca", label: "🇨🇦", name: "Canada" },
] as const;

type CountryCode = (typeof COUNTRIES)[number]["code"];

/**
 * Country switcher component for manual country selection
 * Sets a cookie to override geo-based detection
 */
export function CountrySwitcher() {
	const router = useRouter();
	const pathname = usePathname();

	// Determine current country from pathname
	const currentCountry = pathname.startsWith("/ca")
		? "ca"
		: pathname.startsWith("/de")
			? "de"
			: "de";

	const handleCountryChange = (newCountry: CountryCode) => {
		if (newCountry === currentCountry) return;

		// Set cookie to remember preference (30 days)
		void setCookie("country", newCountry);

		// Navigate to the new country route
		// Replace the current country prefix with the new one
		let newPath: string;
		if (pathname.startsWith("/de")) {
			newPath = `/${newCountry}${pathname.slice(3)}`;
		} else if (pathname.startsWith("/ca")) {
			newPath = `/${newCountry}${pathname.slice(3)}`;
		} else {
			newPath = `/${newCountry}`;
		}

		router.push(newPath);
	};

	return (
		<div className="flex items-center gap-1 rounded-lg border border-border/50 p-1">
			{COUNTRIES.map((country) => (
				<Button
					key={country.code}
					variant={currentCountry === country.code ? "default" : "ghost"}
					size="sm"
					className="h-7 px-2 text-xs font-medium"
					onClick={() => handleCountryChange(country.code)}
					aria-label={country.name}
					title={country.name}
				>
					{country.label}
				</Button>
			))}
		</div>
	);
}
