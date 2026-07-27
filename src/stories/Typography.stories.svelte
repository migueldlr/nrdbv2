<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Surface from './Surface.svelte';

	const { Story } = defineMeta({
		title: 'Foundations/Typography',
		component: Surface,
		tags: ['autodocs'],
		argTypes: {
			theme: {
				control: { type: 'inline-radio' },
				options: ['auto', 'light', 'dark']
			}
		},
		args: { theme: 'light' }
	});

	const SPECIMEN = 'René "Loup" Arcemont: Party Animal';
</script>

<Story name="Heading levels">
	{#snippet template(args)}
		<Surface {...args}>
			<h1>h1 &mdash; {SPECIMEN}</h1>
			<h2>h2 &mdash; {SPECIMEN}</h2>
			<h3>h3 &mdash; {SPECIMEN}</h3>
			<h4>h4 &mdash; {SPECIMEN}</h4>
			<h5>h5 &mdash; {SPECIMEN}</h5>
			<h6>h6 &mdash; {SPECIMEN}</h6>
			<p>p &mdash; {SPECIMEN}</p>
			<small>small &mdash; {SPECIMEN}</small>
		</Surface>
	{/snippet}
</Story>

<Story name="Weights">
	{#snippet template(args)}
		<Surface {...args}>
			<div style="font-weight: var(--font-weight-normal)">
				<code>--font-weight-normal</code> &middot; 400 &mdash; {SPECIMEN}
			</div>
			<div style="font-weight: var(--font-weight-semibold)">
				<code>--font-weight-semibold</code> &middot; 600 &mdash; {SPECIMEN}
			</div>
			<div style="font-weight: var(--font-weight-bold)">
				<code>--font-weight-bold</code> &middot; 700 &mdash; {SPECIMEN}
			</div>
		</Surface>
	{/snippet}
</Story>

<Story name="Muted text">
	{#snippet template(args)}
		<Surface {...args}>
			<p><code>--text</code> &mdash; primary text. Card names, headings, body copy.</p>
			<p class="muted">
				<code>--text-muted</code> &mdash; dates, authors, counts, empty states.
			</p>
		</Surface>
	{/snippet}
</Story>

<Story name="Uppercase tracking">
	{#snippet template(args)}
		<Surface {...args}>
			<p class="caps">Corp &middot; Runner &middot; Verified</p>
			<p class="caps caps--untracked">Corp &middot; Runner &middot; Verified</p>
			<small>Upper row uses <code>--tracking-caps</code>; lower row omits it.</small>
		</Surface>
	{/snippet}
</Story>

<style>
	p {
		margin: unset;
	}

	code {
		font-size: var(--font-size-sm);
	}

	.muted {
		color: var(--text-muted);
	}

	.caps {
		text-transform: uppercase;
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-caps);
	}

	.caps--untracked {
		letter-spacing: normal;
	}
</style>
