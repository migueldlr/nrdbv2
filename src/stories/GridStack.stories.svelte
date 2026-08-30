<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SURE_GAMBLE } from '$lib/cards.fixture';
	import GridStack from '$lib/components/decklist/GridStack.svelte';
	import type { Card } from '$lib/types';

	interface GridStackArgs {
		readonly card: Card;
		readonly copies: number;
	}

	const { Story } = defineMeta({
		title: 'Components/Decklist/GridStack',
		component: GridStack,
		render: template,
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			card: { control: false },
			copies: { control: { type: 'range', min: 1, max: 6, step: 1 } }
		},
		args: {
			card: SURE_GAMBLE,
			copies: 3
		}
	});
</script>

{#snippet template(args: GridStackArgs)}
	<div class="preview">
		<GridStack card={args.card} copies={args.copies} />
	</div>
{/snippet}

<Story name="Default" />

<style>
	.preview {
		width: 7.375rem;
		margin: 1rem;
	}
</style>
