import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
	cookies: () => ({
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
	}),
	headers: () => new Headers(),
}));

// Mock environment variables for tests
vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
