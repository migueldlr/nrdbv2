import { createMockCard, createMockImages } from './test-helpers';
import type { Card, CardTypeIds } from './types';

export const SURE_GAMBLE = createMockCard('sure_gamble', 'Sure Gamble', ['system_gateway'], {
	card_type_id: 'event',
	side_id: 'runner',
	faction_id: 'neutral_runner',
	cost: '5',
	influence_cost: 0,
	stripped_text: 'Gain 9 credits.',
	text: 'Gain 9[credit].',
	date_release: '2012-09-06',
	designed_by: 'fantasy_flight_games',
	printing_ids: ['30030', '25059', '20056', '01050'],
	latest_printing_id: '30030',
	latest_printing_images: createMockImages('30030', { xlarge: true }),
	num_printings: 4
});

export const OFFWORLD_OFFICE = createMockCard(
	'offworld_office',
	'Offworld Office',
	['system_gateway'],
	{
		card_type_id: 'agenda',
		cost: null,
		advancement_requirement: '4',
		agenda_points: 2,
		influence_cost: 0,
		card_subtype_ids: ['expansion'],
		display_subtypes: 'Expansion',
		stripped_text: 'When you score this agenda, gain 7 credits.',
		text: 'When you score this agenda, gain 7[credit].',
		date_release: '2021-03-28',
		designed_by: 'null_signal_games',
		printing_ids: ['30067'],
		latest_printing_id: '30067',
		latest_printing_images: createMockImages('30067', { xlarge: true }),
		in_restriction: true,
		restriction_ids: [
			'standard_balance_update_26_08',
			'standard_ban_list_26_05',
			'startup_balance_update_26_05'
		]
	}
);

export const PING = createMockCard('ping', 'Ping', ['system_gateway'], {
	card_type_id: 'ice',
	faction_id: 'nbn',
	cost: '2',
	influence_cost: 2,
	strength: 1,
	card_subtype_ids: ['barrier'],
	display_subtypes: 'Barrier',
	stripped_text:
		'When you rez this ice during a run against this server, give the Runner 1 tag. Subroutine End the run.',
	text: 'When you rez this ice during a run against this server, give the Runner 1 tag.\n[subroutine] End the run.',
	date_release: '2021-03-28',
	designed_by: 'null_signal_games',
	printing_ids: ['30055'],
	latest_printing_id: '30055',
	latest_printing_images: createMockImages('30055', { xlarge: true })
});

export const CLEARINGHOUSE = createMockCard('clearinghouse', 'Clearinghouse', ['system_gateway'], {
	card_type_id: 'asset',
	side_id: 'corp',
	faction_id: 'weyland_consortium',
	cost: '0',
	influence_cost: 3,
	trash_cost: 3,
	display_subtypes: 'Hostile',
	text: 'You can advance this asset.\nWhen your turn begins, you may trash this asset to do 1 meat damage for each hosted advancement counter.',
	printing_ids: ['30061'],
	latest_printing_id: '30061',
	latest_printing_images: createMockImages('30061', { xlarge: true })
});

export const CARNIVORE = createMockCard('carnivore', 'Carnivore', ['system_gateway'], {
	card_type_id: 'hardware',
	side_id: 'runner',
	faction_id: 'anarch',
	cost: '4',
	influence_cost: 3,
	is_unique: true,
	display_subtypes: 'Console',
	text: '+1[mu]\nAccess, once per turn → <strong>Trash 2 cards from your grip:</strong> Trash the card you are accessing.\nLimit 1 <strong>console</strong> per player.',
	printing_ids: ['30003'],
	latest_printing_id: '30003',
	latest_printing_images: createMockImages('30003', { xlarge: true })
});

export const HANSEI_REVIEW = createMockCard('hansei_review', 'Hansei Review', ['system_gateway'], {
	card_type_id: 'operation',
	side_id: 'corp',
	faction_id: 'jinteki',
	cost: '5',
	influence_cost: 1,
	display_subtypes: 'Transaction',
	text: 'Gain 10[credit]. If there are any cards in HQ, trash 1 of them.',
	printing_ids: ['30048'],
	latest_printing_id: '30048',
	latest_printing_images: createMockImages('30048', { xlarge: true })
});

export const CONDUIT = createMockCard('conduit', 'Conduit', ['system_gateway'], {
	card_type_id: 'program',
	side_id: 'runner',
	faction_id: 'shaper',
	cost: '4',
	influence_cost: 4,
	memory_cost: 1,
	card_subtype_ids: ['virus'],
	display_subtypes: 'Virus',
	text: 'Whenever a successful run on R&D ends, you may place 1 virus counter on this program.\n[click]<strong>:</strong> Run R&D. If successful, access X additional cards when you breach R&D. X is equal to the number of hosted virus counters.',
	printing_ids: ['30024'],
	latest_printing_id: '30024',
	latest_printing_images: createMockImages('30024', { xlarge: true })
});

export const COOKBOOK = createMockCard('cookbook', 'Cookbook', ['system_gateway'], {
	card_type_id: 'resource',
	side_id: 'runner',
	faction_id: 'anarch',
	cost: '1',
	influence_cost: 3,
	is_unique: true,
	display_subtypes: 'Virtual',
	text: 'Whenever you install a <strong>virus</strong> program, you may place 1 virus counter on it.',
	printing_ids: ['30009'],
	latest_printing_id: '30009',
	latest_printing_images: createMockImages('30009', { xlarge: true })
});

export const AMAZE_AMUSEMENTS = createMockCard(
	'amaze_amusements',
	'AMAZE Amusements',
	['system_gateway'],
	{
		card_type_id: 'upgrade',
		side_id: 'corp',
		faction_id: 'nbn',
		cost: '1',
		influence_cost: 3,
		trash_cost: 3,
		is_unique: true,
		text: 'Persistent → Whenever a run on this server ends, if the Runner stole any agendas during that run, give the Runner 2 tags. <em>(If the Runner trashes this card while accessing it, this ability still applies for the remainder of this run.)</em>',
		printing_ids: ['30058'],
		latest_printing_id: '30058',
		latest_printing_images: createMockImages('30058', { xlarge: true })
	}
);

export const CREATIVE_COMMISSION = createMockCard(
	'creative_commission',
	'Creative Commission',
	['system_gateway'],
	{
		card_type_id: 'event',
		side_id: 'runner',
		faction_id: 'shaper',
		printing_ids: ['30020'],
		latest_printing_id: '30020',
		latest_printing_images: createMockImages('30020', { xlarge: true })
	}
);

export const JAILBREAK = createMockCard('jailbreak', 'Jailbreak', ['system_gateway'], {
	card_type_id: 'event',
	side_id: 'runner',
	faction_id: 'neutral_runner',
	printing_ids: ['30028'],
	latest_printing_id: '30028',
	latest_printing_images: createMockImages('30028', { xlarge: true })
});

export const DZMZ_OPTIMIZER = createMockCard(
	'dzmz_optimizer',
	'DZMZ Optimizer',
	['system_gateway'],
	{
		card_type_id: 'hardware',
		side_id: 'runner',
		faction_id: 'shaper',
		printing_ids: ['30022'],
		latest_printing_id: '30022',
		latest_printing_images: createMockImages('30022', { xlarge: true })
	}
);

export const DOCKLANDS_PASS = createMockCard(
	'docklands_pass',
	'Docklands Pass',
	['system_gateway'],
	{
		card_type_id: 'hardware',
		side_id: 'runner',
		faction_id: 'criminal',
		printing_ids: ['30013'],
		latest_printing_id: '30013',
		latest_printing_images: createMockImages('30013', { xlarge: true })
	}
);

export const BOTULUS = createMockCard('botulus', 'Botulus', ['system_gateway'], {
	card_type_id: 'program',
	side_id: 'runner',
	faction_id: 'anarch',
	printing_ids: ['30004'],
	latest_printing_id: '30004',
	latest_printing_images: createMockImages('30004', { xlarge: true })
});

export const CARMEN = createMockCard('carmen', 'Carmen', ['system_gateway'], {
	card_type_id: 'program',
	side_id: 'runner',
	faction_id: 'criminal',
	printing_ids: ['30015'],
	latest_printing_id: '30015',
	latest_printing_images: createMockImages('30015', { xlarge: true })
});

export const RED_TEAM = createMockCard('red_team', 'Red Team', ['system_gateway'], {
	card_type_id: 'resource',
	side_id: 'runner',
	faction_id: 'criminal',
	printing_ids: ['30018'],
	latest_printing_id: '30018',
	latest_printing_images: createMockImages('30018', { xlarge: true })
});

export const SMARTWARE_DISTRIBUTOR = createMockCard(
	'smartware_distributor',
	'Smartware Distributor',
	['system_gateway'],
	{
		card_type_id: 'resource',
		side_id: 'runner',
		faction_id: 'neutral_runner',
		printing_ids: ['30033'],
		latest_printing_id: '30033',
		latest_printing_images: createMockImages('30033', { xlarge: true })
	}
);

export const ABOVE_THE_LAW = createMockCard('above_the_law', 'Above the Law', ['system_gateway'], {
	card_type_id: 'agenda',
	side_id: 'corp',
	faction_id: 'weyland_consortium',
	printing_ids: ['30060'],
	latest_printing_id: '30060',
	latest_printing_images: createMockImages('30060', { xlarge: true })
});

export const LONGEVITY_SERUM = createMockCard(
	'longevity_serum',
	'Longevity Serum',
	['system_gateway'],
	{
		card_type_id: 'agenda',
		side_id: 'corp',
		faction_id: 'jinteki',
		printing_ids: ['30044'],
		latest_printing_id: '30044',
		latest_printing_images: createMockImages('30044', { xlarge: true })
	}
);

export const NICO_CAMPAIGN = createMockCard('nico_campaign', 'Nico Campaign', ['system_gateway'], {
	card_type_id: 'asset',
	side_id: 'corp',
	faction_id: 'haas_bioroid',
	printing_ids: ['30037'],
	latest_printing_id: '30037',
	latest_printing_images: createMockImages('30037', { xlarge: true })
});

export const REGOLITH_MINING_LICENSE = createMockCard(
	'regolith_mining_license',
	'Regolith Mining License',
	['system_gateway'],
	{
		card_type_id: 'asset',
		side_id: 'corp',
		faction_id: 'neutral_corp',
		printing_ids: ['30071'],
		latest_printing_id: '30071',
		latest_printing_images: createMockImages('30071', { xlarge: true })
	}
);

export const GOVERNMENT_SUBSIDY = createMockCard(
	'government_subsidy',
	'Government Subsidy',
	['system_gateway'],
	{
		card_type_id: 'operation',
		side_id: 'corp',
		faction_id: 'weyland_consortium',
		printing_ids: ['30064'],
		latest_printing_id: '30064',
		latest_printing_images: createMockImages('30064', { xlarge: true })
	}
);

export const HEDGE_FUND = createMockCard('hedge_fund', 'Hedge Fund', ['system_gateway'], {
	card_type_id: 'operation',
	side_id: 'corp',
	faction_id: 'neutral_corp',
	printing_ids: ['30075'],
	latest_printing_id: '30075',
	latest_printing_images: createMockImages('30075', { xlarge: true })
});

export const ANOETIC_VOID = createMockCard('anoetic_void', 'Anoetic Void', ['system_gateway'], {
	card_type_id: 'upgrade',
	side_id: 'corp',
	faction_id: 'jinteki',
	printing_ids: ['30050'],
	latest_printing_id: '30050',
	latest_printing_images: createMockImages('30050', { xlarge: true })
});

export const MALAPERT_DATA_VAULT = createMockCard(
	'malapert_data_vault',
	'Malapert Data Vault',
	['system_gateway'],
	{
		card_type_id: 'upgrade',
		side_id: 'corp',
		faction_id: 'weyland_consortium',
		printing_ids: ['30066'],
		latest_printing_id: '30066',
		latest_printing_images: createMockImages('30066', { xlarge: true })
	}
);

export const ANSEL = createMockCard('ansel_1_0', 'Ansel 1.0', ['system_gateway'], {
	card_type_id: 'ice',
	side_id: 'corp',
	faction_id: 'haas_bioroid',
	printing_ids: ['30038'],
	latest_printing_id: '30038',
	latest_printing_images: createMockImages('30038', { xlarge: true })
});

export const BRAN = createMockCard('bran_1_0', 'Brân 1.0', ['system_gateway'], {
	card_type_id: 'ice',
	side_id: 'corp',
	faction_id: 'haas_bioroid',
	printing_ids: ['30039'],
	latest_printing_id: '30039',
	latest_printing_images: createMockImages('30039', { xlarge: true })
});

type RunnerGridCardType = Extract<CardTypeIds, 'event' | 'hardware' | 'program' | 'resource'>;
type CorpGridCardType = Extract<CardTypeIds, 'agenda' | 'asset' | 'operation' | 'upgrade' | 'ice'>;

export const runner_grid_cards = {
	event: [SURE_GAMBLE, CREATIVE_COMMISSION, JAILBREAK],
	hardware: [CARNIVORE, DZMZ_OPTIMIZER, DOCKLANDS_PASS],
	program: [CONDUIT, BOTULUS, CARMEN],
	resource: [COOKBOOK, RED_TEAM, SMARTWARE_DISTRIBUTOR]
} satisfies Record<RunnerGridCardType, readonly Card[]>;

export const corp_grid_cards = {
	agenda: [OFFWORLD_OFFICE, ABOVE_THE_LAW, LONGEVITY_SERUM],
	asset: [CLEARINGHOUSE, NICO_CAMPAIGN, REGOLITH_MINING_LICENSE],
	operation: [HANSEI_REVIEW, GOVERNMENT_SUBSIDY, HEDGE_FUND],
	upgrade: [AMAZE_AMUSEMENTS, ANOETIC_VOID, MALAPERT_DATA_VAULT],
	ice: [PING, ANSEL, BRAN]
} satisfies Record<CorpGridCardType, readonly Card[]>;
