import { formats } from './i18n';
import type { CardRestrictions } from './types';

export const LEGALITY_FORMATS = ['startup', 'standard', 'eternal'] as const;
export type LegalityFormat = (typeof LEGALITY_FORMATS)[number];

export interface LegalitySnapshot {
	format_id: string;
	card_pool_id: string;
	date_start: string;
	restriction_id: string | null;
	restriction_name: string | null;
	restriction_date_start: string | null;
}

export type Verdict =
	| { kind: 'banned' }
	| { kind: 'restricted' }
	| { kind: 'global_penalty' }
	| { kind: 'points'; value: number }
	| { kind: 'universal_faction_cost'; value: number };

export type Standing = { kind: 'legal' } | { kind: 'out' } | Verdict;

export type Tone = 'legal' | 'out' | 'banned' | 'restricted';

export interface LegalitySpan {
	standing: Standing;
	start: string;
	end: string | null;
	lists: string[];
}

export interface FormatLegality {
	format: LegalityFormat;
	start: string;
	spans: LegalitySpan[];
	current: Standing;
	ever_in_pool: boolean;
}

export interface LegalityCard {
	card_pool_ids: string[];
	restrictions: CardRestrictions;
}

interface Period {
	start: string;
	in_pool: boolean;
	list?: LegalitySnapshot;
}

function verdict_for(restrictions: CardRestrictions, restriction_id: string): Verdict | null {
	if (restrictions.banned.includes(restriction_id)) return { kind: 'banned' };
	if (restrictions.restricted.includes(restriction_id)) return { kind: 'restricted' };
	if (restrictions.global_penalty.includes(restriction_id)) return { kind: 'global_penalty' };
	const points = restrictions.points[restriction_id];
	if (points != null) return { kind: 'points', value: points };
	const influence = restrictions.universal_faction_cost[restriction_id];
	if (influence != null) return { kind: 'universal_faction_cost', value: influence };
	return null;
}

export function is_verdict(standing: Standing): standing is Verdict {
	return standing.kind !== 'legal' && standing.kind !== 'out';
}

export function tone(standing: Standing): Tone {
	if (standing.kind === 'banned') return 'banned';
	return is_verdict(standing) ? 'restricted' : standing.kind;
}

function periods_for(snapshots: LegalitySnapshot[], pools: Set<string>, today: string): Period[] {
	const periods: Period[] = [];
	let list: LegalitySnapshot | undefined;
	snapshots.forEach((snapshot, i) => {
		const start = snapshot.date_start;
		const in_pool = pools.has(snapshot.card_pool_id);
		const takes_effect = snapshot.restriction_date_start ?? start;
		if (takes_effect > start) {
			periods.push({ start, in_pool, list });
			const next_start = snapshots[i + 1]?.date_start;
			if (takes_effect > today || (next_start && takes_effect >= next_start)) return;
			periods.push({ start: takes_effect, in_pool, list: snapshot });
		} else {
			periods.push({ start, in_pool, list: snapshot });
		}
		list = snapshot;
	});
	return periods;
}

function backdate_entries(periods: Period[], releases: string[]): Period[] {
	return periods.flatMap((period, i) => {
		const entered = periods.findIndex((p, j) => j > i && p.in_pool);
		if (period.in_pool || entered < 0) return [period];
		const left = periods[periods.findLastIndex((p, j) => j < i && p.in_pool) + 1].start;
		const entry = releases.find((d) => d >= left && d < periods[entered].start);
		if (!entry || entry >= periods[i + 1].start) return [period];
		if (entry <= period.start) return [{ ...period, in_pool: true }];
		return [period, { ...period, start: entry, in_pool: true }];
	});
}

function merge(spans: LegalitySpan[]): LegalitySpan[] {
	const merged: LegalitySpan[] = [];
	for (const span of spans) {
		if (span.end !== null && span.end <= span.start) continue;
		const last = merged.at(-1);
		if (last && JSON.stringify(last.standing) === JSON.stringify(span.standing)) {
			last.end = span.end;
			last.lists.push(...span.lists.filter((name) => !last.lists.includes(name)));
		} else {
			merged.push(span);
		}
	}
	return merged;
}

export function build_legality(
	card: LegalityCard,
	release_dates: string[],
	snapshots: LegalitySnapshot[],
	today: string
): FormatLegality[] {
	const pools = new Set(card.card_pool_ids);
	const releases = [...release_dates].sort();
	const release = releases[0] ?? today;
	if (release > today) return [];

	return LEGALITY_FORMATS.flatMap((format): FormatLegality[] => {
		const ordered = snapshots
			.filter(
				(s) =>
					s.format_id === format &&
					s.date_start <= today &&
					!s.restriction_id?.startsWith('sunset')
			)
			.sort((a, b) => a.date_start.localeCompare(b.date_start));
		if (ordered.length === 0) return [];

		const periods = backdate_entries(periods_for(ordered, pools, today), releases);
		const raw = periods.flatMap((period, i): LegalitySpan[] => {
			const end = periods[i + 1]?.start ?? null;
			if (end !== null && end <= release) return [];
			const id = period.list?.restriction_id;
			const verdict = id ? verdict_for(card.restrictions, id) : null;
			const name = period.list?.restriction_name;
			return [
				{
					standing: period.in_pool ? (verdict ?? { kind: 'legal' }) : { kind: 'out' },
					start: period.start < release ? release : period.start,
					end,
					lists: name ? [name] : []
				}
			];
		});

		const settled = merge(raw);

		return [
			{
				format,
				start: ordered[0].date_start,
				spans: settled,
				current: settled.at(-1)!.standing,
				ever_in_pool: settled.some((span) => span.standing.kind !== 'out')
			}
		];
	});
}

export function standing_short(standing: Standing): string {
	switch (standing.kind) {
		case 'legal':
			return 'Legal';
		case 'out':
			return 'Not in pool';
		case 'banned':
			return 'Banned';
		case 'restricted':
			return 'Restricted';
		case 'global_penalty':
			return 'Penalty';
		case 'points':
			return `${standing.value} ${standing.value === 1 ? 'pt' : 'pts'}`;
		case 'universal_faction_cost':
			return `+${standing.value} inf`;
	}
}

export function status_label(legality: FormatLegality): string {
	if (legality.current.kind === 'out') return legality.ever_in_pool ? 'Rotated' : 'Not legal';
	return standing_short(legality.current);
}

export function verdict_label(format: LegalityFormat, verdict: Verdict): string {
	const name = formats[format];
	switch (verdict.kind) {
		case 'banned':
			return `Banned in ${name}`;
		case 'restricted':
			return `Restricted in ${name}`;
		case 'global_penalty':
			return `Global penalty in ${name}`;
		case 'points':
			return `${verdict.value} ${name} ${verdict.value === 1 ? 'point' : 'points'}`;
		case 'universal_faction_cost':
			return `+${verdict.value} universal influence in ${name}`;
	}
}
