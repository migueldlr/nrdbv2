import { error } from '@sveltejs/kit';
import { NRDB_PRIVATE_API_URL } from '$lib/constants';
import type { PageServerLoad } from './$types';
import type { CollectionResponse, Decklist } from '$lib/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const session = await locals.auth();
	if (!session || session.error === 'RefreshTokenError') {
		error(401, 'Sign in to view your decks.');
	}
	if (!session.accessToken) error(503, 'Your decks could not be loaded. Try again.');

	const response = await fetch(`${NRDB_PRIVATE_API_URL}/decks?sort=-updated_at`, {
		headers: { Authorization: `Bearer ${session.accessToken}` }
	});
	if (!response.ok) error(response.status, 'Your decks could not be loaded.');

	const { data: decks }: CollectionResponse<Decklist> = await response.json();

	return { tiles: decks.map((decklist) => ({ decklist })) };
};
