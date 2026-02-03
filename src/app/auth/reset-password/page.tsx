/**
 * Reset Password page
 * Set a new password after clicking the reset link
 */

import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<ResetPasswordForm />
			</Suspense>
		</div>
	);
}
