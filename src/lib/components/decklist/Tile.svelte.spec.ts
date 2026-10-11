import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { decklist, privateDeck, cards } from '../../../stories/decklist.fixture';
import Tile from './Tile.svelte';

describe('Tile', () => {
	it('links public decklists and shows their author', async () => {
		await render(Tile, { decklist, cards });
		await expect
			.element(page.getByRole('link', { name: decklist.attributes.name }))
			.toHaveAttribute('href', `/decklist/${decklist.id}`);
		await expect.element(page.getByText(decklist.attributes.user_id)).toBeVisible();
	});

	it('links private decks without showing an author', async () => {
		await render(Tile, { decklist: privateDeck, cards });
		await expect
			.element(page.getByRole('link', { name: privateDeck.attributes.name }))
			.toHaveAttribute('href', `/decks/${privateDeck.id}`);
		expect(page.getByText(privateDeck.attributes.user_id).query()).toBeNull();
	});
});
