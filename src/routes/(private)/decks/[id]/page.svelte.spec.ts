import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import type { Decklist } from '$lib/types';
import { privateDeck, cards } from '../../../../stories/decklist.fixture';
import DeckDetail from './+page.svelte';

const deck: Decklist = {
	...privateDeck,
	attributes: {
		...privateDeck.attributes,
		notes: 'Will win worlds\n100% guaranteed'
	}
};

const render_deck = () =>
	render(DeckDetail, { data: { locale: 'en' as const, session: null, deck, cards } });

describe('saved deck detail', () => {
	it('renders the saved deck details and identity', async () => {
		await render_deck();
		await expect
			.element(page.getByRole('heading', { name: deck.attributes.name }))
			.toBeVisible();
		await expect
			.element(page.getByRole('link', { name: /^3× Hedge Fund/ }))
			.toHaveAttribute('href', '/card/hedge_fund');
		await expect.element(page.getByText(/Will win worlds/)).toBeVisible();
		const identity = page.getByRole('region', { name: 'Identity' });
		await expect
			.element(identity.getByRole('img', { name: 'Haas-Bioroid: Precision Design' }))
			.toBeVisible();
		await expect.element(identity.getByText('Haas-Bioroid: Precision Design')).toBeVisible();
		await expect.element(identity.getByRole('img', { name: 'haas_bioroid' })).toBeVisible();
	});
});
