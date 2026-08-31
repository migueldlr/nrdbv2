import { createMockCard, createMockImages } from '$lib/test-helpers';
import type { Card, Decklist } from '$lib/types';

export const decklist: Decklist = {
	id: 'precision-design-demo',
	type: 'decklists',
	attributes: {
		user_id: 'spiderbro',
		follows_basic_deckbuilding_rules: true,
		identity_card_id: 'haas_bioroid_precision_design',
		name: 'Brutal Efficiency',
		notes: '',
		tags: ['standard'],
		side_id: 'corp',
		created_at: '2026-08-12T12:00:00Z',
		updated_at: '2026-08-12T12:00:00Z',
		faction_id: 'haas_bioroid',
		card_slots: {
			haas_bioroid_precision_design: 1,
			hedge_fund: 3,
			predictive_planogram: 2,
			seamless_launch: 3
		},
		num_cards: 40,
		influence_spent: 2
	},
	relationships: {},
	links: { self: '/decklists/precision-design-demo' }
};

export const secondDecklist: Decklist = {
	...decklist,
	id: 'second-decklist',
	attributes: {
		...decklist.attributes,
		name: 'Second decklist',
		card_slots: {
			haas_bioroid_precision_design: 1,
			hedge_fund: 3
		}
	}
};

export const cards: Card[] = [
	createMockCard(
		'haas_bioroid_precision_design',
		'Haas-Bioroid: Precision Design',
		['system_gateway'],
		{
			side_id: 'corp',
			faction_id: 'haas_bioroid',
			card_type_id: 'corp_identity',
			printing_ids: ['30035'],
			latest_printing_id: '30035',
			latest_printing_images: createMockImages('30035')
		}
	),
	createMockCard('hedge_fund', 'Hedge Fund', ['system_gateway'], {
		side_id: 'corp',
		faction_id: 'neutral_corp',
		card_type_id: 'operation',
		printing_ids: ['30075'],
		latest_printing_id: '30075',
		latest_printing_images: createMockImages('30075')
	}),
	createMockCard('predictive_planogram', 'Predictive Planogram', ['system_gateway'], {
		side_id: 'corp',
		faction_id: 'nbn',
		card_type_id: 'operation',
		printing_ids: ['30056'],
		latest_printing_id: '30056',
		latest_printing_images: createMockImages('30056')
	}),
	createMockCard('seamless_launch', 'Seamless Launch', ['system_gateway'], {
		side_id: 'corp',
		faction_id: 'haas_bioroid',
		card_type_id: 'operation',
		printing_ids: ['30040'],
		latest_printing_id: '30040',
		latest_printing_images: createMockImages('30040')
	})
];
