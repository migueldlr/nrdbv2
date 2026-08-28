import { createMockCard, createMockImages } from './test-helpers';

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
