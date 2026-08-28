<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		AMAZE_AMUSEMENTS,
		CARNIVORE,
		CLEARINGHOUSE,
		CONDUIT,
		COOKBOOK,
		HANSEI_REVIEW,
		OFFWORLD_OFFICE,
		PING,
		SURE_GAMBLE
	} from '$lib/cards.fixture';
	import CardModal from '$lib/components/card/Modal.svelte';
	import { PRECISION_DESIGN, ZAHYA } from '$lib/identities.fixture';
	import type { Card, CardTypeIds } from '$lib/types';
	import CardModalStory from './CardModalStory.svelte';

	interface CardModalArgs {
		card: Card;
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	const card_examples = {
		agenda: OFFWORLD_OFFICE,
		asset: CLEARINGHOUSE,
		corp_identity: PRECISION_DESIGN,
		event: SURE_GAMBLE,
		hardware: CARNIVORE,
		ice: PING,
		operation: HANSEI_REVIEW,
		program: CONDUIT,
		resource: COOKBOOK,
		runner_identity: ZAHYA,
		upgrade: AMAZE_AMUSEMENTS
	} satisfies Record<CardTypeIds, Card>;

	const { Story } = defineMeta({
		title: 'Components/Card/Modal',
		component: CardModal,
		render: template,
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			card: { control: { type: 'object' } },
			open: { control: { type: 'boolean' } }
		},
		args: {
			card: card_examples.agenda,
			open: true,
			onOpenChange: () => {}
		}
	});
</script>

{#snippet template(args: CardModalArgs)}
	<CardModalStory card={args.card} open={args.open} />
{/snippet}

<Story name="Corp Identity" args={{ card: card_examples.corp_identity }} />
<Story name="Agenda" args={{ card: card_examples.agenda }} />
<Story name="Asset" args={{ card: card_examples.asset }} />
<Story name="Operation" args={{ card: card_examples.operation }} />
<Story name="Upgrade" args={{ card: card_examples.upgrade }} />
<Story name="ICE" args={{ card: card_examples.ice }} />

<Story name="Runner Identity" args={{ card: card_examples.runner_identity }} />
<Story name="Event" args={{ card: card_examples.event }} />
<Story name="Hardware" args={{ card: card_examples.hardware }} />
<Story name="Program" args={{ card: card_examples.program }} />
<Story name="Resource" args={{ card: card_examples.resource }} />
