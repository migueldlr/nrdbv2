import {
	type Intent,
	type SemanticIntent,
	normalizeInput,
	extractNumericIntents,
	recognizeIntents,
	assembleOutput
} from './intents';
import { RE_QUOTED_TERM } from './patterns';
import { CARD_TYPES, FACTIONS } from '$lib/constants';
import type { CardTypeIds, FactionIds } from '$lib/types';
import {
	parseQueryExpression,
	queryFilterKind,
	serializeQueryExpression,
	type QueryExpression,
	type QueryValue
} from '$lib/search_grammar_and_builder';

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

export type QueryFilter =
	| { kind: 'faction'; id: FactionIds }
	| { kind: 'cardType'; id: CardTypeIds };

export interface QueryInterpretation {
	expression: string;
	filters: QueryFilter[];
}

function runStages(input: string): Intent[] {
	const { remainder, terms } = extractQuotedTerms(input);
	const normalized = normalizeInput(remainder);
	const { intents: numericRaw, remainder: afterNumeric } = extractNumericIntents(normalized);
	// Restore each placeholder to its quoted-term intent, in place, so the or-grouping in
	// assembleOutput sees the original token order.
	const tokenRaw = recognizeIntents(afterNumeric).map((intent) => {
		if (intent.kind === 'freeform') {
			const m = RE_PLACEHOLDER.exec(intent.word);
			if (m) return terms[Number(m[1])];
		}
		return intent;
	});
	return [...numericRaw, ...tokenRaw];
}

function factionId(value: string): FactionIds | undefined {
	const normalized = value.toLowerCase();
	return FACTIONS.find((id) => id === normalized);
}

function cardTypeId(value: string): CardTypeIds | undefined {
	const normalized = value.toLowerCase();
	return CARD_TYPES.find((id) => id === normalized);
}

function filterFor(kind: 'faction' | 'cardType', value: string): QueryFilter | undefined {
	if (kind === 'faction') {
		const id = factionId(value);
		return id ? { kind, id } : undefined;
	}
	const id = cardTypeId(value);
	return id ? { kind, id } : undefined;
}

function filtersFromValue(value: QueryValue, kind: 'faction' | 'cardType'): QueryFilter[] {
	if (value.type === 'value_comb') {
		return [...filtersFromValue(value.left, kind), ...filtersFromValue(value.right, kind)];
	}
	if (value.is_regex) return [];
	const filter = filterFor(kind, value.value);
	return filter ? [filter] : [];
}

function collectPositiveFilters(query: QueryExpression, positive = true): QueryFilter[] {
	switch (query.type) {
		case 'conjunction':
			return [
				...collectPositiveFilters(query.left, positive),
				...collectPositiveFilters(query.right, positive)
			];
		case 'bracketed':
			return collectPositiveFilters(query.child, positive);
		case 'negate':
			return collectPositiveFilters(query.child, !positive);
		case 'pair': {
			const conditionIsPositive =
				(query.operator === ':' && positive) || (query.operator === '!' && !positive);
			const kind = queryFilterKind(query.keyword);
			return conditionIsPositive && kind ? filtersFromValue(query.values, kind) : [];
		}
	}
}

function sameFilter(left: QueryFilter, right: QueryFilter): boolean {
	return left.kind === right.kind && left.id === right.id;
}

function fromQuery(query: QueryExpression): QueryInterpretation {
	const filters = collectPositiveFilters(query);
	return {
		expression: serializeQueryExpression(query),
		filters: filters.filter(
			(filter, index) =>
				filters.findIndex((candidate) => sameFilter(candidate, filter)) === index
		)
	};
}

export function interpretQuery(input: string): QueryInterpretation {
	const expression = assembleOutput(runStages(input));
	const parsed = parseQueryExpression(expression);
	return parsed.kind === 'valid'
		? { ...fromQuery(parsed.query), expression }
		: { expression, filters: [] };
}

export function interpretSearch(input: string): string {
	return interpretQuery(input).expression;
}

function filterCondition(filter: QueryFilter): QueryExpression {
	return {
		type: 'pair',
		keyword: filter.kind === 'faction' ? 'f' : 't',
		operator: ':',
		values: { type: 'literal', value: filter.id, is_regex: false }
	};
}

function literalMatchesFilter(value: QueryValue, filter: QueryFilter): boolean {
	return value.type === 'literal' && !value.is_regex && value.value.toLowerCase() === filter.id;
}

function removeFilterValue(value: QueryValue, filter: QueryFilter): QueryValue | null {
	if (value.type === 'literal') return literalMatchesFilter(value, filter) ? null : value;

	const left = removeFilterValue(value.left, filter);
	const right = removeFilterValue(value.right, filter);
	if (!left) return right;
	if (!right) return left;
	return { ...value, left, right };
}

function removeQueryFilter(
	expression: QueryExpression,
	filter: QueryFilter,
	positive = true
): QueryExpression | null {
	switch (expression.type) {
		case 'conjunction': {
			const left = removeQueryFilter(expression.left, filter, positive);
			const right = removeQueryFilter(expression.right, filter, positive);
			if (!left) return right;
			if (!right) return left;
			return { ...expression, left, right };
		}
		case 'bracketed': {
			const child = removeQueryFilter(expression.child, filter, positive);
			if (!child) return null;
			return child.type === 'conjunction' ? { ...expression, child } : child;
		}
		case 'negate': {
			const child = removeQueryFilter(expression.child, filter, !positive);
			return child ? { ...expression, child } : null;
		}
		case 'pair': {
			const conditionIsPositive =
				(expression.operator === ':' && positive) ||
				(expression.operator === '!' && !positive);
			if (!conditionIsPositive || queryFilterKind(expression.keyword) !== filter.kind) {
				return expression;
			}
			const values = removeFilterValue(expression.values, filter);
			return values ? { ...expression, values } : null;
		}
	}
}

export function toggleQueryFilter(
	interpretation: QueryInterpretation,
	filter: QueryFilter
): QueryInterpretation {
	if (!interpretation.expression) return fromQuery(filterCondition(filter));
	const parsed = parseQueryExpression(interpretation.expression);
	if (parsed.kind === 'invalid') return interpretation;

	if (interpretation.filters.some((active) => sameFilter(active, filter))) {
		const query = removeQueryFilter(parsed.query, filter);
		return query ? fromQuery(query) : { expression: '', filters: [] };
	}

	return fromQuery({
		type: 'conjunction',
		op: 'and',
		left: filterCondition(filter),
		right: parsed.query
	});
}
