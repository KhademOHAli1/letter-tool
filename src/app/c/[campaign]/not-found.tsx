/**
 * Not found page for campaigns
 * Phase 3, Epic 3.1
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CampaignNotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="text-center space-y-6 px-6 max-w-md">
				<div className="text-6xl">🔍</div>
				<h1 className="text-2xl font-bold text-foreground">
					Campaign Not Found
				</h1>
				<p className="text-muted-foreground">
					The campaign you're looking for doesn't exist or may have ended.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild>
						<Link href="/campaigns">Browse Campaigns</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/">Go Home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
