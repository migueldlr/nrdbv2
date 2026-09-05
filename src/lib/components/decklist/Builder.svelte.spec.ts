import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CARNIVORE, RED_TEAM, SURE_GAMBLE } from '$lib/cards.fixture';
import { ESA, ZAHYA } from '$lib/identities.fixture';
import type { Card } from '$lib/types';
import Builder from './Builder.svelte';

const { sqlMock, adaptCardMock } = vi.hoisted(() => ({
	sqlMock: vi.fn(),
	adaptCardMock: vi.fn()
}));

vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));
vi.mock('$lib/adapter', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/adapter')>()),
	adaptCard: adaptCardMock
}));

const cardFor = new Map(
	[ZAHYA, ESA, RED_TEAM, CARNIVORE, SURE_GAMBLE].map((card) => [card.id, card])
);

function seedRows(...cards: Card[]) {
	sqlMock.mockResolvedValue(cards.map((card) => ({ id: card.id })));
}

describe('Decklist Builder', () => {
	const redTeamRow = page.getByRole('row', { name: /Red Team/ });

	beforeEach(() => {
		sqlMock.mockReset();
		sqlMock.mockImplementation(async () => []);
		adaptCardMock.mockReset();
		adaptCardMock.mockImplementation((row: { id: string }) => {
			const card = cardFor.get(row.id);
			if (!card) throw new Error(`Unexpected row: ${row.id}`);
			return card;
		});
	});

	it('reflects quantity controls in the grid and restores the empty state on removal', async () => {
		seedRows(RED_TEAM);

		await render(Builder, {
			identity: ZAHYA.id,
			side_cards: [ZAHYA, RED_TEAM]
		});

		const emptyState = page.getByText('No cards selected');
		await expect.element(emptyState).toBeVisible();

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		const oneCopy = page.getByRole('button', { name: 'Red Team, 1 copy' });
		await expect.element(oneCopy).toBeVisible();
		expect(oneCopy.element().querySelectorAll('img')).toHaveLength(1);
		expect(emptyState.query()).toBeNull();

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		const twoCopies = page.getByRole('button', { name: 'Red Team, 2 copies' });
		await expect.element(twoCopies).toBeVisible();
		expect(twoCopies.element().querySelectorAll('img')).toHaveLength(2);

		await userEvent.click(redTeamRow.getByRole('button', { name: '-' }));
		await userEvent.click(redTeamRow.getByRole('button', { name: '-' }));
		await expect.element(emptyState).toBeVisible();
		expect(page.getByRole('button', { name: /Red Team, \d cop/ }).query()).toBeNull();
	});

	it('keeps the deck when the identity changes', async () => {
		seedRows(RED_TEAM, CARNIVORE);

		const { rerender } = await render(Builder, {
			identity: ZAHYA.id,
			side_cards: [ZAHYA, ESA, RED_TEAM, CARNIVORE]
		});

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		await expect.element(page.getByRole('button', { name: 'Red Team, 1 copy' })).toBeVisible();

		await rerender({ identity: ESA.id });

		await expect.element(page.getByRole('button', { name: 'Red Team, 1 copy' })).toBeVisible();
		expect(page.getByText('No cards selected').query()).toBeNull();
		await expect.element(page.getByRole('link', { name: 'Carnivore' })).toBeVisible();
	});

	it('syncs filter chips with the query through the interpretation', async () => {
		seedRows(RED_TEAM);

		await render(Builder, {
			identity: ZAHYA.id,
			side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE, CARNIVORE]
		});

		const search = page.getByRole('searchbox');
		const criminalChip = page.getByRole('button', { name: 'Criminal' });
		const eventChip = page.getByRole('button', { name: 'Event' });

		// Chips start inactive.
		await expect.element(criminalChip).toHaveClass('button--ghost');
		await expect.element(eventChip).toHaveClass('button--ghost');

		// Typing a natural-language faction selector activates its chip.
		await userEvent.type(search, 'criminal');
		await vi.waitFor(() => expect.element(criminalChip).toHaveClass('button--primary'));

		// Clicking the active chip removes the filter from the query.
		await userEvent.click(criminalChip);
		await vi.waitFor(() => expect.element(criminalChip).toHaveClass('button--ghost'));
		await expect.element(search).toHaveValue('');

		// Clicking an inactive chip adds the canonical filter to the query.
		await userEvent.click(criminalChip);
		await vi.waitFor(() => expect.element(criminalChip).toHaveClass('button--primary'));
		await expect.element(search).toHaveValue('f:criminal');

		// The canonical query drives the actual card search.
		await vi.waitFor(() =>
			expect(sqlMock).toHaveBeenCalledWith(
				expect.stringContaining('unified_cards.side_id = ?'),
				expect.anything(),
				'runner'
			)
		);

		// Explicit syntax activates the chip too.
		await userEvent.fill(search, 'f:criminal t:event');
		await vi.waitFor(() => expect.element(eventChip).toHaveClass('button--primary'));
		await expect.element(search).toHaveValue('f:criminal t:event');
	});

	it('shows the full card pool for a blank query and searches with the full grammar', async () => {
		seedRows(RED_TEAM);

		await render(Builder, {
			identity: ZAHYA.id,
			side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE]
		});

		await expect.element(page.getByRole('link', { name: 'Red Team' })).toBeVisible();
		await expect.element(page.getByRole('link', { name: 'Sure Gamble' })).toBeVisible();
		expect(sqlMock).not.toHaveBeenCalled();

		seedRows(SURE_GAMBLE);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 't:"gain 9 credits"');

		await vi.waitFor(() =>
			expect(sqlMock).toHaveBeenCalledWith(
				expect.stringContaining('unified_cards.side_id = ?'),
				expect.anything(),
				'runner'
			)
		);
		await expect.element(page.getByRole('link', { name: 'Sure Gamble' })).toBeVisible();
		expect(page.getByRole('link', { name: 'Red Team' }).query()).toBeNull();

		seedRows(RED_TEAM);
		await userEvent.fill(search, 'red');

		await expect.element(page.getByRole('link', { name: 'Red Team' })).toBeVisible();
		expect(page.getByRole('link', { name: 'Sure Gamble' }).query()).toBeNull();
	});
});
