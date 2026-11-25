import { describe, it, expect } from 'vitest';
import type { CardRestrictions } from './types';
import { build_legality, status_label, type LegalitySnapshot } from './legality';

const snapshot = (
	format_id: string,
	card_pool_id: string,
	restriction_id: string | null,
	date_start: string,
	restriction_date_start = date_start
): LegalitySnapshot => ({
	format_id,
	card_pool_id,
	date_start,
	restriction_id,
	restriction_name: restriction_id,
	restriction_date_start: restriction_id ? restriction_date_start : null
});

const SNAPSHOTS = [
	snapshot('standard', 'pre_rotation', null, '2012-09-06'),
	snapshot('standard', 'pre_rotation', 'napd_mwl_1_0', '2016-02-01'),
	snapshot('standard', 'rotation_2017', 'napd_mwl_2_0', '2017-10-01'),
	snapshot('standard', 'rotation_2017', 'napd_mwl_2_2', '2018-09-06'),
	snapshot('standard', 'rotation_2018', 'standard_mwl_3_0', '2018-12-21'),
	snapshot('standard', 'rotation_2023', 'sunset_ban_list_24_01', '2023-09-21'),
	snapshot('standard', 'rotation_2022', 'standard_ban_list_22_08', '2022-08-05'),
	snapshot('standard', 'rotation_2022', 'standard_ban_list_30_01', '2030-01-01'),
	snapshot('eternal', 'eternal', null, '2017-10-01'),
	snapshot('eternal', 'eternal', 'eternal_points_list_21_11', '2021-11-12'),
	snapshot('eternal', 'eternal', 'eternal_points_list_22_09', '2022-09-26'),
	snapshot('startup', 'startup_ashes', null, '2019-03-18'),
	snapshot('startup', 'startup_borealis', 'startup_ban_list_24_01', '2024-01-19'),
	snapshot('startup', 'startup_liberation', 'startup_ban_list_24_09', '2024-03-30', '2024-09-20'),
	snapshot('ram', 'ram_0', null, '2021-12-07')
];

const restrictions = (overrides: Partial<CardRestrictions> = {}): CardRestrictions => ({
	banned: [],
	restricted: [],
	global_penalty: [],
	points: {},
	universal_faction_cost: {},
	...overrides
});

const MUSEUM = {
	card_pool_ids: ['pre_rotation', 'rotation_2017', 'rotation_2018', 'eternal', 'ram_0'],
	restrictions: restrictions({
		restricted: ['napd_mwl_2_0'],
		banned: ['napd_mwl_2_2', 'standard_mwl_3_0', 'sunset_ban_list_24_01'],
		points: { eternal_points_list_21_11: 1, eternal_points_list_22_09: 2 }
	})
};

const TODAY = '2026-11-19';

const summary = (spans: { standing: { kind: string }; start: string; end: string | null }[]) =>
	spans.map((span) => [span.standing.kind, span.start, span.end]);

describe('build_legality', () => {
	const [startup, standard, eternal] = build_legality(MUSEUM, ['2016-01-29'], SNAPSHOTS, TODAY);

	it('collapses snapshots with the same standing into one span', () => {
		expect(summary(standard.spans)).toEqual([
			['legal', '2016-01-29', '2017-10-01'],
			['restricted', '2017-10-01', '2018-09-06'],
			['banned', '2018-09-06', '2022-08-05'],
			['out', '2022-08-05', null]
		]);
		expect(standard.spans[2].lists).toEqual(['napd_mwl_2_2', 'standard_mwl_3_0']);
		expect(standard.spans[3].lists).toEqual(['standard_ban_list_22_08']);
	});

	it('splits spans when the point value changes', () => {
		expect(eternal.spans.map((span) => span.standing)).toEqual([
			{ kind: 'legal' },
			{ kind: 'points', value: 1 },
			{ kind: 'points', value: 2 }
		]);
	});

	it('keeps the format start when the format began after the card', () => {
		expect(eternal.start).toBe('2017-10-01');
		expect(eternal.spans[0].start).toBe('2017-10-01');
	});

	it('labels the current standing', () => {
		expect(status_label(standard)).toBe('Rotated');
		expect(status_label(eternal)).toBe('2 pts');
		expect(status_label(startup)).toBe('Not legal');
	});

	it('clamps the first span to the card release', () => {
		const [, late] = build_legality(MUSEUM, ['2018-01-01'], SNAPSHOTS, TODAY);
		expect(late.spans[0]).toMatchObject({
			standing: { kind: 'restricted' },
			start: '2018-01-01'
		});
	});

	it('treats a card as legal from release when the pool catches up later', () => {
		const downfall = { card_pool_ids: ['rotation_2018'], restrictions: restrictions() };
		const [, late_pool] = build_legality(downfall, ['2018-10-01'], SNAPSHOTS, TODAY);
		expect(summary(late_pool.spans)).toEqual([
			['legal', '2018-10-01', '2022-08-05'],
			['out', '2022-08-05', null]
		]);
	});

	it('judges the time before a late pool entry by the list then in force', () => {
		const banned_on_entry = {
			card_pool_ids: ['rotation_2018'],
			restrictions: restrictions({ banned: ['standard_mwl_3_0'] })
		};
		const [, late_pool] = build_legality(banned_on_entry, ['2018-10-01'], SNAPSHOTS, TODAY);
		expect(summary(late_pool.spans)).toEqual([
			['legal', '2018-10-01', '2018-12-21'],
			['banned', '2018-12-21', '2022-08-05'],
			['out', '2022-08-05', null]
		]);
		expect(late_pool.spans[0].lists).toEqual(['napd_mwl_2_2']);
	});

	it('enters the pool at the reprint that brought the card back', () => {
		const reprinted = {
			card_pool_ids: ['pre_rotation', 'rotation_2018'],
			restrictions: restrictions()
		};
		const [, back] = build_legality(reprinted, ['2015-01-01', '2018-11-01'], SNAPSHOTS, TODAY);
		expect(summary(back.spans)).toEqual([
			['legal', '2015-01-01', '2017-10-01'],
			['out', '2017-10-01', '2018-11-01'],
			['legal', '2018-11-01', '2022-08-05'],
			['out', '2022-08-05', null]
		]);
	});

	it('waits for a restriction list that starts after its snapshot', () => {
		const banned_late = {
			card_pool_ids: ['startup_borealis', 'startup_liberation'],
			restrictions: restrictions({ banned: ['startup_ban_list_24_09'] })
		};
		const [late_startup] = build_legality(banned_late, ['2023-01-01'], SNAPSHOTS, TODAY);
		expect(summary(late_startup.spans)).toEqual([
			['legal', '2023-01-01', '2024-09-20'],
			['banned', '2024-09-20', null]
		]);
		expect(late_startup.spans[0].lists).toEqual(['startup_ban_list_24_01']);
		const [day_before] = build_legality(banned_late, ['2023-01-01'], SNAPSHOTS, '2024-09-19');
		expect(day_before.current).toEqual({ kind: 'legal' });
		const [on_the_day] = build_legality(banned_late, ['2023-01-01'], SNAPSHOTS, '2024-09-20');
		expect(on_the_day.current).toEqual({ kind: 'banned' });
	});

	it('ignores the Sunset list and future lists for cards in their pools', () => {
		const card = {
			card_pool_ids: ['rotation_2022', 'rotation_2023'],
			restrictions: restrictions({
				banned: ['sunset_ban_list_24_01', 'standard_ban_list_30_01']
			})
		};
		const [, current] = build_legality(card, ['2022-09-01'], SNAPSHOTS, TODAY);
		expect(summary(current.spans)).toEqual([['legal', '2022-09-01', null]]);
	});

	it('returns nothing for a card that is not out yet', () => {
		const upcoming = { card_pool_ids: ['eternal'], restrictions: restrictions() };
		expect(build_legality(upcoming, ['2027-01-01'], SNAPSHOTS, TODAY)).toEqual([]);
	});
});
