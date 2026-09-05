import {
	type Intent,
	type SemanticIntent,
	type FactionIntent,
	type TypeIntent,
	normalizeInput,
	extractNumericIntents,
	extractExplicitFilterIntents,
	recognizeIntents,
	assembleOutput
} from './intents';
import { RE_QUOTED_TERM } from './patterns';
import type { CardTypeIds, FactionIds } from '$lib/types';

export { NEUTRAL_FACTION_OR_QUERY } from './intents';

// A quoted term swapped out for a positional placeholder. The placeholder is delimited by
// NULL so it survives lowercasing/normalization and the numeric pre-pass untouched, and is a
// single whitespace-free token so recognizeIntents keeps it whole. Restoring it in place
// (rather than extracting and re-appending) preserves its position relative to `or` - pulling
// quoted terms out would orphan the or-marker and turn `x:"tag" or x:"damage"` into an AND.
// oxlint-disable-next-line no-control-regex -- NULL is an intentional, collision-proof delimiter
const RE_PLACEHOLDER = /^\x00(\d+)\x00$/;
const RE_QUOTED_GROUP = /!?\([^()]*"[^"]+"[^()]*\)/g;

function pushTerm(terms: SemanticIntent[], token: string): string {
	const i = terms.length;
	terms.push({ kind: 'semantic', tokens: [token] });
	return ` \x00${i}\x00 `;
}

function extractQuotedTerms(input: string): { remainder: string; terms: SemanticIntent[] } {
	const terms: SemanticIntent[] = [];
	const withQuotedGroups = input.replace(RE_QUOTED_GROUP, (match) => pushTerm(terms, match));
	const remainder = withQuotedGroups.replace(
		RE_QUOTED_TERM,
		(match, prefix: string | undefined, phrase: string) => {
			// Explicit field/operator syntax (x:"...") passes through verbatim; a bare quoted
			// string (no field prefix) becomes a title/text search.
			return pushTerm(terms, prefix ? match : `"${phrase.toLowerCase()}"`);
		}
	);
	return { remainder, terms };
}

export interface QueryFilters {
	factionIds: FactionIds[];
	cardTypeIds: CardTypeIds[];
}

export interface QueryInterpretation {
	intents: Intent[];
	filters: QueryFilters;
}

// Positive (non-negated) faction/type filters represented by the intents. Derived
// here so chip state and the canonical expression come from one interpretation.
function deriveFilters(intents: Intent[]): QueryFilters {
	const factionIds = new Set<FactionIds>();
	const cardTypeIds = new Set<CardTypeIds>();
	for (const intent of intents) {
		if (intent.kind !== 'faction' && intent.kind !== 'type') continue;
		if (intent.negated) continue;
		if (intent.kind === 'faction') {
			for (const id of Array.isArray(intent.value) ? intent.value : [intent.value]) {
				factionIds.add(id);
			}
		} else {
			for (const id of Array.isArray(intent.value) ? intent.value : [intent.value]) {
				cardTypeIds.add(id);
			}
		}
	}
	return { factionIds: [...factionIds], cardTypeIds: [...cardTypeIds] };
}

function runStages(input: string): QueryInterpretation {
	const { remainder, terms } = extractQuotedTerms(input);
	const normalized = normalizeInput(remainder);
	const { intents: numericRaw, remainder: afterNumeric } = extractNumericIntents(normalized);
	const { intents: explicitRaw, remainder: afterExplicit } =
		extractExplicitFilterIntents(afterNumeric);
	// Restore each placeholder to its quoted-term intent, in place, so the or-grouping in
	// assembleOutput sees the original token order.
	const tokenRaw = recognizeIntents(afterExplicit).map((intent) => {
		if (intent.kind === 'freeform') {
			const m = RE_PLACEHOLDER.exec(intent.word);
			if (m) return terms[Number(m[1])];
		}
		return intent;
	});
	const intents = [...numericRaw, ...explicitRaw, ...tokenRaw];
	return { intents, filters: deriveFilters(intents) };
}

export function interpretSearch(input: string): string {
	return assembleOutput(runStages(input).intents);
}

export function interpretQuery(input: string): QueryInterpretation {
	return runStages(input);
}

// Removes every intent that represents the given faction/type filter and re-serializes.
// Canonicalizing the wording is acceptable: the serialized expression is the source of
// truth, not the user's original phrasing.
function representsFilter(intent: Intent, filter: QueryFilter): boolean {
	if (intent.kind !== filter.kind) return false;
	const values = Array.isArray(intent.value) ? intent.value : [intent.value];
	return values.includes(filter.id);
}

function isNegatedFilterIntent(intent: Intent): boolean {
	return intent.kind === 'faction' || intent.kind === 'type' ? intent.negated : false;
}

export type FactionFilter = { kind: 'faction'; id: FactionIds };
export type TypeFilter = { kind: 'type'; id: CardTypeIds };
export type QueryFilter = FactionFilter | TypeFilter;

// Toggles a semantic faction/type filter in the query. "Active" matches the derived
// chip state: only positive intents count. Removing drops every intent (NL phrase or
// explicit syntax) that resolves to the id; adding drops negated selectors for the same
// id (replacing the negation) and appends the canonical explicit token. The result is
// re-serialized from the mutated intent list.
export function toggleQueryFilter(query: string, filter: QueryFilter): string {
	const { intents } = interpretQuery(query);
	const active = intents.some(
		(intent) => representsFilter(intent, filter) && !isNegatedFilterIntent(intent)
	);

	if (active) {
		const remaining = intents.filter((intent) => !representsFilter(intent, filter));
		return assembleOutput(remaining);
	}

	const withoutNegation = intents.filter(
		(intent) => !representsFilter(intent, filter) || !isNegatedFilterIntent(intent)
	);
	const added: FactionIntent | TypeIntent =
		filter.kind === 'faction'
			? { kind: 'faction', value: filter.id, negated: false }
			: { kind: 'type', value: filter.id, negated: false };
	return assembleOutput([...withoutNegation, added]);
}
