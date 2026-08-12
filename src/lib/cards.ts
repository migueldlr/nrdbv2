import { adaptCard } from './adapter';
import type { Card } from './api.types';
import { sql } from './sqlite';
import type { UnifiedCardRow } from './sqlite.types';

export async function getCardsByIds(cardIds: readonly string[]): Promise<Card[]> {
	if (cardIds.length === 0) return [];

	const placeholders = cardIds.map(() => '?').join(', ');
	const rows = (await sql(
		`SELECT * FROM unified_cards WHERE id IN (${placeholders})`,
		...cardIds
	)) as UnifiedCardRow[];

	return rows.map(adaptCard);
}
