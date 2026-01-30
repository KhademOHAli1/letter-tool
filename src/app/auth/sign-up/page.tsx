/**
 * Sign Up page
 */

import { Suspense } from "react";
import { SignUp } from "@/components/auth/sign-up";

export default function SignUpPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<SignUp />
			</Suspense>
		</div>
	);
}
