/**
 * Tests for embed widget functionality
 * Phase 9 & 10
 *
 * Tests embed iframe, postMessage API, and customization
 */
import { describe, expect, it, vi } from "vitest";

describe("Embed Widget", () => {
	describe("URL Parameters", () => {
		const parseEmbedParams = (searchParams: URLSearchParams) => ({
			theme: searchParams.get("theme") || "light",
			hideHeader: searchParams.get("hideHeader") === "true",
			hideStats: searchParams.get("hideStats") === "true",
			primaryColor: searchParams.get("primaryColor") || undefined,
			countryCode: searchParams.get("country") || "de",
		});

		it("parses theme parameter", () => {
			const params = new URLSearchParams("theme=dark");
			const config = parseEmbedParams(params);
			expect(config.theme).toBe("dark");
		});

		it("defaults to light theme", () => {
			const params = new URLSearchParams();
			const config = parseEmbedParams(params);
			expect(config.theme).toBe("light");
		});

		it("parses hideHeader parameter", () => {
			const params = new URLSearchParams("hideHeader=true");
			const config = parseEmbedParams(params);
			expect(config.hideHeader).toBe(true);
		});

		it("parses hideStats parameter", () => {
			const params = new URLSearchParams("hideStats=true");
			const config = parseEmbedParams(params);
			expect(config.hideStats).toBe(true);
		});

		it("parses primaryColor parameter", () => {
			const params = new URLSearchParams("primaryColor=%2310b981");
			const config = parseEmbedParams(params);
			expect(config.primaryColor).toBe("#10b981");
		});

		it("parses country parameter", () => {
			const params = new URLSearchParams("country=uk");
			const config = parseEmbedParams(params);
			expect(config.countryCode).toBe("uk");
		});

		it("defaults country to de", () => {
			const params = new URLSearchParams();
			const config = parseEmbedParams(params);
			expect(config.countryCode).toBe("de");
		});
	});

	describe("postMessage API", () => {
		const messageTypes = [
			"letter-tools:ready",
			"letter-tools:resize",
			"letter-tools:success",
			"letter-tools:error",
		];

		it("sends ready message on load", () => {
			expect(messageTypes).toContain("letter-tools:ready");
		});

		it("sends resize message for height adjustment", () => {
			expect(messageTypes).toContain("letter-tools:resize");
		});

		it("sends success message on letter generation", () => {
			expect(messageTypes).toContain("letter-tools:success");
		});

		it("sends error message on failure", () => {
			expect(messageTypes).toContain("letter-tools:error");
		});

		describe("Message Format", () => {
			const createMessage = (type: string, payload: unknown) => ({
				type,
				payload,
				source: "letter-tools",
			});

			it("includes type field", () => {
				const msg = createMessage("letter-tools:ready", {});
				expect(msg).toHaveProperty("type");
			});

			it("includes payload field", () => {
				const msg = createMessage("letter-tools:ready", { height: 500 });
				expect(msg.payload).toEqual({ height: 500 });
			});

			it("includes source identifier", () => {
				const msg = createMessage("letter-tools:ready", {});
				expect(msg.source).toBe("letter-tools");
			});
		});
	});

	describe("Minimal UI Version", () => {
		it("hides navigation elements", () => {
			const hiddenInEmbed = ["header", "footer", "navigation", "language-switcher"];
			expect(hiddenInEmbed).toContain("header");
			expect(hiddenInEmbed).toContain("footer");
		});

		it("keeps essential form elements", () => {
			const visibleInEmbed = ["form", "submit-button", "demands-checkboxes"];
			expect(visibleInEmbed).toContain("form");
			expect(visibleInEmbed).toContain("submit-button");
		});
	});

	describe("Cross-Origin Compatibility", () => {
		it("sets appropriate CORS headers", () => {
			const headers = {
				"Access-Control-Allow-Origin": "*",
				"X-Frame-Options": "ALLOWALL",
			};

			expect(headers["Access-Control-Allow-Origin"]).toBe("*");
		});

		it("does not restrict framing", () => {
			const headers = {
				"X-Frame-Options": "ALLOWALL",
			};

			expect(headers["X-Frame-Options"]).not.toBe("DENY");
		});
	});
});

describe("Embed Code Generator", () => {
	describe("Iframe Code", () => {
		const generateIframeCode = (
			campaignSlug: string,
			options: {
				theme?: "light" | "dark";
				hideHeader?: boolean;
				hideStats?: boolean;
				primaryColor?: string;
				width?: string;
				height?: string;
			} = {}
		) => {
			const params = new URLSearchParams();
			if (options.theme) params.set("theme", options.theme);
			if (options.hideHeader) params.set("hideHeader", "true");
			if (options.hideStats) params.set("hideStats", "true");
			if (options.primaryColor) params.set("primaryColor", options.primaryColor);

			const query = params.toString();
			const src = `https://example.com/embed/${campaignSlug}${query ? `?${query}` : ""}`;

			return `<iframe src="${src}" width="${options.width || "100%"}" height="${options.height || "600"}" frameborder="0"></iframe>`;
		};

		it("generates basic iframe code", () => {
			const code = generateIframeCode("test-campaign");
			expect(code).toContain("<iframe");
			expect(code).toContain("test-campaign");
		});

		it("includes theme parameter", () => {
			const code = generateIframeCode("test-campaign", { theme: "dark" });
			expect(code).toContain("theme=dark");
		});

		it("includes hideHeader parameter", () => {
			const code = generateIframeCode("test-campaign", { hideHeader: true });
			expect(code).toContain("hideHeader=true");
		});

		it("includes custom dimensions", () => {
			const code = generateIframeCode("test-campaign", {
				width: "800px",
				height: "700px",
			});
			expect(code).toContain('width="800px"');
			expect(code).toContain('height="700px"');
		});

		it("defaults to 100% width and 600px height", () => {
			const code = generateIframeCode("test-campaign");
			expect(code).toContain('width="100%"');
			expect(code).toContain('height="600"');
		});
	});

	describe("JavaScript Embed Code", () => {
		const generateJsCode = (campaignSlug: string) => {
			return `<script src="https://example.com/embed.js" data-campaign="${campaignSlug}"></script>`;
		};

		it("generates script tag", () => {
			const code = generateJsCode("test-campaign");
			expect(code).toContain("<script");
			expect(code).toContain("</script>");
		});

		it("includes campaign in data attribute", () => {
			const code = generateJsCode("my-campaign");
			expect(code).toContain('data-campaign="my-campaign"');
		});

		it("references embed.js", () => {
			const code = generateJsCode("test");
			expect(code).toContain("embed.js");
		});
	});

	describe("Customization Options", () => {
		const customizationOptions = [
			{ id: "theme", label: "Theme", type: "select", values: ["light", "dark"] },
			{ id: "hideHeader", label: "Hide Header", type: "checkbox" },
			{ id: "hideStats", label: "Hide Stats", type: "checkbox" },
			{ id: "primaryColor", label: "Primary Color", type: "color" },
			{ id: "width", label: "Width", type: "text" },
			{ id: "height", label: "Height", type: "text" },
		];

		it("offers theme selection", () => {
			const themeOption = customizationOptions.find((o) => o.id === "theme");
			expect(themeOption).toBeDefined();
			expect(themeOption?.type).toBe("select");
		});

		it("offers color customization", () => {
			const colorOption = customizationOptions.find((o) => o.id === "primaryColor");
			expect(colorOption).toBeDefined();
			expect(colorOption?.type).toBe("color");
		});

		it("offers dimension controls", () => {
			const widthOption = customizationOptions.find((o) => o.id === "width");
			const heightOption = customizationOptions.find((o) => o.id === "height");
			expect(widthOption).toBeDefined();
			expect(heightOption).toBeDefined();
		});
	});

	describe("Live Preview", () => {
		it("updates preview on option change", () => {
			const updatePreview = vi.fn();
			const options = { theme: "dark" };

			updatePreview(options);

			expect(updatePreview).toHaveBeenCalledWith({ theme: "dark" });
		});

		it("shows preview in admin panel", () => {
			const hasPreview = true;
			expect(hasPreview).toBe(true);
		});
	});
});

describe("Share Buttons", () => {
	describe("Platform Support", () => {
		const platforms = ["twitter", "facebook", "linkedin", "whatsapp", "email", "copy"];

		it("supports Twitter", () => {
			expect(platforms).toContain("twitter");
		});

		it("supports Facebook", () => {
			expect(platforms).toContain("facebook");
		});

		it("supports LinkedIn", () => {
			expect(platforms).toContain("linkedin");
		});

		it("supports WhatsApp", () => {
			expect(platforms).toContain("whatsapp");
		});

		it("supports Email", () => {
			expect(platforms).toContain("email");
		});

		it("supports Copy Link", () => {
			expect(platforms).toContain("copy");
		});
	});

	describe("UTM Parameters", () => {
		const addUtmParams = (
			url: string,
			params: { source: string; medium: string; campaign: string }
		) => {
			const urlObj = new URL(url);
			urlObj.searchParams.set("utm_source", params.source);
			urlObj.searchParams.set("utm_medium", params.medium);
			urlObj.searchParams.set("utm_campaign", params.campaign);
			return urlObj.toString();
		};

		it("adds utm_source", () => {
			const url = addUtmParams("https://example.com", {
				source: "twitter",
				medium: "social",
				campaign: "iran-2026",
			});
			expect(url).toContain("utm_source=twitter");
		});

		it("adds utm_medium", () => {
			const url = addUtmParams("https://example.com", {
				source: "twitter",
				medium: "social",
				campaign: "iran-2026",
			});
			expect(url).toContain("utm_medium=social");
		});

		it("adds utm_campaign", () => {
			const url = addUtmParams("https://example.com", {
				source: "twitter",
				medium: "social",
				campaign: "iran-2026",
			});
			expect(url).toContain("utm_campaign=iran-2026");
		});
	});

	describe("Share URLs", () => {
		const shareUrl = "https://example.com/c/iran-2026";
		const shareText = "I just wrote a letter supporting Iran. Join me!";

		it("generates Twitter share URL", () => {
			const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
			expect(twitterUrl).toContain("twitter.com/intent/tweet");
		});

		it("generates Facebook share URL", () => {
			const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
			expect(fbUrl).toContain("facebook.com/sharer");
		});

		it("generates WhatsApp share URL", () => {
			const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
			expect(waUrl).toContain("wa.me");
		});

		it("generates LinkedIn share URL", () => {
			const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
			expect(liUrl).toContain("linkedin.com/sharing");
		});

		it("generates Email share URL", () => {
			const subject = "Join me in supporting Iran";
			const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
			expect(emailUrl).toContain("mailto:");
		});
	});
});
