import { describe, expect, it } from 'vitest';
import { createMockCard } from '$lib/test-helpers';
import { getCardModalStats } from './modal-stats';

describe('getCardModalStats', () => {
	it('formats agenda requirements and points', () => {
		const card = createMockCard('agenda', 'Agenda', [], {
			card_type_id: 'agenda',
			advancement_requirement: '4',
			agenda_points: 2
		});

		expect(getCardModalStats(card.attributes)).toEqual({
			title: {
				value: '4 / 2',
				announcement: 'Advancement requirement: 4 and agenda points: 2',
				icon: 'agenda_points'
			},
			footer: []
		});
	});

	it('does not invent missing agenda points', () => {
		const card = createMockCard('agenda', 'Agenda', [], {
			card_type_id: 'agenda',
			advancement_requirement: '4',
			agenda_points: null
		});

		expect(getCardModalStats(card.attributes)).toEqual({
			title: undefined,
			footer: []
		});
	});

	it('formats program memory and strength', () => {
		const card = createMockCard('corroder', 'Corroder', [], {
			card_type_id: 'program',
			side_id: 'runner',
			faction_id: 'anarch',
			memory_cost: 1,
			strength: 2
		});

		expect(getCardModalStats(card.attributes)).toEqual({
			title: undefined,
			footer: [
				{ value: '1', announcement: 'Memory cost: 1', icon: 'mu' },
				{ value: '2 strength', announcement: 'Strength: 2' }
			]
		});
	});

	it('shows a placeholder for a program without strength', () => {
		const card = createMockCard('conduit', 'Conduit', [], {
			card_type_id: 'program',
			side_id: 'runner',
			faction_id: 'shaper',
			memory_cost: 1,
			strength: null
		});

		expect(getCardModalStats(card.attributes)).toEqual({
			title: undefined,
			footer: [
				{ value: '1', announcement: 'Memory cost: 1', icon: 'mu' },
				{ value: '- strength', announcement: 'Strength: -' }
			]
		});
	});

	it('preserves a zero trash cost', () => {
		const card = createMockCard('reversed_accounts', 'Reversed Accounts', [], {
			card_type_id: 'asset',
			faction_id: 'haas_bioroid',
			trash_cost: 0
		});

		expect(getCardModalStats(card.attributes)).toEqual({
			title: undefined,
			footer: [{ value: '0', announcement: 'Trash cost: 0', icon: 'trash' }]
		});
	});

	it('formats identity deck size and influence limit', () => {
		const card = createMockCard('identity', 'Identity', [], {
			card_type_id: 'runner_identity',
			minimum_deck_size: 40,
			influence_limit: 15
		});

		expect(getCardModalStats(card.attributes)).toEqual({
			title: undefined,
			footer: [
				{
					value: '40 / 15',
					announcement: 'Minimum deck size: 40 and influence limit: 15'
				}
			]
		});
	});
});
