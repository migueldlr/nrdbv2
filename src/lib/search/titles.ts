import { sql } from '$lib/sqlite';
import { normalize } from '$lib/search/filter';

export interface CardTitle {
	id: string;
	title: string;
}

const escape_like = (text: string) => text.replace(/[\\%_]/g, '\\$&');

export async function searchCardTitles(query: string, limit: number): Promise<CardTitle[]> {
	const text = escape_like(normalize(query));
	if (!text) return [];

	return (await sql(
		`SELECT id, title FROM unified_cards
			WHERE stripped_title LIKE ? ESCAPE '\\'
			ORDER BY stripped_title LIKE ? ESCAPE '\\' DESC, title ASC
			LIMIT ?`,
		`%${text}%`,
		`${text}%`,
		limit
	)) as CardTitle[];
}
