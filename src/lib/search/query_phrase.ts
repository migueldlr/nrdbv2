import { CARD_TYPE_MAP, FACTION_MAP } from './vocabulary';

const escape = (phrase: string): string => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Strips the phrase (whitespace-delimited, case-insensitive) and collapses
// leftover whitespace; returns null when the phrase is not present.
function removePhrase(query: string, phrase: string): string | null {
	const removal = new RegExp(`(?<!\\S)${escape(phrase)}(?!\\S)`, 'i');
	return removal.test(query) ? query.replace(removal, '').replace(/\s+/g, ' ').trim() : null;
}

// Toggle a filter phrase (e.g. "anarch", "ice") in a search query string.
// Adding appends the phrase; removing strips it and collapses leftover whitespace.
export function toggle_query_phrase(query: string, phrase: string): string {
	return removePhrase(query, phrase) ?? [...query.split(' ').filter(Boolean), phrase].join(' ');
}

// Every typed phrase that resolves to this canonical id ("hb", "haas bioroid",
// "haas-bioroid" all map to haas_bioroid).
function collectAliases(map: Record<string, string | string[]>, canonical: string): string[] {
	return Object.entries(map)
		.filter(([, value]) =>
			Array.isArray(value) ? value.includes(canonical) : value === canonical
		)
		.map(([phrase]) => phrase);
}

// Toggle a faction/type by canonical id. Every alias is checked together, so
// any one of them (or the f:/t: field form) marks the filter as active; removal
// strips all variants, adding appends the canonical phrase with spaces.
function toggleWithAliases(
	query: string,
	aliases: string[],
	prefix: string,
	canonicalPhrase: string,
	canonicalId: string
): string {
	const variants = [
		...aliases,
		canonicalPhrase,
		`${prefix}${canonicalId}`,
		`${prefix}${canonicalPhrase}`
	].sort((a, b) => b.length - a.length);

	let anyRemoved = false;
	let result = query;
	for (const variant of variants) {
		const removed = removePhrase(result, variant);
		if (removed !== null) {
			result = removed;
			anyRemoved = true;
		}
	}
	return anyRemoved ? result : toggle_query_phrase(query, canonicalPhrase);
}

// Toggle a faction by canonical id, removing any alias the user may have typed.
export function toggle_faction_phrase(query: string, faction_id: string): string {
	return toggleWithAliases(
		query,
		collectAliases(FACTION_MAP, faction_id),
		'f:',
		faction_id.replaceAll('_', ' '),
		faction_id
	);
}

// Toggle a card type by canonical id, removing any alias the user may have typed.
export function toggle_type_phrase(query: string, card_type_id: string): string {
	return toggleWithAliases(
		query,
		collectAliases(CARD_TYPE_MAP, card_type_id),
		't:',
		card_type_id.replaceAll('_', ' '),
		card_type_id
	);
}
