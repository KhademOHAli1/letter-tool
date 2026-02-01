/**
 * Component exports barrel file
 * Provides centralized exports for commonly used components
 */

export { CampaignGoal } from "./campaign-goal";

// Campaign components
export { CampaignHeader } from "./campaign-header";
export { CampaignPublicCard } from "./campaign-public-card";
export { CountrySwitcher } from "./country-switcher";
export { EmailSender } from "./email-sender";
// Stats and display
export { ImpactStats } from "./impact-stats";
export { LanguageSwitcher } from "./language-switcher";
// Core letter components
export { LetterForm } from "./letter-form";
export { LetterHistory } from "./letter-history";
export { LetterOutput } from "./letter-output";
export {
	BlockLetterDocument,
	downloadLetterPdf,
	FrenchLetterDocument,
	GermanLetterDocument,
} from "./letter-pdf";
// QR Code component
export { QRCodeDisplay, type QRCodeProps } from "./qr-code";
// Sharing
export { ShareButtons } from "./share-buttons";
// Navigation and layout
export { SiteHeader } from "./site-header";

// Utilities
export { VoiceInput } from "./voice-input";
