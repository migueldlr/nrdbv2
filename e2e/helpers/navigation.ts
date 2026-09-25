import type { Page } from '@playwright/test';

export const siteHeaderLogo = (page: Page) => page.locator('.site-header__logo');
export const accountMenuTrigger = (page: Page) => page.locator('.site-header__account-trigger');

export const selectLocale = async (page: Page, locale: 'en' | 'de') => {
	await accountMenuTrigger(page).click();
	await page
		.getByRole('menuitemradio', { name: locale === 'en' ? 'English' : 'Deutsch' })
		.click();
};

export const selectTheme = async (page: Page, theme: 'light' | 'dark') => {
	await accountMenuTrigger(page).click();
	await page.getByRole('menuitemradio', { name: theme === 'light' ? 'Light' : 'Dark' }).click();
};

export const searchInput = (page: Page) => page.locator('input[placeholder="Search"]');
export const searchDropdown = (page: Page) => page.locator('.search-dropdown');
export const interpretedSearchCheckbox = (page: Page) =>
	searchDropdown(page).getByLabel('Interpreted');
// TODO: abstract this so we're not directly checking OPFS
export const waitForSearchDatabase = (page: Page) =>
	page.waitForFunction(
		async () => {
			try {
				const root = await navigator.storage.getDirectory();
				await root.getFileHandle('netrunnerdb.sqlite3');
				return true;
			} catch {
				return false;
			}
		},
		undefined,
		{ timeout: 30_000 }
	);
