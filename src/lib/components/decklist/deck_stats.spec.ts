import { describe, expect, it } from 'vitest';
import { CARNIVORE, HANSEI_REVIEW, OFFWORLD_OFFICE, PING, SURE_GAMBLE } from '$lib/cards.fixture';
import { PRECISION_DESIGN, ZAHYA } from '$lib/identities.fixture';
import { createMockCard } from '$lib/test-helpers';
import { agendaPointRange, computeDeckStats } from './deck_stats';

describe('agendaPointRange', () => {
	it('follows the 2-per-5-cards-plus-2 table', () => {
		expect(agendaPointRange(40)).toEqual({ min: 18, max: 19 });
		expect(agendaPointRange(44)).toEqual({ min: 18, max: 19 });
		expect(agendaPointRange(45)).toEqual({ min: 20, max: 21 });
		expect(agendaPointRange(54)).toEqual({ min: 22, max: 23 });
	});
});

describe('computeDeckStats', () => {
	it('returns zeroed counts and the identity limits for an empty deck', () => {
		expect(computeDeckStats(ZAHYA, [ZAHYA], {})).toEqual({
			card_count: 0,
			minimum_deck_size: 40,
			influence_spent: 0,
			influence_limit: 15,
			agenda_points: 0,
			agenda_point_range: null
		});
	});

	it('counts copies and charges influence only for out-of-faction cards', () => {
		const in_faction = createMockCard('in_faction', 'In Faction', ['core'], {
			side_id: 'runner',
			faction_id: 'criminal',
			influence_cost: 4
		});

		const stats = computeDeckStats(ZAHYA, [ZAHYA, SURE_GAMBLE, CARNIVORE, in_faction], {
			[SURE_GAMBLE.id]: 3,
			[CARNIVORE.id]: 1,
			[in_faction.id]: 2
		});

		expect(stats.card_count).toBe(6);
		expect(stats.influence_spent).toBe(CARNIVORE.attributes.influence_cost);
	});

	it('ignores the identity even if it appears in the card slots', () => {
		const stats = computeDeckStats(ZAHYA, [ZAHYA], { [ZAHYA.id]: 1 });
		expect(stats.card_count).toBe(0);
	});

	it('totals agenda points and sizes the required range for corp decks', () => {
		const stats = computeDeckStats(PRECISION_DESIGN, [OFFWORLD_OFFICE, PING, HANSEI_REVIEW], {
			[OFFWORLD_OFFICE.id]: 3,
			[PING.id]: 2,
			[HANSEI_REVIEW.id]: 3
		});

		expect(stats.agenda_points).toBe(6);
		expect(stats.influence_spent).toBe(2 * 2 + 3 * 1);
		expect(stats.agenda_point_range).toEqual({ min: 18, max: 19 });
	});

	it('grows the agenda point range with the deck size', () => {
		const filler = createMockCard('filler', 'Filler', ['core'], { deck_limit: 50 });
		const stats = computeDeckStats(PRECISION_DESIGN, [filler], { [filler.id]: 45 });
		expect(stats.agenda_point_range).toEqual({ min: 20, max: 21 });
	});
});
