<script lang="ts">
	import type { Decklist } from '$lib/types';
	import DecklistTiles from '$lib/components/decklist/Tiles.svelte';
	import Meta from '$lib/components/Meta.svelte';

	let { data }: { data: { decklists: Decklist[] } } = $props();
</script>

<Meta title="Decklists" />

{#if data.decklists}
	<DecklistTiles tiles={data.decklists.map((decklist) => ({ decklist }))} />
{/if}
