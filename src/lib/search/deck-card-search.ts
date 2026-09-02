import { adaptCard } from '$lib/adapter';
import { sql } from '$lib/sqlite';
import type { UnifiedCardRow } from '$lib/sqlite.types';
import type { Card, SidesIds } from '$lib/types';
import { interpretSearch } from './interpret';
import { translateToQuery } from './translate';

export interface DeckCardSearchConstraints {
	readonly sideId: SidesIds;
	readonly limit?: number;
}

export async function searchDeckCards(
	input: string,
	constraints: DeckCardSearchConstraints
): Promise<{ cards: Card[]; error: Error | null }> {
	const {
		sql: text,
		params,
		error
	} = translateToQuery(interpretSearch(input), {
		limit: constraints.limit,
		constraint: {
			clause: 'unified_cards.side_id = ?',
			params: [constraints.sideId]
		}
	});

	if (error || !text) {
		return { cards: [], error };
	}

	const rows = (await sql(text, ...params)) as UnifiedCardRow[];

	return { cards: rows.map(adaptCard), error: null };
}
