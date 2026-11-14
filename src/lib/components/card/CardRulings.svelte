<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { Ruling } from '$lib/types';
	import Ghost from '$lib/components/Ghost.svelte';
	import RulingItem from '$lib/components/Ruling.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		rulings: Promise<Ruling[]>;
	}

	let { rulings }: Props = $props();

	const PREVIEW_COUNT = 5;
	let show_all = $state(false);
</script>

{#await rulings}
	<Ghost />
{:then rulings}
	<section class="card-section">
		<h2>{m.rulings()}</h2>
		{#if rulings.length > 0}
			<ul class="rulings">
				{#each show_all ? rulings : rulings.slice(0, PREVIEW_COUNT) as ruling (ruling.id)}
					<RulingItem data={ruling} />
				{/each}
			</ul>
			{#if rulings.length > PREVIEW_COUNT}
				<!-- TODO(i18n): use i18n value -->
				<Button
					class="show-all"
					color="secondary"
					size="sm"
					onclick={() => (show_all = !show_all)}
				>
					{show_all ? 'Show fewer' : `Show all ${rulings.length} rulings`}
				</Button>
			{/if}
		{:else}
			<p>No rulings found for this card.</p>
		{/if}
	</section>
{:catch error}
	<p>error loading rulings: {error.message}</p>
{/await}

<style>
	.card-section {
		padding: 1.5rem;
		background-color: var(--foreground);
		border: 1px solid var(--border);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: var(--font-size-xl);
	}

	.rulings {
		margin: 0;
		padding: 0;
		list-style: none;

		> :global(li) {
			padding-block: var(--space-4);
			border-top: 1px solid var(--border);
		}

		> :global(li:first-child) {
			padding-top: 0;
			border-top: 0;
		}
	}

	.card-section :global(.show-all) {
		margin-top: var(--space-4);
	}

	@media (max-width: 640px) {
		.card-section {
			padding: 1.25rem;
		}
	}
</style>
