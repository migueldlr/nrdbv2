import { describe, expect, it } from 'vitest';
import { CARNIVORE, COOKBOOK, OFFWORLD_OFFICE, SURE_GAMBLE } from '$lib/cards.fixture';
import { PRECISION_DESIGN, SHRED, ZAHYA } from '$lib/identities.fixture';
import type { CardGroup } from '$lib/types';
import { buildDeckGridModel } from './grid';

describe('buildDeckGridModel', () => {
	it('uses canonical group order while preserving card order and totaling copies', () => {
		const groups: readonly CardGroup[] = [
			{ type: 'hardware', data: [CARNIVORE] },
			{ type: 'event', data: [SHRED, SURE_GAMBLE] },
			{ type: 'resource', data: [COOKBOOK] }
		];

		const model = buildDeckGridModel({
			groups,
			cardSlots: {
				[CARNIVORE.id]: 2,
				[SHRED.id]: 1,
				[SURE_GAMBLE.id]: 3,
				[COOKBOOK.id]: 2
			}
		});

		expect(model.map((group) => group.type)).toEqual(['event', 'hardware', 'resource']);
		expect(model[0]?.items.map((item) => item.card.id)).toEqual([SHRED.id, SURE_GAMBLE.id]);
		expect(model.map((group) => group.totalCopies)).toEqual([4, 2, 2]);
	});

	it('filters both identity group types even when their slots are positive', () => {
		const model = buildDeckGridModel({
			groups: [
				{ type: 'corp_identity', data: [PRECISION_DESIGN] },
				{ type: 'agenda', data: [OFFWORLD_OFFICE] },
				{ type: 'runner_identity', data: [ZAHYA] }
			],
			cardSlots: {
				[PRECISION_DESIGN.id]: 1,
				[OFFWORLD_OFFICE.id]: 3,
				[ZAHYA.id]: 1
			}
		});

		expect(model).toHaveLength(1);
		expect(model[0]?.type).toBe('agenda');
	});

	it('uses card slots as the only quantity source', () => {
		const model = buildDeckGridModel({
			groups: [{ type: 'event', data: [SURE_GAMBLE, SHRED] }],
			cardSlots: { [SURE_GAMBLE.id]: 2 }
		});

		expect(model[0]?.items).toEqual([{ card: SURE_GAMBLE, copies: 2 }]);
		expect(model[0]?.totalCopies).toBe(2);
	});

	it('omits nonpositive quantities and groups left empty', () => {
		const model = buildDeckGridModel({
			groups: [
				{ type: 'event', data: [SURE_GAMBLE, SHRED] },
				{ type: 'hardware', data: [CARNIVORE] }
			],
			cardSlots: {
				[SURE_GAMBLE.id]: 0,
				[SHRED.id]: -1,
				[CARNIVORE.id]: 1
			}
		});

		expect(model).toHaveLength(1);
		expect(model[0]?.type).toBe('hardware');
		expect(model[0]?.items).toEqual([{ card: CARNIVORE, copies: 1 }]);
	});

	it('omits groups with no cards', () => {
		const model = buildDeckGridModel({
			groups: [{ type: 'upgrade', data: [] }],
			cardSlots: {}
		});

		expect(model).toEqual([]);
	});

	it('does not mutate source groups or cards', () => {
		const groups: CardGroup[] = [{ type: 'event', data: [SURE_GAMBLE, SHRED] }];
		const originalGroups = structuredClone(groups);

		const model = buildDeckGridModel({
			groups,
			cardSlots: { [SURE_GAMBLE.id]: 3, [SHRED.id]: 1 }
		});

		expect(groups).toEqual(originalGroups);
		expect(model[0]?.items[0]?.card).toBe(SURE_GAMBLE);
		expect(model[0]?.items[1]?.card).toBe(SHRED);
	});
});
