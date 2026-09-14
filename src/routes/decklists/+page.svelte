<script lang="ts">
	import type { Decklist } from '$lib/types';
	import Header from '$lib/components/Header.svelte';
	import DecklistItem from '$lib/components/decklist/Item.svelte';
	import Meta from '$lib/components/Meta.svelte';

	let { data }: { data: { decklists: Decklist[] } } = $props();
</script>

<Meta title="Decklists" />

{#if data.decklists}
	<ul>
		{#each data.decklists as decklist (decklist.id)}
			<li>
				<DecklistItem {decklist} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	/* Temporary styles */
	ul {
		display: grid;
		gap: 1rem;
	}
</style>
