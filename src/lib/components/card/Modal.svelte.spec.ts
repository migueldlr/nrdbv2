import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import { createMockCard } from '$lib/test-helpers';
import Modal from './Modal.svelte';

const createCard = () =>
	createMockCard('sure_gamble', 'Sure Gamble', ['system_gateway'], {
		card_type_id: 'event',
		cost: '5',
		card_set_ids: ['system_gateway'],
		card_set_names: ['System Gateway'],
		latest_printing_id: '30030'
	});

describe('Card Modal', () => {
	it('renders a supplied card and focuses the close button', async () => {
		await render(Modal, {
			card: createCard(),
			open: true,
			onOpenChange: () => {}
		});

		await expect.element(page.getByRole('button', { name: 'Close' })).toHaveFocus();
	});

	it('reports close interactions to its owner', async () => {
		const onOpenChange = vi.fn();

		await render(Modal, {
			card: createCard(),
			open: true,
			onOpenChange
		});

		const close_button = page.getByRole('button', { name: 'Close' });
		await expect.element(close_button).toBeVisible();
		close_button.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
