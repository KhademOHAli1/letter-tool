"use client";

import { Check, Copy, Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface QRCodeProps {
	value: string;
	size?: number;
	includeMargin?: boolean;
	showDownload?: boolean;
	showCopy?: boolean;
	label?: string;
}

export function QRCodeDisplay({
	value,
	size = 256,
	includeMargin = true,
	showDownload = true,
	showCopy = true,
	label,
}: QRCodeProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (canvasRef.current) {
			QRCode.toCanvas(
				canvasRef.current,
				value,
				{
					width: size,
					margin: includeMargin ? 2 : 0,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				},
				(error) => {
					if (error) {
						console.error("QR code generation error:", error);
						toast.error("Failed to generate QR code");
					}
				},
			);
		}
	}, [value, size, includeMargin]);

	const handleDownload = () => {
		if (!canvasRef.current) return;

		canvasRef.current.toBlob((blob) => {
			if (!blob) {
				toast.error("Failed to create download");
				return;
			}

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `qr-code-${label || "letter-tool"}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("QR code downloaded");
		});
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success("URL copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (_error) {
			toast.error("Failed to copy URL");
		}
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="rounded-lg border bg-white p-4">
				<canvas ref={canvasRef} />
			</div>

			{label && (
				<p className="text-center text-sm font-medium text-muted-foreground">
					{label}
				</p>
			)}

			<div className="flex gap-2">
				{showDownload && (
					<Button onClick={handleDownload} variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Download
					</Button>
				)}
				{showCopy && (
					<Button
						onClick={handleCopy}
						variant="outline"
						size="sm"
						disabled={copied}
					>
						{copied ? (
							<>
								<Check className="h-4 w-4 mr-2" />
								Copied!
							</>
						) : (
							<>
								<Copy className="h-4 w-4 mr-2" />
								Copy URL
							</>
						)}
					</Button>
				)}
			</div>
		</div>
	);
}
