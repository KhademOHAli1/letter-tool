/**
 * AuthProvider - Client-side authentication context
 * Phase 5: Frontend Admin Interface
 *
 * Provides auth state to the entire app via React Context.
 * Listens to Supabase auth state changes and keeps state in sync.
 */

"use client";

import type { User } from "@supabase/supabase-js";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	signIn as authSignIn,
	signInWithGoogle as authSignInWithGoogle,
	signOut as authSignOut,
	signUp as authSignUp,
	getCurrentUser,
	getSupabaseBrowserClient,
	isSupabaseConfigured,
	onAuthStateChange,
} from "@/lib/auth/client";
import type { UserProfile, UserRole } from "@/lib/auth/types";

// Auth context state
interface AuthContextState {
	user: User | null;
	profile: UserProfile | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	configError: string | null;
	signIn: (
		email: string,
		password: string,
	) => Promise<{ error: string | null }>;
	signUp: (
		email: string,
		password: string,
		displayName?: string,
	) => Promise<{ error: string | null }>;
	signOut: () => Promise<{ error: string | null }>;
	signInWithGoogle: () => Promise<{ error: string | null }>;
	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [configError, setConfigError] = useState<string | null>(null);

	// Check if Supabase is configured
	const supabaseConfigured = isSupabaseConfigured();

	// Fetch user profile from database with retry support
	const fetchProfile = useCallback(
		async (
			userId: string,
			retries = 3,
			delay = 500,
		): Promise<UserProfile | null> => {
			if (!supabaseConfigured) {
				return null;
			}

			const supabase = getSupabaseBrowserClient();

			const { data, error } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) {
				// PGRST116 = "no rows returned" - profile may not be created yet by trigger
				const errorCode = error.code;
				const errorMessage = error.message;
				const isNotFound = errorCode === "PGRST116";

				if (isNotFound && retries > 0) {
					// Wait and retry - the database trigger may still be creating the profile
					await new Promise((resolve) => setTimeout(resolve, delay));
					return fetchProfile(userId, retries - 1, delay);
				}

				// Only log as error if it's not a "not found" issue after retries
				if (!isNotFound) {
					console.error("Error fetching profile:", errorMessage || errorCode);
				} else {
					console.warn(
						"Profile not found for user:",
						userId,
						"- may need manual creation",
					);
				}
				return null;
			}

			if (!data) {
				return null;
			}

			const userProfile: UserProfile = {
				id: data.id,
				displayName: data.display_name,
				avatarUrl: data.avatar_url,
				role: data.role as UserRole,
				email: data.email,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
			};

			return userProfile;
		},
		[supabaseConfigured],
	);

	// Refresh profile data
	const refreshProfile = useCallback(async () => {
		if (user) {
			const newProfile = await fetchProfile(user.id);
			setProfile(newProfile);
		}
	}, [user, fetchProfile]);

	// Initialize auth state on mount
	useEffect(() => {
		// If Supabase is not configured, just mark loading as done
		if (!supabaseConfigured) {
			setConfigError(
				"Authentication is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
			);
			setIsLoading(false);
			return;
		}

		const initAuth = async () => {
			try {
				const currentUser = await getCurrentUser();
				setUser(currentUser);

				if (currentUser) {
					const userProfile = await fetchProfile(currentUser.id);
					setProfile(userProfile);
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();

		// Subscribe to auth state changes
		const unsubscribe = onAuthStateChange(async (newUser) => {
			setUser(newUser);

			if (newUser) {
				const userProfile = await fetchProfile(newUser.id);
				setProfile(userProfile);
			} else {
				setProfile(null);
			}
		});

		return unsubscribe;
	}, [fetchProfile, supabaseConfigured]);

	// Auth methods
	const signIn = useCallback(
		async (email: string, password: string) => {
			const result = await authSignIn(email, password);
			if (!result.error && result.user) {
				setUser(result.user);
				const userProfile = await fetchProfile(result.user.id);
				setProfile(userProfile);
			}
			return { error: result.error };
		},
		[fetchProfile],
	);

	const signUp = useCallback(
		async (email: string, password: string, displayName?: string) => {
			const result = await authSignUp(email, password, displayName);
			if (!result.error && result.user) {
				setUser(result.user);
				// Profile will be created by database trigger
				// fetchProfile has built-in retry logic to handle the race condition
				const userProfile = await fetchProfile(result.user.id);
				setProfile(userProfile);
			}
			return { error: result.error };
		},
		[fetchProfile],
	);

	const signOut = useCallback(async () => {
		const result = await authSignOut();
		if (!result.error) {
			setUser(null);
			setProfile(null);
		}
		return result;
	}, []);

	const signInWithGoogle = useCallback(async () => {
		return authSignInWithGoogle();
	}, []);

	const value = useMemo(
		() => ({
			user,
			profile,
			isLoading,
			isAuthenticated: !!user,
			configError,
			signIn,
			signUp,
			signOut,
			signInWithGoogle,
			refreshProfile,
		}),
		[
			user,
			profile,
			isLoading,
			configError,
			signIn,
			signUp,
			signOut,
			signInWithGoogle,
			refreshProfile,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextState {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}

/**
 * Hook to access auth context, returns null if not in provider.
 * Use this when auth is optional.
 */
export function useAuthOptional(): AuthContextState | null {
	return useContext(AuthContext) ?? null;
}
