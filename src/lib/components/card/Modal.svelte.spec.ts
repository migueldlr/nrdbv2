import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import { CARNIVORE, OFFWORLD_OFFICE, PING, SURE_GAMBLE } from '$lib/cards.fixture';
import Modal from './Modal.svelte';

describe('Card Modal', () => {
	it('labels the dialog and closes from its initially focused button', async () => {
		const onOpenChange = vi.fn();

		await render(Modal, {
			card: SURE_GAMBLE,
			open: true,
			onOpenChange
		});

		const close_button = page.getByRole('button', { name: 'Close' });
		await expect.element(page.getByRole('dialog', { name: 'Sure Gamble' })).toBeVisible();
		await expect.element(close_button).toHaveFocus();

		close_button.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('renders and announces agenda stats', async () => {
		await render(Modal, {
			card: OFFWORLD_OFFICE,
			open: true,
			onOpenChange: () => {}
		});

		await expect.element(page.getByText('4 / 2', { exact: true })).toBeVisible();
		await expect
			.element(page.getByText('Advancement requirement: 4 and agenda points: 2'))
			.toBeInTheDocument();
	});

	it('renders and announces ice stats', async () => {
		await render(Modal, {
			card: PING,
			open: true,
			onOpenChange: () => {}
		});

		await expect.element(page.getByText('1 strength', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Cost: 2')).toBeInTheDocument();
		await expect.element(page.getByText('Strength: 1')).toBeInTheDocument();
	});

	it('renders card text as separate paragraphs', async () => {
		await render(Modal, {
			card: CARNIVORE,
			open: true,
			onOpenChange: () => {}
		});

		const paragraphs = document.querySelectorAll('.card-modal__text p');
		expect(Array.from(paragraphs, (paragraph) => paragraph.textContent)).toEqual([
			'+1 [mu]',
			'Access, once per turn → Trash 2 cards from your grip: Trash the card you are accessing.',
			'Limit 1 console per player.'
		]);
	});
});
