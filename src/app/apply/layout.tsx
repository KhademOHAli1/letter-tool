import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Apply to Become a Campaigner | Letter Tools",
	description:
		"Apply to join our platform and start running advocacy letter-writing campaigns for your cause.",
};

export default function ApplyLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
