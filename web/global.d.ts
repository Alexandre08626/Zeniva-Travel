declare module "*.css";

interface Window {
	zenivaConsent?: {
		analytics: boolean;
		marketing: boolean;
		updatedAt: string;
	};
	zenivaSetConsent?: (partial: { analytics?: boolean; marketing?: boolean }) => void;
	zenivaOpenCookieSettings?: () => void;
}
