import { NRDB_API_URL } from '$lib/utils';
import type { LayoutServerLoad } from './$types';
import type { Card } from '$lib/types';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const cardsResponse = await fetch(`${NRDB_API_URL}/cards?page[size]=100`);
	const cards: Card[] = (await cardsResponse.json()).data;

	return {
		cards
	};
};
