import type { Page } from '@playwright/test';

// This helper function determines MacOS vs other platforms
// so we can target proper keyboard shortcuts (Ctrl vs Cmd) in tests
export const isMac = (page: Page): Promise<boolean> =>
	page.evaluate(() => {
		const ua = (
			navigator as unknown as {
				userAgentData?: { platform?: string };
			}
		).userAgentData;
		const platform = typeof ua?.platform === 'string' ? ua.platform : navigator.userAgent;

		return typeof platform === 'string' && platform.toLowerCase().includes('mac');
	});
