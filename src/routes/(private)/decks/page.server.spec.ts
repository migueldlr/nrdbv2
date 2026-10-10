import { describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';
import type { PageServerLoad } from './$types';
import type { Session } from '@auth/sveltekit';
import { privateDeck } from '../../../stories/decklist.fixture';

const response = (data: unknown) => new Response(JSON.stringify({ data }));
const event = ({
	fetcher,
	session = { accessToken: 'test-token' }
}: {
	fetcher: typeof fetch;
	session?: Partial<Session> | null;
}) =>
	({
		fetch: fetcher,
		locals: { auth: async () => session }
	}) as unknown as Parameters<PageServerLoad>[0];

describe('saved deck list', () => {
	it('loads private decks with authentication', async () => {
		const fetcher = vi.fn().mockResolvedValueOnce(response([privateDeck]));
		expect(await load(event({ fetcher }))).toEqual({
			tiles: [{ decklist: privateDeck }]
		});
		const [url, options] = fetcher.mock.calls[0];
		expect(new URL(url).pathname).toBe('/api/v3/private/decks');
		expect(options.headers.Authorization).toBe('Bearer test-token');
	});

	it.each([
		['no session', null],
		['a rejected refresh token', { error: 'RefreshTokenError' as const }]
	])('requires reauthentication with %s', async (_label, session) => {
		const fetcher = vi.fn();
		await expect(load(event({ fetcher, session }))).rejects.toMatchObject({ status: 401 });
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('asks to retry when a transient refresh failure left no access token', async () => {
		const fetcher = vi.fn();
		await expect(load(event({ fetcher, session: {} }))).rejects.toMatchObject({ status: 503 });
		expect(fetcher).not.toHaveBeenCalled();
	});

	it.each([401, 500])('passes through a %i response from the API', async (status) => {
		const fetcher = vi.fn().mockResolvedValue(new Response('', { status }));
		await expect(load(event({ fetcher }))).rejects.toMatchObject({ status });
	});
});
