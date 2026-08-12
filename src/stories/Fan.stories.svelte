<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Fan from '$lib/components/decklist/Fan.svelte';
	import { cards } from './decklist.fixture';

	const fan_cards = [cards[0], cards[1], cards[2]] as const;
	const loading_cards = [undefined, undefined, undefined] as const;

	const { Story } = defineMeta({
		title: 'Components/Decklist/Fan',
		component: Fan,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			cards: { control: { type: 'object' } },
			hover: { control: { type: 'boolean' } }
		},
		args: {
			cards: fan_cards,
			hover: false
		}
	});
</script>

<script lang="ts">
	let interactive_hover = $state(false);
</script>

<Story name="Default">
	{#snippet template(args)}
		<a
			class="preview"
			href="#fan-preview"
			aria-label="Preview card fan"
			onmouseenter={() => (interactive_hover = true)}
			onmouseleave={() => (interactive_hover = false)}
			onfocus={() => (interactive_hover = true)}
			onblur={() => (interactive_hover = false)}
			onclick={(event) => event.preventDefault()}
		>
			<Fan {...args} hover={args.hover || interactive_hover} />
		</a>
	{/snippet}
</Story>

<Story name="Loading cards" args={{ cards: loading_cards }}>
	{#snippet template(args)}
		<a
			class="preview"
			href="#fan-preview"
			aria-label="Preview card fan"
			onmouseenter={() => (interactive_hover = true)}
			onmouseleave={() => (interactive_hover = false)}
			onfocus={() => (interactive_hover = true)}
			onblur={() => (interactive_hover = false)}
			onclick={(event) => event.preventDefault()}
		>
			<Fan {...args} hover={args.hover || interactive_hover} />
		</a>
	{/snippet}
</Story>

<style>
	.preview {
		display: block;
		color: inherit;
		text-decoration: none;
	}
</style>
