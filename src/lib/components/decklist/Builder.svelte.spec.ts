import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CARNIVORE, RED_TEAM, SURE_GAMBLE } from '$lib/cards.fixture';
import { ESA, ZAHYA } from '$lib/identities.fixture';
import { createMockCard } from '$lib/test-helpers';
import { card_modal } from '$lib/store';
import CardModalHarness from '$lib/test/CardModalHarness.svelte';
import type { Card } from '$lib/types';
import Builder from './Builder.svelte';

const { sqlMock, adaptCardMock } = vi.hoisted(() => ({
	sqlMock: vi.fn(),
	adaptCardMock: vi.fn()
}));

vi.mock('$lib/sqlite', () => ({ sql: sqlMock }));
vi.mock('$lib/printings', () => ({ getPrintingById: vi.fn().mockResolvedValue(null) }));
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
		card_modal.set(null);
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

		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

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

		const { rerender } = await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, ESA, RED_TEAM, CARNIVORE]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(redTeamRow.getByRole('button', { name: '+' }));
		await expect.element(page.getByRole('button', { name: 'Red Team, 1 copy' })).toBeVisible();

		await rerender({ identity: ESA.id });

		await expect.element(page.getByRole('button', { name: 'Red Team, 1 copy' })).toBeVisible();
		expect(page.getByText('No cards selected').query()).toBeNull();
		await expect.element(page.getByRole('link', { name: 'Carnivore' })).toBeVisible();
	});

	it('shows the full card pool for a blank query and searches with the full grammar', async () => {
		seedRows(RED_TEAM);

		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, RED_TEAM, SURE_GAMBLE]
			},
			{ wrapper: CardModalHarness }
		);

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

	it('opens the card modal from the title and sets quantity from its toggle group', async () => {
		seedRows(RED_TEAM);

		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('link', { name: 'Red Team' }));

		const dialog = page.getByRole('dialog', { name: 'Red Team' });
		await expect.element(dialog).toBeVisible();

		await userEvent.click(dialog.getByRole('button', { name: '2' }));

		await expect
			.element(page.getByRole('button', { name: 'Red Team, 2 copies' }))
			.toBeVisible();
		expect(page.getByRole('dialog', { name: 'Red Team' }).query()).toBeNull();
	});

	it('opens the first search result when Enter is pressed in the search box', async () => {
		seedRows(RED_TEAM);

		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

		const search = page.getByRole('searchbox');
		await userEvent.type(search, 'red');
		await expect.element(page.getByRole('link', { name: 'Red Team' })).toBeVisible();

		await userEvent.keyboard('{Enter}');

		await expect.element(page.getByRole('dialog', { name: 'Red Team' })).toBeVisible();
	});

	it('sets the quantity from a number key and closes the modal', async () => {
		seedRows(RED_TEAM);

		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, RED_TEAM]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('link', { name: 'Red Team' }));
		await expect.element(page.getByRole('dialog', { name: 'Red Team' })).toBeVisible();

		await userEvent.keyboard('2');

		await expect
			.element(page.getByRole('button', { name: 'Red Team, 2 copies' }))
			.toBeVisible();
		expect(page.getByRole('dialog', { name: 'Red Team' }).query()).toBeNull();
	});

	it('scales the modal quantity buttons to the card deck limit', async () => {
		const limited = createMockCard('limited_card', 'Limited Card', ['core'], {
			deck_limit: 1
		});

		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, limited]
			},
			{ wrapper: CardModalHarness }
		);

		await userEvent.click(page.getByRole('link', { name: 'Limited Card' }));

		const dialog = page.getByRole('dialog', { name: 'Limited Card' });
		await expect.element(dialog.getByRole('button', { name: '1' })).toBeVisible();
		expect(dialog.getByRole('button', { name: '2' }).query()).toBeNull();

		await userEvent.keyboard('2');

		await expect.element(dialog).toBeVisible();
		expect(page.getByRole('button', { name: 'Limited Card, 1 copy' }).query()).toBeNull();
	});

	it('synchronizes chips with natural-language input', async () => {
		await render(
			Builder,
			{
				identity: ZAHYA.id,
				side_cards: [ZAHYA, SURE_GAMBLE]
			},
			{ wrapper: CardModalHarness }
		);

		const search = page.getByRole('searchbox');
		const criminal = page.getByRole('button', { name: 'Criminal' });
		const neutral = page.getByRole('button', { name: 'Neutral' });

		await expect
			.element(page.getByRole('button', { name: 'Criminal', pressed: false }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Event', pressed: false }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: false }))
			.toBeVisible();

		await userEvent.type(search, 'criminal events');
		await expect
			.element(page.getByRole('button', { name: 'Criminal', pressed: true }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Event', pressed: true }))
			.toBeVisible();

		await userEvent.click(criminal);
		await expect.element(search).toHaveValue('events');
		await expect
			.element(page.getByRole('button', { name: 'Criminal', pressed: false }))
			.toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Event', pressed: true }))
			.toBeVisible();

		await userEvent.fill(search, 'neutral');
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: true }))
			.toBeVisible();
		await userEvent.click(neutral);
		await expect.element(search).toHaveValue('');
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: false }))
			.toBeVisible();
		await userEvent.click(neutral);
		await expect.element(search).toHaveValue('neutral');
		await expect
			.element(page.getByRole('button', { name: 'Neutral', pressed: true }))
			.toBeVisible();
	});
});
