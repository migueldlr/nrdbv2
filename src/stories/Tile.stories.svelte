<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tile from '$lib/components/decklist/Tile.svelte';
	import type { Decklist } from '$lib/types';
	import { cards, decklist } from './decklist.fixture';

	const long_name_decklist: Decklist = {
		...decklist,
		attributes: {
			...decklist.attributes,
			name: 'Brutal Efficiency - Core Only (Really long name that maybe should wrap)'
		}
	};

	const { Story } = defineMeta({
		title: 'Components/Decklist/Tile',
		component: Tile,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			decklist: { control: { type: 'object' } },
			cards: { control: { type: 'object' } }
		},
		args: {
			decklist,
			cards
		}
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<div class="preview">
			<Tile {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Long name" args={{ decklist: long_name_decklist }}>
	{#snippet template(args)}
		<div class="preview">
			<Tile {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Loading cards" args={{ cards: [] }}>
	{#snippet template(args)}
		<div class="preview">
			<Tile {...args} />
		</div>
	{/snippet}
</Story>

<style>
	.preview {
		width: min(40rem, calc(100vw - 2rem));
	}
</style>
