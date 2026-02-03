/**
 * Forgot Password page
 * Request a password reset email
 */

import { Suspense } from "react";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<ForgotPasswordForm />
			</Suspense>
		</div>
	);
}
