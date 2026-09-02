import { adaptCard, adaptFaction } from '$lib/adapter';
import { sql } from '$lib/sqlite';
import { isDeckFormat, type ActiveCardPoolIds } from '$lib/deck_formats';
import type { FactionRow, UnifiedCardRow } from '$lib/types';
import type { PageLoad } from './$types';

export const ssr = false;

interface ActiveCardPoolRow {
	format_id: string;
	card_pool_id: string;
}

export const load: PageLoad = async ({ data, url }) => {
	try {
		const factions: FactionRow[] = await sql`SELECT * FROM factions`;
		const identities: UnifiedCardRow[] =
			await sql`SELECT * FROM unified_cards WHERE card_type_id IN ('corp_identity', 'runner_identity')`;

		const activeCardPoolRows: ActiveCardPoolRow[] = await sql`
			SELECT f.id AS format_id, s.card_pool_id
			FROM formats f
			JOIN snapshots s ON s.id = f.active_snapshot_id
		`;

		const active_card_pool_ids: ActiveCardPoolIds = {};
		for (const row of activeCardPoolRows) {
			if (isDeckFormat(row.format_id)) active_card_pool_ids[row.format_id] = row.card_pool_id;
		}

		if (identities.length === 0) return { ...data };

		const identityId = url.searchParams.get('identity');
		const identity = identityId ? identities.find((row) => row.id === identityId) : undefined;

		const sideCards: UnifiedCardRow[] = identity
			? await sql`SELECT * FROM unified_cards WHERE side_id = ${identity.side_id}`
			: [];

		return {
			...data,
			factions: factions.map(adaptFaction),
			cards: identities.map(adaptCard),
			side_cards: sideCards.map(adaptCard),
			active_card_pool_ids
		};
	} catch (error) {
		if (!data?.cards?.length) throw error;

		console.error(
			'Failed to load deck builder data from local SQL; using API fallback:',
			error
		);
		return data;
	}
};
