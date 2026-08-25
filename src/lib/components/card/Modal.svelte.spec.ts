import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CARNIVORE, OFFWORLD_OFFICE, PING, SURE_GAMBLE } from '$lib/cards.fixture';
import { SURE_GAMBLE_30030 } from '$lib/printings.fixture';
import { createMockPrinting } from '$lib/test-helpers';
import type { Printing } from '$lib/types';
import Modal from './Modal.svelte';

const { getPrintingByIdMock } = vi.hoisted(() => ({
	getPrintingByIdMock: vi.fn()
}));

vi.mock('$lib/printings', () => ({ getPrintingById: getPrintingByIdMock }));

describe('Card Modal', () => {
	beforeEach(() => {
		getPrintingByIdMock.mockReset();
		getPrintingByIdMock.mockResolvedValue(null);
	});

	it('hydrates a Card only while the modal is open', async () => {
		const { rerender } = await render(Modal, {
			card: SURE_GAMBLE,
			open: false,
			onOpenChange: () => {}
		});

		await new Promise((resolve) => window.setTimeout(resolve, 0));
		expect(getPrintingByIdMock).not.toHaveBeenCalled();

		await rerender({ open: true });
		await vi.waitFor(() => expect(getPrintingByIdMock).toHaveBeenCalledWith('30030'));
	});

	it('keeps Card rendering available when Printing hydration fails', async () => {
		getPrintingByIdMock.mockRejectedValue(new Error('SQLite unavailable'));

		await render(Modal, {
			card: SURE_GAMBLE,
			open: true,
			onOpenChange: () => {}
		});

		await expect
			.element(page.getByRole('heading', { name: 'Sure Gamble' }))
			.toBeInTheDocument();
		await expect.element(page.getByText('Gain 9')).toBeVisible();
		await vi.waitFor(() => expect(getPrintingByIdMock).toHaveBeenCalledWith('30030'));
		expect(document.body.textContent).not.toContain('Illustrated by');
	});

	it('hydrates Printing metadata after rendering the Card', async () => {
		const pending_printing = Promise.withResolvers<Printing | null>();
		const card = SURE_GAMBLE;
		getPrintingByIdMock.mockReturnValue(pending_printing.promise);

		await render(Modal, {
			card,
			open: true,
			onOpenChange: () => {}
		});

		await expect
			.element(page.getByRole('heading', { name: 'Sure Gamble' }))
			.toBeInTheDocument();
		const dialog = page.getByRole('dialog').element();
		expect(document.body.textContent).not.toContain('Kira L. Nguyen');

		pending_printing.resolve(SURE_GAMBLE_30030);

		await expect.element(page.getByText('Kira L. Nguyen')).toBeVisible();
		await expect.element(page.getByText('Anyone can put in the hours')).toBeVisible();
		expect(page.getByRole('dialog').element()).toBe(dialog);
	});

	it('ignores stale Printing hydration after the Card changes', async () => {
		const first_result = Promise.withResolvers<Printing | null>();
		const second_result = Promise.withResolvers<Printing | null>();
		const first_card = SURE_GAMBLE;
		const second_card = CARNIVORE;
		const first_printing = createMockPrinting(first_card, '30030', {
			illustrator_names: ['Old Illustrator'],
			illustrator_ids: ['old_illustrator']
		});
		const second_printing = createMockPrinting(second_card, '30003', {
			illustrator_names: ['Current Illustrator'],
			illustrator_ids: ['current_illustrator']
		});
		getPrintingByIdMock
			.mockReturnValueOnce(first_result.promise)
			.mockReturnValueOnce(second_result.promise);

		const { rerender } = await render(Modal, {
			card: first_card,
			open: true,
			onOpenChange: () => {}
		});
		await vi.waitFor(() => expect(getPrintingByIdMock).toHaveBeenCalledWith('30030'));

		await rerender({ card: second_card });
		await vi.waitFor(() => expect(getPrintingByIdMock).toHaveBeenCalledWith('30003'));

		first_result.resolve(first_printing);
		await new Promise((resolve) => window.setTimeout(resolve, 0));
		expect(document.body.textContent).not.toContain('Old Illustrator');

		second_result.resolve(second_printing);
		await expect.element(page.getByText('Current Illustrator')).toBeVisible();
	});

	it('reports close interactions to its owner', async () => {
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
