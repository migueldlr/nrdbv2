import type { Card } from './types';

export const createFixtureCard = (
	id: string,
	title: string,
	side_id: string,
	faction_id: string,
	cycle: string,
	card_type_id = `${side_id}_identity`
): Card =>
	({
		id,
		type: 'cards',
		attributes: {
			title,
			card_type_id,
			side_id,
			faction_id,
			card_cycle_ids: [cycle]
		}
	}) as unknown as Card;

export const PRECISION_DESIGN = createFixtureCard(
	'haas_bioroid_precision_design',
	'Haas-Bioroid: Precision Design',
	'corp',
	'haas_bioroid',
	'system_gateway'
);

export const RESTORING_HUMANITY = createFixtureCard(
	'jinteki_restoring_humanity',
	'Jinteki: Restoring Humanity',
	'corp',
	'jinteki',
	'system_gateway'
);

export const ESA = createFixtureCard(
	'esa_afontov_eco_insurrectionist',
	'Esâ Afontov: Eco-Insurrectionist',
	'runner',
	'anarch',
	'borealis'
);

export const TOPAN = createFixtureCard(
	'topan_ormas_leader',
	'Topan: Ormas Leader',
	'runner',
	'anarch',
	'elevation'
);

export const ZAHYA = createFixtureCard(
	'zahya_sadeghi_versatile_smuggler',
	'Zahya Sadeghi: Versatile Smuggler',
	'runner',
	'criminal',
	'system_gateway'
);

export const TAO = createFixtureCard(
	'tao_salonga_telepresence_magician',
	'Tāo Salonga: Telepresence Magician',
	'runner',
	'shaper',
	'system_gateway'
);

export const APEX = createFixtureCard(
	'apex_invasive_predator',
	'Apex: Invasive Predator',
	'runner',
	'apex',
	'data_and_destiny'
);

export const SHRED = createFixtureCard('shred', 'Shred', 'runner', 'anarch', 'elevation', 'event');
