import { test, expect } from './helpers/fixtures';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/sets', '/factions', '/cycles', '/decklists'];

test.describe('Accessibility', () => {
	for (const route of ROUTES) {
		test(`no critical axe violations on ${route}`, async ({ page }) => {
			await page.goto(route);

			// wait for the local card db to hydrate
			await page.waitForLoadState('networkidle');

			const results = await new AxeBuilder({ page }).analyze();

			const serious = results.violations.filter((v) => v.impact === 'serious');
			if (serious.length > 0) {
				console.warn(
					`[a11y] violations on ${route}:`,
					JSON.stringify(
						serious.map((v) => ({ id: v.id, nodes: v.nodes.length })),
						null,
						2
					)
				);
			}

			const critical = results.violations.filter((v) => v.impact === 'critical');
			expect(critical, `a11y violations on ${route}`).toEqual([]);
		});
	}

	test('skip link moves focus to main content', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Tab');

		const skip_link = page.locator('.skip-link');
		await expect(skip_link).toBeFocused();

		await page.keyboard.press('Enter');
		await expect(page.locator('#main')).toBeFocused();
	});
});
