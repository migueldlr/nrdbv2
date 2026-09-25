import { test, expect } from './helpers/fixtures';
import { accountMenuTrigger, selectLocale } from './helpers/navigation';
import { availableLocales, buildLocalePath } from './helpers/i18n';

test.describe('Locale selector', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/sets');
	});

	test('Locale selector is visible', async ({ page }) => {
		await accountMenuTrigger(page).click();
		await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeVisible();
		await expect(page.getByRole('menuitemradio', { name: 'Deutsch' })).toBeVisible();
	});

	test('Changing locale to de redirects to /de/ URL prefix', async ({ page }) => {
		await selectLocale(page, 'de');
		await expect(page).toHaveURL(/\/de\//);
	});

	test('Changing locale to de stores de in localStorage', async ({ page }) => {
		await selectLocale(page, 'de');
		await page.waitForURL(/\/de\//);
		const stored = await page.evaluate(() => localStorage.getItem('PARAGLIDE_LOCALE'));
		expect(stored).toBe('de');
	});

	test('Default locale (en) uses no URL prefix', async ({ page }) => {
		// Switch to de first, then back to en
		await selectLocale(page, 'de');
		await page.waitForURL(/\/de\//);
		await selectLocale(page, 'en');
		await page.waitForURL(/\/sets/);
		await expect(page).toHaveURL(/\/sets$/);
		await expect(page).not.toHaveURL(/\/en\//);
	});
});

test.describe('Local based paths', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('Locale-prefixed paths work correctly', async ({ page }) => {
		for (const locale of availableLocales) {
			const locale_slug = buildLocalePath('/sets', locale);
			await page.evaluate(
				(locale) => localStorage.setItem('PARAGLIDE_LOCALE', locale),
				locale
			);

			await page.goto(locale_slug);
			await page.waitForURL(locale_slug);
		}
	});

	test('Default locale (en) does not add prefix', async ({ page }) => {
		await page.evaluate(() => localStorage.setItem('PARAGLIDE_LOCALE', 'en'));

		await page.goto('/sets');
		await page.waitForURL('/sets');
	});
});
