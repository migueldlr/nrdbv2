import { describe, expect, it } from 'vitest';
import { toggle_faction_phrase, toggle_query_phrase, toggle_type_phrase } from './query_phrase';

describe('toggle_query_phrase', () => {
	it('appends a phrase to a non-empty query', () => {
		expect(toggle_query_phrase('t:program', 'anarch')).toBe('t:program anarch');
	});

	it('appends a phrase to a blank query without leading whitespace', () => {
		expect(toggle_query_phrase('', 'anarch')).toBe('anarch');
	});

	it('removes a phrase and collapses leftover whitespace', () => {
		expect(toggle_query_phrase('t:program anarch', 'anarch')).toBe('t:program');
		expect(toggle_query_phrase('anarch t:program', 'anarch')).toBe('t:program');
	});

	it('matches phrases case-insensitively', () => {
		expect(toggle_query_phrase('ANARCH t:program', 'anarch')).toBe('t:program');
	});

	it('matches on word boundaries so a substring is untouched', () => {
		expect(toggle_query_phrase('anarchist deck', 'anarch')).toBe('anarchist deck anarch');
	});

	it('escapes regex metacharacters in the phrase', () => {
		expect(toggle_query_phrase('c+"tag"', 'c+"tag"')).toBe('');
		expect(toggle_query_phrase('deck', 'c+"tag"')).toBe('deck c+"tag"');
	});
});

describe('toggle_faction_phrase', () => {
	it('removes every alias resolving to the canonical faction', () => {
		expect(toggle_faction_phrase('f:haas_bioroid', 'haas_bioroid')).toBe('');
		expect(toggle_faction_phrase('f:haas bioroid', 'haas_bioroid')).toBe('');
		expect(toggle_faction_phrase('haas bioroid', 'haas_bioroid')).toBe('');
		expect(toggle_faction_phrase('hb', 'haas_bioroid')).toBe('');
		expect(toggle_faction_phrase('haas-bioroid ice', 'haas_bioroid')).toBe('ice');
		expect(toggle_faction_phrase('haas ice', 'haas_bioroid')).toBe('ice');
	});

	it('adds the canonical phrase with underscores replaced by spaces', () => {
		expect(toggle_faction_phrase('t:ice', 'haas_bioroid')).toBe('t:ice haas bioroid');
		expect(toggle_faction_phrase('', 'neutral_corp')).toBe('neutral corp');
	});

	it('removes both neutrals without touching other factions', () => {
		expect(toggle_faction_phrase('neutral', 'neutral_corp')).toBe('');
		expect(toggle_faction_phrase('anarch neutral runner', 'neutral_runner')).toBe('anarch');
	});
});

describe('toggle_type_phrase', () => {
	it('removes every alias resolving to the canonical type', () => {
		expect(toggle_type_phrase('runner identity', 'runner_identity')).toBe('');
		expect(toggle_type_phrase('ids t:ice', 'runner_identity')).toBe('t:ice');
		expect(toggle_type_phrase('events t:ice', 'event')).toBe('t:ice');
	});

	it('adds the canonical phrase with underscores replaced by spaces', () => {
		expect(toggle_type_phrase('anarch', 'runner_identity')).toBe('anarch runner identity');
	});
});
