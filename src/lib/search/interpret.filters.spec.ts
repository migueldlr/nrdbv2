import { describe, expect, it } from 'vitest';
import { interpretSearch, interpretQuery, toggleQueryFilter } from './interpret';
import type { QueryFilter } from './interpret';
import type { CardTypeIds, FactionIds } from '$lib/types';

const factionFilter = (id: FactionIds): QueryFilter => ({ kind: 'faction', id });
const typeFilter = (id: CardTypeIds): QueryFilter => ({ kind: 'type', id });

const filtersOf = (query: string) => interpretQuery(query).filters;
const factionIds = (query: string) => filtersOf(query).factionIds;
const typeIds = (query: string) => filtersOf(query).cardTypeIds;

describe('interpretQuery filters: factions', () => {
	it('derives filters from natural-language selectors', () => {
		expect(factionIds('hb ice')).toEqual(['haas_bioroid']);
		expect(factionIds('jinteki')).toEqual(['jinteki']);
		expect(factionIds('weyland consortium deck')).toEqual(['weyland_consortium']);
	});

	it('derives filters from explicit field syntax', () => {
		expect(factionIds('f:anarch t:ice')).toEqual(['anarch']);
		expect(factionIds('f:haas_bioroid')).toEqual(['haas_bioroid']);
	});

	it('expands multi-id selectors to both ids', () => {
		expect(factionIds('neutral runner')).toEqual(['neutral_runner']);
		expect(factionIds('neutral').sort()).toEqual(['neutral_corp', 'neutral_runner'].sort());
	});

	it('is empty for free text without faction selectors', () => {
		expect(factionIds('card that draws')).toEqual([]);
	});

	it('ignores negated factions and quoted text', () => {
		expect(factionIds('non-anarch ice')).toEqual([]);
		expect(factionIds('f!anarch')).toEqual([]);
		expect(factionIds('find "f:anarch" cards')).toEqual([]);
	});

	it('negated groups do not light chips', () => {
		expect(factionIds('!(anarch or shaper)')).toEqual([]);
	});
});

describe('interpretQuery filters: types', () => {
	it('derives filters from natural-language selectors', () => {
		expect(typeIds('ids').sort()).toEqual(['corp_identity', 'runner_identity'].sort());
		expect(typeIds('events')).toEqual(['event']);
	});

	it('derives filters from explicit field syntax', () => {
		expect(typeIds('t:ice')).toEqual(['ice']);
		expect(typeIds('f:anarch t:program')).toEqual(['program']);
	});

	it('is empty for free text without type selectors', () => {
		expect(typeIds('hb deck')).toEqual([]);
	});

	it('ignores negated types', () => {
		expect(typeIds('non-ice deck')).toEqual([]);
		expect(typeIds('t!ice')).toEqual([]);
	});
});

describe('interpretQuery: canonical expression stays consistent', () => {
	it('explicit syntax canonicalizes to the same expression as NL input', () => {
		expect(interpretSearch('hb ice')).toBe('f:haas_bioroid t:ice');
		expect(interpretSearch('f:haas_bioroid t:ice')).toBe('f:haas_bioroid t:ice');
	});

	it('keeps unresolvable explicit values as freeform tokens', () => {
		expect(interpretSearch('f:zzz_unknown')).toBe('f:zzz_unknown');
		expect(factionIds('f:zzz_unknown')).toEqual([]);
	});

	it('keeps negated explicit syntax in the expression but not the filters', () => {
		expect(interpretSearch('f!anarch t:ice')).toBe('f!anarch t:ice');
		expect(factionIds('f!anarch t:ice')).toEqual([]);
	});
});

describe('toggleQueryFilter', () => {
	it('adds the canonical explicit token to a query without the filter', () => {
		expect(toggleQueryFilter('t:ice', factionFilter('haas_bioroid'))).toBe(
			'f:haas_bioroid t:ice'
		);
		expect(toggleQueryFilter('', factionFilter('neutral_corp'))).toBe('f:neutral_corp');
		expect(toggleQueryFilter('anarch', typeFilter('runner_identity'))).toBe(
			'f:anarch t:runner_identity'
		);
	});

	it('removes every selector resolving to the faction', () => {
		expect(toggleQueryFilter('haas bioroid', factionFilter('haas_bioroid'))).toBe('');
		expect(toggleQueryFilter('hb', factionFilter('haas_bioroid'))).toBe('');
		expect(toggleQueryFilter('haas-bioroid ice', factionFilter('haas_bioroid'))).toBe('t:ice');
		expect(toggleQueryFilter('haas ice', factionFilter('haas_bioroid'))).toBe('t:ice');
	});

	it('removes the explicit token when the chip is active via explicit syntax', () => {
		expect(toggleQueryFilter('f:haas_bioroid', factionFilter('haas_bioroid'))).toBe('');
		expect(toggleQueryFilter('f:haas_bioroid t:ice', factionFilter('haas_bioroid'))).toBe(
			't:ice'
		);
		expect(toggleQueryFilter('t:ice', typeFilter('ice'))).toBe('');
	});

	it('removes both neutrals without touching other factions', () => {
		expect(toggleQueryFilter('neutral', factionFilter('neutral_corp'))).toBe('');
		expect(toggleQueryFilter('anarch neutral runner', factionFilter('neutral_runner'))).toBe(
			'f:anarch'
		);
	});

	it('removes every selector resolving to the type', () => {
		expect(toggleQueryFilter('runner identity', typeFilter('runner_identity'))).toBe('');
		expect(toggleQueryFilter('ids t:ice', typeFilter('runner_identity'))).toBe('t:ice');
		expect(toggleQueryFilter('events t:ice', typeFilter('event'))).toBe('t:ice');
	});

	it('repeated selectors are all removed on toggle', () => {
		expect(toggleQueryFilter('hb hb', factionFilter('haas_bioroid'))).toBe('');
		expect(toggleQueryFilter('events events', typeFilter('event'))).toBe('');
	});

	it('toggling an id absent from the query leaves the rest intact', () => {
		expect(toggleQueryFilter('t:ice', factionFilter('anarch'))).toBe('f:anarch t:ice');
	});

	it('replaces a negated selector with the positive filter', () => {
		expect(toggleQueryFilter('non-anarch ice', factionFilter('anarch'))).toBe('f:anarch t:ice');
		expect(toggleQueryFilter('f!anarch', factionFilter('anarch'))).toBe('f:anarch');
	});

	it('shared selector removal may darken siblings of a multi-id selector', () => {
		expect(toggleQueryFilter('ids ice', typeFilter('runner_identity'))).toBe('t:ice');
	});

	it('round-trips: toggling twice returns the canonical query', () => {
		const once = toggleQueryFilter('hb ice', factionFilter('haas_bioroid'));
		expect(once).toBe('t:ice');
		expect(toggleQueryFilter(once, factionFilter('haas_bioroid'))).toBe('f:haas_bioroid t:ice');
	});
});
