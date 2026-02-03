/**
 * Global 404 Not Found page
 */

import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md text-center border-0 shadow-none bg-transparent">
				<CardHeader className="space-y-4">
					<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
						<FileQuestion className="h-12 w-12 text-muted-foreground" />
					</div>
					<div className="space-y-2">
						<h1 className="text-4xl font-bold">404</h1>
						<h2 className="text-xl font-semibold text-muted-foreground">
							Page Not Found
						</h2>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						The page you're looking for doesn't exist or has been moved.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-3">
					<div className="flex w-full gap-3">
						<Button asChild className="flex-1">
							<Link href="/">
								<Home className="mr-2 h-4 w-4" />
								Home
							</Link>
						</Button>
						<Button asChild variant="outline" className="flex-1">
							<Link href="/campaigns">
								<Search className="mr-2 h-4 w-4" />
								Campaigns
							</Link>
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
