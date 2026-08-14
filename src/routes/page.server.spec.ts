import { describe, expect, it, vi } from 'vitest';
import { NRDB_API_URL, NRDB_CACHE_COOKIE } from '$lib/constants';
import type { Card, Decklist } from '$lib/types';
import { cards, decklist, secondDecklist } from '../stories/decklist.fixture';
import type { PageServerLoad } from './$types';
import { load } from './+page.server';

interface HomePageData {
	decklists: Promise<Array<{ decklist: Decklist; cards?: Card[] }>>;
}

const jsonResponse = (data: unknown): Response =>
	new Response(JSON.stringify({ data }), {
		headers: { 'content-type': 'application/json' }
	});

const latestDecklists = [decklist, secondDecklist];
const latestCardsUrl = new URL(`${NRDB_API_URL}/cards`);
latestCardsUrl.searchParams.set(
	'filter[decklist_id]',
	latestDecklists.map(({ id }) => id).join(',')
);
latestCardsUrl.searchParams.set('page[size]', '1000');

const isLatestDecklistCardsRequest = (input: RequestInfo | URL): boolean =>
	String(input) === String(latestCardsUrl);

async function loadHomePage(hasLocalDatabase: boolean) {
	const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
		const url = String(input);

		if (url === `${NRDB_API_URL}/decklists?page[size]=1`) {
			return jsonResponse([decklist]);
		}
		if (url === `${NRDB_API_URL}/decklists?page[size]=10`) {
			return jsonResponse(latestDecklists);
		}
		if (url === `${NRDB_API_URL}/cards/${decklist.attributes.identity_card_id}`) {
			return jsonResponse(cards[0]);
		}
		if (url === `${NRDB_API_URL}/cards?filter[decklist_id]=${decklist.id}`) {
			return jsonResponse(cards);
		}
		if (url === String(latestCardsUrl)) {
			return jsonResponse(cards);
		}

		throw new Error(`Unexpected request: ${url}`);
	});
	const getCookie = vi.fn((name: string) =>
		name === NRDB_CACHE_COOKIE && hasLocalDatabase ? '1' : undefined
	);
	const event = {
		fetch: fetchMock,
		cookies: { get: getCookie }
	} as unknown as Parameters<PageServerLoad>[0];

	const result = (await load(event)) as HomePageData;
	const decklist_tiles = await result.decklists;

	return { decklist_tiles, fetchMock };
}

describe('home page decklist tiles', () => {
	it('trusts the local database when its cache cookie is set', async () => {
		const { decklist_tiles, fetchMock } = await loadHomePage(true);

		expect(decklist_tiles).toEqual([{ decklist }, { decklist: secondDecklist }]);
		expect(
			fetchMock.mock.calls.filter(([input]) => isLatestDecklistCardsRequest(input))
		).toHaveLength(0);
	});

	it('hydrates cards from the API when no local database is known', async () => {
		const { decklist_tiles, fetchMock } = await loadHomePage(false);

		expect(decklist_tiles).toEqual([
			{ decklist, cards },
			{ decklist: secondDecklist, cards: cards.slice(0, 2) }
		]);
		expect(
			fetchMock.mock.calls.filter(([input]) => isLatestDecklistCardsRequest(input))
		).toHaveLength(1);
	});
});
