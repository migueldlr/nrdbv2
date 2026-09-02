import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CARNIVORE, CLEARINGHOUSE, SURE_GAMBLE } from '$lib/cards.fixture';
import { ZAHYA } from '$lib/identities.fixture';
import { DECK_SEARCH_LIMIT } from '$lib/constants';
import { db_ready } from '$lib/store';
import type { DeckCardSearchConstraints } from '$lib/search/deck-card-search';
import type { Card } from '$lib/types';
import Builder from './Builder.svelte';

interface SearchResult {
	readonly cards: Card[];
	readonly error: Error | null;
}

const { searchDeckCardsMock } = vi.hoisted(() => ({
	searchDeckCardsMock:
		vi.fn<(input: string, constraints: DeckCardSearchConstraints) => Promise<SearchResult>>()
}));

vi.mock('$lib/search/deck-card-search', () => ({
	searchDeckCards: searchDeckCardsMock
}));

interface BuilderOptions {
	readonly identity?: Card;
	readonly fallbackCards?: readonly Card[];
}

const renderBuilder = (options: BuilderOptions = {}) =>
	render(Builder, {
		identity: options.identity ?? ZAHYA,
		fallbackCards: options.fallbackCards ?? []
	});

const searchFor = async (query: string) => {
	await userEvent.fill(page.getByRole('searchbox', { name: 'Find cards' }), query);
};

const getCardLink = (card: Card) =>
	page.getByRole('table').getByRole('link', { name: card.attributes.title });

const runnerConstraints = (): DeckCardSearchConstraints => ({
	sideId: 'runner',
	limit: DECK_SEARCH_LIMIT + 1
});

describe('Decklist Builder search', () => {
	beforeEach(() => {
		searchDeckCardsMock.mockReset();
		searchDeckCardsMock.mockResolvedValue({ cards: [], error: null });
		db_ready.set(false);
	});

	afterEach(() => {
		db_ready.set(false);
		vi.restoreAllMocks();
	});

	it('waits for readiness, then runs the blank scoped search', async () => {
		const initialSearch = Promise.withResolvers<SearchResult>();
		searchDeckCardsMock.mockReturnValue(initialSearch.promise);
		await renderBuilder();

		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('Preparing the card database');
		expect(page.getByRole('table').query()).toBeNull();
		expect(searchDeckCardsMock).not.toHaveBeenCalled();

		db_ready.set(true);

		await vi.waitFor(() =>
			expect(searchDeckCardsMock).toHaveBeenCalledWith('', runnerConstraints())
		);
		initialSearch.resolve({ cards: [SURE_GAMBLE], error: null });
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();
	});

	it('uses side-scoped fallback search until the database becomes ready', async () => {
		const sqlSearch = Promise.withResolvers<SearchResult>();
		searchDeckCardsMock.mockReturnValue(sqlSearch.promise);
		await renderBuilder({
			fallbackCards: [SURE_GAMBLE, CARNIVORE, CLEARINGHOUSE]
		});

		await expect.element(page.getByRole('searchbox', { name: 'Find cards' })).toBeEnabled();
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();
		await expect.element(getCardLink(CARNIVORE)).toBeVisible();
		expect(getCardLink(CLEARINGHOUSE).query()).toBeNull();
		expect(searchDeckCardsMock).not.toHaveBeenCalled();

		await searchFor('  CARN  ');

		await expect.element(getCardLink(CARNIVORE)).toBeVisible();
		expect(getCardLink(SURE_GAMBLE).query()).toBeNull();
		expect(searchDeckCardsMock).not.toHaveBeenCalled();

		db_ready.set(true);

		await vi.waitFor(() =>
			expect(searchDeckCardsMock).toHaveBeenCalledWith('CARN', runnerConstraints())
		);
		await expect.element(page.getByRole('status')).toHaveTextContent('Searching cards');
		await expect.element(getCardLink(CARNIVORE)).toBeVisible();

		sqlSearch.resolve({ cards: [SURE_GAMBLE], error: null });
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();
		expect(getCardLink(CARNIVORE).query()).toBeNull();
	});

	it('searches every input live, retains pending results, and ignores stale responses', async () => {
		const firstSearch = Promise.withResolvers<SearchResult>();
		const secondSearch = Promise.withResolvers<SearchResult>();
		db_ready.set(true);
		searchDeckCardsMock
			.mockResolvedValueOnce({ cards: [SURE_GAMBLE], error: null })
			.mockReturnValueOnce(firstSearch.promise)
			.mockReturnValueOnce(secondSearch.promise);
		await renderBuilder();
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();

		await searchFor('  first query  ');
		await vi.waitFor(() =>
			expect(searchDeckCardsMock).toHaveBeenLastCalledWith('first query', runnerConstraints())
		);
		await expect.element(page.getByRole('status')).toHaveTextContent('Searching cards');
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();

		await searchFor('second query');
		secondSearch.resolve({ cards: [CARNIVORE], error: null });
		await expect.element(getCardLink(CARNIVORE)).toBeVisible();

		firstSearch.resolve({ cards: [SURE_GAMBLE], error: null });
		await new Promise((resolve) => window.setTimeout(resolve, 0));
		await expect.element(getCardLink(CARNIVORE)).toBeVisible();
		expect(getCardLink(SURE_GAMBLE).query()).toBeNull();
	});

	it('excludes identity cards from displayed search results', async () => {
		db_ready.set(true);
		searchDeckCardsMock.mockResolvedValue({
			cards: [ZAHYA, SURE_GAMBLE],
			error: null
		});
		await renderBuilder();

		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();
		expect(getCardLink(ZAHYA).query()).toBeNull();
		await expect.element(page.getByRole('status')).toHaveTextContent('1 card found');
	});

	it('reflects capped quantity controls in the grid and restores the empty state', async () => {
		db_ready.set(true);
		searchDeckCardsMock.mockResolvedValue({
			cards: [SURE_GAMBLE],
			error: null
		});
		await renderBuilder();

		const emptyState = page.getByText('No cards selected');
		const quantityInput = page.getByRole('spinbutton', {
			name: `Quantity for ${SURE_GAMBLE.attributes.title}`
		});
		const addCard = page.getByRole('button', {
			name: `Add one ${SURE_GAMBLE.attributes.title}`
		});
		const removeCard = page.getByRole('button', {
			name: `Remove one ${SURE_GAMBLE.attributes.title}`
		});

		await expect.element(emptyState).toBeVisible();
		await userEvent.click(addCard);

		const oneCopy = page.getByRole('button', { name: 'Sure Gamble, 1 copy' });
		await expect.element(oneCopy).toBeVisible();
		expect(oneCopy.element().querySelectorAll('img')).toHaveLength(1);
		expect(emptyState.query()).toBeNull();

		await userEvent.click(addCard);

		const twoCopies = page.getByRole('button', { name: 'Sure Gamble, 2 copies' });
		await expect.element(twoCopies).toBeVisible();
		expect(twoCopies.element().querySelectorAll('img')).toHaveLength(2);
		await expect.element(quantityInput).toHaveValue(2);

		await userEvent.fill(quantityInput, '9');

		const threeCopies = page.getByRole('button', { name: 'Sure Gamble, 3 copies' });
		await expect.element(threeCopies).toBeVisible();
		expect(threeCopies.element().querySelectorAll('img')).toHaveLength(3);
		await expect.element(quantityInput).toHaveValue(3);

		await userEvent.click(removeCard);
		await expect
			.element(page.getByRole('button', { name: 'Sure Gamble, 2 copies' }))
			.toBeVisible();

		await userEvent.fill(quantityInput, '0');

		await expect.element(emptyState).toBeVisible();
		expect(page.getByRole('button', { name: /Sure Gamble, \d cop/ }).query()).toBeNull();
	});

	it('keeps selected cards in the grid when search results change', async () => {
		db_ready.set(true);
		searchDeckCardsMock
			.mockResolvedValueOnce({ cards: [SURE_GAMBLE], error: null })
			.mockResolvedValueOnce({ cards: [CARNIVORE], error: null });
		await renderBuilder();
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();

		await userEvent.click(
			page.getByRole('button', {
				name: `Add one ${SURE_GAMBLE.attributes.title}`
			})
		);
		await expect
			.element(page.getByRole('button', { name: 'Sure Gamble, 1 copy' }))
			.toBeVisible();

		await searchFor('hardware');

		await expect.element(getCardLink(CARNIVORE)).toBeVisible();
		expect(getCardLink(SURE_GAMBLE).query()).toBeNull();
		await expect
			.element(page.getByRole('button', { name: 'Sure Gamble, 1 copy' }))
			.toBeVisible();
	});

	it('retains successful cards on errors and reports empty scoped results', async () => {
		db_ready.set(true);
		searchDeckCardsMock.mockResolvedValueOnce({
			cards: [SURE_GAMBLE],
			error: null
		});
		await renderBuilder();
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();

		searchDeckCardsMock.mockResolvedValueOnce({
			cards: [],
			error: new Error('Unknown faction: moon')
		});
		await searchFor('moon cards');
		await expect.element(page.getByRole('alert')).toHaveTextContent('Unknown faction: moon');
		await expect.element(getCardLink(SURE_GAMBLE)).toBeVisible();

		searchDeckCardsMock.mockResolvedValueOnce({ cards: [], error: null });
		await searchFor('');
		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('No cards found for this search');
		expect(page.getByRole('table').query()).toBeNull();
	});

	it('caps the rendered rows and says so when more matches exist', async () => {
		const overflow = Array.from({ length: DECK_SEARCH_LIMIT + 1 }, (_, index) => ({
			...SURE_GAMBLE,
			id: `filler-${index}`
		}));
		db_ready.set(true);
		searchDeckCardsMock.mockResolvedValue({ cards: overflow, error: null });
		await renderBuilder();

		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent(`Showing the first ${DECK_SEARCH_LIMIT} matches`);
		await vi.waitFor(() =>
			expect(page.getByRole('table').getByRole('row').all()).toHaveLength(
				DECK_SEARCH_LIMIT + 1
			)
		);
	});
});
