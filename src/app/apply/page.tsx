/**
 * Public application page for becoming a campaigner
 */

import { ApplyForm } from "./apply-form";

export default function ApplyPage() {
	return (
		<div className="min-h-screen bg-linear-to-b from-background to-muted/20">
			<div className="container max-w-2xl py-12 px-4">
				<div className="space-y-6">
					{/* Header */}
					<div className="text-center space-y-3">
						<h1 className="text-3xl font-bold tracking-tight">
							Become a Campaigner
						</h1>
						<p className="text-muted-foreground text-lg">
							Run advocacy letter-writing campaigns for causes that matter to
							you.
						</p>
					</div>

					{/* Benefits */}
					<div className="grid gap-4 sm:grid-cols-3 py-6">
						<div className="text-center space-y-2">
							<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Create</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</div>
							<h3 className="font-medium">Create Campaigns</h3>
							<p className="text-sm text-muted-foreground">
								Build campaigns with custom demands and targets
							</p>
						</div>
						<div className="text-center space-y-2">
							<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>AI</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<h3 className="font-medium">AI-Powered Letters</h3>
							<p className="text-sm text-muted-foreground">
								Help supporters write personalized advocacy letters
							</p>
						</div>
						<div className="text-center space-y-2">
							<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Stats</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="font-medium">Track Impact</h3>
							<p className="text-sm text-muted-foreground">
								See real-time analytics and letter counts
							</p>
						</div>
					</div>

					{/* Application Form */}
					<ApplyForm />

					{/* Footer note */}
					<p className="text-center text-xs text-muted-foreground">
						Applications are typically reviewed within 2-3 business days. We'll
						email you with our decision.
					</p>
				</div>
			</div>
		</div>
	);
}
