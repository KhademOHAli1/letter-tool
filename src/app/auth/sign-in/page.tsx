/**
 * Sign In page
 */

import { Suspense } from "react";
import { SignIn } from "@/components/auth/sign-in";

export default function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Suspense fallback={<div>Loading...</div>}>
				<SignIn />
			</Suspense>
		</div>
	);
}
