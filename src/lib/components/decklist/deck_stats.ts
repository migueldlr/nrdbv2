import type { Card } from '$lib/types';
import type { CardSlots } from './card_slots';

export interface AgendaPointRange {
	readonly min: number;
	readonly max: number;
}

export interface DeckStats {
	readonly card_count: number;
	readonly minimum_deck_size: number | null;
	readonly influence_spent: number;
	readonly influence_limit: number | null;
	readonly agenda_points: number;
	readonly agenda_point_range: AgendaPointRange | null;
}

export const agendaPointRange = (deck_size: number): AgendaPointRange => {
	const min = 2 * Math.floor(deck_size / 5) + 2;
	return { min, max: min + 1 };
};

export const influenceFor = (identity: Card, card: Card): number =>
	card.attributes.faction_id === identity.attributes.faction_id
		? 0
		: (card.attributes.influence_cost ?? 0);

export const computeDeckStats = (
	identity: Card,
	cards: readonly Card[],
	card_slots: CardSlots
): DeckStats => {
	let card_count = 0;
	let influence_spent = 0;
	let agenda_points = 0;

	for (const card of cards) {
		const quantity = card_slots[card.id] ?? 0;
		if (quantity <= 0 || card.id === identity.id) continue;

		card_count += quantity;
		influence_spent += quantity * influenceFor(identity, card);
		agenda_points += quantity * (card.attributes.agenda_points ?? 0);
	}

	const minimum_deck_size = identity.attributes.minimum_deck_size;
	const is_corp = identity.attributes.side_id === 'corp';

	return {
		card_count,
		minimum_deck_size,
		influence_spent,
		influence_limit: identity.attributes.influence_limit,
		agenda_points,
		agenda_point_range: is_corp
			? agendaPointRange(Math.max(card_count, minimum_deck_size ?? 0))
			: null
	};
};
