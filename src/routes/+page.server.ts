import { NRDB_API_URL } from '$lib/constants';
import { cache_guard } from '$lib/server/guard';
import type { PageServerLoad } from './$types';
import type { Card, CollectionResponse, Decklist, SingleResponse } from '$lib/types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	return {
		// https://svelte.dev/docs/kit/load#Streaming-with-promises
		// eslint-disable-next-line no-async-promise-executor
		decklist_of_the_week: new Promise(async (resolve, reject) => {
			try {
				const decklists_response = await fetch(
					`${NRDB_API_URL}/decklists?page[size]=1`
				).then((response) => response.json() as Promise<CollectionResponse<Decklist>>);

				if (!decklists_response.data || decklists_response.data.length === 0) {
					throw new Error('No decklists found');
				}

				const first_decklist = decklists_response.data[0];

				const [identity_json, cards_json] = await Promise.all([
					fetch(
						`${NRDB_API_URL}/cards/${first_decklist.attributes.identity_card_id}`
					).then((response) => response.json() as Promise<SingleResponse<Card>>),
					fetch(`${NRDB_API_URL}/cards?filter[decklist_id]=${first_decklist.id}`).then(
						(response) => response.json() as Promise<CollectionResponse<Card>>
					)
				]);

				if (!identity_json.data || !cards_json.data) {
					throw new Error('Incomplete decklist of the week data');
				}

				// await new Promise((resolve) => setTimeout(resolve, 5000));

				resolve({
					identity: identity_json.data,
					decklist: first_decklist,
					cards: cards_json.data
				});
			} catch (error) {
				reject(error);
			}
		}),
		// https://svelte.dev/docs/kit/load#Streaming-with-promises
		decklists: (async () => {
			const response = await fetch(`${NRDB_API_URL}/decklists?page[size]=10`);
			const json: CollectionResponse<Decklist> = await response.json();

			if (json.data.length === 0) return [];

			const cold_data = await cache_guard(cookies, async () => {
				try {
					const cards_url = new URL(`${NRDB_API_URL}/cards`);
					cards_url.searchParams.set(
						'filter[decklist_id]',
						json.data.map((decklist) => decklist.id).join(',')
					);
					cards_url.searchParams.set('page[size]', '1000');

					const cards_response = await fetch(cards_url);
					if (!cards_response.ok) {
						throw new Error(
							`Cards request failed with status ${cards_response.status}`
						);
					}

					const cards_json: CollectionResponse<Card> = await cards_response.json();
					const cards_by_id = new Map(cards_json.data.map((card) => [card.id, card]));

					return json.data.map((decklist) => ({
						decklist,
						cards: Object.keys(decklist.attributes.card_slots)
							.map((id) => cards_by_id.get(id))
							.filter((card): card is Card => card !== undefined)
					}));
				} catch (error) {
					console.error(
						'Failed to load cards for decklist tiles; falling back to the local database:',
						error
					);
					return json.data.map((decklist) => ({ decklist }));
				}
			});

			return cold_data ?? json.data.map((decklist) => ({ decklist }));
		})()
	};
};
