<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CardModal from '$lib/components/card/Modal.svelte';
	import { createMockCard, createMockImages } from '$lib/test-helpers';
	import CardModalStory from './CardModalStory.svelte';

	const event = createMockCard('sure_gamble', 'Sure Gamble', ['system_gateway'], {
		side_id: 'runner',
		faction_id: 'neutral_runner',
		card_type_id: 'event',
		cost: '5',
		text: 'Gain 9[credit].',
		printing_ids: ['30030'],
		latest_printing_id: '30030',
		latest_printing_images: createMockImages('30030', { xlarge: true })
	});

	const operation = createMockCard('hansei_review', 'Hansei Review', ['system_gateway'], {
		side_id: 'corp',
		faction_id: 'jinteki',
		card_type_id: 'operation',
		cost: '5',
		influence_cost: 1,
		display_subtypes: 'Transaction',
		text: 'Gain 10[credit]. If there are any cards in HQ, trash 1 of them.',
		printing_ids: ['30048'],
		latest_printing_id: '30048',
		latest_printing_images: createMockImages('30048', { xlarge: true })
	});

	const { Story } = defineMeta({
		title: 'Components/Card/Modal',
		component: CardModal,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			card: { control: { type: 'object' } },
			open: { control: { type: 'boolean' } }
		},
		args: {
			card: event,
			open: true,
			onOpenChange: () => {}
		}
	});
</script>

<Story name="Event">
	{#snippet template(args)}
		<CardModalStory card={args.card} open={args.open} />
	{/snippet}
</Story>

<Story name="Operation" args={{ card: operation }}>
	{#snippet template(args)}
		<CardModalStory card={args.card} open={args.open} />
	{/snippet}
</Story>
