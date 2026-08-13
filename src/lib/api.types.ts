// Types for NRDB API results.

import type { CardTypeIds, FactionIds, SidesIds } from './shared.types';

// JSON::API response types to handle collection and single-resource responses.
export interface CollectionResponse<T> {
	data: T[];
	links: {
		self: string;
		first: string;
		last: string;
	};
	meta: {
		stats: {
			total: {
				count: number;
			};
		};
	};
}

export interface SingleResponse<T> {
	data: T;
	links: {
		self: string;
	};
}

export interface Links {
	self: string;
}

export interface NrdbClassicImages {
	nrdb_classic: {
		tiny: string;
		small: string;
		medium: string;
		large: string;
		xlarge?: string;
		narrative?: string;
	};
}

export interface CardFace {
	index: number;
	images: NrdbClassicImages;
	base_link?: string;
	card_subtype_ids?: string[];
	copy_quantity?: number;
	display_subtypes?: string;
	flavor?: string;
	stripped_text?: string;
	stripped_title?: string;
	text?: string;
	title?: string;
}

export interface CardAbilities {
	additional_cost: boolean;
	advanceable: boolean;
	charge: boolean;
	gains_subroutines: boolean;
	gains_click: boolean;
	has_paid_ability: boolean;
	install_effect: boolean;
	interrupt: boolean;
	link_provided: number | null;
	mark: boolean;
	mu_provided: number | null;
	num_printed_subroutines: number | null;
	on_encounter_effect: boolean;
	performs_trace: boolean;
	recurring_credits_provided: number | null;
	rez_effect: boolean;
	sabotage: boolean;
	score_effect: boolean;
	steal_effect: boolean;
	trash_ability: boolean;
}

export interface CardRestrictions {
	banned: string[];
	global_penalty: string[];
	points: Record<string, number>;
	restricted: string[];
	universal_faction_cost: Record<string, number>;
}

export interface RelatedLink {
	links: {
		related: string;
	};
}

export interface Relationships {
	card?: RelatedLink;
	card_cycle?: RelatedLink;
	card_cycles?: RelatedLink;
	card_pool?: RelatedLink;
	card_pools?: RelatedLink;
	card_set?: RelatedLink;
	card_set_type?: RelatedLink;
	card_sets?: RelatedLink;
	card_subtypes?: RelatedLink;
	card_type?: RelatedLink;
	card_types?: RelatedLink;
	cards?: RelatedLink;
	decklists?: RelatedLink;
	faction?: RelatedLink;
	factions?: RelatedLink;
	format?: RelatedLink;
	illustrators?: RelatedLink;
	printings?: RelatedLink;
	restriction?: {
		links: {
			related: string | null;
		};
	};
	restrictions?: RelatedLink;
	reviews?: RelatedLink;
	rulings?: RelatedLink;
	side?: RelatedLink;
	snapshots?: RelatedLink;
}

// The actual entity types from the NetrunnerDB API.
// Only the public datatypes that do are not user-created
// have equivalent ${type}Row types in sqlite.types.ts.
export interface Card {
	id: string;
	type: 'cards';
	attributes: {
		stripped_title: string;
		title: string;
		card_type_id: CardTypeIds;
		side_id: SidesIds;
		faction_id: FactionIds;
		cost: string | null;
		advancement_requirement: string | null;
		agenda_points: number | null;
		base_link: number | null;
		deck_limit: number;
		in_restriction: boolean;
		influence_cost: number | null;
		influence_limit: number | null;
		memory_cost: number | null;
		minimum_deck_size: number | null;
		num_printings: number;
		printing_ids: string[];
		date_release: string;
		restriction_ids: string[];
		strength: number | null;
		stripped_text: string | null;
		text: string | null;
		trash_cost: number | null;
		is_unique: boolean;
		card_subtype_ids: string[];
		display_subtypes: string | null;
		attribution: string | null;
		updated_at: string;
		format_ids: string[];
		card_pool_ids: string[];
		snapshot_ids: string[];
		card_cycle_ids: string[];
		card_cycle_names: string[];
		card_set_ids: string[];
		card_set_names: string[];
		designed_by: string;
		narrative_text: string | null;
		printings_released_by: string[];
		pronouns: string | null;
		pronunciation_approximation: string | null;
		pronunciation_ipa: string | null;
		layout_id: string;
		num_extra_faces: number;
		faces: CardFace[];
		card_abilities: CardAbilities;
		restrictions: CardRestrictions;
		latest_printing_id: string;
		latest_printing_images: NrdbClassicImages;
	};
	relationships: Relationships;
	links: Links;
}

export interface CardGroup {
	type: CardTypeIds;
	data: Card[];
}

export interface CardPool {
	id: string;
	type: 'card_pools';
	attributes: {
		name: string;
		format_id: string;
		card_cycle_ids: string[];
		updated_at: string;
		num_cards: number;
	};
	relationships: Relationships;
	links: Links;
}

export interface CardSetType {
	id: string;
	type: 'card_set_types';
	attributes: {
		name: string;
		description: string | null;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface CardSubtype {
	id: string;
	type: 'card_subtypes';
	attributes: {
		name: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface CardType {
	id: CardTypeIds;
	type: 'card_types';
	attributes: {
		name: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Comment {
	id: number;
	body: string;
	user: string;
	created_at: string;
	updated_at: string;
}

export interface Decklist {
	id: string;
	type: 'decklists';
	attributes: {
		user_id: string;
		follows_basic_deckbuilding_rules: boolean;
		identity_card_id: string;
		name: string;
		notes: string;
		tags: string[] | null;
		side_id: 'corp' | 'runner';
		created_at: string;
		updated_at: string;
		faction_id: FactionIds;
		card_slots: Record<string, number>;
		num_cards: number;
		influence_spent: number;
	};
	relationships: Relationships;
	links: Links;
}

export interface Cycle {
	id: string;
	type: 'card_cycles';
	attributes: {
		name: string;
		date_release: string;
		legacy_code: string;
		card_set_ids: string[];
		first_printing_id: string;
		position: number;
		released_by: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Faction {
	id: FactionIds;
	type: 'factions';
	attributes: {
		name: string;
		description: string | null;
		is_mini: boolean;
		side_id: SidesIds;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Format {
	id: string;
	type: 'formats';
	attributes: {
		name: string;
		active_snapshot_id: string;
		snapshot_ids: string[];
		restriction_ids: string[];
		active_card_pool_id: string;
		active_restriction_id: string | null;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Illustrator {
	id: string;
	type: 'illustrators';
	attributes: {
		name: string;
		num_printings: number;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Printing {
	id: string;
	type: 'printings';
	attributes: {
		card_id: string;
		card_cycle_id: string;
		card_cycle_name: string;
		card_set_id: string;
		card_set_name: string;
		flavor: string | null;
		display_illustrators: string | null;
		illustrator_ids: string[];
		illustrator_names: string[];
		position: number;
		position_in_set: number;
		quantity: number;
		date_release: string;
		updated_at: string;
		stripped_title: string;
		title: string;
		card_type_id: CardTypeIds;
		side_id: SidesIds;
		faction_id: FactionIds;
		advancement_requirement: string | null;
		cost: string | null;
		agenda_points: number | null;
		base_link: number | null;
		deck_limit: number;
		in_restriction: boolean;
		influence_cost: number | null;
		influence_limit: number | null;
		memory_cost: number | null;
		minimum_deck_size: number | null;
		num_printings: number;
		is_latest_printing: boolean;
		printing_ids: string[];
		restriction_ids: string[];
		strength: number | null;
		stripped_text: string | null;
		text: string | null;
		trash_cost: number | null;
		is_unique: boolean;
		card_subtype_ids: string[];
		card_subtype_names: string[];
		display_subtypes: string | null;
		attribution: string | null;
		format_ids: string[];
		card_pool_ids: string[];
		snapshot_ids: string[];
		card_cycle_ids: string[];
		card_cycle_names: string[];
		card_set_ids: string[];
		card_set_names: string[];
		designed_by: string;
		narrative_text: string | null;
		released_by: string;
		printings_released_by: string[];
		pronouns: string | null;
		pronunciation_approximation: string | null;
		pronunciation_ipa: string | null;
		images: NrdbClassicImages;
		card_abilities: CardAbilities;
		latest_printing_id: string;
		restrictions: CardRestrictions;
		num_extra_faces: number;
		faces: CardFace[];
	};
	relationships: Relationships;
	links: Links;
}

export interface Restriction {
	id: string;
	type: 'restrictions';
	attributes: {
		name: string;
		date_start: string;
		format_id: string;
		banned_subtypes: string[];
		point_limit: number | null;
		verdicts: {
			banned: string[];
			restricted: string[];
			global_penalty: string[];
			points: { [card_id: string]: number };
			universal_faction_cost: { [card_id: string]: number };
		};
		size: number;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface RestrictionVerdicts {
	banned: string[];
	restricted: string[];
	universal_faction_cost: Record<string, number>;
	global_penalty: string[];
	points: Record<string, number>;
}

export interface Review {
	id: string;
	type: 'reviews';
	attributes: {
		username: string;
		body: string;
		card: string;
		card_id: string;
		created_at: string;
		updated_at: string;
		votes: number;
		comments: {
			id: number;
			body: string;
			user: string;
			created_at: string;
			updated_at: string;
		}[];
	};
	relationships: Relationships;
	links: Links;
}

export interface Ruling {
	id: string;
	type: 'rulings';
	attributes: {
		card_id: string;
		nsg_rules_team_verified: boolean;
		question: string;
		answer?: string;
		text_ruling?: string | null;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Set {
	id: string;
	type: 'card_sets';
	attributes: {
		name: string;
		date_release: string;
		size: number;
		card_cycle_id: string;
		card_set_type_id: string;
		legacy_code: string;
		position: number;
		first_printing_id: string;
		released_by: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Side {
	id: SidesIds;
	type: 'sides';
	attributes: {
		name: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}

export interface Snapshot {
	id: string;
	type: 'snapshots';
	attributes: {
		format_id: string;
		active: boolean;
		card_cycle_ids: string[];
		card_set_ids: string[];
		card_pool_id: string;
		restriction_id: string | null;
		num_cards: number;
		date_start: string;
		updated_at: string;
	};
	relationships: Relationships;
	links: Links;
}
