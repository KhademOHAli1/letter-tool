/**
 * Auth layout - wraps all auth pages
 */

import { AuthProvider } from "@/components/auth/auth-provider";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return <AuthProvider>{children}</AuthProvider>;
}
