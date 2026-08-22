import { NRDB_IMAGE_URL } from './constants';
import type { Card, NrdbClassicImages, Printing } from './types';

export const createMockImages = (
	id: string,
	{ xlarge = false }: { xlarge?: boolean } = {}
): NrdbClassicImages => ({
	nrdb_classic: {
		tiny: `${NRDB_IMAGE_URL}/tiny/${id}.jpg`,
		small: `${NRDB_IMAGE_URL}/small/${id}.jpg`,
		medium: `${NRDB_IMAGE_URL}/medium/${id}.jpg`,
		large: `${NRDB_IMAGE_URL}/large/${id}.jpg`,
		...(xlarge ? { xlarge: `${NRDB_IMAGE_URL}/xlarge/${id}.webp` } : {})
	}
});

/**
 * Helper function to create mock Card objects with all required properties.
 * This centralizes the mock card creation to avoid duplication across test files.
 *
 * @param id - Card ID
 * @param title - Card title
 * @param card_cycle_ids - Array of card cycle IDs (defaults to ['core'])
 * @param overrides - Optional overrides for specific attributes
 */
export const createMockCard = (
	id: string,
	title: string,
	card_cycle_ids: string[] = ['core'],
	overrides: Partial<Card['attributes']> = {}
): Card => ({
	id,
	type: 'cards',
	attributes: {
		stripped_title: title.toLowerCase().replace(/[^a-z0-9]/g, ''),
		title,
		card_type_id: 'agenda',
		side_id: 'corp',
		faction_id: 'neutral_corp',
		cost: '0',
		advancement_requirement: null,
		agenda_points: null,
		base_link: null,
		deck_limit: 3,
		in_restriction: true,
		influence_cost: 0,
		influence_limit: null,
		memory_cost: null,
		minimum_deck_size: null,
		num_printings: 1,
		printing_ids: [id],
		date_release: '2023-01-01',
		restriction_ids: [],
		strength: null,
		stripped_text: '',
		text: '',
		trash_cost: null,
		is_unique: false,
		card_subtype_ids: [],
		display_subtypes: null,
		attribution: null,
		updated_at: '2023-01-01T00:00:00Z',
		format_ids: [],
		card_pool_ids: [],
		snapshot_ids: [],
		card_cycle_ids,
		card_cycle_names: [],
		card_set_ids: [],
		card_set_names: [],
		designed_by: 'Test',
		narrative_text: null,
		printings_released_by: [],
		pronouns: null,
		pronunciation_approximation: null,
		pronunciation_ipa: null,
		layout_id: 'normal',
		num_extra_faces: 0,
		faces: [],
		card_abilities: {
			additional_cost: false,
			advanceable: false,
			charge: false,
			gains_subroutines: false,
			gains_click: false,
			has_paid_ability: false,
			install_effect: false,
			interrupt: false,
			link_provided: null,
			mark: false,
			mu_provided: null,
			num_printed_subroutines: null,
			on_encounter_effect: false,
			performs_trace: false,
			recurring_credits_provided: null,
			rez_effect: false,
			sabotage: false,
			score_effect: false,
			steal_effect: false,
			trash_ability: false
		},
		restrictions: {
			banned: [],
			global_penalty: [],
			points: {},
			restricted: [],
			universal_faction_cost: {}
		},
		latest_printing_id: id,
		latest_printing_images: createMockImages(id),
		// Apply any overrides
		...overrides
	},
	relationships: {
		side: { links: { related: '' } },
		cards: { links: { related: '' } },
		decklists: { links: { related: '' } },
		printings: { links: { related: '' } }
	},
	links: { self: '' }
});

export const createMockPrinting = (
	card: Card,
	id: string = card.attributes.latest_printing_id,
	overrides: Partial<Printing['attributes']> = {}
): Printing => ({
	id,
	type: 'printings',
	attributes: {
		...card.attributes,
		card_id: card.id,
		card_cycle_id: card.attributes.card_cycle_ids[0] ?? 'core',
		card_cycle_name: card.attributes.card_cycle_names[0] ?? 'Core Set',
		card_set_id: card.attributes.card_set_ids[0] ?? 'core',
		card_set_name: card.attributes.card_set_names[0] ?? 'Core Set',
		flavor: null,
		display_illustrators: null,
		illustrator_ids: [],
		illustrator_names: [],
		position: 1,
		position_in_set: 1,
		quantity: 3,
		card_subtype_names: card.attributes.card_subtype_ids,
		released_by: 'null_signal_games',
		images: createMockImages(id, { xlarge: true }),
		is_latest_printing: id === card.attributes.latest_printing_id,
		...overrides
	},
	relationships: {},
	links: { self: '' }
});

export const create_mock_deck = async () => {
	return {
		id: 'mock-deck-1',
		type: 'decklists',
		attributes: {
			name: 'Mock Deck',
			user_id: 1,
			username: 'testuser',
			description: 'Mock deck description',
			card_slots: { '01001': 3 },
			identity_card_id: '01001',
			influence_spent: 0,
			num_cards: 45
		}
	};
};
