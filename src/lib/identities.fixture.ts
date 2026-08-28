import { createMockCard, createMockImages } from './test-helpers';

const ALL_CARD_POOL_IDS = [
	'core',
	'startup_vantage_point',
	'standard_2026_vantage_point',
	'eternal'
];

export const PRECISION_DESIGN = createMockCard(
	'haas_bioroid_precision_design',
	'Haas-Bioroid: Precision Design',
	['system_gateway'],
	{
		side_id: 'corp',
		faction_id: 'haas_bioroid',
		card_type_id: 'corp_identity',
		card_pool_ids: ALL_CARD_POOL_IDS,
		cost: null,
		influence_cost: null,
		minimum_deck_size: 40,
		influence_limit: 15,
		card_subtype_ids: ['megacorp'],
		display_subtypes: 'Megacorp',
		text: 'You get +1 maximum hand size.\nWhenever you score an agenda, you may add 1 card from Archives to HQ.',
		printing_ids: ['30035'],
		latest_printing_id: '30035',
		latest_printing_images: createMockImages('30035', { xlarge: true })
	}
);

export const RESTORING_HUMANITY = createMockCard(
	'jinteki_restoring_humanity',
	'Jinteki: Restoring Humanity',
	['system_gateway'],
	{
		side_id: 'corp',
		faction_id: 'jinteki',
		card_type_id: 'corp_identity',
		card_pool_ids: ALL_CARD_POOL_IDS
	}
);

export const ESA = createMockCard(
	'esa_afontov_eco_insurrectionist',
	'Esâ Afontov: Eco-Insurrectionist',
	['borealis'],
	{
		side_id: 'runner',
		faction_id: 'anarch',
		card_type_id: 'runner_identity',
		format_ids: ['startup', 'standard', 'eternal'],
		card_pool_ids: ['standard_2026_vantage_point', 'eternal']
	}
);

export const TOPAN = createMockCard('topan_ormas_leader', 'Topan: Ormas Leader', ['elevation'], {
	side_id: 'runner',
	faction_id: 'anarch',
	card_type_id: 'runner_identity',
	card_pool_ids: ALL_CARD_POOL_IDS
});

export const ZAHYA = createMockCard(
	'zahya_sadeghi_versatile_smuggler',
	'Zahya Sadeghi: Versatile Smuggler',
	['system_gateway'],
	{
		side_id: 'runner',
		faction_id: 'criminal',
		card_type_id: 'runner_identity',
		card_pool_ids: ALL_CARD_POOL_IDS,
		cost: null,
		influence_cost: null,
		minimum_deck_size: 40,
		influence_limit: 15,
		card_subtype_ids: ['cyborg'],
		display_subtypes: 'Cyborg',
		text: 'Once per turn → When a run on HQ or R&D ends, you may gain 1[credit] for each time you accessed a card during that run.',
		printing_ids: ['30010'],
		latest_printing_id: '30010',
		latest_printing_images: createMockImages('30010', { xlarge: true })
	}
);

export const TAO = createMockCard(
	'tao_salonga_telepresence_magician',
	'Tāo Salonga: Telepresence Magician',
	['system_gateway'],
	{
		side_id: 'runner',
		faction_id: 'shaper',
		card_type_id: 'runner_identity',
		card_pool_ids: ALL_CARD_POOL_IDS
	}
);

export const APEX = createMockCard(
	'apex_invasive_predator',
	'Apex: Invasive Predator',
	['data_and_destiny'],
	{
		side_id: 'runner',
		faction_id: 'apex',
		card_type_id: 'runner_identity',
		card_pool_ids: ['eternal']
	}
);

export const SHRED = createMockCard('shred', 'Shred', ['elevation'], {
	side_id: 'runner',
	faction_id: 'anarch',
	card_type_id: 'event',
	card_pool_ids: ALL_CARD_POOL_IDS
});
