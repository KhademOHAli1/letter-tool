/**
 * Loading skeleton for campaign pages
 * Phase 3, Epic 3.1
 */

export default function CampaignLoading() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header skeleton */}
			<header className="relative heritage-gradient heritage-sun safe-area-top overflow-hidden">
				<div className="container mx-auto max-w-3xl px-6 pt-12 pb-10 md:pt-16 md:pb-14">
					<div className="text-center space-y-4 md:space-y-6">
						{/* Badge skeleton */}
						<div className="inline-flex items-center justify-center">
							<div className="h-8 w-32 bg-primary/10 rounded-full animate-pulse" />
						</div>

						{/* Title skeleton */}
						<div className="space-y-2">
							<div className="h-10 w-3/4 bg-primary/10 rounded mx-auto animate-pulse" />
							<div className="h-6 w-1/2 bg-primary/10 rounded mx-auto animate-pulse" />
						</div>

						{/* Description skeleton */}
						<div className="space-y-2 pt-4">
							<div className="h-4 w-full bg-primary/5 rounded animate-pulse" />
							<div className="h-4 w-5/6 bg-primary/5 rounded mx-auto animate-pulse" />
							<div className="h-4 w-4/6 bg-primary/5 rounded mx-auto animate-pulse" />
						</div>
					</div>
				</div>
			</header>

			{/* Content skeleton */}
			<main className="container mx-auto max-w-3xl px-6 py-8">
				{/* Stats skeleton */}
				<div className="flex justify-center gap-8 mb-8">
					<div className="text-center space-y-2">
						<div className="h-10 w-16 bg-muted/60 rounded mx-auto animate-pulse" />
						<div className="h-4 w-20 bg-muted/40 rounded mx-auto animate-pulse" />
					</div>
					<div className="text-center space-y-2">
						<div className="h-10 w-12 bg-muted/60 rounded mx-auto animate-pulse" />
						<div className="h-4 w-24 bg-muted/40 rounded mx-auto animate-pulse" />
					</div>
				</div>

				{/* Form skeleton */}
				<div className="space-y-6">
					<div className="h-12 w-full bg-muted/40 rounded-lg animate-pulse" />
					<div className="h-12 w-full bg-muted/40 rounded-lg animate-pulse" />
					<div className="h-32 w-full bg-muted/40 rounded-lg animate-pulse" />
					<div className="h-12 w-full bg-muted/40 rounded-lg animate-pulse" />
				</div>
			</main>
		</div>
	);
}
