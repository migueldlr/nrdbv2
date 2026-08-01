<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Surface from './Surface.svelte';
	import {
		Dropdown,
		DropdownGroup,
		DropdownItem,
		DropdownRadioGroup,
		DropdownRadioItem,
		DropdownSeparator
	} from '$lib/components/ui/dropdown';

	const { Story } = defineMeta({
		title: 'Components/Dropdown',
		component: Dropdown,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			side: {
				control: { type: 'inline-radio' },
				options: ['top', 'right', 'bottom', 'left']
			},
			align: {
				control: { type: 'inline-radio' },
				options: ['start', 'center', 'end']
			},
			color: {
				control: { type: 'inline-radio' },
				options: ['primary', 'secondary', 'ghost']
			},
			size: {
				control: { type: 'inline-radio' },
				options: ['sm', 'md']
			},
			children: { table: { disable: true } },
			trigger: { table: { disable: true } },
			class: { table: { disable: true } }
		},
		args: {
			label: 'Options',
			side: 'bottom',
			align: 'end',
			color: 'primary',
			size: 'md',
			disabled: false
		}
	});
</script>

<script lang="ts">
	let theme = $state('light');
	let locale = $state('en');
</script>

<Story name="Default">
	{#snippet template(args)}
		<Dropdown {...args}>
			<DropdownItem onSelect={() => {}}>Copy decklist</DropdownItem>
			<DropdownItem onSelect={() => {}}>Duplicate</DropdownItem>
			<DropdownSeparator />
			<DropdownItem disabled onSelect={() => {}}>Publish</DropdownItem>
		</Dropdown>
	{/snippet}
</Story>

<Story name="Grouped items">
	{#snippet template(args)}
		<Dropdown {...args} label="Decklist">
			<DropdownGroup label="Edit">
				<DropdownItem onSelect={() => {}}>Rename</DropdownItem>
				<DropdownItem onSelect={() => {}}>Change identity</DropdownItem>
			</DropdownGroup>
			<DropdownSeparator />
			<DropdownGroup label="Share">
				<DropdownItem href="/decklist/1">Open public page</DropdownItem>
				<DropdownItem onSelect={() => {}}>Copy link</DropdownItem>
			</DropdownGroup>
		</Dropdown>
	{/snippet}
</Story>

<Story name="Radio groups">
	{#snippet template(args)}
		<Dropdown {...args} label="Preferences">
			<DropdownRadioGroup label="Theme" bind:value={theme}>
				<DropdownRadioItem value="light">Light</DropdownRadioItem>
				<DropdownRadioItem value="dark">Dark</DropdownRadioItem>
			</DropdownRadioGroup>
			<DropdownSeparator />
			<DropdownRadioGroup label="Language" bind:value={locale}>
				<DropdownRadioItem value="en">English</DropdownRadioItem>
				<DropdownRadioItem value="de">Deutsch</DropdownRadioItem>
			</DropdownRadioGroup>
		</Dropdown>
		<p><small>theme: {theme} &middot; locale: {locale}</small></p>
	{/snippet}
</Story>

<Story name="Light and dark">
	{#snippet template(args)}
		<div class="themes">
			{#each ['light', 'dark'] as const as surface_theme (surface_theme)}
				<Surface theme={surface_theme}>
					<div>
						<Dropdown {...args} open portal={false} align="start" label={surface_theme}>
							<DropdownItem onSelect={() => {}}>Copy decklist</DropdownItem>
							<DropdownItem onSelect={() => {}}>Duplicate</DropdownItem>
							<DropdownSeparator />
							<DropdownItem disabled onSelect={() => {}}>Publish</DropdownItem>
						</Dropdown>
					</div>
				</Surface>
			{/each}
		</div>
	{/snippet}
</Story>

<style>
	.themes {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		min-height: 15rem;
	}
</style>
