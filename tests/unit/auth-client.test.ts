/**
 * Unit tests for auth client utilities
 * Phase 10, Epic 10.2
 *
 * Tests auth functions with mocked Supabase client
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock the Supabase browser client
const mockAuth = {
	signInWithPassword: vi.fn(),
	signUp: vi.fn(),
	signOut: vi.fn(),
	signInWithOAuth: vi.fn(),
	resetPasswordForEmail: vi.fn(),
	updateUser: vi.fn(),
	getUser: vi.fn(),
	onAuthStateChange: vi.fn(),
};

const mockSupabaseClient = {
	auth: mockAuth,
};

vi.mock("@supabase/ssr", () => ({
	createBrowserClient: vi.fn(() => mockSupabaseClient),
}));

// Mock clientEnv
vi.mock("@/lib/env", () => ({
	clientEnv: {
		NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
		NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
	},
}));

// Mock window.location for OAuth tests
const mockLocation = {
	origin: "http://localhost:3000",
};
vi.stubGlobal("window", { location: mockLocation });

describe("Auth Client Utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("signIn", () => {
		it("returns user on successful sign in", async () => {
			const mockUser = { id: "user-123", email: "test@example.com" };
			mockAuth.signInWithPassword.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const { signIn } = await import("@/lib/auth/client");
			const result = await signIn("test@example.com", "password123");

			expect(result.user).toEqual(mockUser);
			expect(result.error).toBeNull();
			expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
			});
		});

		it("returns error on failed sign in", async () => {
			mockAuth.signInWithPassword.mockResolvedValue({
				data: { user: null },
				error: { message: "Invalid credentials" },
			});

			const { signIn } = await import("@/lib/auth/client");
			const result = await signIn("test@example.com", "wrong-password");

			expect(result.user).toBeNull();
			expect(result.error).toBe("Invalid credentials");
		});
	});

	describe("signUp", () => {
		it("returns user on successful sign up", async () => {
			const mockUser = { id: "new-user-123", email: "new@example.com" };
			mockAuth.signUp.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const { signUp } = await import("@/lib/auth/client");
			const result = await signUp("new@example.com", "password123", "John Doe");

			expect(result.user).toEqual(mockUser);
			expect(result.error).toBeNull();
			expect(mockAuth.signUp).toHaveBeenCalledWith({
				email: "new@example.com",
				password: "password123",
				options: {
					data: { display_name: "John Doe" },
				},
			});
		});

		it("returns error when email already exists", async () => {
			mockAuth.signUp.mockResolvedValue({
				data: { user: null },
				error: { message: "User already registered" },
			});

			const { signUp } = await import("@/lib/auth/client");
			const result = await signUp("existing@example.com", "password123");

			expect(result.user).toBeNull();
			expect(result.error).toBe("User already registered");
		});
	});

	describe("signOut", () => {
		it("returns no error on successful sign out", async () => {
			mockAuth.signOut.mockResolvedValue({ error: null });

			const { signOut } = await import("@/lib/auth/client");
			const result = await signOut();

			expect(result.error).toBeNull();
			expect(mockAuth.signOut).toHaveBeenCalled();
		});

		it("returns error on failed sign out", async () => {
			mockAuth.signOut.mockResolvedValue({
				error: { message: "Session expired" },
			});

			const { signOut } = await import("@/lib/auth/client");
			const result = await signOut();

			expect(result.error).toBe("Session expired");
		});
	});

	describe("signInWithGoogle", () => {
		it("initiates Google OAuth flow", async () => {
			mockAuth.signInWithOAuth.mockResolvedValue({ error: null });

			const { signInWithGoogle } = await import("@/lib/auth/client");
			const result = await signInWithGoogle();

			expect(result.error).toBeNull();
			expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
				provider: "google",
				options: {
					redirectTo: "http://localhost:3000/auth/callback",
				},
			});
		});

		it("returns error when OAuth fails", async () => {
			mockAuth.signInWithOAuth.mockResolvedValue({
				error: { message: "OAuth provider unavailable" },
			});

			const { signInWithGoogle } = await import("@/lib/auth/client");
			const result = await signInWithGoogle();

			expect(result.error).toBe("OAuth provider unavailable");
		});
	});

	describe("resetPassword", () => {
		it("sends password reset email", async () => {
			mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

			const { resetPassword } = await import("@/lib/auth/client");
			const result = await resetPassword("test@example.com");

			expect(result.error).toBeNull();
			expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
				"test@example.com",
				{
					redirectTo: "http://localhost:3000/auth/reset-password",
				},
			);
		});

		it("returns error for invalid email", async () => {
			mockAuth.resetPasswordForEmail.mockResolvedValue({
				error: { message: "User not found" },
			});

			const { resetPassword } = await import("@/lib/auth/client");
			const result = await resetPassword("nonexistent@example.com");

			expect(result.error).toBe("User not found");
		});
	});

	describe("updatePassword", () => {
		it("updates password successfully", async () => {
			mockAuth.updateUser.mockResolvedValue({ error: null });

			const { updatePassword } = await import("@/lib/auth/client");
			const result = await updatePassword("newPassword123");

			expect(result.error).toBeNull();
			expect(mockAuth.updateUser).toHaveBeenCalledWith({
				password: "newPassword123",
			});
		});

		it("returns error for weak password", async () => {
			mockAuth.updateUser.mockResolvedValue({
				error: { message: "Password too weak" },
			});

			const { updatePassword } = await import("@/lib/auth/client");
			const result = await updatePassword("weak");

			expect(result.error).toBe("Password too weak");
		});
	});

	describe("getCurrentUser", () => {
		it("returns current user when authenticated", async () => {
			const mockUser = { id: "user-123", email: "test@example.com" };
			mockAuth.getUser.mockResolvedValue({
				data: { user: mockUser },
			});

			const { getCurrentUser } = await import("@/lib/auth/client");
			const result = await getCurrentUser();

			expect(result).toEqual(mockUser);
		});

		it("returns null when not authenticated", async () => {
			mockAuth.getUser.mockResolvedValue({
				data: { user: null },
			});

			const { getCurrentUser } = await import("@/lib/auth/client");
			const result = await getCurrentUser();

			expect(result).toBeNull();
		});
	});

	describe("onAuthStateChange", () => {
		it("subscribes to auth state changes", async () => {
			const mockCallback = vi.fn();
			const mockUnsubscribe = vi.fn();
			mockAuth.onAuthStateChange.mockReturnValue({
				data: { subscription: { unsubscribe: mockUnsubscribe } },
			});

			const { onAuthStateChange } = await import("@/lib/auth/client");
			const unsubscribe = onAuthStateChange(mockCallback);

			expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
			expect(typeof unsubscribe).toBe("function");

			// Call unsubscribe
			unsubscribe();
			expect(mockUnsubscribe).toHaveBeenCalled();
		});
	});
});
