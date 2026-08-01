<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/Button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			color: {
				control: { type: 'inline-radio' },
				options: ['primary', 'secondary', 'ghost']
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['sm', 'md']
			},
			children: { table: { disable: true } },
			icon: { table: { disable: true } },
			class: { table: { disable: true } }
		},
		args: {
			color: 'primary',
			size: 'md',
			disabled: false
		}
	});

	const COLORS = ['primary', 'secondary', 'ghost'] as const;
</script>

<Story name="Default">
	{#snippet template(args)}
		<Button {...args}>Create a deck</Button>
	{/snippet}
</Story>

<Story name="Colors">
	{#snippet template(args)}
		<div class="row">
			{#each COLORS as color (color)}
				<Button {...args} {color}>{color}</Button>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template(args)}
		<div class="row">
			<Button {...args} size="sm">Small</Button>
			<Button {...args} size="md">Medium</Button>
		</div>
	{/snippet}
</Story>

<Story name="With icon">
	{#snippet template(args)}
		<div class="row">
			<Button {...args}>
				{#snippet icon()}
					<PlusIcon size={16} />
				{/snippet}
				Add card
			</Button>
			<Button {...args} size="sm">
				{#snippet icon()}
					<PlusIcon size={14} />
				{/snippet}
				Add card
			</Button>
		</div>
	{/snippet}
</Story>

<Story name="Link">
	{#snippet template(args)}
		<div class="row">
			<Button {...args} href="/decklist/create">Enabled link</Button>
			<Button {...args} href="/decklist/create" disabled>Disabled link</Button>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template(args)}
		<div class="row">
			{#each COLORS as color (color)}
				<Button {...args} {color} disabled>{color}</Button>
			{/each}
		</div>
	{/snippet}
</Story>

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}
</style>
